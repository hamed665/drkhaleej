# UI-K-C Prototype Intake Addendum

## 1. Executive Summary

UI-K-C is a documentation-only prototype intake addendum for the DrMuscat frontend roadmap. The raw prototype ZIP is not available inside the Codex workspace; instead, the prototype package has been provided as an externally inspected reference summary and that summary is the approved planning input for this task.

The prototype package is treated as reference-only. It is not production architecture, is not a data source, and does not authorize frontend implementation. No raw prototype HTML, CSS, JavaScript, route structure, mock data, SEO metadata, schema markup, or production behavior is copied into DrMuscat production code by this addendum.

This addendum updates frontend planning only and preserves the existing DrMuscat constraints from UI-K-B: `PHASED_BUILD_ONLY`, Oman MVP scope, English/Arabic only, `/${locale}/${country}` public route convention, SEO safety, RLS safety, `public.landing_page_contents` deny-by-default posture, and TypeScript-first future implementation discipline.

## 2. Prototype Reference Inventory

The externally inspected prototype summary identifies the package as a static HTML/CSS/JS prototype with mock data only. Its files and concepts are classified as follows:

| Prototype reference | Classification | Planning use |
| --- | --- | --- |
| `drmuscat/DESIGN-SYSTEM.md` | Design-system docs | Reference for palette, typography direction, component inventory, spacing/radius/shadow style, RTL guidance, and visual hierarchy. |
| `DrMuscat Wireframes.html` | Wireframe overview | Reference for page hierarchy, content grouping, and low-fidelity flow validation only. |
| `drmuscat/DrMuscat.html` | Homepage file | Reference for homepage section order, premium healthcare tone, search entry, category/area presentation, and CTA rhythm. |
| `hifi/DrMuscat Home.html` | High-fidelity homepage file | Reference for polished homepage visual direction and hierarchy in future UI-M planning. |
| `hifi/home.css` | High-fidelity prototype CSS | Reference for visual direction only; do not copy into production CSS. |
| `hifi/home.js` | High-fidelity prototype JS behavior | Reference for intended interactions only; rebuild later in React/Next if approved. |
| `drmuscat/providers.html` | Listing page | Reference for provider listing layout, cards, filters/search rail, badges, skeletons, and empty states. |
| `drmuscat/provider.html` | Profile page | Reference for provider profile section hierarchy, media placeholders, trust cues, contact CTAs, and profile content rhythm. |
| `drmuscat/category.html` | Category landing page | Reference for specialty/category landing layout and card grouping. |
| `drmuscat/area.html` | Area landing page | Reference for localized area landing layout and geographic discovery grouping. |
| `drmuscat/list-your-center.html` | Provider acquisition page | Reference for provider lead/acquisition page hierarchy, CTA bands, and form UI direction. |
| `drmuscat/app.css` | Prototype global CSS | Reference for token extraction and style intent only; do not copy because production styling must use DrMuscat tokens/components. |
| `drmuscat/app.js` | Prototype JS behavior | Reference for interaction ideas only; do not copy or ship as production behavior. |
| `drmuscat/data.js` | Mock data | Reference only for possible mock-data shape inspiration in later planning; never use as real provider, review, rating, SEO, or indexable content. |
| `screenshots/*` | Screenshots | Reference for visual validation, responsive expectations, and future UI comparison only. |
| `wireframes/*` | Wireframes | Reference for flow, layout, and content hierarchy only. |
| Article/blog concepts | Content concept references | Not route-approved for implementation in this task; future article routes require separate SEO/routing approval. |
| Concierge/wellness concepts | Product concept references | Not implementation-approved; future business/product work requires separate phase approval. |
| RTL screen/reference | Localization reference | Reference for Arabic layout quality, non-mechanical mirroring, typography adjustment, and RTL regression avoidance. |

## 3. Production Reuse Decision

### Extract as design guidance

The following prototype material may be extracted as planning guidance only:

