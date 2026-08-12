# Worker Runtime Architecture Decision

## Decision status

- Decision date: 2026-08-12
- Status: accepted architecture decision; implementation remains closed
- Four-axis mapping: Execution Phase 9 / Lock Scope 10 / Product Module 6 /
  `WORKER-RUNTIME-ADR`
- Decision owner: repository and platform owner Hamed Minaee (`hamed665`)
- Independent acceptance: the pull request carrying this decision must be approved under the active
  protected-`main` independent-review rule before the decision is effective on `main`
- Separately reviewable next implementation after acceptance: `AUTOMATION-JOB-RUNTIME`

This document closes architecture choices only. It provisions no service, creates no secret, adds no
dependency, migration, route, Worker process or deployment, and connects to neither Production nor a
Production credential. `AUTOMATION-JOB-RUNTIME` remains a separate pull request with its own approval,
Preview proof and stop conditions.

```json worker-runtime-adr
{
  "schemaVersion": "drkhaleej.workerRuntimeAdr.v1",
  "status": "accepted-decision-implementation-closed",
  "decisionDate": "2026-08-12",
  "decisionOwner": "hamed665",
  "implementationAuthorized": false,
  "productionAuthorized": false,
  "nextImplementation": "AUTOMATION-JOB-RUNTIME",
  "webRuntime": "Vercel Web/Admin",
  "worker": {
    "provider": "Render Background Worker",
    "region": "frankfurt",
    "plan": "Starter",
    "instances": 1,
    "steadyMonthlyUsd": 7
  },
  "jobControl": {
    "provider": "existing Supabase Postgres",
    "workerDatabaseCredential": false,
    "boundary": "Vercel internal automation API plus transactional Postgres RPC"
  },
  "identity": {
    "provider": "DrKhaleej internal service issuer",
    "algorithm": "Ed25519",
    "audience": "urn:drkhaleej:internal-automation:v1",
    "maxTtlSeconds": 300,
    "jtiReplayProtection": true
  },
  "storage": {
    "provider": "Supabase Storage private bucket",
    "defaultRetentionDays": 30,
    "maximumDisputeRetentionDays": 90,
    "hardCapacityGb": 1
  },
  "observability": {
    "provider": "Sentry",
    "plan": "Developer",
    "retentionDays": 30,
    "monthlyUsd": 0
  },
  "notifications": {
    "provider": "Resend",
    "plan": "Free",
    "applicationDailyCap": 20,
    "applicationMonthlyCap": 500,
    "monthlyUsd": 0
  },
  "security": {
    "provider": "GitHub public-repository secret scanning and Dependabot",
    "monthlyUsd": 0
  },
  "deniedScopes": [
    "publish",
    "rollback",
    "public_promote",
    "index_promote",
    "sitemap_promote"
  ]
}
```

## 1. Deployment topology and ownership

One Git repository remains authoritative. The deployments are separate:

| Boundary | Concrete decision |
| --- | --- |
| Web/Admin | The existing Vercel deployment remains the only browser-facing and internal HTTP boundary. Its request runtime does not poll or run a perpetual process. |
| Worker | One Render **Background Worker**, Starter instance, in `frankfurt`; no public HTTP endpoint, persistent disk, Render datastore or private-network peer. Frankfurt is a concrete choice from Render's supported regions and is the nearest available Render region to the Oman-first workload. |
| Source | The Worker is built from the same reviewed repository commit but has its own build/start command, environment, identity key, secrets and deployment history. |
| Owner | `hamed665` owns Render, Vercel, Supabase, Sentry, Resend, service-key rotation, cost review, incident response and rollback. Independent PR approval is not operational ownership. |
| Scale | Manual scale fixed at one instance. Autoscaling is disabled. The hosted fencing proof may run two separately identified Worker processes inside the one Preview instance; it may not buy a second instance. |

The future Preview service name is `drkhaleej-automation-worker-preview`. It must use
`APP_ENV=preview`, auto-deploy **off**, and a manually selected exact reviewed commit. The service may
call only the exact Vercel Preview host recorded in the evidence run. Production domains, Production
Supabase identity and Production credentials are forbidden.

