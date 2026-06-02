# UI-K-B Frontend Implementation Roadmap

## 1. Executive Summary

UI-K-B is a documentation-only roadmap task for the visible DrMuscat frontend delivery track after PR #131 and the approved UI-K-A planning report.

This document converts UI-K-A findings into a practical phased frontend delivery plan while preserving the current DrMuscat constraints:

- Use `PHASED_BUILD_ONLY`.
- Preserve the existing public route convention: `/[locale]/[country]`.
- Preserve Oman MVP scope: English and Arabic only, country `om` only.
- Preserve current SEO safety rules.
- Preserve current RLS safety rules.
- Preserve `public.landing_page_contents` deny-by-default guardrails.
- Preserve TypeScript-first discipline.
- Avoid frontend implementation in this task.

No components, routes, CSS, metadata, sitemap entries, schema markup, API routes, Supabase queries, migrations, RLS policies, grants, public views, generated files, dashboards, mock data files, or production frontend behavior were created by UI-K-B.

## 2. Route Convention Decision

The canonical public route convention for DrMuscat remains:

```txt
/[locale]/[country]
```

For the Oman MVP, the canonical public roots are:

```txt
/en/om
/ar/om
```

Future frontend work must not introduce plain `/:locale` routes such as `/en` or `/ar` during early UI phases. Plain `/:locale` routes would duplicate the existing canonical structure, create SEO/canonical ambiguity, and risk competing route patterns.

Any future redirect or alternate-route decision must be handled in a separately approved routing/SEO phase. Until then, all public frontend planning should target the existing `/:locale/:country` convention.

## 3. Current Frontend Baseline

Observed UI-K-A baseline:

- The app uses Next.js App Router under `src/app/**`.
- The project is React/TypeScript-first, with strict TypeScript settings and no `allowJs` for app code.
- Styling currently uses Tailwind v4 plus DrMuscat CSS variables in `src/styles/globals.css`.
- Existing component groups include:
  - `src/components/layout/**`
  - `src/components/home/**`
  - `src/components/public/**`
  - `src/components/ui/**`
  - `src/components/admin/**`
  - `src/components/brand/**`
- Existing public route helpers live in `src/lib/routes/public.ts`.
- Current i18n setup supports only:
  - `en`
  - `ar`
  - `om`
- Arabic uses RTL direction through the locale direction helper.
- Current crawler-facing files are:
  - `src/app/sitemap.ts`
  - `src/app/robots.ts`
  - `public/llms.txt`
- Current sitemap posture is limited to approved localized public roots, discovery routes, and provider-acquisition route surfaces.
- Current `llms.txt` posture lists current public routes and avoids claims of MOH verification, AI diagnosis, or symptom-checker availability.
- The public landing helper remains fail-closed and does not expose source tables.

Current public route families observed in the repository include:

```txt
/[locale]/[country]
/[locale]/[country]/doctors
/[locale]/[country]/doctor/[doctorSlug]
/[locale]/[country]/centers
/[locale]/[country]/center/[centerSlug]
/[locale]/[country]/centers/[specialtySlug]
/[locale]/[country]/centers/[specialtySlug]/[areaSlug]
/[locale]/[country]/areas/[areaSlug]
/[locale]/[country]/services
/[locale]/[country]/services/[serviceSlug]
/[locale]/[country]/services/[serviceSlug]/[areaSlug]
/[locale]/[country]/pharmacies
/[locale]/[country]/labs
/[locale]/[country]/search
/[locale]/[country]/for-providers
```

Root-level admin routes currently exist separately under `/admin` and are not localized public SEO routes.

## 4. Prototype Status

Prototype-specific design extraction remains blocked.

During UI-K-A and UI-K-B read-only inspection, no prototype ZIP or extracted prototype folder was found in the readable repository/workspace context. No files such as `DrMuscat Wireframes.html`, high-fidelity homepage exports, prototype CSS/JS, screenshots, or extracted design package were available for safe inspection.

Therefore, this roadmap continues based on:

- the current repository state,
- the UI-K-A report,
- canonical master specs,
- existing route/i18n/SEO/RLS guardrails,
- observed frontend structure.

This document does not invent prototype-specific visual details.

If a prototype package is provided later, it must be treated as reference-only. It may inform visual direction, layout rhythm, spacing, tokens, section hierarchy, component inspiration, and copy tone. It must not be copied directly into production as raw HTML/CSS/JS, and it must not be used as a source of production data, SEO metadata, schema markup, medical claims, fake reviews, or crawler-facing content.

