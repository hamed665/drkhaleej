# DrMuscat

DrMuscat is an SEO-first healthcare discovery and provider visibility platform for Oman, designed to scale later to other GCC countries.

Canonical specification path:

- `docs/master-spec/`

Build mode:

- `PHASED_BUILD_ONLY`

## Current project phase status

- Current completed phase: **Phase 3.0A**
- Database foundation status: **completed through Phase 3.0A**
- Completed migration set: **`0001` through `0032`** (expected to exist)

## Completed database foundation scope (through Phase 3.0A)

- core extensions/enums
- profiles/auth base
- geo hierarchy
- taxonomy/services
- centers/locations/services/claims
- doctors/practice locations/services/schedules/exceptions
- appointment slots/core/operations
- reviews/reports
- media assets/entity media
- monetization foundation without payments
- legal/consent/audit foundation
- RLS auth helpers
- public catalog read RLS policies

## Explicitly excluded / not implemented yet

- no frontend/backend app features yet
- no seed rows yet
- no payments/invoices/checkout yet
- no notifications/reminders yet
- no insurance yet
- no medical records/diagnoses/prescriptions/lab results yet
- no private appointment/patient/provider/admin RLS yet

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
  - gyms
  - healthy restaurants
  - wellness centers
  - services
  - reviews
  - media galleries
  - sponsored/featured placements

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
- Future public catalog pages must protect Core Web Vitals:
  - fast LCP
  - low CLS
  - low INP
  - optimized images
  - responsive image sizes
  - no unnecessary heavy animation libraries
- SEO pages must not create Persian/Hindi public routes unless explicitly approved.
- Oman-first URL and content strategy remains the default.

## Next recommended phases

- Phase 3.0C TypeScript Safety Baseline
- Phase 3.1A Profiles RLS
- Provider membership/access foundation before provider write policies
- Patient contact profile link before patient appointment RLS

## Agent workflow reminder

Agents must read `AGENTS.md` before doing any work.

## Phase 3.0C — TypeScript Safety Baseline

Phase 3.0C establishes a TypeScript safety baseline before private RLS, auth, backend, API, and dashboard phases continue.

- Repository inspection in this phase found no `.js` / `.jsx` app code in the current Next.js app surface.
- Existing `.mjs` files are intentionally script/config oriented and may remain `.mjs` when script-only.
- Future app/auth/API/security/backend code must be TypeScript-first.
- Future React components must be implemented as `.tsx`.
- Future server utilities, API handlers, and server actions must be implemented as `.ts`.
- No broad JS-to-TS conversion is allowed without a dedicated approved phase.
- Private RLS/auth/backend work must continue with type-safety discipline; do not bypass typecheck/lint/build to force progress.
- Existing UI/UX and SEO guardrails remain mandatory for all future public work.
