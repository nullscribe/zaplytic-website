---
slug: rails-advanced-patterns
title: "Beyond MVC: Advanced Patterns for Keeping Large Rails Apps Maintainable"
description: "Service Objects, Form Objects, Query Objects, Interactors, and Presenters — the patterns that experienced Rails teams reach for once fat models and bloated controllers start slowing them down."
date: "2025-12-24"
author: "Jahid Hasan"
tags: [rails, ruby, architecture, design-patterns]
featured: false
---

Every Rails app starts clean. You scaffold a few resources, drop some logic in the model, a bit of flow control in the controller, and everything feels wonderful. Then six months pass, the codebase grows, and suddenly your `User` model is 1,400 lines, your `OrdersController#create` is doing nine things, and touching any of it feels like defusing a bomb. This is the Rails scaling wall, and it hits every team eventually.

The good news: the Rails community has spent the last decade figuring out patterns to deal with this. The bad news: none of them are in the default Rails guides, and there's no single canonical list. This post is a practical tour of the patterns that actually hold up in production — what each one is for, when to reach for it, and when it'll hurt you.

### The Core Problem: Where Does the Logic Go?

Rails MVC gives you three places to put logic: model, view, controller. This works beautifully for CRUD. It falls apart the moment a single user action triggers multiple domain operations — say, creating an order, charging a card, sending a confirmation email, updating inventory, and writing an audit log. Where does that go?

- **In the controller?** Now your controller knows about payments, email, inventory, and auditing. It's no longer a controller; it's a god object.
- **In the `Order` model?** Now `Order` knows about the payment gateway, the email service, and the inventory system. It's no longer a domain model; it's a different god object in a nicer outfit.
- **In a callback?** `after_create :charge_card, :send_email, :update_inventory`. This is the most common Rails anti-pattern. It looks clean. It is a trap. You can no longer create an `Order` without charging a card, which means you can't write tests, you can't import data, and you can't run a migration. Every callback is a hidden coupling.

The answer is: put it nowhere Rails told you to. Put it in a new object whose entire job is to coordinate this workflow. Let's look at the patterns.

### Service Objects

A Service Object is a plain Ruby class that represents a single business operation. It takes inputs, does work across multiple models, and returns a result. No inheritance from `ApplicationRecord`, no Rails magic, just a class with a `call` method.

```ruby
# app/services/create_order.rb
class CreateOrder
  def initialize(user:, items:, payment_method_id:)
    @user = user
    @items = items
    @payment_method_id = payment_method_id
  end

  def call
    return Result.failure("Cart is empty") if @items.empty?

    ActiveRecord::Base.transaction do
      order = @user.orders.create!(items: @items)
      payment = ChargeCard.call(order: order, payment_method_id: @payment_method_id)
      OrderMailer.with(order: order).confirmation_email.deliver_later
      AuditLog.write(action: "order_created", user: @user, target: order)
      Result.success(order)
    end
  rescue ChargeCard::Failed => e
    Result.failure(e.message)
  end

  Result = Struct.new(:success?, :value, :error) do
    def self.success(value); new(true, value, nil); end
    def self.failure(error); new(false, nil, error); end
  end
end
```

The controller now shrinks to almost nothing:

```ruby
class OrdersController < ApplicationController
  def create
    result = CreateOrder.new(
      user: current_user,
      items: cart.items,
      payment_method_id: params[:payment_method_id]
    ).call

    if result.success?
      redirect_to order_path(result.value)
    else
      flash.now[:alert] = result.error
      render :new, status: :unprocessable_entity
    end
  end
end
```

The wins are real: the controller is back to being a controller, the workflow is testable in isolation, and you can call `CreateOrder` from a background job, a rake task, or a console without going through HTTP. The single biggest win is testability — you can unit test this without a single HTTP request.

### Form Objects

Sometimes the problem isn't the workflow, it's the form. Rails gives you `accepts_nested_attributes_for` to handle the case where one form edits multiple models, but that pattern breaks down fast. The moment your form spans models that don't have a parent-child relationship, or you need validations that don't belong to any single model, you need a Form Object.

A Form Object is a plain Ruby class that includes `ActiveModel::Model` (which gives you validations, attribute assignment, and form compatibility) without being backed by a table.

```ruby
# app/forms/signup_form.rb
class SignupForm
  include ActiveModel::Model

  attr_accessor :email, :password, :company_name, :plan_id

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 12 }
  validates :company_name, presence: true
  validates :plan_id, presence: true

  def save
    return false unless valid?

    ActiveRecord::Base.transaction do
      user = User.create!(email: email, password: password)
      company = Company.create!(name: company_name, owner: user, plan_id: plan_id)
      OnboardingMailer.with(user: user, company: company).welcome_email.deliver_later
      true
    end
  rescue ActiveRecord::RecordInvalid => e
    errors.add(:base, e.message)
    false
  end
end
```