## 5. Phased Frontend Roadmap

### UI-L — Public Shell Foundation

Goal: prepare premium public shell and layout consistency.

Scope:

- `AppShell` review.
- `PublicHeader` planning.
- `PublicFooter` planning.
- `MobileNav` planning.
- `LocaleSwitcher` planning.
- `Breadcrumbs` planning.
- `PageContainer` planning.
- `Section` planning.
- `SectionHeader` planning.
- Logo placement rules.
- Mobile-first navigation behavior.
- LTR/RTL shell parity.

Allowed in a future UI-L implementation phase:

- Component normalization only.
- Layout consistency improvements.
- Design-token-aligned shell refinements.
- Accessibility-safe header/footer/navigation improvements.

Forbidden in UI-L implementation unless separately approved:

- New data fetching.
- Sitemap expansion.
- Metadata expansion.
- Supabase usage.
- Public data projections.
- Landing content access.
- Schema markup.
- New business features.

### UI-M — Homepage Upgrade

Goal: make the homepage premium, trustworthy, and sales-ready.

Scope:

- Hero.
- Search entry UI.
- Category cards.
- Areas block.
- Trust block.
- List your center CTA.
- Placeholder featured sections only.
- Mobile-first visual hierarchy.
- Arabic/English copy separation.

Rules:

- No fake providers.
- No real data integration.
- No schema markup.
- No unsafe SEO pages.
- No unapproved sitemap changes.
- No public `landing_page_contents` usage.
- No unsupported medical verification claims.

### UI-N — Provider Listing UX

Goal: improve discovery/listing experience.

Scope:

- Centers listing UX.
- Doctors listing UX.
- Pharmacies/labs/services UX where existing route patterns support them.
- Filters UI.
- Sorting placeholder.
- Provider cards.
- Empty states.
- Responsive listing grid/list behavior.
- Mobile filter drawer planning.

Rules:

- No unsafe programmatic SEO.
- No raw landing content.
- No crawler expansion.
- No fake coverage claims.
- No thin specialty/area pages made indexable without quality gates.
- No new Supabase usage unless approved.

### UI-O — Provider Profile UX

Goal: create premium provider profile experience.

Scope:

- Profile header.
- Contact actions.
- WhatsApp CTA.
- Services.
- Opening hours.
- Gallery placeholder.
- Map placeholder.
- Offers placeholder.
- Reviews placeholder.
- Data freshness/safety notices.
- License/trust display planning only where source data is approved.

Rules:

- No fake reviews.
- No unsupported verified claims.
- No schema markup until data-backed and approved.
- No unapproved offers logic.
- No live appointment booking.
- No AI diagnosis or symptom checker.

### UI-P — Provider Acquisition / List Your Center

Goal: support sales outreach and center onboarding interest.

Scope:

- Improve `/[locale]/[country]/for-providers`, or document a future route decision for `list-your-center`.
- Claim explanation.
- Verification trust copy.
- Lead form UI only if already approved by existing route/API scope.
- Sales-safe provider value messaging.

Rules:

- No dashboard.
- No subscription logic.
- No billing.
- No claim mutation workflow unless separately approved.
- No payment gateway.
- No provider self-service entitlement workflow.

### UI-Q — Mock / Static Data Phase

Goal: allow UI validation with safe local mock data only if approved.

Rules:

- Mock data must not be indexable.
- No schema markup from mock data.
- No fake real providers.
- No Supabase.
- No protected table usage.
- No sitemap inclusion for mock/thin pages.
- Mock content must be clearly non-production and must not be represented as verified clinic data.

### UI-R — Safe Public Data Integration

Goal: integrate real public data only through approved public-safe sources.

Rules:

- Use only approved public-safe views, projections, or helpers.
- Never read raw `public.landing_page_contents`.
- Tests are required before public exposure.
- Sitemap inclusion only after content quality gates.
- Metadata only from approved public-safe content.
- Schema only after content and source approval.
- No private/admin/reviewer/internal fields may reach public pages.

### UI-S — Dashboard Shell Later

Goal: create dashboard shell later, after public trust pages.

Scope:

- Auth-aware dashboard layout.
- Center dashboard navigation skeleton.
- Workspace structure planning.
- Mobile/tablet-safe shell degradation.

Rules:

- No business logic.
- No billing.
- No provider mutation unless approved.
- No private data expansion.
- No claim approval workflow.
- No analytics/reporting implementation.

### UI-T — Offers / Leads / Monetization Later

