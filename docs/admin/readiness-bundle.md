# Readiness Bundle

This bundle summarizes the current launch readiness chain for the first controlled provider rollout.

It is a status and evidence document. It does not add runtime behavior, approve bulk rollout, or replace the operator checklist.

## Completed admin chain

The admin side now has the following protected surfaces:

- draft center list
- draft center detail
- workflow panel
- taxonomy panel
- location panel
- contact review panel
- quality panel
- publication readiness panel
- active centers read-only view
- audit log read-only route

The draft workflow remains limited to `draft` and `pending_review` records. Active provider records are reviewed through the active centers read-only view and audit log.

## Completed final action chain

The final action chain now has:

- publication contract
- readiness helper
- readiness panel
- gated server action
- final admin control
- final chain validator
- post-activation verifier
- final launch recap
- final route sanity guard

The final server action must keep re-checking readiness before changing public state.

## Completed public chain

The public side now has:

- public catalog eligibility wrapper
- guarded public center detail route
- public launch-safe UI guard
- listing card safety guard
- safe contact fallback copy
- medical safety copy
- sitemap and import family validators

Public center detail must continue loading through the eligibility wrapper, not raw catalog queries.

## Completed operator chain

The operator side now has:

- launch smoke checklist
- soft launch operator checklist
- first provider rehearsal document
- route and indexability sanity guard

The operator must still complete the rehearsal and checklist before using the final gated control.

## Required admin validators

These admin validators must remain wired into `seo:check`:

- `admin:provider-publication-contract:validate`
- `admin:final-chain:validate`
- `admin:launch-checklist:validate`
- `admin:post-activation:validate`
- `admin:provider-view-contract:validate`
- `admin:active-centers-readonly:validate`
- `admin:audit-log-readonly:validate`
- `admin:final-launch-recap:validate`
- `admin:final-route-sanity:validate`
- `admin:soft-launch-checklist:validate`
- `admin:r1:validate`
- `admin:readiness-bundle:validate`

## Required public and import validators

These public and import validators must remain wired into `seo:check`:

- `seo:public-catalog-eligibility:validate`
- `seo:public-listing-card-safety:validate`
- `seo:public-launch-safe-ui:validate`
- `import:publish-readiness-audit:validate`
- `import:sitemap-family-caps:validate`
- `import:profile-smoke:validate`

## Not approved by this bundle

This bundle does not approve:

- bulk provider rollout
- live active-provider editing
- claim workflow changes
- billing or subscription changes
- sponsored ranking
- reviews or ratings
- open-now claims
- booking claims
- insurance claims
- manual sitemap insertion

Each of those requires a separate contract, implementation, audit behavior, and validator.

## Readiness statement

The codebase has the structural pieces needed for a controlled first-provider rollout rehearsal and a guarded activation path.

The next step is operational: choose one candidate, complete the rehearsal, complete the operator checklist, and only then use the final gated admin control.
