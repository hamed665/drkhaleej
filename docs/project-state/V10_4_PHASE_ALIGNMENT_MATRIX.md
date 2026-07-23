# V10.4 Phase Alignment Matrix

## Purpose

This file is documentation-only. It maps the current DrMuscat repository state to the existing V10.4 architecture and does not authorize implementation.

Future work must declare:

1. Execution Phase
2. Lock Scope
3. Product Module
4. Subphase ID

If this file conflicts with `docs/master-spec/`, the master spec wins. If it conflicts with `README.md`, `AGENTS.md`, or `docs/project-state/CURRENT_STATE.md`, the stricter current-state or safety instruction wins.

## Current Repository Baseline

- Import-readiness runtime is aligned through PR #954 at baseline `9d0511ba6b2ff5a53e8fd857cb09273d269d602d` (last aligned 2026-07-24).
- Migrations validate through `0082_import_pharmacy_private_execution_audit.sql`.
- The current next implementation is `ROLLBACK-AUTHORITY-HARDENING`.
- Current foundations include public catalog/detail pages, static public article shell routes, provider onboarding lead capture, callback request capture, protected root `/admin`, minimal admin login, lead list/detail, limited lead mutation, lead history, draft center creation from lead, center subscription view/assignment, base plan initializer, admin quick navigation, admin commercial add-on assignment shell, and the Preview-only guarded Pharmacy private publish/readback path.
- The Pharmacy private publish path consumes one already verified Reservation, applies the exact reviewed canonical patch, persists terminal state, creates one server-only durable rollback reference and remains private/noindex/no-route/no-sitemap.
- The commercial add-on shell creates draft/internal Homepage Ads and Special Offer Placement assignments only.
- Article pages are still static shell pages only.
- Official Offers, public commercial rendering, article CMS, article placement engine, AI content workflows, live financial workflows, real seed rows, provider dashboard mutations, sales/referral/reporting expansion, and other business expansion features remain out of scope unless explicitly approved.

## Canonical Phase Systems

| Execution Phase | Meaning |
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

| Lock Scope | Meaning |
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

| Product Module | Meaning |
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

## Current State Mapping

| Capability | Current Status | Execution Phase | Lock Scope | Product Module | Notes |
| --- | --- | --- | --- | --- | --- |
| Public catalog/detail foundations | Completed baseline | Phase 3 | Phase 4 | Phase 3 / Phase 9 | Limited to `en`/`ar` and `om`. |
| Static public article shell | Completed shell | Phase 3 | Phase 4 | Phase 9 | No article CMS or placement engine. |
| Provider onboarding lead capture | Completed baseline | Phase 5 | Phase 6 | Phase 5 | Broader provider workflows remain gated. |
| Callback request capture | Completed baseline | Phase 3 | Phase 4 | Phase 3 | CRM-style expansion remains gated. |
| Admin shell and login | Completed baseline | Phase 4 | Phase 5 | Phase 4 / Phase 6 | Admin routes stay root-level and private. |
| Admin lead list/detail | Completed baseline | Phase 4 | Phase 5 | Phase 6 / Phase 5 | Later contact workflows remain gated. |
| Lead status/priority mutation and history | Partially completed baseline | Phase 4 | Phase 5 | Phase 6 / Phase 12 | Event types remain constrained by their existing migration contract. |
| Draft center creation from lead | Completed admin baseline | Phase 4 / Phase 5 | Phase 5 / Phase 6 | Phase 5 / Phase 6 | Uses `note_added` with `event_kind: draft_center_created`. |
| Center subscription view/assignment | Completed foundation | Phase 6 | Phase 9 / Phase 5 | Phase 7 / Phase 15 | Admin assignment only. |
| Commercial add-on assignment shell | Completed draft/internal shell | Phase 6 | Phase 8 / Phase 5 | Phase 15 | Homepage Ads and Special Offer Placement only. |
| Pharmacy private publish/readback | Completed Preview authority | Phase 4 / Phase 9 | Phase 10 / Phase 11 | Phase 6 / Phase 18 | Single entity, verified Reservation, exact patch, terminal persistence, durable reference and hosted readback; Production and public promotion remain disabled. |
| Migrations through `0082` | Completed | Phase 2 / Phase 4 | Phase 2 / Phase 3 / Phase 10 | Phase 1 / Phase 2 / Phase 6 | Existing SQL migrations must not be modified unless approved. |
| Review companion foundation | Foundation only | Phase 2 | Phase 2 / Phase 3 | Phase 10 | Full review product is not implemented. |
| Official Offers | Not started / phase-gated | Phase 6 | Phase 8 | Phase 13 | Needed before real Special Offer Placement. |
| Article placement engine | Not started / phase-gated | Phase 3 / Phase 6 | Phase 4 / Phase 8 | Phase 9 / Phase 13 / Phase 15 | Future slot system only after approval. |
| Live financial workflows | Not started / phase-gated | Phase 6 | Phase 9 | Phase 7 | Not approved by current foundations. |
| AI-assisted content workflows | Not started / phase-gated | Future approval required | Future approval required | Phase 9 / Phase 11 / Phase 12 | No auto-publishing. |
| Real seed rows | Not started / phase-gated | Phase 2 | Phase 2 | Phase 1 / Phase 3 | Requires approved seed phase. |
| Provider dashboard mutations | Not started / phase-gated | Phase 5 | Phase 7 | Phase 5 / Phase 12 | Requires explicit future approval. |
| Business expansion features | Not started / phase-gated | Depends on scope | Depends on files | Depends on module | Requires explicit future approval. |

