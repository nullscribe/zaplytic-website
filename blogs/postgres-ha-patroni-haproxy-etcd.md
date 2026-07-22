---
slug: postgres-ha-patroni-haproxy-etcd
title: "Bulletproof Postgres: Building a High-Availability Cluster With Patroni, HAProxy, and etcd"
description: "A practical, hands-on walkthrough of setting up a real Postgres HA cluster using Patroni for failover, etcd for distributed consensus, and HAProxy for routing — including the failure modes the tutorials don't mention."
date: "2025-12-31"
author: "Jahid Hasan"
tags: [postgres, patroni, haproxy, etcd, high-availability, database, devops]
featured: true
---

If you're running Postgres in production and your architecture is "one primary, take backups, pray", you have a single point of failure. When that primary dies — and it will, eventually, whether from disk failure, OOM, network blip, or a cloud provider's scheduled maintenance — your app goes down until you restore from backup. That's minutes to hours of downtime, plus potential data loss for whatever was in WAL not yet shipped.

The fix is high availability: a primary that can fail over automatically to a replica when things go wrong, with clients none the wiser. In the Postgres world, the stack most people converge on in 2025 is **Patroni + etcd + HAProxy**. Let's walk through what each piece does, how to set them up, and where the sharp edges are.

### The Architecture at a Glance

Three moving parts, each with a clear job:

1.  **etcd** — a distributed, consistent key-value store. It's the source of truth for "who is the current primary". Patroni uses it for leader election and consensus. You need at least 3 nodes for a quorum that tolerates 1 failure (the classic Raft rule: 2N+1 nodes tolerate N failures).
2.  **Patroni** — a Python daemon that runs on every Postgres node. It manages the local Postgres instance, talks to etcd to coordinate leader election, and performs automatic failover when the primary becomes unreachable.
3.  **HAProxy** — a TCP load balancer that sits in front of your Postgres nodes. It health-checks each node via Patroni's REST API and routes writes to the primary, reads to replicas. Your app talks to HAProxy; HAProxy figures out where to send the query.

The flow looks like this:

```
App --> HAProxy --> Primary Postgres (Patroni-managed)
                  \-> Replica Postgres (Patroni-managed)
                         ^
                         |
            etcd cluster (3 nodes) <-- Patroni on each Postgres node
```

### Why Not Just Use Streaming Replication?

Postgres has built-in streaming replication. You set up a primary, configure a replica with a `primary_conninfo`, and you have a hot standby. Why do you need Patroni on top?

Because streaming replication only gives you a *replica*. It doesn't give you *automatic failover*. When the primary dies, you have to manually promote the replica — which means a human has to notice, log in, and run `pg_promote()`. That's not high availability; that's disaster recovery with extra steps.

Patroni adds the brain that detects the primary is down, picks the most-recent replica, promotes it, updates etcd so all other nodes know about the new topology, and reconfigures them to follow the new primary. All without a human in the loop, typically in 10–30 seconds.

### Step 1: Set Up etcd

You need an etcd cluster of 3 nodes (minimum) running separately from your Postgres nodes. They can be small VMs — etcd is lightweight. Here's the config for one node:

```yaml
# /etc/etcd/etcd.conf
name: 'etcd-1'
data-dir: '/var/lib/etcd'
listen-peer-urls: 'http://10.0.0.1:2380'
listen-client-urls: 'http://10.0.0.1:2379'
initial-advertise-peer-urls: 'http://10.0.0.1:2380'
advertise-client-urls: 'http://10.0.0.1:2379'
initial-cluster: 'etcd-1=http://10.0.0.1:2380,etcd-2=http://10.0.0.2:2380,etcd-3=http://10.0.0.3:2380'
initial-cluster-state: 'new'
initial-cluster-token: 'patroni-cluster'
```

Start it on all three nodes, verify the cluster is healthy:

```bash
etcdctl --endpoints=http://10.0.0.1:2379,http://10.0.0.2:2379,http://10.0.0.3:2379 \
  endpoint health --cluster
```

You should see all three endpoints report `is healthy`. If any one is down, fix that before proceeding — Patroni will not behave correctly with a sick etcd cluster.