Goal: add business revenue surfaces after provider value is visible.

Scope:

- Offers UI.
- Lead capture UI.
- Paid placement UI.
- Subscription UI.

Rules:

- No payment integration yet.
- Sponsored placements must be labeled.
- Medical compliance review is required.
- No hidden organic ranking boosts.
- No unsupported discount/medical claims.
- No billing ledger or entitlement activation without explicit approval.

### UI-U — AI / WhatsApp Later

Goal: reserve AI/WhatsApp entry points only.

Rules:

- No AI diagnosis.
- No symptom checker.
- No automation implementation.
- No medical recommendation automation.
- No AI chat implementation.
- No WhatsApp assistant automation without approval.

## 6. Component Roadmap

### Early

Build or normalize first because these establish consistency and reduce downstream duplication:

- `AppShell`
- `PublicHeader`
- `PublicFooter`
- `MobileNav`
- `LocaleSwitcher`
- `Breadcrumbs`
- `PageContainer`
- `Section`
- `SectionHeader`
- `Button`
- `Card`
- `Badge`
- `Input`
- `EmptyState`
- `Skeleton`

Early component rules:

- Must support LTR and RTL.
- Must be mobile-first.
- Must use design tokens.
- Must preserve accessible focus and labels.
- Must avoid page-specific one-off styling.

### Mid

Build once shell/homepage foundations are stable and listing/profile tasks are explicitly approved:

- `SearchBar`
- `CategoryNav`
- `AreaSelector`
- `FilterSidebar`
- `SortControl`
- `Pagination`
- `ProviderCard`
- `ProviderBadge`
- `ProviderProfileHeader`
- `ProviderContactActions`
- `ProviderServices`
- `ProviderOpeningHours`
- `ProviderGallery`
- `ProviderMapPlaceholder`
- `MedicalDisclaimer`
- `DataFreshnessNotice`

Mid component rules:

- UI may be placeholder-only before data approval.
- Filters/sorting must not imply functional data behavior if not implemented.
- Provider cards must not use fake real-world providers as production content.

### Later

Build only after specific business, trust, modal/interaction, or data-backed phase approval:

- `OfferCard`
- `WhatsAppCTA`
- `ClaimCenterCTA`
- `ListYourCenterCTA`
- `SubscriptionPlanCard`
- `FeaturedPlacementBadge`
- `VerifiedBadge`
- `LicenseStatusBadge`
- `ReviewSummary`
- `ControlledReviewNotice`
- `Tabs`
- `Accordion`
- `Modal`
- `Toast`

Later component rules:

- Reviews must be controlled and data-backed.
- Verified/license badges must be source-backed and policy-approved.
- Sponsored/featured placement badges must be visibly labeled.
- Subscription/offer components must not imply active billing or payment gateway support before approval.

## 7. Design System Plan

Future UI phases should extract or normalize the design system around the following areas.

### Color tokens

Define and audit:

- Brand primary.
- Brand strong/dark.
- Brand soft/background.
- Healthcare-safe accent colors.
- Premium restrained gold accent.
- Surface colors.
- Text hierarchy.
- Border colors.
- Status colors.

### Typography tokens

Define:

- Heading scale.
- Body scale.
- Small/supporting text.
- Button text.
- Card/listing title styles.
- Arabic font stack.
- English font stack.
- Line-height rules.

### Spacing

Use a constrained, repeatable spacing system. Avoid random spacing values unless justified by a design-system phase.

### Border radius

Normalize radius usage for:

- Small controls.
- Cards.
- Large panels.
- Pills/badges.
- Full-radius buttons/chips.

### Shadows

Use subtle healthcare-safe shadows only:

- Soft.
- Card.
- Elevated.
- Premium.
- Focus.

Avoid harsh, cheap directory-card shadows.

### Buttons

Normalize:

- Primary CTA.
- Secondary CTA.
- Ghost/link action.
- Premium/accent CTA.
- Admin-only danger action.
- Loading/disabled states.
- Mobile full-width behavior.

### Cards

Normalize:

- Base card.
- Category card.
- Provider card.
- Profile card.
- Trust card.
- CTA card.
- Offer card later.

### Form controls

Normalize:

- Input.
- Select.
- Textarea.
- Search input.
- Label.
- Help text.
- Error state.
- Success state.
- Disabled/loading states.

### RTL behavior

Use logical CSS properties and avoid hardcoded left/right layout assumptions.

### Arabic typography

Arabic pages must have comfortable line-height, correct reading order, readable mixed numerals/phone numbers, and no cramped UI.