## Import readiness baseline

| Field | Value |
| --- | --- |
| Aligned through | PR #954 |
| Runtime baseline | `9d0511ba6b2ff5a53e8fd857cb09273d269d602d` |
| Last aligned | `2026-07-24` |
| Current migration | `0082_import_pharmacy_private_execution_audit.sql` |
| Current next | `ROLLBACK-AUTHORITY-HARDENING` |

## Import readiness capability mapping

This table maps current capability evidence to the canonical phase systems. The authoritative wave ledger remains in [`docs/import/import-readiness-roadmap-after-933.md`](../import/import-readiness-roadmap-after-933.md).

| Capability | Current status | Evidence | Next gate |
| --- | --- | --- | --- |
| Client-safe authorization | Complete | #936 | Maintain static checks |
| Canonical Pharmacy patch | Complete | #937 | Executor parity |
| Metadata/locale preservation | Complete | #938 | Publish/rollback regression |
| Stable operation identity | Complete | #939 | Replay proof |
| Persisted authorization | Complete | #940 | Lifecycle regression |
| Invalidation/readback | Complete | #941 | Bounded UI regression |
| Atomic reservation transaction | Complete | #942, #949 | Maintain transaction regression |
| Admin reserve operation | Complete | #943 | Maintain bounded operation regression |
| Reservation integrity proof | Complete | #946 | Maintain readback regression |
| Reservation DB safety proof | Complete | #949 | Maintain hosted proof |
| Reservation audit split | Complete | #950 | Maintain audit compatibility |
| Existing private executor handoff | Complete | #953 | Maintain handoff regression |
| Private Admin wiring and publish readback | Complete | #954 | `ROLLBACK-AUTHORITY-HARDENING` |
| Exact rollback recovery | Open | — | Wave 4 |
| Pharmacy public/index/sitemap | Disabled/Open | — | After Admin canary |
| AI-assisted intake | Planned | — | After intake convergence |
| Content/SEO Agent | Planned separate track | — | After CMS/automation authority |

The current reservation audit signature is `event_type=reservation_created`, `event_payload.phase=reservation`, and `schema_version=drkhaleej.import.publishAudit.v2`; legacy reservation-phase `execution_started` rows remain compatible only with prior schema versions. Mutation execution uses `execution_started + phase=mutation` and terminal success under `drkhaleej.import.publishAudit.v3`.

## Immediate task mapping

