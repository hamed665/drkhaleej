# Current Project State

## Build mode

- `PHASED_BUILD_ONLY`
- This file is a documentation snapshot only. It does not authorize unapproved implementation scope.

## Current completed state

- Import-readiness runtime is aligned through PR #955 at baseline commit `e32d3e8789df5fb2cb744723cc5acd8e59d4827d` (last aligned 2026-07-24).
- The current repository includes approved public catalog/detail foundations, public article shell routes, provider onboarding lead capture, callback request capture, protected admin shell, admin provider onboarding lead operations baseline, center subscription assignment foundation, and admin commercial add-on assignment shell.
- Future phases must remain narrowly scoped and explicitly approved.

## Completed migration range

- Completed migration set: `0001` through `0084`.
- Migration validation is expected through `0084_import_pharmacy_rollback_digest_schema.sql`.
- Existing SQL migrations must not be modified unless explicitly approved.

## Import readiness alignment

| Field | Value |
| --- | --- |
| Aligned through | PR #955 |
| Runtime baseline | `e32d3e8789df5fb2cb744723cc5acd8e59d4827d` |
| Last aligned | `2026-07-24` |
| Current migration | `0084_import_pharmacy_rollback_digest_schema.sql` |
| Current next | `ROLLBACK-EXACT-RECOVERY` |
| Reservation audit event | `reservation_created` |
| Reservation audit phase | `reservation` |

| Wave | Status | Evidence and remainder |
| --- | --- | --- |
| 0 | COMPLETE | PRs #936–#939 |
| 1 | COMPLETE | PRs #940–#941 |
| 2.1 | COMPLETE | PRs #942, #949 and #950; atomic transaction, hosted DB proof and reservation audit split complete |
| 2.2 | COMPLETE | PRs #943 and #946; Admin reservation operation and authorization-linked integrity readback proven |
| 3+ | COMPLETE | PRs #953 and #954; verified Reservation handoff, guarded private mutation, terminal persistence and publish readback proven |
| 4.1 | COMPLETE | PR #955; server-selected atomic rollback authority consumption and bounded replay proven |
| 4.2 | OPEN | Exact logical recovery verification remains next |

The Admin reservation operation and bounded authorization-linked integrity readback are implemented and proven on an isolated Preview database. P03 additionally proved replay, conflict, two-client lock waiting, forced rollback at all four write boundaries, deterministic cleanup and zero partial writes. P04-A writes `reservation_created` with the exact v2 schema while retaining legacy reader compatibility. P04-B hands only an already verified, fully bound Reservation to an injected server-only executor port and invokes no second Reservation. P05 wires that handoff to the existing Pharmacy mutation authority, appends mutation-phase `execution_started` v3, applies the exact reviewed canonical patch, persists terminal success, creates one server-only durable rollback reference and requires post-mutation readback. The hosted P05 proof verifies one Reservation, one snapshot, one reservation audit, one mutation start, one terminal success, one durable reference, zero duplicate execution, zero public exposure, exact patch and protected metadata preservation, bounded replay and deterministic cleanup. Rollback authority hardening is complete. P06 keeps raw references server-only, atomically consumes one actor/entity/version/snapshot-bound authority, returns bounded replay, proves one rollback audit with zero duplicate/public exposure, and leaves failed authority unconsumed. Exact logical recovery remains open. Pharmacy public/index/sitemap promotion remains disabled. AI-assisted intake and the Content/SEO Agent are planned capabilities, not production implementations.

Independent code ownership and review governance are recorded by PR #947 and the active `main-protected-review` ruleset. Import-readiness implementation PRs remain independently review-gated before merge.

The current reservation audit signature is `event_type=reservation_created`, `event_payload.phase=reservation`, and `schema_version=drkhaleej.import.publishAudit.v2`. Legacy `execution_started + phase=reservation` rows remain read/replay compatible only with prior schema versions. Real mutation execution appends `execution_started + phase=mutation` and terminal success under `drkhaleej.import.publishAudit.v3`.

The canonical ledger and ordered next steps live in [`docs/import/import-readiness-roadmap-after-933.md`](../import/import-readiness-roadmap-after-933.md). PRs #919–#921 provide earlier canary/readback infrastructure but are not proof that the current Reservation authority is complete.

## Implemented public app surface

- Public localized routes exist under `/:locale/:country`.
- Supported locales are only `en` and `ar`.
- Supported country is only `om`.
- Public catalog/discovery surfaces exist for doctors, centers, pharmacies, labs, services, and search.
- Public center detail pages exist.
- Public doctor detail pages exist.
- Public `/:locale/:country/for-providers` page exists.
- Public article shell routes exist at `/:locale/:country/articles` and `/:locale/:country/articles/:slug`.
- Contact/callback, media, and license foundations exist.
- Public callback request API exists.
- Public provider onboarding lead capture API exists.
- Provider onboarding public form success/error handling has been corrected.

## Implemented admin surface