The controller stays idiomatic:

```ruby
class SignupsController < ApplicationController
  def create
    @form = SignupForm.new(signup_params)
    if @form.save
      redirect_to root_path, notice: "Welcome aboard!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def signup_params
    params.require(:signup_form).permit(:email, :password, :company_name, :plan_id)
  end
end
```

This is what `accepts_nested_attributes_for` wishes it could be. The form owns its own validations, the controller stays clean, and the models stay focused on their own concerns.

### Query Objects

Once your app grows, you'll end up with queries that are too complex to live in a controller and don't belong in the model (because they're not really about a single entity). Query Objects encapsulate these.

```ruby
# app/queries/revenue_report_query.rb
class RevenueReportQuery
  def initialize(start_date:, end_date:, scope: Order.all)
    @start_date = start_date
    @end_date = end_date
    @scope = scope
  end

  def call
    @scope
      .where(status: :completed, created_at: @start_date..@end_date)
      .joins(:line_items)
      .group("DATE(orders.created_at)")
      .select("DATE(orders.created_at) AS date, SUM(line_items.price * line_items.quantity) AS revenue")
      .order(date: :asc)
  end
end
```

Usage is clean and intention-revealing:

```ruby
@report = RevenueReportQuery.new(start_date: 30.days.ago, end_date: Time.current).call
```

The benefit isn't just organisation — it's that this query is now testable in isolation, reusable across controllers and jobs, and easy to swap out (say, for a materialised view) without touching calling code.

### Presenters / Decorators

Views are another place Rails grows messy. The moment you have conditional display logic — "show this badge only if the user is an admin and the order is completed and it's within 30 days" — you have a choice between putting it in the view (messy), the model (wrong — it's presentation logic), or a helper (untestable global namespace pollution).

Presenters solve this by wrapping a model and exposing presentation-specific methods.

```ruby
# app/presenters/order_presenter.rb
class OrderPresenter < SimpleDelegator
  def status_badge_class
    case status.to_sym
    when :completed then "bg-green-100 text-green-800"
    when :pending   then "bg-yellow-100 text-yellow-800"
    when :failed    then "bg-red-100 text-red-800"
    end
  end

  def formatted_total
    "$#{'%.2f' % total}"
  end

  def can_be_refunded_by?(user)
    user.admin? && completed? && created_at > 30.days.ago
  end
end
```

In the controller: `@order = OrderPresenter.new(order)`. In the view, you call `@order.status_badge_class` exactly as if it were a model method. The model stays clean of presentation concerns, the view stays clean of conditional logic, and the presenter is a plain Ruby class that's trivial to test.

### Interactors: When You Need Composition

Once you have multiple Service Objects that need to chain together — and especially when the chain has conditional branches — a gem like `interactor` (or its typed cousin `active_interaction`) earns its keep. Interactors give you a standardised interface for wrapping business operations and composing them.

```ruby
class ChargeCard
  include Interactor

  def call
    payment = PaymentGateway.charge(
      amount: context.order.total,
      token: context.payment_method_id
    )
    context.payment = payment
  rescue PaymentGateway::Error => e
    context.fail!(message: e.message)
  end
end

class CreateOrder
  include Interactor::Organizer

  organize CreateOrderRecord, ChargeCard, SendConfirmationEmail, WriteAuditLog
end
```

If any step calls `context.fail!`, the organisers automatically rolls back. This is heavier machinery than plain Service Objects, and I'd only reach for it once you have a dozen-plus services that genuinely benefit from composition. For a small app, plain Service Objects are lighter and easier to reason about.

### A Warning About Patterns

Every pattern in this post is a tool, not a rule. The fastest way to make your Rails app unmaintainable is to apply all of them everywhere. A controller with two lines of logic doesn't need a Service Object. A form that edits a single model doesn't need a Form Object. A query that's a single `where` clause doesn't need a Query Object.

The discipline is to reach for these patterns when the pain is real — when a controller method is more than 10 lines, when a model has more than one responsibility, when a view has nested conditionals three levels deep. Apply the pattern to the pain, not preemptively to pain you imagine you might have someday.

### Conclusion: Rails Grows Up With You

The narrative that "Rails doesn't scale" usually comes from people who never moved past the beginner patterns the guides teach. Rails scales beautifully — you just have to be willing to step outside the framework's defaults and reach for plain Ruby objects when the situation demands it. The beauty of this is that none of these patterns require a special framework. They're just Ruby classes, organised by responsibility, tested in isolation. The framework gets out of your way when you ask it to.

The rule of thumb I use: if a piece of logic doesn't clearly belong to a single model, a single view, or a single controller, it probably belongs to a new object. Give that object a name, give it a single responsibility, and your future self will thank you.
