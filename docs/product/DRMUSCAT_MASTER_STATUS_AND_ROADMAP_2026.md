# DrMuscat Master Status and Roadmap Report 2026

**Task ID:** DOC-K-A  
**Task name:** Save DrMuscat Master Status and Roadmap Report  
**Mode:** Documentation only  
**Build mode:** `PHASED_BUILD_ONLY`  
**Report status:** Current-state record and future-roadmap control document. This file does **not** authorize implementation.

---

## 1. Project Definition

DrMuscat is an SEO-first healthcare discovery and provider visibility platform for Oman. The product is intended to help patients discover doctors, centers, services, areas, offers, and trustworthy healthcare information while giving providers a future path to claim profiles, manage visibility, receive leads, and participate in compliant commercial programs.

The platform is Oman-first and currently constrained to:

- supported public locales: `en`, `ar`;
- supported public country: `om`;
- canonical localized public route style under `/:locale/:country`;
- protected root-level admin routes under `/admin`;
- strict exclusion of admin/private/provider surfaces from sitemap, robots, public SEO, and crawler exposure.

DrMuscat is not being built as a one-pass full platform. Every future step must be a separately approved phase with a four-axis mapping:

1. **Execution Phase**
2. **Lock Scope**
3. **Product Module**
4. **Subphase ID**

V10.5 addendums are requirement-registration documents only. They do not approve monetization, SEO AI, sales, referral, provider dashboard, payment, ads, or business-feature implementation.

---

## 2. Execution Philosophy

DrMuscat must remain phase-gated, fail-closed, and reviewable.

Core execution rules:

- Use `PHASED_BUILD_ONLY` mode.
- Implement only the approved scope for the current task.
- List planned files before editing.
- Preserve the stricter guardrail when any documents conflict.
- Stop on ambiguity rather than guessing.
- Do not fake passing tests.
- Do not weaken TypeScript, lint, build, route, env, migration, seed, SEO, RLS, or validation checks.
- Do not implement business features just because foundation tables, routes, or addendums exist.
- Stop after each phase and wait for explicit approval.

The strategic product approach is **display-first, data-safe, SEO-disciplined, and monetization-aware**. Public pages should only become indexable after they have adequate public-safe data, reviewed content, canonical uniqueness, and approved quality gates.

---

## 3. Completed Work So Far

The current repository includes approved baseline foundations, including:

- Next.js application foundation with TypeScript-first expectations for app/auth/API/security/backend work.
- Oman-first localized public surfaces under `/:locale/:country`.
- Public catalog/discovery surfaces for doctors, centers, pharmacies, labs, services, and search.
- Public doctor and center detail foundations.
- Public `/:locale/:country/for-providers` page.
- Contact/callback foundations.
- Media and license foundations.
- Provider onboarding lead capture API.
- Protected root-level `/admin` baseline.
- Read-only admin provider onboarding lead list/detail baseline.
- Database foundations through the approved migration sequence recorded in project-state documentation, with later landing content foundation present as a private, fail-closed schema layer.
- RLS/security foundations for approved scopes, including public catalog read policies and selected private-data guardrails.

Still not implemented:

- payment gateways;
- checkout;
- invoice workflows;
- AI chat;
- provider dashboard mutations;
- admin provider onboarding lead mutation/status/update workflows;
- lead assignment/conversion/contact-action/audit-write workflows;
- real seed rows;
- sales, referral, billing, analytics, SEO AI, provider dashboard, ads, or broader business expansion features unless a future phase explicitly approves them.

---

## 4. `landing_page_contents` Current State

The current guardrail posture for landing content is intentionally private and fail-closed.

Current state:

- `public.landing_page_contents` exists.
- RLS is enabled on `public.landing_page_contents`.
- No RLS policies exist for `public.landing_page_contents`.
- No public `SELECT` path is approved.
- No grants to `anon` or `authenticated` are approved.
- No mutation policies are approved.
- No seed rows are approved.
- No public projection/view is approved.
- No public crawler exposure is approved.
- No programmatic SEO exposure is approved.

Purpose of the table:

- It is a private landing content storage foundation.
- It models landing page families, locale/country scope, lifecycle status, editorial review status, medical review status, and publication fields.
- It is not a public content source yet.
- It is not a CMS implementation yet.
- It is not a sitemap source yet.
- It is not an approval to generate SEO pages.

The strict interpretation is: **the table exists, but the public web cannot read it and crawlers cannot discover content from it.**

---

## 5. Public-Safe Projection/View Planning State

A future public-safe projection or view may be considered only after explicit approval. It must not be inferred from the existence of `landing_page_contents`.

A future projection/view phase would need to define:

- exact public fields;
- allowed landing families;
- locale/country constraints;
- published-only lifecycle rules;
- editorial review requirements;
- medical review requirements;
- deleted/archived exclusion;
- canonical key uniqueness;
- private-data exclusion proof;
- RLS or security-barrier posture;
- grants, if any, and only with explicit approval;
- static and runtime validation commands.

Until that future phase is approved:

- no projection/view exists;
- no helper may query public landing content;
- no page may render from `landing_page_contents`;
- no metadata, sitemap, schema, robots, or `llms.txt` surface may expose landing content;
- no crawler-facing route may be created from landing content.

---

## 6. Static and Runtime Guardrails

Current and future guardrails must preserve both static repository checks and runtime database checks.

Static guardrails should continue to verify:

- no forbidden public landing exposure;
- no accidental `CREATE POLICY` for restricted tables without phase approval;
- no grants to `anon` or `authenticated` for private landing content;
- no seed rows unless explicitly approved;
- no route, sitemap, robots, schema, or metadata exposure for unapproved landing pages;
- no direct raw-table helper usage for public landing content;
- no Persian/Hindi public SEO routes;
- no deprecated dentist shortcut routes;
- no duplicate canonical route families.

Runtime guardrails should continue to verify, when environment support is available:

- `public.landing_page_contents` exists;
- RLS is enabled;
- no policies exist;
- no `anon` or `authenticated` grants exist;
- raw `SELECT`, `INSERT`, `UPDATE`, and `DELETE` attempts are denied for public roles;
- landing helpers remain fail-closed;
- landing routes remain fail-closed.

---

## 7. Current Public Landing Path Status

Current public landing path status is fail-closed.

Approved public surfaces remain the existing catalog/detail and provider-interest baselines. Landing route scaffolds may exist only as non-indexable, fail-closed placeholders where previously approved. They must not render SEO content, query landing content, generate metadata from landing content, appear in sitemap, expose schema, or become crawler-visible.

Current required posture:

- service and service-area landing scaffolds remain fail-closed;
- unsupported locale/country values return `notFound()`;
- helper outputs are conservative and non-passing;
- gate decisions must not produce public indexability without approved content/data/review sources;
- programmatic landing pages are not active public SEO pages.

---

## 8. Prototype/UI Package Interpretation

Any prototype, UI package, mockup, design reference, component library, or visual concept must be treated as a design input only.

A prototype does not authorize:

- route creation;
- app/component implementation;
- backend/API implementation;
- database changes;
- RLS policies;
- public SEO exposure;
- seed data;
- payment, ads, AI, dashboards, or business workflows.

Future UI implementation must be mobile-first, responsive, professional, accessible, and SEO-compatible. Desktop-only or placeholder-looking pages are forbidden. Premium visual polish may be used only when performance-safe, accessibility-safe, and respectful of `prefers-reduced-motion`.

---

## 9. Frontend/Display-First Strategy

The recommended frontend strategy is to make DrMuscat visually credible and conversion-ready while keeping data and crawler exposure locked until public-safe sources are approved.

Display-first means:

- build professional, responsive public UI foundations before broad business workflows;
- use existing approved public data only;
- keep unapproved dynamic content fail-closed;
- avoid thin pages and fake SEO content;
- use semantic HTML and metadata only where the page is approved for public exposure;
- design for phones, tablets, laptops, and desktops from the start;
- preserve RTL support for Arabic;
- use deliberate logo placement and high-quality layout hierarchy;
- avoid heavy animation libraries unless explicitly approved;
- never sacrifice Core Web Vitals for visual effects.

Display-first does **not** mean exposing unreviewed content. It is a presentation strategy, not a permission to bypass data, RLS, review, SEO, or route gates.

---