- Color token direction: green, teal, ivory, sand, gold, pearl, warm white, and ink tones.
- Typography direction: editorial/premium English headings, clean UI body text, dedicated Arabic heading/body choices, and language-specific typographic tuning.
- Spacing direction: calm, spacious, premium healthcare layouts with clear grouping and mobile-first hierarchy.
- Radius style: soft, modern, trust-oriented rounding suitable for healthcare cards, chips, CTAs, and forms.
- Shadow style: restrained elevation that supports hierarchy without looking like a coupon directory.
- Motion restraint: calm transitions only, with no heavy animation libraries and future `prefers-reduced-motion` support.
- RTL rules: Arabic should be intentionally designed, not merely mirrored from English.
- Component inventory: header, navigation, mobile menu, search rail, cards, chips, badges, CTA bands, forms, skeletons, empty states, media placeholders, and language switching.
- Visual hierarchy: premium, clean, warm, healthcare-safe, Oman/Muscat appropriate, calm, and trust-first.

### Rebuild in React/Next later

The following prototype concepts should be rebuilt later using DrMuscat production architecture, React/Next, TypeScript-first code, existing routing conventions, approved data sources, and design-system components:

- Header.
- Footer.
- Homepage sections.
- Search rail.
- Provider cards.
- Category cards.
- Area cards.
- Provider profile sections.
- List-your-center / provider acquisition form UI.
- CTA bands.
- Badges and pills.
- Skeleton and empty states.
- Media placeholders.
- Mobile menu and language switching behavior.

### Do not copy directly

The following must not be copied directly into production:

- Raw HTML files.
- Raw CSS, including `app.css` and `home.css`.
- Raw `app.js` or `home.js` behavior.
- Mock data as real data.
- Prototype routes.
- Fake providers, reviews, ratings, claims, testimonials, or ranking signals.
- SEO metadata or schema from the prototype.
- Article/blog or concierge/wellness concepts as route-approved production features.

## 4. Design Token Extraction

The prototype token direction should inform future DrMuscat token planning, but implementation must reconcile any selected values with the existing CSS variables, Tailwind usage, and master design-system documents rather than copying blindly.

| Prototype token | Prototype value | Future DrMuscat planning interpretation |
| --- | ---: | --- |
| Green | `#0F4B4A` | Primary medical-trust brand green candidate for future brand/action surfaces. |
| Green hover | `#13605E` | Hover/interactive state candidate for green actions. |
| Green dark | `#0A3A39` | Dark brand green candidate for high-emphasis text, deep backgrounds, or pressed states. |
| Teal | `#6FB7AA` | Secondary teal candidate for supportive highlights, icons, soft UI accents, and wellness cues. |
| Pale teal | `#DDEBE8` | Soft teal surface candidate for low-emphasis backgrounds and trust panels. |
| Ivory | `#F7F2EA` | Warm page background candidate that avoids sterile white while remaining healthcare-safe. |
| Pearl | `#F1EADD` | Subtle warm surface candidate for cards, alternate sections, or premium shells. |
| Sand | `#E9DDC7` | Warm divider/section tone candidate for Oman/Muscat context and gentle contrast. |
| White | `#fffdf9` | Warm white candidate for cards, content panels, and form surfaces. |
| Gold | `#C6A15B` | Premium accent candidate for limited trust, highlight, or decorative emphasis; should not dominate medical actions. |
| Ink | `#1C2422` | Primary text candidate with warm dark-green/black character. |
| Secondary ink | `#5d6b66` | Secondary text candidate for descriptions and supporting labels. |
| Muted ink | `#8a948f` | Muted text candidate for helper text, metadata, and low-emphasis UI. |

Additional token planning notes:

- Line colors should derive from pale teal, sand, pearl, or muted neutral borders, with enough contrast for card boundaries and form fields.
- Success, warning, and error tokens are not fully specified in the embedded prototype summary; future implementation must derive or reconcile them with the master design system and accessibility contrast requirements rather than inventing final values here.
- Shadows should remain soft and restrained, supporting premium hierarchy without heavy elevation.
- Focus glow should be visible, accessible, and tokenized; future implementation should likely align it with green/teal rather than browser-default-only styling.
- Radius should feel soft and premium across cards, chips, buttons, inputs, and panels, while preserving consistency with the existing component contract.
- Spacing should be generous, mobile-first, and rhythm-based; future implementation must map this direction to approved DrMuscat spacing tokens rather than one-off values.
- Motion durations/easing should remain subtle, calm, and performance-safe. Future implementation must respect `prefers-reduced-motion` and avoid heavy animation libraries unless explicitly approved.

## 5. Typography Extraction

The prototype summary suggests a language-aware typography direction:

### English typography intent

