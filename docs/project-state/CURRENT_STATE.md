# Current Project State

## Build mode

- `PHASED_BUILD_ONLY`
- This file is a documentation snapshot only. It does not authorize unapproved implementation scope.

## Current completed state

- Current repo state is after the admin provider onboarding lead detail baseline.
- The current repository includes approved public catalog/detail foundations, provider onboarding lead capture, callback request capture, protected admin shell, and read-only admin provider onboarding lead list/detail.
- Future phases must remain narrowly scoped and explicitly approved.

## Completed migration range

- Completed migration set: `0001` through `0050`.
- Migration validation is expected through `0050_provider_onboarding_leads.sql`.
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
- Admin provider onboarding mutation/status/update actions are not implemented and remain out of scope.
- Admin lead assignment, conversion, contact-action, and audit-write workflows remain out of scope.

## Data/RLS foundations

- Database foundations now validate through `0050_provider_onboarding_leads.sql`.
- Contact visibility, callback request, provider license verification, media public visibility/RLS hardening, and provider onboarding leads foundations exist.
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
- Admin lead mutation workflows are not implemented.
- Sales, referral, billing, analytics, SEO AI, provider dashboard, payment, and admin mutation features remain out of scope unless explicitly approved.
- Business expansion features remain out of scope unless explicitly approved.

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
- Migration validation passes through `0050_provider_onboarding_leads.sql`.
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

## UI-K-ROUTE-CONTRACT-A — Public UI Route Contract Alignment

- Route contract now allows future frontend-only public UI page creation for:
  - `/[locale]/[country]/articles`
  - `/[locale]/[country]/articles/[slug]`
  - `/[locale]/[country]/sign-in`
  - `/[locale]/[country]/register`
  - `/[locale]/[country]/list-your-center`
  - `/[locale]/[country]/for-providers` remains approved.
- This alignment does not create UI pages, sitemap entries, robots changes, `llms.txt` changes, backend handlers, auth backend, payment backend, database schema, seed data, Supabase access, or RLS policies.
- The route-check contract allows only the exact approved locale/country route families and continues to reject countryless localized public UI routes, unsupported `fa`/`hi` routes, localized admin routes, deprecated shortcut routes, and duplicate doctor detail route patterns.
- Articles remain subject to public medical-content safety: disclaimers are required when implemented, diagnosis/treatment claims are forbidden, and reviews/comments must remain moderated with no fabricated ratings.
