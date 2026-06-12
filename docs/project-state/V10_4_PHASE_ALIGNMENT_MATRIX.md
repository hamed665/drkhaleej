# V10.4 Phase Alignment Matrix

## 1. Purpose

This file is a documentation-only alignment matrix for mapping the current DrMuscat repository state and future V10.5 business/growth expansion ideas to the existing V10.4 canonical architecture.

It exists to prevent phase drift. Future tasks must not invent new canonical phase numbers when the work can be mapped to the existing DrMuscat architecture. Instead, future work must be described through the four-axis mapping model:

1. Execution Phase from `docs/master-spec/58_CODEX_PHASED_BUILD_MASTER_PLAN.md`.
2. Lock Scope from `docs/master-spec/66_PHASE_LOCKS_AND_ALLOWED_FILE_CHANGES.md`.
3. Product Module from `docs/master-spec/08_IMPLEMENTATION_TASKS_AND_PHASES.md`.
4. Subphase ID namespace such as `SEO-A`, `MON-B`, `SALES-A`, `REF-A`, `PROV-C`, or `ANL-A`.

## 2. Authority and Non-Authority

- This file is documentation-only.
- This file does not authorize implementation.
- This file does not replace any file in `docs/master-spec/`.
- This file does not modify lock scopes.
- This file maps future tasks to the canonical DrMuscat architecture.
- If this file conflicts with `docs/master-spec/`, the master spec files remain authoritative.
- If this file conflicts with `README.md`, `AGENTS.md`, or `docs/project-state/CURRENT_STATE.md`, the stricter current-state or agent-safety instruction applies.

## 3. Current Repository Baseline

- Current repo state is after the admin provider onboarding lead detail baseline, landing content foundation, and review companion table foundation.
- Migrations validate through `0052_review_companion_tables.sql`.
- `0051_landing_page_contents.sql` is the landing content foundation migration.
- `0052_review_companion_tables.sql` is the review companion table foundation migration. It adds review companion tables only and does not complete the full review feature.
- Current public/admin baselines exist as documented in `docs/project-state/CURRENT_STATE.md`.
- Approved current surfaces include localized public catalog/detail foundations, provider onboarding lead capture, callback request capture, protected root `/admin`, read-only admin provider onboarding lead list/detail, landing content foundations, and review companion table foundations.
- The full review product remains unimplemented: no full moderation UI, no public review display workflow, no provider reply workflow, and no complete review operations.
- Payment gateways, invoices, checkout, AI chat, real seed rows, provider dashboard mutations, admin lead mutation workflows, sales, referral, billing, analytics, SEO AI, provider dashboard expansion, payment work, admin mutation work, provider marketing hub, full review product workflows, and other business expansion features remain out of scope unless explicitly approved.
- This matrix is not evidence that any not-started or phase-gated feature may be implemented.

## 4. Canonical Phase Systems

DrMuscat currently uses three canonical phase systems plus one task-level namespace. They are complementary, not interchangeable.

### 4.1 Execution Phases from `58_CODEX_PHASED_BUILD_MASTER_PLAN.md`

Execution Phase means lifecycle stage / when the work belongs in the build plan.

| Execution Phase | Canonical lifecycle meaning |
| --- | --- |
| Phase 0 | Spec Freeze and Schema Patch |
| Phase 1 | Repo Foundation |
| Phase 2 | Database Core and RLS |
| Phase 3 | Public SEO Platform |
| Phase 4 | Admin Foundation |
| Phase 5 | Provider Dashboard and Claim |
| Phase 6 | Monetization Foundation |
| Phase 7 | Analytics, Support, Quality |
| Phase 8 | Appointment/Insurance Foundation |
| Phase 9 | Production Hardening |

### 4.2 Lock Scopes from `66_PHASE_LOCKS_AND_ALLOWED_FILE_CHANGES.md`

Lock Scope means file and change boundary / where edits are allowed.