### Step 2: Configure Patroni

On each Postgres node, install Patroni (`pip install patroni[etcd]`) and create a config file. Here's a working example for node 1:

```yaml
# /etc/patroni/patroni.yml
scope: pg-cluster
name: pg-node-1

restapi:
  listen: 0.0.0.0:8008
  connect_address: 10.0.1.1:8008

etcd:
  hosts: 10.0.0.1:2379,10.0.0.2:2379,10.0.0.3:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      parameters:
        wal_level: replica
        hot_standby: 'on'
        max_wal_senders: 10
        max_replication_slots: 10
        wal_keep_size: 2048

  initdb:
    - encoding: UTF8
    - data-checksums

postgresql:
  listen: 0.0.0.0:5432
  connect_address: 10.0.1.1:5432
  data_dir: /var/lib/postgresql/data
  bin_dir: /usr/lib/postgresql/15/bin
  authentication:
    replication:
      username: replicator
      password: <a-strong-password>
    superuser:
      username: postgres
      password: <another-strong-password>
  pg_hba:
    - host replication replicator 10.0.1.0/24 md5
    - host all all 0.0.0.0/0 md5

tags:
  nofailover: false
  noloadbalance: false
  clonefrom: false
  nosync: false
```

Key settings worth understanding:

- **`ttl: 30`** — the leader lease in etcd lasts 30 seconds. If the primary doesn't renew within 30s, a new leader is elected. Lower = faster failover, but more sensitive to network blips. 30s is a sane default.
- **`loop_wait: 10`** — Patroni checks the cluster state every 10 seconds. Combined with `ttl`, this gives you a failover window of roughly 30–40 seconds in the worst case.
- **`maximum_lag_on_failover: 1048576`** (1MB) — a replica with more than 1MB of replication lag will *not* be promoted. This protects you from promoting a stale replica and losing committed data. Tune this carefully — too low and you may not be able to fail over at all under heavy write load.

Start Patroni on the first node. It will bootstrap a fresh Postgres cluster and acquire leadership. Then start Patroni on nodes 2 and 3 — they'll notice a primary exists, clone it via `pg_basebackup`, and join as replicas.

Verify the cluster state:

```bash
patronictl -c /etc/patroni/patroni.yml list
```

You should see something like:

```
+ Cluster: pg-cluster -----+---------+----+-----------+
| Member    | Host      | Role    | State   | TL | Lag in MB |
|-----------|-----------|---------|---------|----|-----------|
| pg-node-1 | 10.0.1.1  | Leader  | running |  1 |           |
| pg-node-2 | 10.0.1.2  | Replica | streaming | 1 |         0 |
| pg-node-3 | 10.0.1.3  | Replica | streaming | 1 |         0 |
```

### Step 3: HAProxy as the Traffic Cop

HAProxy sits in front of all Postgres nodes and uses Patroni's REST API to figure out which node is the primary. The config:

```haproxy
# /etc/haproxy/haproxy.cfg
global
  log stdout format raw local0

defaults
  log global
  mode tcp
  option tcplog
  timeout connect 5s
  timeout client 30s
  timeout server 30s

frontend postgres_write
  bind *:5432
  default_backend postgres_primary

frontend postgres_read
  bind *:5433
  default_backend postgres_replicas

backend postgres_primary
  option httpchk OPTIONS /primary
  http-check expect status 200
  default-server inter 3s fall 3 rise 2
  server pg-node-1 10.0.1.1:5432 check port 8008
  server pg-node-2 10.0.1.2:5432 check port 8008
  server pg-node-3 10.0.1.3:5432 check port 8008

backend postgres_replicas
  option httpchk OPTIONS /replica
  http-check expect status 200
  balance roundrobin
  default-server inter 3s fall 3 rise 2
  server pg-node-1 10.0.1.1:5432 check port 8008
  server pg-node-2 10.0.1.2:5432 check port 8008
  server pg-node-3 10.0.1.3:5432 check port 8008
```

Patroni's REST API exposes two endpoints that make this work:

- `GET /primary` returns 200 only on the current primary.
- `GET /replica` returns 200 only on replicas.

