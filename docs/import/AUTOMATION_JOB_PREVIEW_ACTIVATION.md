# Automation Job Preview Activation

## Scope and status

- Subphase: `AUTOMATION-JOB-PREVIEW-ACTIVATION`
- Four-axis mapping: Execution Phase 9 / Lock Scope 10 / Product Module 6 /
  `AUTOMATION-JOB-PREVIEW-ACTIVATION`
- Runtime schema: `drkhaleej.import.automationPreviewActivation.v1`
- Environment: isolated Preview only
- Status: repository admission implemented; external evidence pending

This gate adds the final fail-closed admission boundary needed before the existing report-only Worker
probe may run. It does not activate an Agent, source connector, AI call, notification delivery,
Human Review decision application, canonical entity mutation, publish, rollback, public promotion,
Index promotion, Sitemap promotion, Content, Hospital, Doctor, later-family, Bulk or Production
behavior.

```json automation-job-preview-activation
{
  "schemaVersion": "drkhaleej.import.automationPreviewActivation.v1",
  "status": "repository-admission-ready-external-evidence-pending",
  "provider": "Render Background Worker",
  "region": "frankfurt",
  "plan": "Starter",
  "instances": 1,
  "monthlyCostCapUsd": 7,
  "autoDeploy": false,
  "productionAuthorized": false,
  "controlsDefaultEnabled": false,
  "exactSourceCommitRequired": true
}
```

## Exact-SHA admission

Vercel and Render remain closed unless all three explicit switches are exactly `true`:

```text
AUTOMATION_PREVIEW_ACTIVATION_ENABLED
AUTOMATION_EMERGENCY_ENABLED
AUTOMATION_RUNTIME_PROBE_ENABLED
```

Vercel additionally requires `VERCEL_ENV=preview`, and its built-in `VERCEL_GIT_COMMIT_SHA` must
equal `AUTOMATION_PREVIEW_ACTIVATION_SHA`. Render requires its built-in `RENDER=true`,
`RENDER_GIT_REPO_SLUG=hamed665/drkhaleej`, `IS_PULL_REQUEST=false`, and `RENDER_GIT_COMMIT` equal to
the same activation SHA. The Worker calls only the exact `.vercel.app` host recorded in
`AUTOMATION_VERCEL_PREVIEW_HOST`.

Both runtimes require distinct bounded Preview and Production project references. Vercel also
verifies that the configured Supabase URL contains only the Preview reference. The Worker receives
no database URL, Supabase credential, Storage credential or Production secret.

Vercel Authentication remains enabled. Create one Vercel Protection Bypass for Automation secret,
store the same value in the Render Worker as `VERCEL_AUTOMATION_BYPASS_SECRET`, and never place the
value in Git, logs, artifacts or pull-request text. The Worker sends it only in the
`x-vercel-protection-bypass` request header; query-parameter bypass is forbidden. Rotating the
secret requires updating Render and redeploying the Worker before any bounded probe.

## Provisioning contract

The only authorized paid resource is one `drkhaleej-automation-worker-preview` Render Background
Worker in Frankfurt on the Starter plan. The recurring cost hard cap is USD 7/month. Autoscaling,
additional instances, persistent disk, Render database, Render Key Value, public endpoint,
auto-deploy and paid overage are forbidden.

Provisioning order:

1. push the reviewable branch and record its exact Git commit;
2. obtain a Vercel Preview deployment for that exact commit;
3. create the Render service with all activation switches false;
4. create one environment-specific Ed25519 Worker key and configure only its public JWK on Vercel;
5. create one Vercel Automation Bypass secret and save the same value only in Render;
6. populate the exact Preview host, separate project references and exact source SHA;
7. verify the service is one manual Starter instance and still idle;
8. collect the accepted evidence bundle;
9. enable the three switches only for the bounded `report` probe;
10. return every switch and service identity to disabled after evidence collection.

Creating a key or saving any private key is an operator action in the provider secret stores. No
private key, JWT, database credential, lease token or raw evidence may enter Git, logs, artifacts,
issues or pull-request text.

## Required external evidence

The activation remains `NO-GO` until one bounded exact-SHA bundle proves every accepted ADR item:

1. GitHub, Vercel Preview and Render use the same exact SHA;
2. the isolated Preview Supabase identity is present and Production identity is absent;
3. migration, RLS, grant and RPC checks pass and the Worker has no database/Storage credential;
4. two boot-unique Worker processes race one Job and exactly one lease succeeds;
5. reclaim increments the epoch and fences the old Worker from every protected write;
6. cancel and global/source/family kill switches invalidate the old lease;
7. completion/outbox atomicity and duplicate-completion replay produce one notification row;
8. adversarial JWT algorithm, key, issuer, audience, scope, TTL, body, clock, revocation and replay checks pass;
9. SSRF, redirect, DNS, timeout, MIME and compressed/decompressed bounds pass before any source connector opens;
10. private raw-object access, retention/deletion/audit and bounded-log redaction pass before raw capture opens;
11. cost, egress, Storage, notification and AI caps plus every kill switch fail closed;
12. repository CI, GitHub Actions, Vercel Preview and independent latest-head approval are green.

Items 9–11 may be recorded as `closed_not_exercised` only while their corresponding runtime
capability is absent and statically proven unreachable. They must be exercised before that
capability is opened. A missing, ambiguous or unbounded item is not a pass.

## Rollback and stop conditions

Rollback starts by setting `AUTOMATION_PREVIEW_ACTIVATION_ENABLED=false`,
`AUTOMATION_EMERGENCY_ENABLED=false` and `AUTOMATION_RUNTIME_PROBE_ENABLED=false` on both runtimes.
Then disable both service identities, wait at least one 60-second lease interval, verify zero active
leases and keep migration `0095` forward-compatible. Code rollback and provider suspension are
separate actions; no down migration is authorized.

Stop immediately on SHA drift, Production identity, more than one Render instance, a plan above
Starter, auto-deploy, missing cap, unknown charge, secret/raw-payload leakage, stale-worker write,
duplicate lease/outbox, public endpoint, downstream authority or incomplete evidence. Production remains disconnected.