- Headings: `Spectral` direction for premium, editorial, warm, trustworthy healthcare headings.
- Body/UI: `Manrope` direction for readable, modern, clean interface text.
- Usage intent: English pages should feel polished and serious, closer to a healthcare/wellness platform than a discount directory.

### Arabic typography intent

- Headings: `Alexandria` direction for Arabic headings.
- Body/UI: `IBM Plex Sans Arabic` direction for Arabic body and interface text.
- Arabic pages should not be a simple mirrored version of English pages.
- Arabic headings should generally be smaller and/or lighter than English headings where needed to preserve balance, rhythm, and line wrapping.
- Arabic body text needs a more comfortable line-height than English body text.
- Mixed Latin text, numerals, phone numbers, emails, and medical/provider names inside Arabic layouts must remain readable and directionally stable.

### Phase boundary

No font loading, CSS changes, route changes, or component implementation is approved in UI-K-C. The production route language set must remain `en` and `ar` only, consistent with the Oman MVP route model.

## 6. Page Mapping to Current Route Convention

The prototype route model is not the production route model. Prototype plain `/en` and `/ar` routes are not production routes. Production DrMuscat public routes must use the `/${locale}/${country}` convention, and the Oman MVP roots remain `/en/om` and `/ar/om`.

No duplicate `/en` or `/ar` production routes should be introduced by future UI work. Any future redirect or alternate route decision requires separate routing/SEO approval.

| Prototype concept | Prototype route pattern | Production DrMuscat route mapping |
| --- | --- | --- |
| Homepage | `/en`, `/ar` | `/en/om`, `/ar/om` |
| Providers listing | `/en/providers` | `/en/om/centers`, `/ar/om/centers`, `/en/om/doctors`, `/ar/om/doctors` |
| Provider profile | `/en/providers/[slug]` | `/en/om/center/[centerSlug]`, `/ar/om/center/[centerSlug]`, `/en/om/doctor/[doctorSlug]`, `/ar/om/doctor/[doctorSlug]` |
| Category page | `/en/categories/[category]` | `/en/om/centers/[specialtySlug]`, `/ar/om/centers/[specialtySlug]` |
| Category + area concept | Derived from category/area concepts | `/en/om/centers/[specialtySlug]/[areaSlug]`, `/ar/om/centers/[specialtySlug]/[areaSlug]` |
| Area page | `/en/areas/[area]` | `/en/om/areas/[areaSlug]`, `/ar/om/areas/[areaSlug]` |
| Articles index | `/en/articles` | Not approved by UI-K-C; future articles require separate route/content/SEO approval. |
| Article detail | `/en/articles/[slug]` | Not approved by UI-K-C; future article detail routes require separate route/content/SEO approval. |
| List your center | `/en/list-your-center` | Existing `/en/om/for-providers`, existing `/ar/om/for-providers` |

Any future `/list-your-center` route requires separate routing and SEO approval. UI-K-C does not add routes, redirects, sitemap entries, robots changes, llms changes, metadata, or schema markup.

## 7. Component Mapping

Prototype classes and sections should map to future React components as planning references only:

| Prototype class/section | Future React/Next component direction |
| --- | --- |
| `site-header` | `PublicHeader` |
| Mobile menu | `MobileNav` |
| Footer | `PublicFooter` |
| Search rail | `SearchBar` / `SearchRail` |
| Chips | `FilterChip` / `CategoryChip` |
| Provider card | `ProviderCard` |
| Category card | `CategoryCard` |
| Area card | `AreaCard` |
| CTA band | `CTABand` |
| List-your-center form | `ProviderLeadForm` UI |
| Badges/pills | `Badge` / `Pill` |
| Skeleton/empty state | `Skeleton` / `EmptyState` |
| Media placeholder | `MediaPlaceholder` |
| Language switcher | `LocaleSwitcher` |

Future implementation must use approved component contracts, TypeScript-first React/Next code, accessible interaction semantics, mobile-first responsive layout, RTL/LTR parity, and approved data access rules.

## 8. UI Phase Impact

### UI-L

Use the prototype header, footer, navigation, mobile menu, language switcher, shell spacing, and layout rules as visual references for the future public shell implementation plan. UI-L should still remain aligned with UI-K-B and must not add routes, crawler-facing content, or data access without approval.

### UI-M

