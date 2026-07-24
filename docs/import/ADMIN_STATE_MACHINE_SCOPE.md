# P08 ADMIN-STATE-MACHINE

P08 extends the existing protected `/admin/imports/readiness` Pharmacy workflow without creating a parallel authority. The ten visible stages are derived only from persisted server readback: Dry Run, Exact Review, Authorization Ready, Reservation, Reservation Verified, Private Publish, Publish Verified, Rollback, Exact Recovery Verified, and Bounded Audit History.

The UI provides explicit readback-only refresh, server revision binding for stale and multi-tab submissions, expiry countdown, stale/expired fail-closed state, client pending lock for double-submit protection, bounded fresh/replayed receipts, manual Preview-only rollback through the existing atomic authority, P07 exact-recovery comparison, and at most ten bounded audit events.

Every write remains actor/entity allowlisted, single-entity, Pharmacy-only, private/noindex/no-route/no-sitemap, and accepted only after persisted post-operation readback. Reservation, private mutation, and rollback are never retried automatically. Raw durable references, protected values, persistence identifiers, and unrestricted payloads are not serialized to the browser.

P08 adds no migration, RLS policy, RPC, snapshot authority, rollback authority, or public route. P09 real Admin canary, Production access, public/index/sitemap/route promotion, Agent, Content, Hospital, Doctor, Registry, and Bulk remain closed.