Render supports long-running background services, Frankfurt, manual deploy control and reuse of
recent build artifacts for rollback. The selected Starter compute is currently USD 7/month. See the
official [Render pricing](https://render.com/pricing), [region list](https://render.com/docs/regions),
[deploy controls](https://render.com/docs/deploys), [Blueprint boundary](https://render.com/docs/blueprint-spec)
and [rollback behavior](https://render.com/docs/rollbacks).

### Deployment and rollback procedure

1. Only a separately approved P19 may add the Worker build/start boundary and Preview service
   declaration. Its default global kill switch is off.
2. Record the Git SHA, Vercel Preview URL, isolated Preview Supabase identity and Render deploy ID.
3. Run static gates, exact-SHA Preview integration and the two-worker fencing proof before enabling
   any job family.
4. For rollback, disable the global kill switch first. This atomically increments the control epoch,
   cancels active leases and blocks lease, heartbeat, checkpoint, draft, evidence, report and complete
   calls.
5. Wait one lease interval, verify zero active leases and zero notification claims, then use Render's
   previous successful build artifact. If that artifact is unavailable, redeploy the recorded prior
   Git SHA.
6. Database migrations are forward-only and must remain compatible with the immediately previous
   Worker build. Rollback never edits or reverses an applied migration.
7. Re-run the Preview smoke proof. Re-enabling the global switch requires an explicit owner action and
   a recorded audit event; it is never automatic.

## 2. Job control plane and fencing

The existing Supabase Postgres project is the only job-control datastore. The Worker receives **no**
database URL, Supabase secret/service-role key or direct Storage credential. It calls a Vercel
server-only internal automation API with its scoped service token. That API validates identity,
scope, request binding, replay and kill switches, then calls narrowly granted transactional Postgres
RPCs. The browser never receives these tokens or responses.

The P19 schema must implement these states and no implicit alternatives:

`queued -> leased -> running -> waiting_review | succeeded | failed_retryable | failed_terminal |
deferred_budget | cancelled`

- Claim is one transaction using `FOR UPDATE SKIP LOCKED` or an equivalently atomic RPC.
- Lease duration is 60 seconds; heartbeat cadence is 20 seconds. Postgres `clock_timestamp()` is the
  sole lease clock. Client clocks never extend authority.
- Each claim or reclaim increments a monotonically increasing `lease_epoch` and returns a random
  256-bit lease token once. Only its SHA-256 digest is stored.
- Every heartbeat, checkpoint, draft/evidence/report write and completion must match job ID, exact
  Worker subject, boot-unique Worker instance UUID, lease-token digest, `lease_epoch`, current control
  epoch and an unexpired lease in the same transaction. Zero matched rows is a bounded stale-lease
  error.
- Reclaim is legal only when `lease_expires_at <= clock_timestamp()`. The prior Worker is fenced from
  every later write, including completion.
- Retryable read/transform work has at most three total attempts with bounded backoff. Ambiguous
  writes, Human Review, publish, rollback and promotions are never retried automatically.
- A unique idempotency key binds job type, family, source-policy version, bounded target reference and
  canonical input hash. Replays return the existing bounded job state.
- Pause prevents new leases. Cancel and every applicable kill switch invalidate the current lease by
  incrementing the relevant control/lease epoch.

### Transactional outbox

Job completion and its bounded outbox row are committed in one transaction. The outbox contains only
an event type, template ID, locale, bounded status, hashed reference and deduplication key—never raw
observation content, credentials, URLs with query strings or reviewer/session material. The Resend
dispatcher claims one row atomically, uses the deduplication key, attempts delivery at most three
times, and records provider message ID or a bounded failure code. A notification failure cannot
re-run the completed job.

## 3. Service identity and authority

The concrete provider is the repository-owned **DrKhaleej internal service issuer**, implemented with
the fully specified JOSE `Ed25519` algorithm. It is intentionally independent of browser Supabase
Auth and of Supabase's broad service-role key.
[RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) defines the JWT claims and replay-capable
`jti`; [RFC 8037](https://www.rfc-editor.org/info/rfc8037/) defines Ed25519 key use in JOSE and
[RFC 9864](https://www.rfc-editor.org/info/rfc9864/) defines the fully specified `Ed25519` algorithm
identifier.

Every request uses a new signed JWT with:

- exact `alg=Ed25519`, a known `kid`, and no algorithm negotiation;
- `iss` and `sub` equal to one registered service identity:
  `urn:drkhaleej:service:worker-preview` or `urn:drkhaleej:service:n8n-preview`;
- exact `aud=urn:drkhaleej:internal-automation:v1`;
- `iat`, `exp`, `jti`, space-delimited `scope`, HTTP method, normalized path and
  `req_sha256` body hash;
- a boot-unique `worker_instance` UUID for Worker calls; n8n tokens must not carry it;
- TTL no greater than 300 seconds and accepted clock skew no greater than 30 seconds.

The API atomically inserts the SHA-256 digest of `(iss, jti)` into a replay table before executing a
protected operation. The unique constraint rejects reuse. Replay records expire 10 minutes after
token expiry. Tokens, JOSE headers, signing keys and request bodies are never logged.

### Canonical scopes

| Identity | Exact allowed scopes |
| --- | --- |
| Worker | `job:lease`, `job:execute`, `job:heartbeat`, `job:complete`, `draft:write`, `evidence:write`, `report:write` |
| n8n | `job:create`, `job:read` |
| Admin human | Existing authenticated platform-admin session; not a service token and no Worker scope |

No token, role, route or adapter may accept `publish`, `rollback`, `public_promote`,
`index_promote` or `sitemap_promote`. Unknown or wildcard scopes fail closed. The Worker cannot apply
an Entity Resolution decision, mutate a canonical entity, issue Authorization/Reservation or touch
the existing publication authorities.

### Key lifecycle and emergency revocation

- Each issuer has a separate Ed25519 key pair and `kid` formatted
  `<issuer>-YYYYMMDD-<sequence>`. Private keys exist only in that issuer's encrypted runtime secret
  store; public JWKs and activation/revocation state are server-only verifier data.
- Normal rotation is every 90 days. Add and deploy the new public JWK, verify dual-key acceptance in
  Preview, activate the new private key, wait 10 minutes, then revoke the old `kid`. Maximum planned
  overlap is 24 hours.
- Emergency response disables global automation, revokes the affected `kid`, increments the control
  epoch, expires all active leases, rotates the private key and runs one old-token/new-token drill.
  Old token, old lease and replayed `jti` must all be rejected before re-enable.
- No key is copied between Vercel, Render and n8n. No key or Supabase secret is committed, placed in
  client code or included in logs/traces.

## 4. Raw observation storage and retention

Raw HTML/JSON is stored only in a private, environment-specific Supabase Storage bucket named
`automation-raw-observations-preview`. The canonical database stores only the observation ID,
content SHA-256, byte count, bounded MIME type, source-policy ID/version, captured/expiry timestamps
and an opaque object-reference digest.

- Bucket is private; no public URL or public policy exists. Supabase private buckets apply RLS to
  every operation and Supabase encrypts customer data at rest with AES-256 and in transit with TLS.
  See [private bucket controls](https://supabase.com/docs/guides/storage/buckets/fundamentals) and
  [Supabase security](https://supabase.com/security).
- Worker requests a one-object, non-upsert signed upload capability only after scope/policy checks.
  The fixed object path is
  `v1/preview/<job-uuid>/<observation-uuid>/<content-sha256>`; user filenames and source URLs are not
  used. Maximum object size is 2 MiB compressed and 5 MiB after decompression.
- Default expiry is capture time plus 30 days. A platform-admin may extend a disputed/evidentiary
  observation once, with a reason and immutable audit, to at most 90 days from capture.
- A daily deletion job selects expired rows, deletes Storage objects, verifies absence and writes a
  bounded deletion audit. Failed deletion is retried at most three times and then pages the owner.
  Supabase Storage deletion is permanent because object versioning is unavailable.
- Reviewer access requires the existing platform-admin session, an entered reason and an audit row
  written before a read capability is issued. The read URL lasts 60 seconds and is never logged or
  rendered into public/browser cacheable output.
- The Worker program has a hard 1 GiB bucket budget. At 700 MiB an owner alert fires; at 850 MiB new
  captures pause; at 1 GiB signed upload creation fails closed. Deletion and audit remain available.

The selected capacity stays inside Supabase's current 1 GiB Free quota or the larger included paid
quota, so attributed incremental storage cost is USD 0. Supabase documents both the quota and the
USD 0.0213/GB-month paid overage rate in its [pricing](https://supabase.com/pricing) and
[Storage usage](https://supabase.com/docs/guides/platform/manage-your-usage/storage-size) pages.

## 5. Observability and redaction

Sentry Developer is the concrete provider: USD 0/month, 5,000 errors, 5 GB logs, 5 million spans and
a 30-day lookback under the current [Sentry pricing](https://sentry.io/pricing/). Pay-as-you-go and
attachments are disabled. Sentry is for sanitized exception/trace metadata; the Postgres job ledger
remains the authoritative operational record.

Required defaults are `sendDefaultPii=false`, request bodies/headers/cookies/query strings disabled,
attachments disabled, session replay disabled and a fail-closed `beforeSend` scrubber. Allowed fields
are event code, job type, family, source-policy ID/version, attempt, lease epoch, duration bucket and
irreversible identifier digests. Raw payload, extracted text, object key/URL, email, phone, credential,
JWT, lease token, reviewer reason and session material are denied.

If Sentry rejects, exhausts quota or is unavailable, the application may emit only the same bounded
event code to the internal job ledger. It must never fall back to `console` with an exception object,
request, response, environment or raw payload. Alerts fire for stale lease, fencing rejection,
terminal failure, deletion failure, notification dead letter and Sentry 50%/80% quota. Sentry quota
exhaustion has a USD 0 hard cost and does not weaken job safety.

## 6. Egress and SSRF boundary

The Worker has no inbound endpoint and no direct database/storage credential. All external source
access must pass through one repository-owned safe-fetch adapter; direct imports of `fetch`,
`http`, `https`, socket or alternate HTTP clients are forbidden elsewhere in Worker code and checked
statically.

Each source policy must be approved before use and pins exact hostnames (no wildcard), HTTPS, port
443, allowed path prefix, methods, MIME types, rate, concurrency, byte limits, retention and legal/
robots basis. The adapter:

- normalizes IDN/hostname/path, rejects credentials and fragments, and accepts HTTPS/443 only;
- resolves every A/AAAA record before connection, pins a validated address for that connection and
  rejects loopback, private, link-local, multicast, unspecified, carrier-grade NAT, documentation,
  benchmark and cloud-metadata ranges plus metadata hostnames;
- performs the same DNS/IP/source-policy validation on every redirect, permits at most three
  redirects and rejects HTTPS downgrade or host escape;
- enforces 3-second connect, 5-second idle-read and 15-second total timeouts;
- rejects advertised or streamed bodies beyond 2 MiB compressed or 5 MiB decompressed and accepts
  only the source policy's MIME allowlist;
- starts with global concurrency one, per-source concurrency one and at most 60 requests/hour unless
  a lower source limit is recorded;
- records only bounded status, timing, byte count and content hash.

The runtime counts all outbound bytes. At 3 GiB/month it alerts; at 4 GiB it stops new source fetch,
Storage upload, AI and notification dispatch while allowing heartbeat/cancel/complete. This stays
below Render Hobby's documented 5 GiB included outbound allowance and prevents the USD 0.15/GB
overage described in Render's [bandwidth policy](https://render.com/docs/outbound-bandwidth). The
policy follows OWASP's positive allowlist, redirect and DNS-rebinding guidance in the
[SSRF prevention reference](https://owasp.org/Top10/2021/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/).

## 7. Kill switches

All switches default off when absent. Every lease and every protected write rechecks the relevant
switch in the same transaction.

| Switch | Required effect |
| --- | --- |
| Global automation | Block new leases and all protected writes; increment global control epoch and invalidate every active lease. |
| Source | Block/revoke jobs for one source-policy ID; other sources remain unaffected. |
| Family | Block/revoke one entity family; Pharmacy is the only family that a future first P19 may name, and it still has no publish authority. |
| AI | Block external model calls and move eligible jobs to `deferred_budget`; deterministic non-AI cleanup remains available. AI starts disabled with a USD 0 P19 cap. |
| Notifications | Stop outbox claims without deleting rows or retrying completed jobs; owner may resume explicitly. |

Both an audited Postgres switch and an emergency Render environment switch exist for global control;
either off value wins. A switch cannot be bypassed by n8n, retries, reclaim or a stale process.

## 8. Cost register and alert ownership

"Current" means cost attributable to Worker-program resources before any P19 provisioning; all are
currently absent. "Selected steady" is the approved post-P19 monthly configuration. Existing Vercel
and Supabase platform subscriptions are unchanged and P19 receives no authority to upgrade them.

| Category | Owner | Concrete plan | Current USD/month | Selected steady USD/month | Hard stop | Soft alert |
| --- | --- | --- | ---: | ---: | --- | --- |
| Worker compute | `hamed665` | Render Background Worker Starter, Frankfurt, one instance | 0 | 7 | One instance, no autoscale; build-pipeline spend limit USD 0; outbound stop at 4 GiB | 70% CPU/memory sustained, 3 GiB outbound or USD 7 accrued |
| Raw storage | `hamed665` | Existing Supabase project, private bucket, maximum 1 GiB | 0 | 0 incremental | Pause at 850 MiB; reject at 1 GiB; no plan upgrade/overage | 700 MiB and deletion backlog |
| Observability | `hamed665` | Sentry Developer; no pay-as-you-go | 0 | 0 | Provider quota drops sanitized events; no paid overage | 50% and 80% provider quota |
| Notifications | `hamed665` | Resend Free; email only | 0 | 0 | App 20/day and 500/month; provider 100/day and 3,000/month; no overage | 50% and 80% app cap, delivery failure |
| Security | `hamed665` | GitHub public-repository secret scanning, push protection and Dependabot; encrypted provider secret stores | 0 | 0 | No paid security add-on in P19 | Any secret/dependency alert, key age 75 days |
| AI | `hamed665` | Disabled in P19 | 0 | 0 | USD 0 and AI kill switch off | Any attempted call |

Total attributable cost is currently USD 0/month; the selected steady incremental cost is USD
7/month and the approved recurring vendor hard cap is USD 7/month. The application caps prevent
bandwidth, Storage, Sentry, Resend and AI overages. Resend's Free provider quota is documented as
100 emails/day and 3,000/month in its [quota reference](https://resend.com/docs/knowledge-base/account-quotas-and-limits).
GitHub documents that secret scanning runs automatically for public repositories at no cost in its
[secret scanning reference](https://docs.github.com/code-security/secret-scanning/about-secret-scanning).

The owner reviews provider usage weekly and records a monthly bounded cost report. A missing report,
unknown charge, disabled cap, exceeded alert or provider plan drift turns the global switch off until
independently reviewed.

## 9. Preview-only acceptance evidence for P19

P19 cannot activate even its Preview job loop until one evidence bundle records:

1. exact PR SHA across GitHub, Vercel Preview and Render Preview Worker;
2. isolated Preview Supabase identity allowlist and explicit proof that Production identity is absent;
3. migration/RLS/grant/RPC validation and proof that Worker has no database/Storage credential;
4. two distinct boot-unique Worker process IDs under the registered Worker service identity racing
   one job: exactly one lease succeeds;
5. expiry and reclaim: epoch increases, then the old Worker is rejected for heartbeat, checkpoint,
   draft write, evidence write, report write and complete;
6. cancel plus each global/source/family kill switch invalidates the old lease;
7. completion and outbox commit atomically, duplicate completion is bounded replay and duplicate
   notification count is zero;
8. JWT tests for bad algorithm, `kid`, issuer, audience, scope, TTL, body hash, clock skew, revoked
   key and replayed `jti`;
9. SSRF tests for private/metadata IPv4 and IPv6, DNS rebinding, redirect escape, userinfo, alternate
   ports, timeout, MIME and compressed/decompressed limits;
10. raw-object private access, 30/90-day retention, deletion, reviewer-access audit and bounded-log
    redaction tests;
11. cost/egress/Storage/notification/AI caps and every kill switch fail closed;
12. all repository gates, GitHub Actions and Vercel Preview green, plus independent approval.

Failure of any item keeps global automation off. The evidence author cannot self-approve the P19
pull request.

## 10. Consequences and closed boundaries

The decision adds one long-lived compute provider but avoids a second database, Redis queue and raw
evidence store. Routing all privileged operations through the existing server boundary preserves
scope enforcement and prevents broad Supabase credentials from entering the Worker. The tradeoff is
an HTTP hop through Vercel and an application-enforced egress boundary; latency and throughput are
therefore deliberately secondary to fail-closed authority, starting at concurrency one.

This ADR does not authorize Entity decision application, canonical entity mutation, duplicate merge,
geo verification, publish, rollback, public/Index/Sitemap promotion, Content/SEO Agent, Hospital,
Doctor, later families, Bulk, n8n provisioning or Production execution. Those remain closed even
after `AUTOMATION-JOB-RUNTIME` is named.