| Lock Scope | Canonical lock meaning |
| --- | --- |
| Phase 0 | Repository Readiness |
| Phase 1 | App Foundation |
| Phase 2 | Database Core |
| Phase 3 | RLS and Security |
| Phase 4 | Public SEO Pages |
| Phase 5 | Admin Basic |
| Phase 6 | Claim and Provider Ownership |
| Phase 7 | Provider Dashboard |
| Phase 8 | Offers, Click Tracking, Sponsored Foundation |
| Phase 9 | Plans and Manual Billing |
| Phase 10 | SEO Ops, Redirects, Import, Duplicate Tools |
| Phase 11 | QA and Production Hardening |

### 4.3 Product Modules from `08_IMPLEMENTATION_TASKS_AND_PHASES.md`

Product Module means business capability / what the task is about.

| Product Module | Canonical capability meaning |
| --- | --- |
| Phase 0 | Setup Only |
| Phase 1 | Database |
| Phase 2 | RLS/Security |
| Phase 3 | Public Directory and Seeded Listings |
| Phase 4 | Auth |
| Phase 5 | Onboarding/Claims |
| Phase 6 | Admin Foundation |
| Phase 7 | Billing/Ledger |
| Phase 8 | Media/Storage |
| Phase 9 | SEO/CMS and Programmatic Pages |
| Phase 10 | Reviews and Reputation |
| Phase 11 | AI Chat Discovery Assistant |
| Phase 12 | CRM/Dashboards/Analytics |
| Phase 13 | Offers, Claims and Redemption Tracking |
| Phase 14 | Sales CRM, Proposals and Contracts |
| Phase 15 | Internal Advertising and Sponsored Placements |
| Phase 16 | Microsites and External Campaign Landing Pages |
| Phase 17 | Premium Polish |
| Phase 18 | Launch QA |

### 4.4 Four-axis mapping model

- Execution Phase = lifecycle stage / when.
- Lock Scope = file and change boundary / where.
- Product Module = business capability / what.
- Subphase ID = task namespace / specific work item.

## 5. Phase Alignment Rules

- Every future task must declare `Execution Phase`, `Lock Scope`, `Product Module`, and `Subphase ID`.
- Informal labels like `Phase 5.20`, `Phase 5.26`, and `Phase 5.27` are retired.
- Future tasks must not use retired informal labels as canonical phase numbers.
- If mapping is unclear, STOP and request clarification.
- Do not infer implementation approval from this matrix.
- Do not infer database, RLS, route, validator, source-code, business-logic, or UI approval from this matrix.
- If a task requires files outside the declared lock scope, STOP and request a scope extension or a corrected task prompt.

## 6. Current Repo State Mapping After ALIGN-A

