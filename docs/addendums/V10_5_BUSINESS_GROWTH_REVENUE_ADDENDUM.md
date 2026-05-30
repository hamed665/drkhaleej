# V10.5 Business Growth and Revenue Addendum

## 1. Status and Authority

- This addendum is documentation-only.
- This addendum does not authorize implementation.
- This addendum does not replace V10.4 master-spec files.
- If this addendum conflicts with V10.4 master-spec files, `README.md`, `AGENTS.md`, `docs/project-state/CURRENT_STATE.md`, `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`, or any stricter guardrail, the V10.4 master-spec files, current-state documentation, agent instructions, alignment matrix, and stricter guardrail win.
- This addendum registers future business/growth and revenue requirements only.
- This addendum is not evidence that provider dashboards, marketing tools, billing, lead monetization, sponsored placements, analytics, routes, migrations, or revenue systems may be implemented.

## 2. Four-Axis Mapping Requirement

Every future implementation task derived from this addendum must use the existing V10.4 four-axis mapping model:

1. Execution Phase
2. Lock Scope
3. Product Module
4. Subphase ID

The future task must map work to existing V10.4 execution phases, lock scopes, product modules, and subphase namespaces. It must not invent replacement phase numbers, informal phase labels, or parallel architecture.

## 3. Non-Implementation Boundary

This addendum does not create, modify, or approve:

- routes
- migrations
- RLS policies
- API handlers
- server actions
- UI components
- business logic
- validators
- Supabase types
- route checks
- SEO checks
- seed data
- provider dashboards
- provider marketing tools
- billing systems
- lead monetization
- sponsored placement systems
- analytics systems
- revenue systems

## 4. Future Implementation Gate

Implementation requires a future `PHASED_BUILD_ONLY` task with:

- Execution Phase
- Lock Scope
- Product Module
- Subphase ID
- allowed files
- forbidden scope
- database impact
- route impact
- RLS/security impact
- validation
- human approval checkpoint

No implementation may proceed from this addendum alone.

## 5. Market Reality and Competitor Positioning

Future business/growth planning should recognize that DrMuscat is entering an Oman healthcare discovery market where trust, local relevance, provider data quality, and search visibility matter before aggressive monetization.

Future approved planning may evaluate:

- local healthcare directory competitors
- clinic and hospital direct websites
- Google Business Profiles and map-pack competition
- social-media-driven discovery behavior
- WhatsApp-first patient/provider communication norms
- provider willingness to pay only after visible demand, analytics, and trust are established

This section is strategic context only. It does not authorize competitor scraping, public route expansion, SEO page generation, sales tooling, provider dashboard work, or monetization implementation.

## 6. Oman-first Business Assumptions

Future V10.5 business planning should preserve Oman-first assumptions:

- Oman remains the launch country focus.
- Muscat and high-demand Oman locations should be prioritized before GCC expansion.
- English and Arabic remain the approved public launch languages unless a future phase explicitly approves additional locales.
- Provider acquisition should begin with trust, visibility, and accurate listing coverage rather than immediate self-serve SaaS pressure.
- Healthcare advertising, medical claims, referral incentives, and offers require compliance-sensitive review before implementation.

## 7. Growth Sequencing Principles

Future growth work should follow these sequencing principles:

### Free Supply First, Paid Conversion Later

- Build accurate provider supply and public discovery value before pushing paid plans.
- Avoid premature paywalls that reduce provider adoption.
- Use free or manually onboarded listings to establish search footprint and trust before monetized upgrades.

### Manual Sales Before Self-Serve SaaS

- Early monetization should assume manual sales, manual onboarding, and human-reviewed commercial workflows before self-serve SaaS automation.
- Self-serve plan purchase, checkout, gateway integration, or automated entitlement activation must wait for a separately approved monetization phase.

### Analytics Before Aggressive Premium Selling

- Providers should see credible visibility, source, and lead evidence before aggressive premium upsells.
- Future analytics must be accurate, auditable, and privacy-safe.
- Analytics requirements do not authorize event tables, dashboards, provider reports, or tracking implementation in this addendum.

## 8. Provider Marketing Hub Future Scope

A future Provider Marketing Hub may be considered only in a separately approved phase. Candidate future capabilities include:

