# DrMuscat

DrMuscat is an SEO-first healthcare discovery and provider visibility platform for Oman, designed to scale later to other GCC countries.

Canonical specification path:

- `docs/master-spec/`
- `docs/platform/DRMUSCAT_PLATFORM_ARCHITECTURE_V1.md` — documentation-only future platform architecture map.
- `docs/platform/DRMUSCAT_ROLES_AND_PERMISSIONS_SPEC_V1.md` — documentation-only role, permission, ownership, audit, and RLS implication spec.
- `docs/platform/DRMUSCAT_PROVIDER_ENTITY_MODEL_SPEC_V1.md` — documentation-only provider, doctor, center, branch, claim, verification, and public/private entity model spec.
- `docs/platform/DRMUSCAT_TAXONOMY_AND_PROVIDER_PROFILE_MODEL_SPEC_V1.md` — documentation-only taxonomy, provider profile, doctor, specialty, service, insurance, license, media, review, bilingual label, and WhatsApp CTA planning spec.
- `docs/platform/DRMUSCAT_TAXONOMY_SCHEMA_PLAN_SPEC_V1.md` — documentation-only schema plan for verticals, center categories, center taxonomy assignments, doctor languages, education, insurance, license authority, hours, and activation gates.
- `docs/platform/DRMUSCAT_SEO_AI_CONTENT_OPERATING_SYSTEM_SPEC_V1.md` — documentation-only SEO, AI content, CMS, media, review, and reporting operating system specification.
- `docs/platform/DRMUSCAT_KEYWORD_UNIVERSE_CONTENT_INTELLIGENCE_SPEC_V1.md` — documentation-only keyword universe and content intelligence planning specification.
- `docs/platform/DRMUSCAT_AI_BRIEF_DRAFT_WORKFLOW_SPEC_V1.md` — documentation-only AI brief and draft workflow, prompt governance, output validation, review, and approval specification.
- `docs/platform/DRMUSCAT_EXISTING_REVIEW_SCHEMA_RECONCILIATION_SPEC_V1.md` — documentation-only reconciliation of existing review tables, policies, migration numbering, conflicts, and safe future review implementation paths.
- `docs/master-spec/82_COMMERCIAL_CONTENT_PLACEMENT_AI_OPERATING_MODEL.md` — documentation-only commercial content, placement, article, media, and AI operating model.

Build mode:

- `PHASED_BUILD_ONLY`

## Current project phase status

- Current repo state: **after ADDON-A commercial add-on assignment shell and CENTER-A lead history event-type fix**.
- Database/migration status: **validates through `0053_provider_onboarding_lead_events.sql`**.
- Completed migration set: **`0001` through `0053`**.
- Implementation remains phase-gated. Do not infer approval for new business features from the existence of current public/admin baselines.

## Completed database and platform foundation scope

- core extensions/enums
- profiles/auth base and approved profile RLS baseline
- geo hierarchy
- taxonomy/services
- centers/locations/services/claims
- doctors/practice locations/services/schedules/exceptions
- appointment slots/core/operations
- reviews/reports
- media assets/entity media
- monetization foundation without payment gateways
- legal/consent/audit foundation
- RLS auth helpers and approved access-helper foundations
- public catalog read RLS policies
- center access helpers and center claims/memberships RLS foundation
- patient contact profile link and patient appointment access-helper/RLS foundations
- reviews/reports/media private RLS foundation
- monetization sponsored RLS foundation
- legal/consent/audit RLS foundation
- contact visibility foundation
- callback request foundation
- provider license verification foundation
- media public visibility/RLS hardening
- provider onboarding lead database/RLS foundation through `0050_provider_onboarding_leads.sql`
- landing content foundation through `0051_landing_page_contents.sql`
- review companion table foundation through `0052_review_companion_tables.sql` only; this does not complete the review feature
- provider onboarding lead event-history database foundation through `0053_provider_onboarding_lead_events.sql`

## Current implemented app surface

The repository now includes approved public and admin baselines. These are not permission to expand product scope without a dedicated phase approval.

- public localized app routes under `/:locale/:country`
- supported public locales: `en` and `ar`
- supported public country: `om`
- public catalog/discovery surfaces for doctors, centers, pharmacies, labs, services, and search
- public center detail pages
- public doctor detail pages
- public provider plans/onboarding page at `/:locale/:country/for-providers`
- public articles shell routes at `/:locale/:country/articles` and `/:locale/:country/articles/:slug`
- contact/callback, media, and license display foundations
- public callback request API
- public provider onboarding lead capture API
- provider onboarding form success/error handling baseline
- protected root-level `/admin` baseline
- minimal platform-admin sign-in at `/admin/login` using Supabase Auth magic links and `/auth/callback`
- read-only admin provider onboarding lead list/detail baseline
- admin provider onboarding lead status/priority mutation baseline
- read-only admin provider onboarding lead history UI
- status/priority lead history event writes
- admin draft center creation from provider onboarding lead, with lead history stored through allowed event types
- read-only admin center subscriptions view
- admin center subscription assignment foundation
- base subscription plan catalog initializer
- admin quick navigation links for provider leads, center subscriptions, and commercial add-ons
- admin commercial add-on assignment shell for Homepage Ads and Special Offer Placement using existing sponsored campaign tables

## Route and locale contract