| Area / Capability | Current Status | Evidence Source | Execution Phase Mapping | Lock Scope Mapping | Product Module Mapping | Notes / Constraints |
| --- | --- | --- | --- | --- | --- | --- |
| Public localized catalog/detail foundations | Completed baseline | `README.md`; `docs/project-state/CURRENT_STATE.md` | Phase 3 — Public SEO Platform | Phase 4 — Public SEO Pages | Phase 3 — Public Directory and Seeded Listings; Phase 9 — SEO/CMS and Programmatic Pages | Current public routing remains limited to `en`/`ar` and `om`; no Persian/Hindi public SEO routes. |
| Provider onboarding lead capture | Completed baseline | `README.md`; `docs/project-state/CURRENT_STATE.md` | Phase 5 — Provider Dashboard and Claim, limited to approved lead capture baseline | Phase 6 — Claim and Provider Ownership, with approved public lead capture/API foundation already present | Phase 5 — Onboarding/Claims | Capture exists; provider dashboard mutations and broader provider workflows remain out of scope. |
| Callback request capture | Completed baseline | `README.md`; `docs/project-state/CURRENT_STATE.md` | Phase 3 — Public SEO Platform, limited to contact/callback foundation | Phase 4 — Public SEO Pages, plus approved API foundation already present | Phase 3 — Public Directory and Seeded Listings | Capture exists; do not expand into CRM or sales workflows without explicit approval. |
| Protected root admin shell | Completed baseline | `README.md`; `docs/project-state/CURRENT_STATE.md` | Phase 4 — Admin Foundation | Phase 5 — Admin Basic | Phase 6 — Admin Foundation | Admin routes are root-level `/admin`, not localized, and excluded from public SEO/sitemap surfaces. |
| Read-only admin provider onboarding lead list/detail | Completed baseline | `README.md`; `docs/project-state/CURRENT_STATE.md` | Phase 4 — Admin Foundation | Phase 5 — Admin Basic | Phase 6 — Admin Foundation; Phase 5 — Onboarding/Claims | Read-only baseline only; mutation/status/update workflows remain out of scope. |
| Completed migrations through `0052_review_companion_tables.sql` | Completed | `README.md`; `docs/project-state/CURRENT_STATE.md`; migration validation gate | Phase 2 — Database Core and RLS | Phase 2 — Database Core; Phase 3 — RLS and Security for approved policy phases | Phase 1 — Database; Phase 2 — RLS/Security; Phase 9 — SEO/CMS and Programmatic Pages for landing content foundation; Phase 10 — Reviews and Reputation for review companion table foundation | Current migration baseline is `0001` through `0052`; existing SQL migrations must not be modified unless explicitly approved. |
| Landing content foundation migration `0051_landing_page_contents.sql` | Completed foundation | `README.md`; `docs/project-state/CURRENT_STATE.md`; migration validation gate | Phase 2 — Database Core and RLS; supports future Phase 3 public SEO/CMS work only when approved | Phase 2 — Database Core; future Phase 4 or Phase 10 route/content work requires explicit approval | Phase 1 — Database; Phase 9 — SEO/CMS and Programmatic Pages | Database foundation only; it does not authorize new public routes, CMS workflows, seed rows, or SEO expansion. |
| Review companion table foundation migration `0052_review_companion_tables.sql` | Completed foundation / full review product not implemented | `README.md`; `docs/project-state/CURRENT_STATE.md`; migration validation gate | Phase 2 — Database Core and RLS; future review product work requires explicit approval | Phase 2 — Database Core; Phase 3 — RLS and Security only in approved policy phases; future admin/public/provider review files require explicit lock approval | Phase 1 — Database; Phase 10 — Reviews and Reputation | Adds review companion tables only; no full moderation UI, public review display workflow, provider reply workflow, or complete review operations are implemented. |
| Admin lead mutation/status/update workflows | Not started / phase-gated | `docs/project-state/CURRENT_STATE.md` | Phase 4 — Admin Foundation, only if explicitly approved | Phase 5 — Admin Basic | Phase 6 — Admin Foundation; Phase 12 — CRM/Dashboards/Analytics if workflow/CRM expands | Not implemented; assignment, conversion, contact-action, and audit-write workflows remain out of scope. |
| Payment gateways/invoices/checkout | Not started / forbidden unless approved | `README.md`; `docs/project-state/CURRENT_STATE.md`; master-spec payment restrictions | Phase 6 — Monetization Foundation, only if separately approved | Phase 9 — Plans and Manual Billing for manual billing; gateway work requires explicit approval beyond current lock assumptions | Phase 7 — Billing/Ledger | Live payment gateway integration and card storage are not approved. |
| AI chat | Not started / forbidden unless approved | `README.md`; `docs/project-state/CURRENT_STATE.md`; master-spec AI restrictions | No current execution approval; future AI chat would map outside current approved baselines | No current allowed lock scope for implementation | Phase 11 — AI Chat Discovery Assistant | AI chat is not implemented and remains out of scope; no diagnosis/prescription. |
| Real seed rows | Not started / phase-gated | `README.md`; `docs/project-state/CURRENT_STATE.md`; migration/seed protocol | Phase 2 — Database Core and RLS, only in an approved seed phase | Phase 2 — Database Core, only if explicitly approved | Phase 1 — Database; Phase 3 — Public Directory and Seeded Listings where seeded listings are approved | No real seed rows are allowed unless a seed phase is explicitly approved. |
| Provider dashboard mutations | Not started / phase-gated | `README.md`; `docs/project-state/CURRENT_STATE.md` | Phase 5 — Provider Dashboard and Claim | Phase 7 — Provider Dashboard | Phase 5 — Onboarding/Claims; Phase 12 — CRM/Dashboards/Analytics depending scope | Provider dashboard mutations are not implemented and require explicit future approval. |
| Sales/referral/billing/analytics/SEO AI/business expansion features | Not started / phase-gated | `README.md`; `docs/project-state/CURRENT_STATE.md` | Phase 6 — Monetization Foundation; Phase 7 — Analytics, Support, Quality; Phase 9 — Production Hardening as applicable | Phase 8, Phase 9, Phase 10, or Phase 11 lock depending exact files | Phase 7; Phase 9; Phase 12; Phase 14; Phase 15; Phase 18 depending exact capability | Business expansion features remain out of scope unless explicitly approved. |