- tracking links
- QR code generator
- campaign links
- WhatsApp templates
- source breakdown

Future implementation must define provider ownership rules, entitlement rules, audit requirements, privacy boundaries, analytics model, and validation before any file changes. The Provider Marketing Hub must not expose private CRM notes, payment data, license files, receipts, claim evidence, admin notes, unpublished provider data, or unsupported analytics.

## 9. Fast SEO Launch Sprint Future Scope

Future SEO launch planning may include:

- local citation checklist
- Google Business Profile setup plan
- first manual authority articles
- branded search capture strategy

This section does not create article routes, CMS records, public SEO pages, schema output, sitemap entries, redirects, or route changes. Any future SEO execution must preserve the V10.4 SEO route contract, quality gates, canonical strategy, and locale/country constraints.

## 10. Revenue Streams Overview

The following are registered as possible future revenue streams only:

- subscription
- boosts
- pay-per-lead
- article packages
- branded reports
- provider referral credits
- premium microsites
- future sponsored wallet
- future appointment/telehealth commission

Each stream requires future phase approval before implementation. Revenue streams involving rankings, sponsored placements, articles, reports, referrals, credits, appointments, telehealth, or wallets require explicit security, SEO, compliance, RLS, analytics, and monetization review as applicable.

## 11. Phase Mapping Table

| Requirement group | Execution Phase | Lock Scope | Product Module | Subphase ID namespace |
| --- | --- | --- | --- | --- |
| Business-growth planning | Phase 0 if documentation only | Phase 0 — Repository Readiness | Phase 0 — Setup Only | `ALIGN-*` |
| Provider Marketing Hub | Phase 5, Phase 6, or Phase 7 depending approved scope | Phase 7, Phase 8, or Phase 9 depending files | Phase 12, Phase 13, or Phase 15 depending capability | `PROV-*`, `MON-*`, `ANL-*` |
| Tracking links, QR codes, campaign links, WhatsApp templates, source breakdown | Phase 5 if provider dashboard; Phase 6 if monetized; Phase 7 if analytics/reporting | Phase 7, Phase 8, or Phase 9 depending files | Phase 12, Phase 13, or Phase 15 depending capability | `PROV-*`, `ANL-*`, `MON-*` |
| Fast SEO launch sprint, citations, GBP planning, authority articles, branded search | Phase 3 if public SEO; Phase 7 if measurement/reporting | Phase 4 or Phase 10 depending files | Phase 9; Phase 12 if tracking/reporting | `SEO-*`, `ANL-*` |
| Revenue streams overview | Phase 6; Phase 7; Phase 3 if public SEO content is involved | Phase 8, Phase 9, or Phase 10 depending files | Phase 7, Phase 9, Phase 12, or Phase 15 depending capability | `MON-*`, `SEO-*`, `ANL-*`, `REF-*` |

## 12. Explicitly Out of Scope

This addendum does not approve or implement:

- provider dashboard routes or mutations
- Provider Marketing Hub UI or backend
- tracking link generation
- QR code generation
- campaign link generation
- WhatsApp template sending
- source attribution tables or dashboards
- billing or subscriptions
- boosts or featured placement logic
- pay-per-lead workflows
- SEO article package creation
- branded report generation
- provider referral credits
- premium microsites
- sponsored wallet
- appointment or telehealth commission
- public route changes
- admin route changes
- migrations
- RLS changes
- seed data
- analytics events
- business logic

## 13. Future Validation Expectations

A future implementation task derived from this addendum must run the validation commands specified by that task. At minimum, future documentation-only alignment should confirm changed files with `git status --short`. Future product implementation may require environment, migration, RLS, route, typecheck, build, lint, SEO, and security validation depending on approved scope.

No validation command may be faked, skipped silently, weakened, or replaced with a non-equivalent check.

## 14. Human Approval Requirements

Before implementation of any requirement registered here, a human must approve a future `PHASED_BUILD_ONLY` task that includes the full four-axis mapping, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation gate, and human approval checkpoint.

This addendum must not be treated as human approval for business, growth, provider marketing, analytics, monetization, billing, sponsored placement, referral, SEO article, microsite, appointment, telehealth, or revenue feature implementation.
