# UI-K-DESIGN-REFERENCE-IMPORT-A

## Phase identity

- **Task ID:** `UI-K-DESIGN-REFERENCE-IMPORT-A-FIXUP`
- **Mode:** Reference import cleanup and documentation only
- **Execution mode:** `PHASED_BUILD_ONLY`
- **Execution Phase:** Phase 0 documentation/reference alignment
- **Lock Scope:** Documentation and prototype-reference assets only
- **Product Module:** UI/UX design reference system
- **Subphase ID:** `UI-K-DESIGN-REFERENCE-IMPORT-A`

## 1. Imported reference files

The design reference import for this phase is limited to the following prototype/reference assets:

- `docs/prototype-reference/drmuscat-ui-kit-2026-v2/DrMuscat Design System (2).zip`
- `docs/prototype-reference/drmuscat-ui-kit-2026-v2/DrMuscat Web UI Kit (1).html`

These files are intended to be stored under `docs/prototype-reference/drmuscat-ui-kit-2026-v2/` so future UI alignment phases can inspect them without treating them as application source code. The folder is reserved for these assets; if a cleanup branch does not contain the uploaded binaries yet, the files must be added there before any implementation phase consumes the reference package.

## 2. Reference-only status

The imported files are design and prototype reference assets only. They are not production Next.js routes, reusable production components, backend code, database code, authentication code, payment code, or SEO route definitions.

They must not be imported directly into the production app because standalone prototype HTML, zipped design-system exports, demo styles, mock interactions, mock data, ratings, comments, payments, authentication states, dashboard screens, and nearby-discovery examples may not satisfy DrMuscat production requirements for accessibility, responsiveness, localization, SEO, security, RLS, data integrity, permissions, or medical-content safety.

## 3. Design source-of-truth summary

This reference import establishes a visual and product-direction source for future UI alignment phases only. The source of truth is:

1. DrMuscat canonical master specifications and phase locks.
2. The current production codebase and approved public/admin baselines.
3. The imported `drmuscat-ui-kit-2026-v2` reference files as visual guidance only.
4. Future approved `UI-K-ALIGN-*` implementation tasks, each limited to its explicit scope.

If the prototype conflicts with phase locks, RLS/security rules, SEO guardrails, production route constraints, or backend readiness, the stricter DrMuscat guardrail wins and implementation must stop until clarified.

## 4. Confirmed design features

The imported design direction confirms the following future alignment targets:

- Homepage search-first hero.
- `992px` search card target.
- Articles lower on the homepage.
- Strict **Country → City → Area** location hierarchy.
- Oman default and active.
- UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, and Iran marked future or coming soon.
- Role-based onboarding.
- Google sign-in, phone/OTP, and future email/phone plus password states.
- Doctor profile with reviews, comments, FAQ, nearby discovery, and disclaimer.
- Provider profile with reviews, comments, FAQ, nearby discovery, claim/report actions, and last-updated information.
- Rating-distribution bars with honest zero or empty state.
- Moderated comments pending state.
- Nearby/nearest discovery placeholder.
- Articles and FAQ.
- Admin and super-admin placeholder management scope.
- RTL Arabic support.
- No fake ratings, reviews, or medical claims.

## 5. Prototype files that must not be copied directly into production

The following imported reference files must not be copied directly into production app routes or components:

- `DrMuscat Design System (2).zip`
- `DrMuscat Web UI Kit (1).html`

Any future production implementation must translate the approved design intent into typed, reviewed, responsive, accessible, localized, SEO-safe, and phase-scoped production code. Prototype markup, demo CSS, demo JavaScript, mock ratings, mock comments, mock dashboards, mock payment states, mock authentication flows, and mock nearby-discovery logic must remain outside production until the relevant backend, permissions, validation, and content phases are approved.

## 6. Future safe implementation sequence

Future UI alignment must proceed only through small approved phases:

1. `UI-K-ALIGN-B` — Token and typography alignment only.
2. `UI-K-ALIGN-C` — Public shell/header/footer alignment.
3. `UI-K-ALIGN-D` — Homepage search alignment.
4. `UI-K-ALIGN-E` — Provider/doctor cards alignment.
5. `UI-K-ALIGN-F` — Registration/onboarding alignment.
6. `UI-K-ALIGN-G` — Provider and doctor profile alignment.
7. `UI-K-ALIGN-H` — Articles/FAQ/reviews/comments alignment.
8. `UI-K-ALIGN-I` — Dashboard/admin placeholder alignment.

Each phase must list planned files before editing, remain within its allowed scope, run validation, and stop for review before the next phase.

## 7. Forbidden areas

This documentation/reference cleanup phase does not authorize changes to:

- `supabase/*`
- `migrations/*`
- generated database types
- `scripts/db/*`
- RLS policies
- API routes
- auth backend
- payment backend
- `sitemap.ts`
- `robots.ts`
- `public/llms.txt`
- route-check relaxation

It also does not authorize changes to production UI routes, production components, backend files, package files, lockfiles, database schemas, seed data, or any feature implementation outside the explicit reference/documentation scope.

## 8. Risk notes

- Prototype and standalone HTML must not be imported directly into Next.js.
- Design-only ratings, comments, nearby discovery, payment states, and authentication states must remain placeholders until the required backend, schema, security, validation, and moderation support exists.
- Dashboards and admin panels are visual placeholders until real authentication, authorization, permissions, and audit requirements exist.
- Reviews, comments, ratings, FAQ, nearby, and medical disclaimers must avoid fake data, unsupported medical claims, and unapproved structured data.
- RTL Arabic alignment must be implemented through production-safe localization and layout work, not by copying prototype-only markup.

## 9. Recommended next PR

The recommended next PR is:

- `UI-K-ALIGN-B` — Token and typography alignment only.

That PR should avoid production feature expansion and should focus exclusively on approved token and typography alignment.
