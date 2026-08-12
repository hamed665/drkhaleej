# Automation Job Runtime

## Scope

- Subphase: `AUTOMATION-JOB-RUNTIME`
- Four-axis mapping: Execution Phase 9 / Lock Scope 10 / Product Module 6 /
  `AUTOMATION-JOB-RUNTIME`
- Accepted architecture: `WORKER_RUNTIME_ARCHITECTURE_DECISION.md`
- Database migration: `0095_import_automation_job_runtime.sql`
- Contract schema: `1.2.2`
- Runtime schema: `drkhaleej.import.automationJobRuntime.v1`
- Environment: isolated Preview only

This change implements the smallest fail-closed P19 control plane and Worker shell. It does not
apply Human Review decisions, mutate canonical entities, publish, roll back published entities, or
promote public, Index, or Sitemap state. Content, Hospital, Doctor, future families, Bulk, external
AI, notification delivery, raw-object storage, and Production execution remain outside this scope.

## Closed-by-default authority

Migration `0095_import_automation_job_runtime.sql` creates private, RLS-enabled queue, control,
identity, replay, artifact-hash, bounded notification-outbox, and audit tables. Direct table access
is revoked, and the Vercel internal API may call only explicitly granted `SECURITY DEFINER` RPCs.
The Worker receives no Supabase, database, Storage, or canonical-write credential.

The migration seeds the global, Pharmacy-family, AI, and notification controls off. Both service
identities are inactive with no active key IDs. In other words, all controls and identities default disabled.
No route can run unless the application is explicitly marked Preview, the emergency switch is true,
the Preview and Production project references differ, and the Supabase URL resolves to Preview but
not Production.

The bounded service identities are:

| Identity | Exact scopes |
| --- | --- |
| `urn:drkhaleej:service:n8n-preview` | `job:create`, `job:read` |
| `urn:drkhaleej:service:worker-preview` | `job:lease`, `job:execute`, `job:heartbeat`, `job:complete`, `draft:write`, `evidence:write`, `report:write` |

`publish`, `rollback`, and public/Index/Sitemap promotion scopes do not exist. Each request uses an
Ed25519 JWT with a maximum 300-second TTL, exact audience, issuer/subject/key/scope vocabulary,
method/path/body-hash binding, and one-use `jti`. Protected Worker writes also bind the boot-unique
Worker instance UUID, Job UUID, and lease epoch.

## Lease and fencing invariants

Claim uses `FOR UPDATE SKIP LOCKED`. At most one concurrent Worker receives a random 256-bit lease
token; only its SHA-256 digest is stored. A lease lasts 60 seconds, the Worker heartbeat contract is
20 seconds, and every new or reclaimed lease increments the epoch. Expired `leased` and `running`
jobs are eligible for atomic reclaim until the fixed three-attempt ceiling is reached.

Start, heartbeat, artifact write, and completion require an exact unexpired tuple of subject,
Worker instance, token digest, lease epoch, and the control epochs captured at claim. Disabling the
global, family, or source control increments its epoch and cancels active matching jobs. This fences
in-flight Workers immediately. Completion and its bounded outbox row are one database transaction;
an exact completion replay creates no second outbox event.

Artifacts contain only kind, SHA-256 payload hash, idempotency key, Worker instance, and lease epoch.
No raw payload, fetched page, credential, email address, phone number, or provider response belongs
in these tables. Outbox delivery is not implemented or authorized in this change.

## Runtime declaration

`render.yaml` declares the accepted single Frankfurt Starter background Worker with manual deploy,
one instance, and both runtime switches false. `scripts/automation/worker.mjs` stays idle unless the
Preview boundary, emergency switch, and separate runtime-probe switch are all explicitly enabled.
Its only implemented operation is a bounded `report` probe that ends in `waiting_review`.

Render provisioning is not performed by this PR. No paid resource, key pair, webhook, bucket,
Sentry project, Resend sender, or external secret has been created, and no cost has been incurred by
this repository change. Provisioning and activating the Preview loop require a separately approved
`AUTOMATION-JOB-PREVIEW-ACTIVATION` gate and the complete evidence bundle specified by the accepted
architecture decision.

## Verification and rollback

Static validation rejects downstream authority, embedded credentials, public RPC grants, unexpected
Worker credentials, and unsafe Render drift. Unit tests cover exact runtime contracts, Ed25519
request binding, identity/body binding, and the bounded control-plane operation map. The hosted
Preview proof checks schema/privileges, one-use `jti`, concurrent claim, expired-lease reclaim,
stale-worker fencing, artifact hashing, exact completion replay, and single bounded outbox creation.
It removes its fixtures and restores the original disabled controls and identities.

Code rollback removes the route, Worker shell, and declaration. Database rollback is forward-only:
keep all controls and identities disabled, remove fixture data, revoke P19 RPC grants if necessary,
and retire the private tables in a separately reviewed migration. Production remains disconnected.
