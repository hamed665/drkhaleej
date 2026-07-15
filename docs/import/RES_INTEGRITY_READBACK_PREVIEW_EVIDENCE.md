# RES-INTEGRITY-READBACK Preview Evidence

This runbook collects the real Preview proof required by P02. It does not mark P02 complete and does not authorize private publish, rollback, public routing, indexing, sitemap inclusion, or bulk execution.

## Preconditions

- Use an isolated Preview Supabase project, never Production credentials.
- Deploy the exact PR head under review and record its commit SHA and Vercel deployment URL.
- Apply migrations through `0079_import_pharmacy_atomic_authorization_reservation.sql`.
- Configure exactly one Preview actor and one draft Pharmacy entity.
- The actor must be the authenticated platform admin and must match `IMPORT_PREVIEW_ALLOWED_ACTOR_IDS`.
- The entity must match `IMPORT_PREVIEW_CANARY_ENTITY_IDS`, remain `status=draft`, `is_active=false`, `is_featured=false`, and have no deleted timestamp.
- Keep `IMPORT_PREVIEW_APPROVAL_TOKEN` and `IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN` equal, server-only, and out of evidence.
- Set `IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED=true` only on the isolated Preview deployment.

Required server-only Preview configuration:

```text
VERCEL_ENV=preview
NEXT_PUBLIC_SUPABASE_URL=<isolated-preview-url>
SUPABASE_SERVICE_ROLE_KEY=<isolated-preview-service-role-key>
IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED=true
IMPORT_PREVIEW_ALLOWED_ACTOR_IDS=<one-platform-admin-profile-id>
IMPORT_PREVIEW_CANARY_ENTITY_IDS=<one-draft-pharmacy-id>
IMPORT_PREVIEW_APPROVAL_TOKEN=<one-time-approval>
IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN=<same-one-time-approval>
```

Do not paste values from this block into the PR, logs, screenshots, browser storage, or analytics.

## Exact UI sequence

1. Sign in to the Vercel Preview deployment as the allowlisted platform admin.
2. Open `/admin/imports/readiness`.
3. Confirm the selected entity is the one allowlisted draft Pharmacy.
4. Run **Generate dry-run**.
5. Run **Review exact diff** with `PRIVATE PUBLISH <entity-id>`.
6. Confirm the bounded authorization state is ready.
7. Run **Reserve private publish** once with `RESERVE PRIVATE PUBLISH <entity-id>`.
8. Do not run private publish or rollback. Those controls must remain disabled.

## Required bounded result

The Admin result must show all of the following on the same PR head:

```text
integrity verified = true
authorization rows = 1
reservation rows = 1
snapshot rows = 1
reservation audit rows = 1
current audit rows = 1
future audit rows = 0
entity rows = 1
audit signature = execution_started
duplicates = 0
orphans = 0
audit gaps = 0
entity mutated = No
route/index/sitemap = Disabled
```

The current audit signature is `execution_started` with reservation phase. `reservation_created` is reader-compatible but must not be claimed as implemented before P04-A.

## Evidence bundle

Attach a redacted evidence comment or artifact to the P02 PR containing:

- PR number and exact reviewed commit SHA;
- Vercel deployment URL;
- isolated Preview project identifier or non-secret alias;
- UTC start and finish timestamps;
- operator GitHub login;
- the bounded result above;
- confirmation that the Pharmacy fingerprint and entity version were unchanged;
- confirmation that no public route, index, sitemap, publish, rollback, or bulk capability ran;
- independent reviewer login, GitHub review ID, reviewed commit SHA, and zero unresolved threads.

Never attach authorization material, service-role keys, approval tokens, raw audit data, rollback snapshots, database row IDs, or unrestricted entity data.

## Stop conditions

Stop without retrying or merging if any count differs, any finding is non-zero, the audit signature is unexpected, the entity changed, authorization is not consumed and linked, the UI reports `reservation_integrity_failed`, the deployment SHA differs from the reviewed SHA, or an independent approval is missing.

P02 may be marked complete only after the evidence is attached to the current PR head, all required checks remain green, branch protection and valid independent CODEOWNERS are active, and the independent human approval is recorded.