### Responsive breakpoints

Use mobile-first layouts across phones, tablets, laptops, desktops, and wide screens.

### Image ratios

Define consistent ratios for:

- Provider thumbnails.
- Profile covers.
- Gallery images.
- Logos/avatars.
- Article or content previews.

### Icon style

Icons should be restrained, premium, medically safe, and RTL-aware when directional.

### Restrained animation

Use only performance-safe and accessibility-safe animation. Respect `prefers-reduced-motion`. Do not add heavy animation libraries without explicit approval.

The site must look premium, clean, trustworthy, healthcare-safe, and Oman-first. It must not look like a cheap directory, spammy coupon site, or generic AI landing page.

## 8. i18n / RTL Plan

MVP locale/country scope:

- English only through `en`.
- Arabic only through `ar`.
- Oman only through `om`.

Canonical route model:

```txt
/[locale]/[country]
```

Direction:

- English: LTR.
- Arabic: RTL.

Future UI phases must include:

- Arabic-capable font stack.
- Logical CSS properties.
- Route-preserving language switcher.
- No Persian/Hindi routes.
- No hardcoded mixed-language UI text.
- No English-only layout assumptions.
- No duplicate localized route patterns that compete with canonical URLs.

Language switching should preserve equivalent route intent where safe, such as switching `/en/om/centers` to `/ar/om/centers`, and must avoid unsupported locale/country destinations.

## 9. SEO Safety Plan

Hard rules for frontend phases:

- No exposure of `public.landing_page_contents`.
- No raw Supabase query to protected landing table.
- No generated unsafe landing pages.
- No sitemap inclusion for unsafe, thin, mock, or unapproved pages.
- No robots or `llms.txt` exposure for protected content.
- No schema markup until content is approved.
- No public metadata using protected landing content.
- Programmatic SEO only after safe projection and quality gates.
- No Persian/Hindi public SEO routes.
- No deprecated route patterns such as `/en/dentist/al-khuwair`.
- No duplicate route patterns that compete with canonical URLs.

Future SEO-facing frontend work must prove:

- Content source is public-safe.
- Metadata source is public-safe.
- Canonical route is unique.
- Sitemap inclusion is approved.
- Schema is supported by real, approved content.
- No private/admin/internal/reviewer data can leak into public output.

## 10. Data Safety Plan

### UI-only

Use hardcoded placeholders only.

Allowed examples:

- Layout copy.
- Non-data-backed section headings.
- Empty states.
- Generic CTAs.

Forbidden examples:

- New Supabase queries.
- Protected table access.
- Public data projections.
- Real provider claims.
- Schema from placeholders.

### Mock/static

Use local mock data only if separately approved.

Rules:

- Mock data must not be indexable.
- Mock data must not generate schema.
- Mock data must not represent fake providers as real.
- Mock data must not be included in sitemap.
- Mock data must not bypass RLS or public safety checks.

### Public-safe integration

Use approved public-safe views, projections, or helpers only.

Rules:

- Never raw `public.landing_page_contents`.
- Tests required before public exposure.
- Sitemap only after quality gates.
- Public metadata only from safe data.

### Dynamic provider data

Later only after route, RLS, and SEO checks.

Rules:

- Must preserve public/private field boundaries.
- Must not leak internal/admin/reviewer/license details.
- Must not expose unapproved landing content.
- Must not generate crawlable thin pages.

### Dashboard data

Authenticated later phase only.

Rules:

- Auth and authorization checks required.
- Provider ownership checks required where applicable.
- No provider mutations unless explicitly approved.
- No billing/private data expansion without RLS/security approval.

Early frontend phases must not introduce new Supabase usage in public pages unless separately approved.

## 11. Accessibility & Performance Plan

Targets:

- LCP under 2.5s.
- CLS under 0.1.
- INP under 200ms.
- WCAG 2.2 AA directionally.

Required practices:

- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Sufficient color contrast.
- Labels for form fields.
- Accessible names for icon-only actions.
- Reduced-motion support.
- Mobile-first design.
- Minimal JavaScript.
- No layout shift.
- RTL QA.
- Responsive QA across phone, tablet, laptop, desktop.
- Optimized responsive images when images are introduced.
- Avoid heavy animation libraries.
- Prefer server-rendered public content where applicable.

## 12. Business Rollout Alignment

Recommended delivery order:

1. Public shell.
2. Homepage.
3. Listing.
4. Profile.
5. For-providers/list-your-center.
6. Mock/static UI.
7. Safe data integration.
8. Dashboard.
9. Offers/leads.
10. Monetization.
11. AI/WhatsApp.

