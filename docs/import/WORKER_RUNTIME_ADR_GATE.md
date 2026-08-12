# WORKER-RUNTIME-ADR

## Roadmap decision

The documentation-only `WORKER-RUNTIME-ADR` gate after `ENTITY-RESOLUTION-GATE` is decision-complete.
The accepted bundle is [`WORKER_RUNTIME_ARCHITECTURE_DECISION.md`](WORKER_RUNTIME_ARCHITECTURE_DECISION.md).
It selects the providers, ownership, authority, security, retention, recovery and cost boundaries
needed to make the next Worker implementation reviewable. It does not open P19 runtime implementation.

Four-axis mapping:

- Execution Phase: 9 — Production Hardening
- Lock Scope: 10 — SEO Ops, Redirects, Import, Duplicate Tools
- Product Module: 6 — Admin Foundation
- Subphase ID: `WORKER-RUNTIME-ADR`

## Gate resolution

The accepted ADR records all required choices without implementation placeholders:

- one repository; Web/Admin on Vercel and one separately deployed long-lived Render Background
  Worker Starter instance in Frankfurt;
- existing Supabase Postgres behind a Vercel internal API, atomic leases, increasing lease/control
  epochs and stale-worker fencing;
- the DrKhaleej internal Ed25519 service issuer, exact audience/scopes, 300-second maximum TTL,
  `jti` replay protection and a 90-day key lifecycle with revocation drill;
- one private Supabase Storage bucket, AES-256/TLS provider encryption, 30-day default retention,
  reason-bound 90-day maximum dispute retention, deletion and access audit;
- Sentry Developer with 30-day sanitized retention and no raw-payload/log fallback;
- source-policy allowlisting, DNS/IP/redirect revalidation, bounded time/size/rate/concurrency and
  outbound-byte enforcement;
- transactional outbox and Resend Free email delivery with application/provider caps;
- global, source, family, AI and notification kill switches;
- `hamed665` ownership, exact plans, USD 0 current cost, USD 7 selected steady incremental cost,
  hard stops and alerts;
- exact-SHA isolated Preview integration and adversarial two-worker reclaim proof before activation.

## Fixed authority boundary

The Worker may eventually receive only the approved `job:*`, `draft:write`, `evidence:write` and
`report:write` scopes. It must never receive `publish`, `rollback`, `public_promote`,
`index_promote` or `sitemap_promote`. n8n remains limited to bounded `job:create` and `job:read`.

Entity decisions remain additive records. This gate does not apply a review decision, mutate a
Candidate, resolve or merge a duplicate, verify geo, write a canonical entity, create a publish
Authorization or Reservation, expose an Admin control, activate a connector, or enable Content,
Hospital, Doctor, later-family, Bulk or Production behavior.

## Exit and stop conditions

After this bundle is independently approved and merged, the separately reviewable current next may
be named `AUTOMATION-JOB-RUNTIME`; it is not authorized by this document. That future PR must begin
with every switch off and may target only the isolated Preview evidence contract in the accepted ADR.

Reopen this gate and stop if a selected host, identity, storage, observability, notification, egress,
cost, retention, owner, reviewer or Preview-isolation choice changes or becomes ambiguous. No
migration, runtime code, dependency, secret, external resource, deployment or Production connection
is added by this gate-completion change.
