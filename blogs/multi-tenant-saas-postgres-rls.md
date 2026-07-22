---
slug: multi-tenant-saas-postgres-rls
title: "Building Multi-Tenant SaaS Without Losing Your Mind: Postgres RLS and the acts_as_tenant Gem"
description: "A practical guide to tenant isolation in a Rails SaaS app using Postgres Row-Level Security and the acts_as_tenant gem — including the patterns that scale and the traps that will leak data across tenants."
date: "2026-02-04"
author: "Jahid Hasan"
tags: [postgres, rails, multi-tenant, saas, rls, architecture]
featured: false
---

The first time you leak data across tenants in a SaaS app, you'll understand viscerally why this topic matters. Customer A sees Customer B's data in their dashboard. Support gets a ticket. The founder gets an email. Trust evaporates. Multi-tenancy is one of those things that seems simple until you get it wrong, and getting it wrong is remarkably easy to do.

There are three classical approaches to multi-tenancy in a Rails app: separate databases per tenant, separate schemas per tenant, and shared schema with a `tenant_id` column. The first two are clean but operationally expensive. The third is the most common and the most dangerous, because a single missing `where` clause in a single query leaks data across tenants. This is the story of how to do the third approach safely, using Postgres Row-Level Security and the `acts_as_tenant` gem together.

### The Problem with `tenant_id` Columns

The naive approach: every table gets a `tenant_id` column, and every query includes `WHERE tenant_id = ?`. This works for approximately two weeks, until someone writes a new query and forgets the `tenant_id` filter. Or until someone adds a new association and forgets to scope it. Or until a background job runs without tenant context and processes every tenant's data at once.

I've seen all three happen in production. The background job one is the scariest — a nightly email job that sent Customer A's invoice summary to Customer B's users because the job didn't set a tenant context before querying. The bug existed for six months before anyone noticed, because the affected tenants were small and nobody complained loudly enough.

The fundamental problem is that `tenant_id` filtering is an application-level concern enforced by developer discipline. Developer discipline does not scale. You will forget. Your new hire will forget. The framework should make it impossible to leak data, not merely inadvisable.

### Enter Postgres Row-Level Security

Row-Level Security (RLS) is a Postgres feature that moves tenant isolation from the application to the database. When RLS is enabled on a table, every query is automatically filtered by a policy — and there is no way for the application to bypass it without explicitly using a special role.

Here's the core idea: instead of trusting every query to include `WHERE tenant_id = ?`, you tell Postgres "this role can only see rows where `tenant_id` equals the value I set in a session variable." Every query, without exception, is filtered. A forgotten `WHERE` clause is no longer a data leak; it's just a query that returns fewer rows.

### Setting Up RLS

First, enable RLS on each tenant-scoped table:

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

Then define the policy. The standard pattern uses a session variable set by the application on each connection:

```sql
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.current_tenant')::integer);

CREATE POLICY tenant_isolation ON line_items
  USING (tenant_id = current_setting('app.current_tenant')::integer);

CREATE POLICY tenant_isolation ON customers
  USING (current_setting('app.current_tenant')::integer = id);
```

For the `customers` table (which IS the tenants table), the policy checks against the `id` column directly. For everything else, it checks the `tenant_id` foreign key.

Now, before any query, the application sets the tenant:

```sql
SET app.current_tenant = '42';
```

And every query on `orders` will automatically be filtered to `WHERE tenant_id = 42`, regardless of what the application wrote in its own `WHERE` clause. A query that forgets to filter by tenant simply returns the correct tenant's rows. A query that tries to filter by the wrong tenant returns nothing. The database enforces isolation, not the application.

### The `acts_as_tenant` Gem: Making It Ergonomic in Rails

RLS handles the database side, but you still need the application to set the tenant on every request. Doing this manually is error-prone. The `acts_as_tenant` gem handles this cleanly.

Add it to your Gemfile:

```ruby
gem 'acts_as_tenant'
```

Configure it in an initializer:

```ruby
# config/initializers/acts_as_tenant.rb
ActsAsTenant.configure do |config|
  config.require_tenant = true  # This is the important one
end
```

The `require_tenant = true` setting is the magic. With this enabled, any query that touches a tenant-scoped model without a tenant being set will raise an `ActsAsTenant::Errors::NoTenantSet` error. This means a background job that forgets to set the tenant doesn't silently leak data — it crashes loudly, in development, before it ever reaches production.

In your `ApplicationController`, set the tenant from the request:

```ruby
class ApplicationController < ActionController::Base
  set_current_tenant_through_filter

  before_action :set_tenant

  private

  def set_tenant
    current_account = Account.find(subdomain_to_account_id)
    set_current_tenant(current_account)

    # Also set the Postgres session variable for RLS
    ActiveRecord::Base.connection.execute(
      "SET app.current_tenant = '#{current_account.id}'"
    )
  end
end
```

Now mark your models as tenant-scoped:

```ruby
class Order < ApplicationRecord
  acts_as_tenant :account
end

class LineItem < ApplicationRecord
  acts_as_tenant :account
end
```

From this point, every query on `Order` is automatically scoped to the current tenant:

```ruby
Order.all  # SELECT * FROM orders WHERE account_id = 42
Order.find(params[:id])  # Finds the order only if it belongs to tenant 42
```

And because RLS is enabled at the database level, even a raw SQL query is protected:

```sql
-- This query, even without a WHERE clause, only returns tenant 42's rows
SELECT * FROM orders;
```

You now have two layers of defence: the application-layer scoping from `acts_as_tenant` (which makes the common case ergonomic and raises errors when tenant is missing) and the database-layer enforcement from RLS (which catches anything the application misses).

### Where `acts_as_tenant` Makes Life Easier

The gem does more than just add `WHERE account_id = ?` to your queries. A few quality-of-life features that matter:

**Automatic association on create.** When you create a record, the tenant is set automatically:

```ruby
# No need to manually set account_id
Order.create(total: 100, customer_id: params[:customer_id])
# Automatically sets account_id to the current tenant
```

**Form helpers.** The gem integrates with form builders so that tenant-scoped select dropdowns only show the current tenant's options:

```erb
<%= form.collection_select :customer_id, Customer.all, :id, :name %>
<!-- Only shows customers belonging to the current tenant -->
```

**Nested building.** When you build associations, the tenant propagates:

```ruby
order = current_tenant.orders.build(total: 100)
order.line_items.build(quantity: 2, price: 50)
# Both order and line_items automatically get the correct account_id
```

### The Traps That Will Bite You

A few patterns that will still leak data if you're not careful:

**1. Bypassing RLS with the superuser role.** By default, Postgres table owners and superusers bypass RLS. If your Rails app connects as the table owner (common in development), RLS silently does nothing. The fix: connect as a non-owner role, and use `ALTER TABLE ... FORCE ROW LEVEL SECURITY` to apply RLS even to owners.

```sql
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
```

**2. Connection pooling resets.** When using PgBouncer or a connection pool, the `SET app.current_tenant` variable can leak between requests if not properly reset. The fix: reset the variable at the end of every request, or use `SET LOCAL` within a transaction.

```ruby
after_action :reset_tenant

def reset_tenant
  ActiveRecord::Base.connection.execute("RESET app.current_tenant")
end
```

**3. Background jobs without tenant context.** A job that processes records without setting the tenant will either crash (good, if `require_tenant = true`) or process all tenants' data (bad). The fix: always set the tenant inside the job:

```ruby
class SendInvoiceEmailsJob < ApplicationJob
  def perform(account_id)
    ActsAsTenant.with_tenant(Account.find(account_id)) do
      Invoice.where(status: :pending).find_each do |invoice|
        InvoiceMailer.with(invoice: invoice).summary_email.deliver_later
      end
    end
  end
end
```

**4. Cross-tenant associations.** If a model can belong to multiple tenants (rare but happens — shared templates, shared admin users), RLS will block legitimate access. The fix: exclude these models from RLS and handle their scoping explicitly.

### AI-Assisted RLS Auditing

One of the more interesting uses of LLMs in 2026 is auditing multi-tenant code for isolation bugs. I've been running GLM-5.2 over the codebase weekly with a prompt that asks it to flag any query, job, or controller action that touches a tenant-scoped model without setting a tenant context.

The prompt is simple:

```
You are auditing a multi-tenant Rails application for data isolation bugs.
Every model that `acts_as_tenant` must be accessed within a tenant context.
Review the following code and flag:
1. Any query on a tenant-scoped model without a current tenant set.
2. Any background job that doesn't wrap tenant-scoped queries in ActsAsTenant.with_tenant.
3. Any raw SQL that doesn't include a tenant_id filter (unless RLS handles it).
4. Any association that could leak data across tenants.

Be conservative. Flag anything suspicious. False positives are cheap; data leaks are not.
```

Over three months, this caught two real bugs that RLS would have blocked at runtime but that `acts_as_tenant` would have raised noisy errors on — both in background jobs that had been silently failing for weeks. The combination of RLS (hard enforcement), `acts_as_tenant` (ergonomic scoping + errors), and AI auditing (catching the gaps) is genuinely robust.

### Conclusion: Defence in Depth

Multi-tenancy is not a feature; it's a security boundary. Treating it as a feature leads to the `tenant_id` column approach, which works until it doesn't. Treating it as a security boundary leads to RLS + `acts_as_tenant` + AI auditing, which fails safe instead of failing open.

The setup takes a weekend. The ongoing cost is negligible. The peace of mind — knowing that a forgotten `WHERE` clause is a bug, not a data breach — is worth far more than the implementation effort. If you're building a multi-tenant SaaS app in 2026 and you're not using RLS, you're one pull request away from a breach that could end your company. Don't be that pull request.