- Protected root-level `/admin` baseline exists.
- Minimal platform-admin sign-in exists at `/admin/login` using Supabase Auth magic links and `/auth/callback`.
- Admin routes are root-level routes and are not localized.
- Read-only admin provider onboarding lead list/detail exists.
- Admin provider onboarding lead status/priority mutation baseline exists.
- Read-only admin provider onboarding lead history UI exists.
- Admin status/priority lead history event writes exist.
- Admin draft center creation from provider onboarding lead exists.
- Draft center creation history uses the allowed `note_added` event type with `event_kind: "draft_center_created"` metadata.
- Read-only admin center subscriptions view exists.
- Admin center subscription assignment foundation exists.
- Base subscription plan catalog initializer exists.
- Admin quick navigation links exist for provider leads, center subscriptions, and commercial add-ons.
- Admin commercial add-on assignment shell exists at `/admin/commercial-addons` for Homepage Ads and Special Offer Placement.
- Preview-only guarded Pharmacy `private_publish` exists after exact Review, Authorization, Reservation verification and entity-bound confirmation. It remains single-entity, private/noindex/no-route/no-sitemap, bounded by post-mutation readback, and unavailable in Production.
- Admin lead contact-action, sales automation, full audit-write, provider dashboard, billing, payment, invoice, and public activation workflows remain out of scope and are not implemented.

## Data/RLS foundations

- Database foundations validate through `0084_import_pharmacy_rollback_digest_schema.sql`.
- Contact visibility, callback request, provider license verification, media public visibility/RLS hardening, provider onboarding leads, provider onboarding lead event-history DB foundation, landing content foundations, and review companion table foundations exist.
- Provider onboarding lead event history supports the currently allowed event types: `status_changed`, `priority_changed`, and `note_added`.
- Legacy/current review foundations already exist in `0020_reviews.sql` and `0021_review_reports.sql`; `0052_review_companion_tables.sql` adds review companion tables only.
- Further review system work remains incomplete and blocked until explicitly approved.
- Private-data access remains phase-gated.
- `CREATE POLICY` and `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` remain allowed only in explicitly approved RLS phases.
- No real seed rows are allowed unless a seed phase is explicitly approved.

## Route/SEO constraints

- Public localized routing is limited to `en`/`ar` and `om`.
- Admin routes are excluded from sitemap/public SEO surfaces.
- Persian/Hindi public SEO routes are not implemented and remain forbidden unless explicitly approved.
- Deprecated route patterns such as `/en/dentist/al-khuwair` remain forbidden.
- Duplicate route patterns that compete with canonical URLs remain forbidden.
- Public SEO work must remain Oman-first, indexable, semantic, and canonicalized where approved.

## Out-of-scope / not implemented

- Payment gateways, invoices, checkout, and billing integrations are not implemented.
- AI chat and AI article generation are not implemented.
- Real seed rows are not implemented.
- Provider dashboard mutations are not implemented.
- Official Offers admin/data model is not implemented.
- Public ads rendering is not implemented.
- Public special-offer rendering is not implemented.
- Article CMS, admin article editor, DB-backed article rendering, and article placement engine are not implemented.
- Article ads and article special-offer placement rendering are not implemented.
- Full review moderation UI, public review display workflow, provider reply workflow, and complete review operations are not implemented.
- Sales, referral, billing, analytics, SEO AI, provider dashboard, payment, and business expansion features remain out of scope unless explicitly approved.

## Ops workflow state

- A fail-closed Preview Migration Sync workflow validates repository migration/RLS contracts, verifies isolated Preview identity, applies ledger-missing migrations under an advisory lock, verifies the exact ledger, runs the isolated P05 private publish/readback regression and runs the exact-SHA P06 atomic rollback authority proof.
- A manual-only Supabase remote migration workflow exists for operator-triggered migration pushes.
- Remote migration execution remains guarded by GitHub secrets and the exact manual confirmation input `PUSH_REMOTE_DB`.

## Validation commands

Current validation gate:

- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm db:validate:seeds`
- `pnpm test:db:rls`
- `pnpm test:db:seed`
- `pnpm routes:check`
- `pnpm seo:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

## Last known validation status

- PRs #936–#955 are the current import-readiness runtime baseline.
- Migration validation passes through `0084_import_pharmacy_rollback_digest_schema.sql`.
- Env, seed validation, static RLS, static seed, routes, SEO, typecheck, build and lint gates pass in CI.
- Preview Migration Sync, the isolated P05 regression proof and the P06 concurrent rollback authority proof pass with Production disconnected.

## Future phase rules

- Preserve `PHASED_BUILD_ONLY` execution.
- List files planned for creation/editing before implementation.
- Implement only approved scope.
- Run validation commands after implementation.
- Stop after each phase and wait for approval.
- Stop on blockers, conflicts, missing dependencies, unclear requirements, route ambiguity, schema conflict, or RLS ambiguity.
- Do not fake passing tests.
- Do not weaken TypeScript, lint, build, route, env, migration, seed, SEO, RLS, or validation checks to force progress.

## ART-A public articles shell

- Article route contract and premium public article shell were added for English/Arabic Oman routes at `/:locale/:country/articles` and `/:locale/:country/articles/:slug`.
- No article CMS, database, admin editor, or article placement engine exists yet.
- ART-A3 through ART-A7 refined the static public articles shell, FAQ behavior, detail slug handling, media placeholders, and visible copy while preserving static route-only scope.

## Monetization/admin placement baseline

- MON-C1 added a read-only admin center subscriptions view.
- MON-C2 added admin center subscription assignment foundations and the base subscription plan catalog initializer.
- ADDON-A added an admin-only commercial add-on assignment shell for Homepage Ads and Special Offer Placement using existing `sponsored_campaigns` and `sponsored_placements` tables.
- ADDON-A creates draft/internal records only and does not add payment, invoice, public activation, public rendering, or offer content workflows.
- Official Offers, fuller Ads options, public placement rendering, article placements, billing, and analytics remain future phase-gated work.