## 7. Status Definitions

| Status | Definition |
| --- | --- |
| Completed | The current repo-state docs explicitly say the baseline exists and no unresolved implementation gap is identified for that baseline. |
| Partially completed | Some foundation exists, but important workflows, mutations, private access, admin actions, provider actions, or later product behavior remain unimplemented or explicitly out of scope. |
| Not started | Current repo-state docs explicitly say the capability is not implemented, or no approved implementation baseline exists. |
| Phase-gated | Work may be possible in the architecture, but it requires a future task with explicit phase, lock, product-module, file, database, route, RLS/security, and validation approval. |
| Documentation-only | The task creates or updates planning/state documentation only and does not authorize or implement product behavior. |
| Blocked / unclear | The task cannot be safely mapped without guessing; the agent must stop and request clarification. |

## 8. Canonical Alignment Matrix

| Capability / Workstream | Current Status | Execution Phase | Lock Scope | Product Module | Allowed Subphase Namespace | Expected File Family / Scope | Forbidden Scope | Approval Checkpoint |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Repo/spec alignment | Documentation-only / active | Phase 0 — Spec Freeze and Schema Patch | Phase 0 — Repository Readiness | Phase 0 — Setup Only, documentation alignment only | `ALIGN-*` | `docs/project-state/**` when explicitly allowed | Product code, migrations, routes, validators, RLS, SEO checks, business features | Approval before edits; stop after documentation phase. |
| Public SEO platform | Completed baseline / future phase-gated expansion | Phase 3 — Public SEO Platform | Phase 4 — Public SEO Pages | Phase 3 — Public Directory and Seeded Listings; Phase 9 — SEO/CMS and Programmatic Pages | `SEO-*` | Public route files, SEO libraries, sitemap/robots/llms only when approved | Persian/Hindi public SEO routes, deprecated route patterns, duplicate canonical routes, thin SEO pages | Human approval for public SEO pages and SEO ops/import/redirect tools. |
| SEO/GEO/AI search readiness | Not started / phase-gated | Phase 3 or Phase 7 depending whether public SEO or measurement | Phase 4 or Phase 10 depending file scope | Phase 9 — SEO/CMS and Programmatic Pages; Phase 12 — CRM/Dashboards/Analytics if tracking | `SEO-*`; `ANL-*` | SEO metadata, sitemap, robots/llms, AI discoverability docs/checks when approved | AI chat, private data exposure, unsupported locales/countries, unapproved routes | Explicit SEO implementation approval required. |
| Admin operations | Partially completed | Phase 4 — Admin Foundation | Phase 5 — Admin Basic | Phase 6 — Admin Foundation | `ADM-*` | `src/app/admin/**`, `src/components/admin/**`, `src/server/admin/**`, `src/lib/permissions/**` when approved | Payment gateway live integration, advanced analytics, full provider dashboard unless separately approved | Human approval for admin basic and any mutation/audit workflow. |
| Provider dashboard and claim | Partially completed / phase-gated | Phase 5 — Provider Dashboard and Claim | Phase 6 — Claim and Provider Ownership; Phase 7 — Provider Dashboard | Phase 5 — Onboarding/Claims; Phase 12 — CRM/Dashboards/Analytics if dashboard expands | `PROV-*` | Claim/provider files and owned-provider server logic when approved | Live payment gateway, public route restructuring, AI chat | Human approval before provider dashboard work. |
| Provider marketing hub | Not started / phase-gated | Phase 5 or Phase 6 depending provider/monetization scope | Phase 7, Phase 8, or Phase 9 depending exact files | Phase 12 — CRM/Dashboards/Analytics; Phase 13 — Offers; Phase 15 — Sponsored Placements | `PROV-*`; `MON-*`; `ANL-*` | Provider-owned marketing/dashboard modules when approved | Hidden organic ranking boosts, unapproved billing, unapproved sponsored logic | Explicit provider/monetization approval required. |
| Monetization/plans/billing | Foundation only / phase-gated | Phase 6 — Monetization Foundation | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger | `MON-*` | Manual billing/plans/ledger files when approved | Live gateway integration unless explicitly approved; storing card data | Human approval for plans/manual billing. |
| Billing term control | Not started / phase-gated | Phase 6 — Monetization Foundation | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger | `MON-*` | Plan/billing term rules, billing admin/provider scope when approved | Payment gateway integration, card storage, undocumented ledger effects | Explicit monetization approval required. |
| Payment method restrictions | Not started / phase-gated | Phase 6 — Monetization Foundation | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger | `MON-*` | Manual payment method policy/config/workflows when approved | Gateway implementation, card data, bypassing validation | Explicit monetization/security approval required. |
| Sales agent panel | Not started / phase-gated | Phase 7 — Analytics, Support, Quality or Phase 4 if admin-only shell | Phase 5 — Admin Basic, or a future approved sales/admin lock mapping | Phase 14 — Sales CRM, Proposals and Contracts | `SALES-*` | Admin/sales CRM surface and server logic when approved | Billing ledger changes, commissions, private data expansion without approval | Explicit sales/admin/security approval required. |
| Sales commission rules and ledger | Not started / phase-gated | Phase 6 — Monetization Foundation; Phase 7 — Analytics, Support, Quality | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger; Phase 14 — Sales CRM | `SALES-*`; `MON-*` | Billing/ledger/commission rules when approved | Gateway integration, unbalanced ledger, unapproved RLS changes | Explicit billing/ledger/RLS approval required. |
| Provider referral partner program | Not started / phase-gated | Phase 6 or Phase 7 depending ledger/reporting scope | Phase 8 or Phase 9 depending event/ledger files | Phase 7 — Billing/Ledger; Phase 12 — CRM/Dashboards/Analytics; Phase 14 — Sales CRM | `REF-*`; `MON-*`; `ANL-*` | Referral tracking, rewards, ledger/reporting when approved | Fake attribution, unapproved credits, unapproved public routes | Explicit referral/ledger/security approval required. |
| Provider credit/reward ledger | Not started / phase-gated | Phase 6 — Monetization Foundation | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger | `MON-*`; `REF-*` | Credit/reward ledger rules when approved | Unbalanced ledger, gateway integration, unapproved private RLS expansion | Explicit ledger/RLS approval required. |
| Analytics/attribution/reporting | Not started / phase-gated beyond current foundations | Phase 7 — Analytics, Support, Quality | Phase 8 — Offers, Click Tracking, Sponsored Foundation; Phase 11 — QA and Production Hardening depending scope | Phase 12 — CRM/Dashboards/Analytics | `ANL-*` | Events, analytics dashboards, reporting, monitoring when approved | Private data leakage, hidden ranking manipulation, unapproved AI tracking | Explicit analytics/security approval required. |
| Appointment/insurance foundation | Foundation only / phase-gated | Phase 8 — Appointment/Insurance Foundation | Lock scope must be explicitly approved if outside existing allowed lists | Phase 4 — Auth where user flow applies; Phase 8-equivalent appointment/insurance product scope from execution plan | `APPT-*` | Appointment request and insurance files only when approved | Real-time eligibility verification, calendar sync, unapproved booking engine | Explicit appointment/insurance approval required. |
| Production hardening | Phase-gated | Phase 9 — Production Hardening | Phase 11 — QA and Production Hardening | Phase 18 — Launch QA; Phase 17 — Premium Polish where relevant | `PROD-*` | Tests, validation scripts, monitoring, health checks when approved | New product scope except bug fixes | Human approval before production deploy. |