Business rationale:

- Clinics in Oman must see trust quickly before being asked to list, claim, or pay.
- Users must understand the platform before advanced features are introduced.
- Provider listing and profile UI must demonstrate verified listing value before monetization.
- The for-providers/list-your-center path should support sales outreach without prematurely building a dashboard or billing system.
- Monetization should come after visible provider value is credible.
- AI/WhatsApp should remain later because healthcare automation requires additional safety, compliance, and product approval.

## 13. Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Copying prototype directly | Non-semantic, non-tokenized, unoptimized, or unsafe UI could enter production. | Treat prototype as reference-only and rebuild through approved components/tokens. |
| Missing prototype files | Prototype-specific design extraction would require guessing. | State blocker clearly and continue from repo state/master specs only. |
| Route duplication | Plain `/:locale` routes could compete with canonical `/:locale/:country` routes. | Preserve `/[locale]/[country]`; require separate SEO/routing approval for redirects. |
| Exposing `landing_page_contents` | Protected landing content could leak publicly. | Keep deny-by-default; never raw query; require approved projection/tests. |
| Thin SEO pages | Crawlable low-quality pages can harm SEO and violate guardrails. | Do not index mock/thin pages; require quality gates. |
| Dashboard overbuild | Internal features could delay public trust and sales-readiness. | Prioritize shell/home/listing/profile/acquisition first. |
| Early Supabase usage | Public UI may bypass RLS or expose protected data. | No new public Supabase usage in early phases unless approved. |
| RTL bugs | Arabic MVP quality may suffer. | Use logical CSS, RTL QA, Arabic typography review. |
| Inconsistent tokens | UI becomes fragmented and low-quality. | Normalize primitives/tokens before broad page work. |
| Mobile UX weakness | Mobile users may experience poor discovery/conversion. | Mobile-first design and responsive QA in every implementation phase. |
| Fake reviews | Trust/compliance damage. | No fake reviews; controlled review system only when approved. |
| Unsafe medical claims | Healthcare/legal risk. | Use approved copy and medical disclaimers; avoid unsupported claims. |
| Uncontrolled AI content | Medical safety and compliance risk. | No AI diagnosis/chat/automation until explicitly approved. |
| Sitemap/robots/llms exposure | Unsafe pages/content can become crawler-visible. | No crawler file changes in early UI phases. |
| Schema too early | Unsupported structured data can mislead crawlers/users. | Emit schema only when data/content approval exists. |
| Scope creep | Frontend track could violate phased discipline. | Keep UI-L through UI-U sequence and stop after each approved phase. |

## 14. Forbidden Scope for Early UI Phases

Early UI phases must not include:

- New Supabase queries.
- `landing_page_contents` access.
- Sitemap expansion.
- Robots changes.
- `llms.txt` changes.
- Schema markup.
- Public data projections.
- Dashboard logic.
- Payment.
- Claims workflow.
- Reviews logic.
- AI assistant.
- WhatsApp automation.
- Fake provider data as real data.
- New RLS policies.
- Grants.
- SQL migrations.
- API routes.
- Generated file changes.

## 15. Future PR Sequence

Recommended future PR sequence after UI-K-B:

1. `UI-L-A`: Public shell implementation plan.
2. `UI-L-B`: Design token/component audit documentation.
3. `UI-L-C`: Public shell implementation.
4. `UI-M-A`: Homepage implementation plan.
5. `UI-M-B`: Homepage implementation.
6. `UI-N-A`: Listing UX implementation plan.
7. `UI-N-B`: Listing UI implementation.
8. `UI-O-A`: Provider profile implementation plan.
9. `UI-O-B`: Provider profile UI implementation.
10. `UI-P-A`: For-providers/list-your-center implementation plan.
11. `UI-P-B`: Provider acquisition UI implementation.

Each implementation phase must include:

- Task ID.
- Mode.
- Goal.
- Read first.
- Allowed files.
- Forbidden files.
- Validation commands.
- Stop conditions.
- Expected output.

Implementation-phase rules:

- List files planned for creation/editing before editing.
- Implement only approved scope.
- Preserve `/[locale]/[country]` routing.
- Preserve `en`/`ar` and `om` MVP scope.
- Preserve RLS and SEO guardrails.
- Run required validation.
- Stop after the phase and wait for approval.
- Never fake passing tests.

UI-K-B completed as DOCUMENTATION ONLY. No frontend implementation performed.