Use `hifi/DrMuscat Home.html` and `drmuscat/DrMuscat.html` as visual references for homepage hierarchy, warm premium healthcare tone, hero/search rhythm, category/area blocks, trust-first content grouping, and provider-acquisition CTAs.

### UI-N

Use `drmuscat/providers.html` and listing screenshots as provider listing references for layout hierarchy, search/filter rail direction, provider cards, chips, badges, skeletons, empty states, and mobile-first list behavior.

### UI-O

Use `drmuscat/provider.html` and profile screenshots as provider profile references for section ordering, media placeholders, contact CTA placement, badges/pills, profile content hierarchy, and trust-focused presentation.

### UI-P

Use `drmuscat/list-your-center.html` and form screenshots as provider acquisition references for the `/en/om/for-providers` and `/ar/om/for-providers` planning path, including CTA bands and `ProviderLeadForm` UI direction.

### UI-Q and later

Use `drmuscat/data.js` only as mock-data shape inspiration, not production content. No fake providers, ratings, reviews, services, article content, SEO metadata, schema, or crawler-facing content should be derived from prototype mock data.

## 9. SEO / RLS Safety Notes

- The prototype route model is not the production route model.
- No prototype route should be added to the sitemap directly.
- No plain `/en` or `/ar` production routes should be introduced by this prototype intake.
- No mock provider data should become indexable.
- No fake review, rating, testimonial, ranking, claim, or schema markup should be added.
- No prototype SEO metadata or schema should be copied into production.
- No `public.landing_page_contents` exposure is authorized.
- No Supabase usage is authorized.
- No crawler-facing content changes are made in this task.
- No robots or llms changes are made in this task.
- No RLS policy, grant, migration, public view, dashboard, API route, or protected-data behavior is authorized.

## 10. Risks and Mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Raw prototype copy risk | Static HTML/CSS/JS may conflict with production architecture, accessibility, routing, SEO, and TypeScript-first rules. | Treat prototype files as reference-only and rebuild later in approved React/Next phases. |
| Global CSS collision risk | Prototype CSS could introduce broad selectors, token drift, or layout regressions. | Reconcile visual direction with existing DrMuscat CSS variables, Tailwind usage, and component contracts before implementation. |
| Route mismatch risk | Prototype `/en`, `/ar`, and `/en/providers` patterns conflict with production `/${locale}/${country}` routes. | Preserve `/en/om` and `/ar/om`; require separate SEO/routing approval for any redirects or alternate routes. |
| Fake/mock data risk | Mock providers, reviews, ratings, or articles could become misleading, indexable, or compliance-sensitive. | Never use prototype mock data as production content; use approved data sources only in later phases. |
| JS behavior mismatch risk | Prototype JavaScript may rely on static DOM patterns unsuitable for Next.js, accessibility, or SSR. | Rebuild behavior later with React/Next semantics and approved client/server boundaries. |
| RTL regression risk | Arabic cannot be treated as a simple mirrored English layout. | Plan language-specific typography, spacing, line-height, icon direction, and mixed numeral handling. |
| Font loading/performance risk | Multiple premium fonts can increase layout shift and Core Web Vitals cost. | Defer font implementation; future phase must evaluate loading strategy, fallbacks, subsets, and performance budget. |
| Accessibility gaps | Prototype interactions may not satisfy keyboard, focus, semantic, contrast, or form-label requirements. | Future implementation must meet accessibility requirements from the component contract and premium UI/accessibility specs. |
| Mobile contrast/hierarchy risk | Warm low-contrast palettes can lose clarity on phones. | Validate contrast, hierarchy, tap targets, and responsive spacing in future UI plans and implementation phases. |
| Scope creep | Prototype includes article/blog, concierge, wellness, and other product concepts beyond current approval. | Keep UI-K-C documentation-only; require separate `PHASED_BUILD_ONLY` approvals for future features. |

## 11. Recommended Next Step

Recommended next task:

- Task ID: `UI-L-A`
- Mode: `PLAN ONLY`
- Goal: Public Shell Implementation Plan using UI-K-B and UI-K-C as references.

UI-L-A must still not implement code. It should define the public shell plan, allowed files for a later implementation phase, route/SEO/RLS safety checks, responsive/RTL expectations, accessibility expectations, and validation commands before any production UI changes are made.

UI-K-C completed as DOCUMENTATION ONLY. Prototype summary used as reference-only. No frontend implementation performed.