## 9. Future Subphase ID Namespace

| Namespace | Intended use |
| --- | --- |
| `ALIGN-*` | Repo/spec/current-state alignment. |
| `SEO-*` | SEO, GEO, AI search, metadata, sitemap, robots/llms validation. |
| `ADM-*` | Admin operations and approved admin workflows. |
| `PROV-*` | Provider dashboard, claim, marketing hub, owned profile workflows. |
| `MON-*` | Monetization, plans, billing terms, payment method rules, credits/rewards, add-ons. |
| `SALES-*` | Sales agent panel, sales CRM, proposals, contracts, commission workflows. |
| `REF-*` | Provider referral/reward partner program. |
| `ANL-*` | Analytics, attribution, reporting, AI visibility tracking. |
| `APPT-*` | Appointment and insurance workflows. |
| `PROD-*` | Production hardening, monitoring, QA, release readiness. |

## 10. Upcoming V10.5 Expansion Mapping

This table is mapping only, not implementation approval. Every item below remains unimplemented unless a future task explicitly approves its files, database impact, routes, RLS/security model, validation gate, and acceptance criteria.

| V10.5 Expansion | Recommended Subphase Namespace | Execution Phase | Lock Scope | Product Module | Database Impact | Route Impact | RLS/Security Impact | SEO Impact | Approval Required Before Implementation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEO/GEO/AI Search readiness | `SEO-*` | Phase 3 — Public SEO Platform; Phase 7 if measurement/reporting is included | Phase 4 — Public SEO Pages; Phase 10 — SEO Ops, Redirects, Import, Duplicate Tools | Phase 9 — SEO/CMS and Programmatic Pages; Phase 12 if tracking | None unless approved; future metadata/index tables would need explicit migration approval | No new routes unless explicitly approved; must preserve `en`/`ar` and `om` constraints | Must not expose private CRM, payment, license, receipt, claim evidence, admin notes, or unpublished provider data | High; must preserve canonical URLs, sitemap discipline, quality gates, and AI discoverability restrictions | Yes — SEO implementation approval required. |
| AI visibility tracking | `ANL-*`; `SEO-*` | Phase 7 — Analytics, Support, Quality | Phase 8 — Offers/Events/Sponsored if event capture; Phase 11 for monitoring/validation | Phase 12 — CRM/Dashboards/Analytics | Likely yes if tracking tables/events are needed; migration/RLS approval required | Usually none unless dashboards/routes are approved | Insert-only/read-restricted event model likely required; no AI chat approval implied | Medium; AI visibility reports must not create crawlable thin pages | Yes — analytics/RLS approval required. |
| Provider Marketing Hub | `PROV-*`; `MON-*`; `ANL-*` | Phase 5 — Provider Dashboard and Claim; Phase 6 if monetized; Phase 7 if reporting | Phase 7 — Provider Dashboard; Phase 8 for offers/sponsored; Phase 9 for billing | Phase 12 — CRM/Dashboards/Analytics; Phase 13 — Offers; Phase 15 — Sponsored Placements | Possible future provider marketing, campaign, offer, reporting, or entitlement tables; explicit migrations required | Provider/admin routes only if explicitly approved; public landing pages require SEO route approval | Provider ownership and entitlement checks required; no private data leakage | Medium/high if marketing pages or reports become public; no hidden ranking boosts | Yes — provider/monetization/security approval required. |
| Sales Agent Panel | `SALES-*`; `ADM-*` | Phase 7 — Analytics, Support, Quality or Phase 4 if admin-only | Phase 5 — Admin Basic, or explicit future sales/admin scope | Phase 14 — Sales CRM, Proposals and Contracts | Likely yes for sales agents, activities, proposals, contracts; explicit migrations required | Admin/internal routes only if approved | Admin-only/role-scoped access required; audit requirements likely apply | Usually none; internal routes must remain excluded from sitemap | Yes — sales/admin/security approval required. |
| Sales commission rules and ledger | `SALES-*`; `MON-*` | Phase 6 — Monetization Foundation; Phase 7 — Analytics, Support, Quality | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger; Phase 14 — Sales CRM | Yes if commission tables, ledger entries, or rules are added; explicit migrations required | Usually none except approved admin/provider billing pages | Strict ledger integrity, role access, and audit requirements; RLS approval required | None unless public reports/pages are introduced, which is not implied | Yes — billing/ledger/RLS approval required. |
| Provider referral partner program | `REF-*`; `MON-*`; `ANL-*` | Phase 6 or Phase 7 depending reward/analytics scope | Phase 8 for events; Phase 9 for billing/credits | Phase 7 — Billing/Ledger; Phase 12 — Analytics; Phase 14 — Sales CRM | Likely yes for referrals, attribution, rewards, credits; explicit migrations required | No public routes unless explicitly approved | Attribution/reward data must be role-scoped; no fake attribution | Medium if referral landing pages are later approved; otherwise none | Yes — referral/ledger/security approval required. |
| Billing term control: 3-month, 6-month, 12-month, annual-only | `MON-*` | Phase 6 — Monetization Foundation | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger | Possible plan/term rules or config tables; explicit migration approval required | Admin/provider billing routes only if approved | Billing rule enforcement must be server-side and auditable | None unless public plan pages are updated under SEO approval | Yes — monetization approval required. |
| Payment method restrictions by plan and term | `MON-*` | Phase 6 — Monetization Foundation | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger | Possible config/rules tables; explicit migration approval required | Admin/provider billing routes only if approved | Must not store card data; gateway integration remains unapproved unless explicitly approved | None unless public plan pages are updated under SEO approval | Yes — monetization/security approval required. |
| Provider credit/reward ledger | `MON-*`; `REF-*` | Phase 6 — Monetization Foundation | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger | Yes if ledger tables/rules are added; explicit migrations required | Admin/provider billing or reward routes only if approved | Balanced ledger, role-scoped access, RLS, and audit requirements apply | None unless public-facing reward pages are approved | Yes — ledger/RLS approval required. |
| Revenue add-ons: boosts, pay-per-lead, article packages, branded reports | `MON-*`; `SEO-*`; `ANL-*` | Phase 6 — Monetization Foundation; Phase 7 — Analytics; Phase 3 if public SEO content is involved | Phase 8 for sponsored/events; Phase 9 for billing; Phase 10 for SEO ops/content tooling | Phase 7 — Billing/Ledger; Phase 9 — SEO/CMS; Phase 12 — Analytics; Phase 15 — Sponsored Placements | Likely yes for add-ons, orders, credits, reports, tracking; explicit migrations required | Public pages/routes only if explicitly approved; admin/provider routes require lock approval | Must avoid hidden organic ranking boosts; sponsored labels and private data protections required | High for article packages/branded reports; must avoid thin/fake content and unsupported schema | Yes — monetization/SEO/analytics/security approval required. |