| Subphase | Execution Phase | Lock Scope | Product Module |
| --- | --- | --- | --- |
| `ALIGN-CURRENT-STATE` | Phase 9 | Phase 10 | Phase 6 |
| `RES-INTEGRITY-READBACK` | Phase 9 | Phase 10 | Phase 6 |
| `RES-DB-SAFETY-PROOF` | Phase 2 | Phase 3 | Phase 2 |
| `RESERVATION-AUDIT-SPLIT` | Phase 2 | Phase 3 | Phase 2 |
| `VERIFIED-RESERVATION-HANDOFF` | Phase 2 | Phase 10 | Phase 6 |
| `PRIVATE-ADMIN-WIRING` | Phase 4 | Phase 10 | Phase 6 |
| `ROLLBACK-AUTHORITY-HARDENING` | Phase 9 | Phase 11 | Phase 6 |
| `ROLLBACK-EXACT-RECOVERY` | Phase 9 | Phase 11 | Phase 18 |
| `ADMIN-STATE-MACHINE` | Phase 4 | Phase 5 | Phase 6 |
| `REAL-ADMIN-CANARY` | Phase 9 | Phase 11 | Phase 18 |

This is the primary mapping and must be confirmed against current `main` before each PR. Program milestones do not replace the canonical phase systems.

## Future Subphase ID Namespace

| Namespace | Intended use |
| --- | --- |
| `ALIGN-*` | Repo/spec/current-state alignment. |
| `ADM-*` | Admin operations and approved admin workflows. |
| `CENTER-*` | Center creation/conversion/admin center operations. |
| `MON-*` | Monetization, plans, billing terms, add-ons. |
| `ADS-*` | Ads product and sponsored campaign workflows. |
| `OFF-*` | Official Offers model and offer approval workflows. |
| `ART-*` | Article CMS, article rendering, article admin workflows. |
| `PLAC-*` | Placement slots across articles, homepage, offers, area, and specialty pages. |
| `SEO-*` | SEO, GEO, AI search, metadata, sitemap, robots/validation. |
| `AI-*` | AI content intelligence and AI-assisted drafting, when approved. |
| `SALES-*` | Sales panel and sales workflow planning. |
| `REF-*` | Referral/reward planning. |
| `ANL-*` | Analytics, attribution, and reporting. |
| `APPT-*` | Appointment and insurance workflows. |
| `PROD-*` | Production hardening, monitoring, QA, release readiness. |

## Upcoming Expansion Mapping

This table is mapping only, not implementation approval.

| Expansion | Recommended Namespace | Status | Key Rule |
| --- | --- | --- | --- |
| Official Offers | `OFF-*` | Not started | Must exist before real Special Offer Placement can point to approved offers. |
| Fuller Ads options | `ADS-*` / `MON-*` | Not started | Must stay labeled and separated from organic ranking. |
| Article CMS | `ART-*` | Not started | Must be CMS-driven before DB-backed article publishing. |
| Article placement engine | `PLAC-*` | Not started | Must use slots and density rules. |
| AI content intelligence | `AI-*` / `SEO-*` | Not started | AI may suggest and draft only after approval workflows exist. |
| Provider Marketing Hub | `PROV-*` / `MON-*` / `ANL-*` | Not started | Provider self-service should come after admin controls. |
| Sales Agent Panel | `SALES-*` / `ADM-*` | Not started | Internal/admin only unless explicitly expanded. |
| Referral/reward program | `REF-*` / `MON-*` / `ANL-*` | Not started | Requires attribution/reward controls. |
| Analytics/reporting | `ANL-*` | Not started | Must not expose private data or manipulate organic ranking. |

## Retired Informal Labels

- `Phase 5.20` is retired.
- `Phase 5.26` is retired.
- `Phase 5.27` is retired.
- Future prompts must not use these labels as canonical phase numbers.

## Standard Future Task Prompt Mapping Template

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

## Validation Commands for Documentation-Only Alignment Tasks

Documentation-only alignment tasks should run:

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

Validation commands must not be faked or skipped silently.

## Stop Conditions and Ambiguity Handling

- Stop if a task needs files outside the allowed lock scope.
- Stop if phase mapping is unclear.
- Stop if implementation would require migrations, RLS, routes, source code, validators, business logic, or UI outside the approved task.
- Stop if business expansion would be implemented without explicit approval.
- Stop rather than guessing.
- Do not fake passing tests.