So HAProxy will only route writes to the primary, and when failover happens, within a few seconds the new primary's `/primary` endpoint starts returning 200 and HAProxy automatically starts routing traffic there. Your app, talking to HAProxy's IP, sees a brief blip and then continues working against the new primary.

Your app's connection string becomes a single hostname: `postgres://app:password@haproxy:5432/app_db`. Writes go through the write frontend. If you want read scaling, point read-heavy queries at port 5433 and they'll be load-balanced across replicas.

### Step 4: Test the Failover (Before Production Does)

The single most important step in this whole setup is to test failover yourself, in staging, before production tests it for you. The command is trivial:

```bash
patronictl -c /etc/patroni/patroni.yml switchover
```

This performs a graceful switchover: it picks a replica, promotes it, demotes the old primary, and reconfigures everything. Watch HAProxy logs — you'll see it mark the old primary down within ~3 seconds and the new primary up within ~3 seconds after that. Total perceived downtime from the app's perspective: typically 5–10 seconds.

Then test a *real* failure: kill the Patroni process on the primary (`kill -9`), or just `systemctl stop postgresql` on the primary. This is the scenario you're actually building for. The cluster should detect the failure within `ttl + loop_wait` seconds (~30–40s with default settings) and promote a replica automatically.

If you've never run this test, you don't have high availability. You have the *appearance* of high availability, which is worse, because it makes you overconfident.

### The Failure Modes Nobody Mentions

This stack is solid, but it has sharp edges. The ones that have bitten me:

- **Split-brain with a network partition.** If the primary loses contact with etcd but is still reachable from clients, it will keep accepting writes *thinking* it's still primary, while the rest of the cluster has already elected a new primary. Patroni has a `standby_cluster` mechanism and `pg_rewind` to recover from this, but the recovery is not instant and data written to the old primary during the split may be lost. Use synchronous replication (`synchronous_mode: true`) if you can afford the latency hit — it guarantees no commits are acknowledged without a replica confirming receipt.
- **Replication lag during failover.** If your workload is write-heavy and a replica falls behind, Patroni may refuse to promote it (because of `maximum_lag_on_failover`). In that case, you have a dead primary and no eligible replica. The cluster stays down. Monitor replication lag like a hawk — set alerts on `pg_stat_replication.replay_lag`.
- **etcd is itself a single point of coordination.** If you lose 2 of 3 etcd nodes, Patroni loses quorum and cannot elect a leader. Your existing primary will actually *step down* rather than risk split-brain. This is the correct behaviour, but it means an etcd outage takes down your Postgres cluster even if all Postgres nodes are healthy. Run etcd on separate infrastructure from Postgres.
- **HAProxy is now a critical component.** If HAProxy itself dies, your app can't reach Postgres even though Postgres is fine. Run HAProxy in a high-availability configuration (keepalived with VRRP) or use a managed load balancer in front of it.

### Monitoring: What to Watch

The non-negotiable alerts for this stack:

1.  **etcd cluster health** — alert if any etcd member is unhealthy or if the leader changes unexpectedly.
2.  **Patroni cluster role** — alert if there's no leader, or if the leader changes outside a planned switchover.
3.  **Replication lag** — alert if any replica's `replay_lag` exceeds a few seconds for more than a minute.
4.  **HAProxy backend health** — alert if any Postgres backend is marked down.
5.  **Connection pool saturation** — if you're using PgBouncer in front of Postgres (you should be), alert on pool saturation. Failover is meaningless if your connection pool is exhausted.

### Conclusion: HA Is a Mindset, Not a Setup

The Patroni + etcd + HAProxy stack works. It's the architecture used by Zalando (who created Patroni), by Compose, by Aiven, and by countless teams running Postgres at scale. The components are mature and battle-tested. But the stack itself is only half the equation. The other half — the half that actually determines whether you'll survive a production failure — is the operational discipline around it. Test your failovers. Monitor your lag. Understand your failure modes. Page yourself when etcd hiccups.

High availability is not a thing you install. It's a thing you practice. The stack gives you the tools; the practice is what makes it bulletproof.
