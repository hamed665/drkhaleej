# WORKER-RUNTIME-ADR

## Roadmap decision

The approved next gate after `ENTITY-RESOLUTION-GATE` is the documentation-only
`WORKER-RUNTIME-ADR` gate from the staged AI Agent program. This decision opens only the
architecture work needed to make the Worker boundary reviewable. It does not open P19 runtime
implementation.

Four-axis mapping:

- Execution Phase: 9 — Production Hardening
- Lock Scope: 10 — SEO Ops, Redirects, Import, Duplicate Tools
- Product Module: 6 — Admin Foundation
- Subphase ID: `WORKER-RUNTIME-ADR`

## Required decisions

The gate is complete only when one reviewed ADR bundle records all of the following without
placeholders:

- one repository with separately deployed Web/Admin and long-lived Worker runtimes;
- the concrete Worker host, owner, deployment boundary and rollback procedure;
- the Postgres/Supabase job control plane, atomic lease transitions, increasing lease epoch and
  stale-worker fencing semantics;
- the service-identity provider, signed-token algorithm and key lifecycle, audience, canonical
  scope vocabulary, five-minute maximum TTL, `jti` replay protection and rotation/revocation drill;
- the private raw-observation storage provider, access boundary, encryption, default 30-day
  retention, approved dispute extension, deletion job and access audit;
- the observability provider and a redaction/retention policy that cannot fall back to raw payloads,
  credentials or reviewer session material;
- egress and SSRF controls, redirect/DNS revalidation, size/time limits and source-policy
  enforcement boundaries;
- transactional outbox and bounded notification ownership;
- kill switches for global automation, source, family, AI calls and notifications;
- owners, plans, hard/soft caps, alerts and current monthly cost for Worker compute, storage,
  observability, notifications and security;
- Preview-only integration and two-worker reclaim evidence required before any runtime activation.

## Fixed authority boundary

The Worker may eventually receive only the approved `job:*`, `draft:write`, `evidence:write` and
`report:write` scopes. It must never receive `publish`, `rollback`, `public_promote`,
`index_promote` or `sitemap_promote`. n8n remains limited to bounded `job:create` and `job:read`.

Entity decisions remain additive records. This gate does not apply a review decision, mutate a
Candidate, resolve or merge a duplicate, verify geo, write a canonical entity, create a publish
Authorization or Reservation, expose an Admin control, activate a connector, or enable Content,
Hospital, Doctor, later-family, Bulk or Production behavior.

## Exit and stop conditions

The gate exits only after the ADR bundle is independently reviewed and every required provider,
owner, retention, cost, security and recovery choice is concrete. The separately reviewable next
implementation may then be named `AUTOMATION-JOB-RUNTIME`; it is not authorized by this document.

Stop at this gate when any host, identity, storage, observability, egress, cost, compliance,
retention, reviewer or Preview-isolation decision is missing or ambiguous. No migration, runtime
code, dependency, secret, external resource, deployment or Production connection may be added
while completing this gate.