## 11. Retired Informal Labels

- `Phase 5.20` is retired.
- `Phase 5.26` is retired.
- `Phase 5.27` is retired.
- Future prompts must not use these labels as canonical phase numbers.
- Future prompts must use `Execution Phase` + `Lock Scope` + `Product Module` + `Subphase ID`.

## 12. Standard Future Task Prompt Mapping Template

```text
TASK ID:
EXECUTION PHASE:
LOCK SCOPE:
PRODUCT MODULE:
SUBPHASE ID:
GOAL:
FILES TO READ:
ALLOWED FILES:
FORBIDDEN SCOPE:
DATABASE CHANGES:
ROUTES:
VALIDATION:
ACCEPTANCE CRITERIA:
STOP CONDITION:
```

## 13. Validation Commands for Documentation-Only Alignment Tasks

Documentation-only alignment tasks should run:

- `git status --short`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

Future SEO implementation phases may also require:

- `pnpm routes:check`
- `pnpm seo:check`
- `pnpm build`

Validation commands must not be faked or skipped silently. If a command cannot run because of a missing dependency, environment failure, route ambiguity, schema conflict, RLS ambiguity, or unclear requirement, stop and report the blocker.

## 14. Stop Conditions and Ambiguity Handling

- Stop if a task needs files outside the allowed lock scope.
- Stop if `Execution Phase` / `Lock Scope` / `Product Module` mapping is unclear.
- Stop if implementation would require migrations, RLS, routes, source code, validators, or business logic outside the approved task.
- Stop if the work would edit `README.md`, `AGENTS.md`, `docs/project-state/CURRENT_STATE.md`, `docs/master-spec/*`, `src/*`, `scripts/*`, `supabase/*`, `package.json`, generated Supabase types, validators, route checks, RLS tests, SEO checks, or seed data without explicit approval.
- Stop if the work would implement sales, referral, billing, analytics, SEO AI, provider dashboard, payment, admin mutation, provider marketing hub, or any business feature without explicit approval.
- Stop rather than guessing.
- Do not fake passing tests.