## 10. UI-K-A Through UI-K-M Roadmap

The UI-K roadmap should be executed as narrow, approved UI phases. Each UI phase must list files before editing and must avoid backend/database/RLS expansion unless separately approved.

| Subphase | Approved continuation scope | Mode |
| --- | --- | --- |
| UI-K-A | Prototype Intake & Full Platform Frontend Roadmap | PLAN ONLY |
| UI-K-B | Frontend Prototype Intake & Full Platform Roadmap Document | DOCUMENTATION ONLY |
| UI-K-C | Design System Token Extraction Plan | PLAN ONLY |
| UI-K-D | Public Frontend Shell Implementation | IMPLEMENTATION |
| UI-K-E | Homepage Display Implementation | IMPLEMENTATION |
| UI-K-F | Provider Listing Display Implementation | IMPLEMENTATION |
| UI-K-G | Provider Profile Display Implementation | IMPLEMENTATION |
| UI-K-H | List Your Center Display Implementation | IMPLEMENTATION |
| UI-K-I | Category / Specialty Display Implementation | IMPLEMENTATION |
| UI-K-J | Area Page Display Implementation | IMPLEMENTATION |
| UI-K-K | Article Shell Implementation | IMPLEMENTATION |
| UI-K-L | RTL / Arabic Polish | IMPLEMENTATION |
| UI-K-M | Responsive / Mobile Polish | IMPLEMENTATION |

---

## 11. DATA-K Phases

DATA-K phases should prepare public-safe data foundations without exposing private or unapproved content.

Recommended future DATA-K sequence:

- **DATA-K-A:** canonical inventory audit for current public tables and route-safe fields.
- **DATA-K-B:** public-safe field matrix for doctors, centers, services, specialties, areas, offers, and landing content.
- **DATA-K-C:** landing content projection design document only.
- **DATA-K-D:** approved migration for public-safe projection/view, if authorized.
- **DATA-K-E:** runtime query helper implementation for approved projection only.
- **DATA-K-F:** quality-threshold data rules for programmatic pages.
- **DATA-K-G:** data QA reports for missing/ambiguous specialty, service, area, and center relationships.
- **DATA-K-H:** seed/import planning, with no seed rows until an explicit seed phase is approved.

DATA-K must not use `doctor_centers` as a writable canonical table and must not use legacy areas as a writable canonical table.

---

## 12. CLAIM-K Phases

CLAIM-K phases should move from lead capture toward compliant ownership and provider claims only after explicit approval.

Recommended future sequence:

- **CLAIM-K-A:** claim workflow requirements and route/security design document.
- **CLAIM-K-B:** claim submission UI/API, if approved.
- **CLAIM-K-C:** evidence upload and media security, if approved.
- **CLAIM-K-D:** admin claim review queue, if approved.
- **CLAIM-K-E:** approval/rejection audit workflow, if approved.
- **CLAIM-K-F:** provider ownership mapping and edit-permission foundation, if approved.
- **CLAIM-K-G:** claim status notifications, if approved.

Providers must not self-edit verified status, sponsored status, organic ranking score, plan entitlement, payment status, license verification status, or other admin-controlled trust/commercial fields.

---

## 13. DASH-K Phases

DASH-K phases should build provider dashboards only after private RLS/auth/backend scope is explicitly approved.

Recommended future sequence:

- **DASH-K-A:** provider dashboard requirements and permission matrix.
- **DASH-K-B:** authenticated provider shell, if approved.
- **DASH-K-C:** read-only claimed profile overview, if approved.
- **DASH-K-D:** controlled profile edit requests, if approved.
- **DASH-K-E:** lead inbox/read-only view, if approved.
- **DASH-K-F:** provider contact-action workflow, if approved.
- **DASH-K-G:** dashboard analytics cards, if approved.
- **DASH-K-H:** provider notification center, if approved.

No provider dashboard mutation may be implemented until ownership, permissions, audit logging, validation, and RLS are approved.

---

## 14. OFFERS-K Phases

OFFERS-K phases must be compliance-sensitive because healthcare offers and discounts may create legal, medical, advertising, and consumer-protection risks.

Recommended future sequence:

- **OFFERS-K-A:** offer policy and compliance requirements.
- **OFFERS-K-B:** offer data model planning.
- **OFFERS-K-C:** admin-created offer foundation, if approved.
- **OFFERS-K-D:** public offer display, if approved and SEO-safe.
- **OFFERS-K-E:** claim-code generation and redemption tracking, if approved.
- **OFFERS-K-F:** WhatsApp/contact attribution, if approved.
- **OFFERS-K-G:** offer analytics and monthly reporting, if approved.

Offers must not promise guaranteed medical outcomes, fake discounts, unsupported claims, or hidden sponsored ranking boosts.

---

## 15. REVIEWS-K Phases

REVIEWS-K phases must preserve trust, moderation, privacy, and schema integrity.

Recommended future sequence:

- **REVIEWS-K-A:** review policy and moderation requirements.
- **REVIEWS-K-B:** review submission flow, if approved.
- **REVIEWS-K-C:** moderation queue and admin actions, if approved.
- **REVIEWS-K-D:** public review display, if approved.
- **REVIEWS-K-E:** center/provider response workflow, if approved.
- **REVIEWS-K-F:** helpful votes and abuse reports, if approved.
- **REVIEWS-K-G:** rating aggregation helpers, if approved.
- **REVIEWS-K-H:** compliant review schema, if approved and only for visible approved reviews.

Review schema must not be faked. Private reviews, pending reviews, reports, and moderation notes must not be exposed publicly.

---

## 16. LEADS-K Phases

LEADS-K phases should build on existing contact/callback/provider-onboarding foundations without jumping to CRM or sales automation.

Recommended future sequence:

- **LEADS-K-A:** lead taxonomy and privacy model.
- **LEADS-K-B:** patient callback lead hardening, if approved.
- **LEADS-K-C:** provider onboarding lead admin actions, if approved.
- **LEADS-K-D:** lead assignment workflow, if approved.
- **LEADS-K-E:** lead conversion tracking, if approved.
- **LEADS-K-F:** contact-action audit logging, if approved.
- **LEADS-K-G:** lead dashboard/reporting, if approved.

Lead data is private. It must not be exposed to public pages, sitemap, robots, schema, AI summaries, or `llms.txt`.

---

## 17. MON-K Phases

MON-K phases should implement monetization only after billing/security/ledger approval.

Recommended future sequence:

- **MON-K-A:** monetization requirements and plan catalog document.
- **MON-K-B:** billing-term rules for 3-month, 6-month, 12-month, and annual-only offerings, if approved.
- **MON-K-C:** manual invoice and approved-payment activation model, if approved.
- **MON-K-D:** plan entitlement foundation, if approved.
- **MON-K-E:** receipt review and payment approval workflow, if approved.
- **MON-K-F:** balanced ledger rules, if approved.
- **MON-K-G:** provider credit/reward ledger, if approved.
- **MON-K-H:** revenue add-ons such as profile boosts, pay-per-lead, article packages, branded reports, and microsite add-ons, if separately approved.

Payment gateways, card storage, checkout, webhooks, payment secrets, and cash payout workflows remain forbidden until explicitly approved.

---

## 18. ADS-K Phases

ADS-K phases must preserve transparent sponsored labeling and avoid hidden organic ranking manipulation.

Recommended future sequence:

- **ADS-K-A:** advertising policy, placement taxonomy, and compliance review.
- **ADS-K-B:** admin-defined placements and flat sponsorship booking, if approved.
- **ADS-K-C:** creative approval and sponsored labels, if approved.
- **ADS-K-D:** basic impression/click tracking, if approved.
- **ADS-K-E:** monthly sponsored report integration, if approved.
- **ADS-K-F:** ad wallet and manual top-up approval, if approved.
- **ADS-K-G:** CPC campaigns, budget caps, and anti-duplicate billing, if approved.
- **ADS-K-H:** optional CPM, sponsored AI suggestions, advanced bidding, and exports, if separately approved.

Sponsored or boosted placements must be visibly labeled wherever surfaced.

---

## 19. CMS, Editorial, and Medical Review Phases

CMS/editorial/medical review phases are required before any reviewed medical landing content can become public.

Recommended future sequence:

- **CMS-K-A:** editorial content model requirements.
- **CMS-K-B:** medical review policy and role matrix.
- **CMS-K-C:** admin editorial draft UI, if approved.
- **CMS-K-D:** medical reviewer workflow, if approved.
- **CMS-K-E:** publish/unpublish controls, if approved.
- **CMS-K-F:** audit logs for editorial and medical decisions, if approved.
- **CMS-K-G:** public-safe published-content projection, if approved.
- **CMS-K-H:** content quality QA and stale-review checks, if approved.

Medical content must be informational and must not display guaranteed outcomes, diagnosis, prescriptions, or unsupported claims.

---

## 20. SEO Future Phases

Future SEO phases must be quality-gated and Oman-first.

Recommended future sequence:

- **SEO-K-A:** route/canonical inventory and duplicate-pattern audit.
- **SEO-K-B:** public-safe landing projection approval, if applicable.
- **SEO-K-C:** programmatic page quality thresholds.
- **SEO-K-D:** metadata and canonical implementation for approved pages only.
- **SEO-K-E:** sitemap expansion for approved indexable pages only.
- **SEO-K-F:** schema implementation only where content supports it.
- **SEO-K-G:** hreflang and localized Arabic/English pairing validation.
- **SEO-K-H:** redirect manager for legacy canonical changes, if approved.
- **SEO-K-I:** editorial/FAQ expansion with review workflow.
- **SEO-K-J:** SEO QA, route check, build check, and sitemap inspection.

Forbidden SEO actions remain:

- Persian/Hindi public SEO routes without explicit approval;
- deprecated shortcut routes such as `/en/dentist/al-khuwair`;
- thin programmatic pages;
- fake schema;
- duplicate canonical patterns;
- public pages dependent on client-only rendering for SEO-critical content.

---

## 21. AI Future Phases

AI phases are future-only and must be safety-scoped.

Recommended future sequence:

- **AI-K-A:** AI discovery assistant requirements and safety policy.
- **AI-K-B:** approved public data boundary and retrieval rules.
- **AI-K-C:** disclaimers and medical non-diagnosis/non-prescription guardrails.
- **AI-K-D:** chat session/message logging model, if approved.
- **AI-K-E:** AI lead tracking, if approved.
- **AI-K-F:** center/provider assistant, if approved.
- **AI-K-G:** AI SEO/answer-summary tooling, if approved.
- **AI-K-H:** red-team, privacy, and prompt-injection validation.

AI must not expose CRM notes, payment logs, private reviews, license files, receipts, claim evidence, admin notes, unpublished provider data, or private leads.

---

## 22. Analytics Phases

Analytics phases should measure real product behavior without exposing private data publicly.

Recommended future sequence:

- **ANL-K-A:** analytics event taxonomy.
- **ANL-K-B:** privacy-safe event capture, if approved.
- **ANL-K-C:** public page impression/click tracking, if approved.
- **ANL-K-D:** provider dashboard analytics cards, if approved.
- **ANL-K-E:** admin analytics dashboard, if approved.
- **ANL-K-F:** monthly provider report architecture, if approved.
- **ANL-K-G:** sponsored placement reporting, if approved.
- **ANL-K-H:** data retention, aggregation, and export rules, if approved.

Analytics must not bypass RLS, leak patient/provider private data, or create hidden ranking manipulation.

---

## 23. Admin Phases

Admin phases must remain protected, audited, and excluded from SEO.

Recommended future sequence:

- **ADM-K-A:** admin role/permission matrix.
- **ADM-K-B:** provider onboarding lead actions, if approved.
- **ADM-K-C:** claim review queue, if approved.
- **ADM-K-D:** media and license review actions, if approved.
- **ADM-K-E:** editorial/CMS workflow, if approved.
- **ADM-K-F:** offer review and approval, if approved.
- **ADM-K-G:** billing/payment review, if approved.
- **ADM-K-H:** sales/CRM admin tools, if approved.
- **ADM-K-I:** audit-log explorer, if approved.
- **ADM-K-J:** settings and feature flags, if approved.

Admin routes remain root-level `/admin`, non-localized, protected, and excluded from sitemap/public SEO surfaces.

---

## 24. Strict Forbidden Actions

The following actions remain forbidden unless a future phase explicitly approves them:

- modifying app files outside approved scope;
- modifying components outside approved scope;
- modifying CSS/Tailwind files outside approved scope;
- modifying routes outside approved scope;
- modifying `package.json` outside approved scope;
- modifying scripts outside approved scope;
- modifying existing SQL migrations without explicit approval;
- adding Supabase migrations without explicit migration approval;
- adding RLS policies without explicit RLS approval;
- adding grants without explicit approval;
- adding Supabase helpers without explicit approval;
- changing sitemap, robots, `llms.txt`, schema, metadata, `generateMetadata`, or `generateStaticParams` without explicit SEO approval;
- importing SEO spreadsheet data without explicit data/import approval;
- generating pages without explicit route/SEO approval;
- implementing AI without explicit AI approval;
- implementing dashboard/auth/payment/ads without explicit approval;
- adding real seed rows without explicit seed approval;
- using `doctor_centers` as a writable canonical table;
- using legacy areas as a writable canonical table;
- creating Persian or Hindi public SEO routes;
- creating deprecated routes such as `/en/dentist/al-khuwair`;
- faking passing tests;
- disabling TypeScript, lint, RLS, build, env, route, migration, seed, or validation checks to force progress;
- exposing private data through public pages, sitemap, robots, schema, AI summaries, or `llms.txt`;
- creating hidden sponsored ranking boosts;
- making unsupported medical claims.

---

## 25. Immediate Recommended Execution Order

The safest immediate execution order is documentation and display-first, with no new data exposure until guardrails are approved.

Recommended next order:

1. **DOC-K-A** — Save this master status and roadmap report. Completed by creating this document only.
2. **UI-K-A** — Prototype Intake & Full Platform Frontend Roadmap — PLAN ONLY, if explicitly approved.
3. **UI-K-B** — Frontend Prototype Intake & Full Platform Roadmap Document — DOCUMENTATION ONLY, if explicitly approved.
4. **UI-K-C** — Design System Token Extraction Plan — PLAN ONLY, if explicitly approved.
5. **UI-K-D** — Public Frontend Shell Implementation — IMPLEMENTATION, if explicitly approved.
6. **UI-K-E** — Homepage Display Implementation — IMPLEMENTATION, if explicitly approved.
7. **UI-K-F** — Provider Listing Display Implementation — IMPLEMENTATION, if explicitly approved.
8. **UI-K-G** — Provider Profile Display Implementation — IMPLEMENTATION, if explicitly approved.
9. **UI-K-H** — List Your Center Display Implementation — IMPLEMENTATION, if explicitly approved.
10. **UI-K-I** — Category / Specialty Display Implementation — IMPLEMENTATION, if explicitly approved.
11. **UI-K-J** — Area Page Display Implementation — IMPLEMENTATION, if explicitly approved.
12. **UI-K-K** — Article Shell Implementation — IMPLEMENTATION, if explicitly approved.
13. **UI-K-L** — RTL / Arabic Polish — IMPLEMENTATION, if explicitly approved.
14. **UI-K-M** — Responsive / Mobile Polish — IMPLEMENTATION, if explicitly approved.
15. **DATA-K-A** — Public-safe field inventory document, if explicitly approved after the UI continuation sequence.
16. **DATA-K-B** — Public-safe field matrix, if explicitly approved.
17. **SEO-K-A** — Route/canonical inventory and duplicate-pattern audit, if explicitly approved.
18. **CMS-K-A / CMS-K-B** — Editorial and medical review requirements, if explicitly approved.
19. **DATA-K-C / SEO-K-B** — Landing projection design and approval, if explicitly approved.
20. **Only after approval:** implement projection/view, public helpers, metadata, sitemap, schema, and indexable landing routes in separate narrow phases.

Do not skip directly to business expansion. The next safe product movement is professional public display polish and documentation-backed data/SEO planning, not payment, AI, ads, provider dashboards, or broad CMS implementation.

---

## Phase Completion Notes for DOC-K-A

This document records current posture and roadmap only. It does not create routes, migrations, policies, grants, helpers, seeds, metadata, sitemap entries, robots entries, schema, `llms.txt` entries, app UI, dashboard/auth/payment/ads, AI, or business workflows.
