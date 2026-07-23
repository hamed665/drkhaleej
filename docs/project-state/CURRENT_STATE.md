# Current Project State

## Build mode

- `PHASED_BUILD_ONLY`
- This file is a documentation snapshot only. It does not authorize unapproved implementation scope.

## Current completed state

- Import-readiness runtime is aligned through PR #953 at baseline commit `af2d964c4d71f07be6b3ec0f5e3b04db75a1d1b0` (last aligned 2026-07-23).
- The current repository includes approved public catalog/detail foundations, public article shell routes, provider onboarding lead capture, callback request capture, protected admin shell, admin provider onboarding lead operations baseline, center subscription assignment foundation, and admin commercial add-on assignment shell.
- Future phases must remain narrowly scoped and explicitly approved.

## Completed migration range

- Completed migration set: `0001` through `0081`.
- Migration validation is expected through `0081_import_pharmacy_reservation_audit_split.sql`.
- Existing SQL migrations must not be modified unless explicitly approved.

## Import readiness alignment

| Field | Value |
| --- | --- |
| Aligned through | PR #953 |
| Runtime baseline | `af2d964c4d71f07be6b3ec0f5e3b04db75a1d1b0` |
| Last aligned | `2026-07-23` |
| Current migration | `0081_import_pharmacy_reservation_audit_split.sql` |
| Current next | `PRIVATE-ADMIN-WIRING` |
| Reservation audit event | `reservation_created` |
| Reservation audit phase | `reservation` |

| Wave | Status | Evidence and remainder |
| --- | --- | --- |
| 0 | COMPLETE | PRs #936–#939 |
| 1 | COMPLETE | PRs #940–#941 |
| 2.1 | COMPLETE | PRs #942, #949 and #950; atomic transaction, hosted DB proof and reservation audit split complete |
| 2.2 | COMPLETE | PRs #943 and #946; Admin reservation operation and authorization-linked integrity readback proven |
| 3+ | PARTIAL | PR #953 completes the verified Reservation handoff contract; private Admin wiring and actual mutation remain disabled |

The Admin reservation operation and bounded authorization-linked integrity readback are implemented and proven on an isolated Preview database. P03 additionally proved replay, conflict, two-client lock waiting, forced rollback at all four write boundaries, deterministic cleanup and zero partial writes. P04-A writes `reservation_created` with the exact v2 schema while retaining legacy reader compatibility. P04-B hands only an already verified, fully bound Reservation to an injected server-only executor port, invokes no second Reservation, exposes no raw persistence identifiers, and keeps actual mutation disabled. Private Admin wiring, terminal persistence, post-mutation readback, and exact rollback recovery remain open. Pharmacy public/index/sitemap promotion remains disabled. AI-assisted intake and the Content/SEO Agent are planned capabilities, not production implementations.

Independent code ownership and review governance are recorded by PR #947 and the active `main-protected-review` ruleset. Import-readiness implementation PRs remain independently review-gated before merge.

The current reservation audit signature is `event_type=reservation_created`, `event_payload.phase=reservation`, and `schema_version=drkhaleej.import.publishAudit.v2`. Legacy `execution_started + phase=reservation` rows remain read/replay compatible only with prior schema versions.

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
- Admin lead contact-action, sales automation, full audit-write, provider dashboard, billing, payment, invoice, and public activation workflows remain out of scope and are not implemented.

## Data/RLS foundations

- Database foundations validate through `0081_import_pharmacy_reservation_audit_split.sql`.
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

- PRs #936–#953 are the current import-readiness runtime baseline.
- Migration validation passes through `0081_import_pharmacy_reservation_audit_split.sql`.
- Env, seed validation, static RLS, static seed, routes, SEO, typecheck, build, and lint gates pass in CI.

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