- Public localized routes are Oman-first and currently limited to `en`/`ar` plus `om`.
- Admin routes are root-level `/admin` routes, not localized routes.
- Admin routes must remain excluded from the sitemap and public SEO surfaces.
- Persian and Hindi public SEO routes are not implemented and remain forbidden unless explicitly approved.
- Deprecated route patterns such as `/en/dentist/al-khuwair` remain forbidden.
- Duplicate route patterns that compete with canonical URLs remain forbidden.
- The singular doctor detail route is the approved doctor detail route pattern.

## Explicitly excluded / not implemented yet

- no payment gateways, invoices, checkout, or billing integrations yet
- no AI chat yet
- no AI article assistant or AI draft generation workflow yet
- no real seed rows yet unless a seed phase is explicitly approved
- no Persian/Hindi public SEO routes
- no provider dashboard mutation workflows yet
- no Official Offers admin/data model yet
- no public ads rendering or public special-offer rendering yet
- no article CMS, article admin editor, article placement engine, or DB-backed article rendering yet
- no public article ads or article special-offer placements yet
- no full review moderation UI, public review display workflow, provider reply workflow, or complete review operations yet
- no broad sales, referral, billing, analytics, SEO AI, provider dashboard, or business expansion features unless explicitly approved
- no medical records/diagnoses/prescriptions/lab results yet
- private-data access remains phase-gated and must not be expanded without explicit approval

## Future frontend/UI/UX requirements (guardrails)

- Future frontend must be mobile-first and fully responsive across:
  - small iPhones
  - large iPhones
  - Android phones
  - tablets
  - laptops
  - desktop screens
- UI must be premium, modern, healthcare-trust oriented, and suitable for Oman/GCC users.
- UI must not look generic, placeholder-like, or template-low-quality.
- Logo placement must be professional:
  - clear header placement
  - safe spacing
  - responsive sizing
  - no awkward cropping
  - adaptable to light/dark or varied backgrounds later
- Future UI should support tasteful motion:
  - animated sections
  - micro-interactions
  - loading states
  - hover/focus states
  - smooth transitions
- Animations must never hurt performance, accessibility, SEO, or Core Web Vitals.
- Motion must respect `prefers-reduced-motion`.
- UI must be accessibility-aware:
  - semantic HTML
  - keyboard navigation
  - visible focus states
  - readable contrast
  - proper labels
  - alt text for images
- UI must support real content types:
  - doctors
  - clinics
  - pharmacies
  - labs
  - wellness centers
  - services
  - reviews
  - media galleries
  - offers
  - sponsored/featured placements
  - articles and editorial media

## SEO-first requirements (future public pages)

- SEO is a core product requirement, not an afterthought.
- Future public pages must support:
  - clean URL structure
  - localized English/Arabic metadata
  - canonical URLs
  - Open Graph metadata
  - Twitter/social metadata where appropriate
  - structured data/schema.org where content supports it
  - sitemap strategy
  - robots strategy
  - internal linking
  - fast server-rendered/indexable content
  - no client-only SEO-critical content
- Future public catalog and article pages must protect Core Web Vitals:
  - fast LCP
  - low CLS
  - low INP
  - optimized images
  - responsive image sizes
  - no unnecessary heavy animation libraries
- SEO pages must not create Persian/Hindi public routes unless explicitly approved.
- Oman-first URL and content strategy remains the default.

## Validation commands

Run the relevant validation gate after each approved phase. The current validation set is:

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

`pnpm lint` may report warnings only, but must not report errors. Do not fake passing tests or weaken validation commands to force progress.

## Last known validation status

- PR #225 passed the full GitHub CI gate before merge.
- PR #226 passed the full GitHub CI gate before merge.
- Migration validation is expected through `0053_provider_onboarding_lead_events.sql`.
- Static RLS and static seed tests pass in the current CI gate.
- Route, SEO, env, typecheck, build, and lint gates pass in the current CI gate.

## Next recommended phases

Future implementation must remain explicitly phase-approved and narrowly scoped.

Recommended next planning order:

1. `TAX-A` / `MODEL-A` — taxonomy, provider profile, doctor, specialty, service, insurance, license, media, review, WhatsApp CTA, and bilingual label planning.
2. `TAX-B` — taxonomy schema plan for verticals, center categories, assignments, doctor languages, insurance, license authority, hours, and activation gates.
3. `OFF-A` — Official Offers admin/data model planning.
4. `ADS-B` / `MON-D` — fuller Ads and paid placement options planning.
5. `ART-B` — Article CMS data model planning.
6. `PLAC-A` — Article placement slot engine planning.
7. `AI-A` — read-only content intelligence planning only after article/offer/placement foundations are approved.

Do not implement sales, referral, billing, analytics, SEO AI, provider dashboard, payment, admin mutation, seed, or other business expansion features unless a future phase specifically approves that scope.

## Agent workflow reminder

Agents must read `AGENTS.md` before doing any work. `AGENTS.md` contains the required future-agent read order for root guardrails, current project state, canonical V10.4 architecture files, and V10.5 documentation-only addendums.

## Phase 3.0C — TypeScript Safety Baseline

Phase 3.0C established a TypeScript safety baseline before private RLS, auth, backend, API, and dashboard phases continued.

- Future app/auth/API/security/backend code must be TypeScript-first.
- Future React components must be implemented as `.tsx`.
- Future server utilities, API handlers, and server actions must be implemented as `.ts`.
- Existing `.mjs` files are intentionally script/config oriented and may remain `.mjs` when script-only.
- No broad JS-to-TS conversion is allowed without a dedicated approved phase.
- Private RLS/auth/backend work must continue with type-safety discipline; do not bypass typecheck/lint/build to force progress.
- Existing UI/UX and SEO guardrails remain mandatory for all future public work.
