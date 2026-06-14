# Current Project State

## Build mode

- `PHASED_BUILD_ONLY`
- This file is a documentation snapshot only. It does not authorize unapproved implementation scope.

## Current completed state

- Current repo state is after the admin provider onboarding lead detail baseline.
- The current repository includes approved public catalog/detail foundations, provider onboarding lead capture, callback request capture, protected admin shell, and read-only admin provider onboarding lead list/detail.
- Future phases must remain narrowly scoped and explicitly approved.

## Completed migration range

- Completed migration set: `0001` through `0052`.
- Migration validation is expected through `0052_review_companion_tables.sql`.
- Existing SQL migrations must not be modified unless explicitly approved.

## Implemented public app surface

- Public localized routes exist under `/:locale/:country`.
- Supported locales are only `en` and `ar`.
- Supported country is only `om`.
- Public catalog/discovery surfaces exist for doctors, centers, pharmacies, labs, services, and search.
- Public center detail pages exist.
- Public doctor detail pages exist.
- Public `/:locale/:country/for-providers` page exists.
- Contact/callback, media, and license foundations exist.
- Public callback request API exists.
- Public provider onboarding lead capture API exists.

## Implemented admin surface

- Protected root-level `/admin` baseline exists.
- Admin routes are root-level routes and are not localized.
- Read-only admin provider onboarding lead list/detail exists.
- Admin provider onboarding lead status/priority mutation baseline exists.
- Admin lead assignment, conversion, contact-action, and audit-write workflows remain out of scope and are not implemented.

## Data/RLS foundations

- Database foundations now validate through `0053_provider_onboarding_lead_events.sql`.
- Contact visibility, callback request, provider license verification, media public visibility/RLS hardening, provider onboarding leads, provider onboarding lead event-history DB foundation, landing content foundations, and review companion table foundations exist.
- Provider onboarding lead event read/write UI/actions remain out of scope and are not implemented.
- Legacy/current review foundations already exist in `0020_reviews.sql` and `0021_review_reports.sql`; `0052_review_companion_tables.sql` adds review companion tables only.
- Further review system work remains incomplete and blocked until explicitly approved: no full moderation UI, no public review display workflow, no provider reply workflow, and no complete review operations are implemented yet.
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
- AI chat is not implemented.
- Real seed rows are not implemented.
- Provider dashboard mutations are not implemented.
- Admin lead mutation workflow scope is limited to the provider onboarding lead status/priority baseline.
- Full review moderation UI, public review display workflow, provider reply workflow, and complete review operations are not implemented.
- Sales, referral, billing, analytics, SEO AI, provider dashboard, payment, and admin mutation features remain out of scope unless explicitly approved.
- Business expansion features remain out of scope unless explicitly approved.

## Ops workflow state

- A manual-only Supabase remote migration workflow exists for operator-triggered migration pushes.
- Remote migration execution remains guarded by GitHub secrets and the exact manual confirmation input `PUSH_REMOTE_DB`.

## Validation commands

Current validation gate:

- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

## Last known validation status

- Environment check passes.
- Migration validation passes through `0052_review_companion_tables.sql`.
- RLS static tests pass.
- Route contract check passes.
- Typecheck passes.
- Build passes.
- Lint has warnings only, with no errors.

## Future phase rules

- Preserve `PHASED_BUILD_ONLY` execution.
- List files planned for creation/editing before implementation.
- Implement only approved scope.
- Run validation commands after implementation.
- Stop after each phase and wait for approval.
- Stop on blockers, conflicts, missing dependencies, unclear requirements, route ambiguity, schema conflict, or RLS ambiguity.
- Do not fake passing tests.
- Do not weaken TypeScript, lint, build, route, env, migration, seed, SEO, RLS, or validation checks to force progress.
