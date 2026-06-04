# 08_IMPLEMENTATION_TASKS_AND_PHASES.md

# Implementation Tasks and Phases

Claude Code must implement one approved phase at a time and stop after each phase with an exit report.

## Phase 0 — Setup Only
Create Next.js app, canonical folder structure, env example, i18n placeholders, auth placeholders, UI component placeholders, dashboard/public layout shells, and shared response helpers. Do not build feature pages yet.

## Phase 1 — Database
Create migrations from canonical DDL. Validate DDL. Generate Supabase TS types. Do not invent schema. Include V10 growth/review/AI/analytics/sales tables from `05b_DATABASE_FULL_DDL_V10.sql.md`.

## Phase 2 — RLS/Security
Implement helper functions, policies, grant review, security tests. Confirm default-deny for private/admin tables.

## Phase 3 — Public Directory and Seeded Listings
Build homepage, centers directory, center profile, search APIs, PostGIS nearby, unclaimed profile labels, claim CTA, suggest edit/report wrong info/request removal CTAs.

## Phase 4 — Auth
Phone login, OTP verify, complete profile, returnTo, guards, Turnstile.

## Phase 5 — Onboarding/Claims
Claim profile, center onboarding wizard, doctor interest, approval queue creation, verification levels, profile completeness score.

## Phase 6 — Admin Foundation
Admin shell, approvals, media/payment review, audit logs, settings shell, seeded listing controls.

## Phase 7 — Billing/Ledger
RPCs for manual subscription, payment approval, balanced ledger, commission. Placeholder billing RPCs are blockers before paid billing launch.

## Phase 8 — Media/Storage
Signed upload URL, media review, image derivative pipeline, video embed, transcript, optimized public image delivery.

## Phase 9 — SEO/CMS and Programmatic Pages
Sitemap, robots, matrix pages, area/category/service pages, blog/articles, disclaimer, reviewer rules, structured data, noindex rules for thin pages.

## Phase 10 — Reviews and Reputation
Structured reviews, sub-ratings, pending moderation, helpful votes, reports, center responses, review policy, weighted rating helpers, admin moderation dashboard.

## Phase 11 — AI Chat Discovery Assistant
Patient AI discovery assistant, center assistant, safety disclaimer, RAG/data retrieval boundaries, chat session/message logging, AI lead tracking. No diagnosis/prescription.

## Phase 12 — CRM/Dashboards/Analytics
Center dashboard, lead kanban, notes, follow-ups, KPI cards, analytics event dashboards, monthly report architecture, center visibility scorecards.

## Phase 13 — Offers, Claims and Redemption Tracking
Offer builder, claim code generation, redemption statuses, WhatsApp attribution, offer analytics.

## Phase 14 — Sales CRM, Proposals and Contracts
Sales pipeline, sales activities, proposal generator, contract tracking, presentation mode, center pitch page, QR kit routes.

## Phase 15 — Internal Advertising and Sponsored Placements
Implement ads in approved sub-phases only. Phase 15A: admin-defined placements, flat sponsorship bookings, creative approval, sponsored labels, basic impression/click tracking, and monthly report integration. Phase 15B: ad wallet, manual top-up approval, CPC campaigns, budget caps, anti-duplicate billing, and center self-serve campaign creation. Phase 15C: optional CPM, AI chat sponsored suggestions, advanced bidding, and exports. Do not implement all ad sub-phases at once unless explicitly instructed.

## Phase 16 — Microsites and External Campaign Landing Pages
Localized microsites, language switching, canonical, Instagram/YouTube/WhatsApp landing pages, retargeting hooks, for-clinics ad landing pages, and campaign-specific pages.

## Phase 17 — Premium Polish
Design consistency, creative premium UI, performance, Lighthouse, responsive, RTL, accessibility, motion rules.

## Phase 18 — Launch QA
Final QA checklist, env, backups, SMS provider, admin bootstrap, security review, SEO validation, analytics validation.

## Task Exit Report
Every task must report:
- files changed
- migrations created
- routes created
- admin pages created
- public pages created
- security/RLS impact
- SEO impact
- analytics impact
- mobile/RTL impact
- build result
- typecheck result
- lint result
- remaining blockers

## UI-K-ROUTE-CONTRACT-A Public UI Route Readiness

Approved route-contract readiness for a later frontend-only UI implementation phase:

- `/[locale]/[country]/articles`
- `/[locale]/[country]/articles/[slug]`
- `/[locale]/[country]/sign-in`
- `/[locale]/[country]/register`
- `/[locale]/[country]/list-your-center`
- `/[locale]/[country]/for-providers`

These are exact locale/country public UI route families only. Locale remains first, country remains second, `en`/`ar` and `om` remain the only active public launch dimensions, and Persian/Hindi routes remain forbidden. This phase does not authorize UI page creation, backend APIs, auth backend, payment backend, dashboards, database/RLS changes, sitemap output, robots changes, or `llms.txt` changes.
