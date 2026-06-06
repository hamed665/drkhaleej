# UI-K-HOME-2026-FULL Completion Report — Premium Homepage Shell with Search and Rotating Ads

## 1. Problems found before this fix

- Search still felt too close to a normal form rather than a premium command center.
- The sponsored visibility/ads section was present but not visible or premium enough and did not behave like a rotating spotlight carousel.
- Care stories, offers, article guides and provider/profile shells still read as safe placeholders rather than polished product inventory shells.
- Header included Sign in and Create account but they needed to remain visually clear while staying route-safe.
- Arabic headings needed tighter, more premium scaling and line-height safeguards.
- The homepage flow needed search first, then spotlight/ads, then discovery stories and lower sections.

## 2. Files changed

- `src/app/[locale]/[country]/page.tsx`
- `src/components/home/HomePage2026HeaderHero.tsx`
- `src/components/home/HomeSearch2026.tsx`
- `src/components/home/HomeAds2026.tsx`
- `src/components/home/HomeCareStories2026.tsx`
- `src/components/home/HomeCategories2026.tsx`
- `src/components/home/HomeFeaturedProviders2026.tsx`
- `src/components/home/HomeOffers2026.tsx`
- `src/components/home/HomeArticles2026.tsx`
- `src/components/home/HomeForProviders2026.tsx`
- `src/components/home/HomeTrust2026.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_FULL_COMPLETION.md`

## 3. Header/sign-in/create-account/language switch result

- The page keeps exactly one official global header.
- Header includes DrMuscat, Home, Doctors, Centers, Labs, Pharmacies, Services, Hospitals, Offers, Articles, For Providers, Sign in, Create account and language switch.
- Approved routes remain real links only.
- Hospitals, Offers, Articles, Sign in and Create account remain disabled/preview-safe pills because supported routes do not exist and route-check must not be weakened.
- English page shows only `العربية` as the language switch.
- Arabic page shows only `English` as the language switch.

## 4. Premium search command center result

- Search remains the first primary homepage product element.
- The command center has one dominant large search input, content-type chips, provider-type chips, country/city/area filters, curated suggestion chips and bottom CTAs.
- Main input placeholders are:
  - English: “Search doctors, clinics, services, offers or areas…”
  - Arabic: “ابحث عن طبيب، عيادة، خدمة، عرض أو منطقة…”
- Search submits to the existing approved search route with query parameters only.
- No live backend, autocomplete API, Supabase query or real ranking was added.

## 5. Complete options added

- Content types: Doctors, Clinics, Hospitals, Labs, Pharmacies, Services, Offers and Articles, with Arabic equivalents.
- Provider types: Doctors, Clinics / Centers, Hospitals, Labs, Pharmacies, Beauty & Wellness, Pet Clinics and Services, with Arabic equivalents.
- Countries: Oman active; UAE, Saudi Arabia, Qatar, Bahrain, Kuwait and Iran marked coming soon, with Arabic equivalents.
- Oman cities: Muscat, Seeb, Bawshar, Muttrah, Salalah, Sohar, Nizwa, Sur, Ibri, Rustaq, Barka and Duqm, with Arabic equivalents.
- Muscat areas: Al Khuwair, Qurum, Azaiba, Al Ghubra, Ruwi, Muttrah, Seeb, Bawshar, Madinat Sultan Qaboos, Ghala, Al Hail, Al Mouj, Muscat Hills, Wadi Kabir, Darsait, Al Amerat and Mabela, with Arabic equivalents.
- Specialty/service suggestions include dentistry, dermatology, pediatrics, gynecology, ENT, orthopedics, ophthalmology, general practice, cardiology, physiotherapy, lab tests, dental cleaning, skin clinic, laser hair removal, pharmacy, pet clinic, nutrition, mental health, beauty clinic and wellness center, with Arabic equivalents.

## 6. Rotating ads/spotlight carousel result

- Added a full-width premium `DrMuscat Spotlight` section directly after the search/hero top and before care stories.
- Implemented CSS-only rotating spotlight cards with a rotating orb/lens visual.
- Carousel items:
  - Homepage Featured Placement
  - Category Featured
  - Area Featured
  - Offers Spotlight
  - Article Sponsored Placement
- Arabic equivalents are included.
- Disclaimer is visible: “Sponsored visibility is paid placement, not quality ranking.” / “الظهور المموّل مساحة مدفوعة وليس ترتيباً لجودة الخدمة.”
- No prices, billing, wallet, checkout or ad backend were added.
- `prefers-reduced-motion` disables the animation and keeps the first spotlight card visible.

## 7. Care stories result

- Care Stories remain immediately after the search/spotlight flow.
- The story rail uses premium orb/lens cards and stronger spacing.
- Story labels are Dental, Beauty, Kids, Pet Clinic, Labs, Offers, Articles and For Providers, with Arabic equivalents.
- No modal behavior or medical advice was added.

## 8. Offers/doctors/articles/providers sections result

- Featured Doctors / Centers shells now use more product-like premium cards with orb/silhouette media placeholders and explicit safe review/approval copy.
- Offers now read as future approved offer inventory without prices, guaranteed outcomes or medical claims.
- Articles are styled as magazine-style guide previews and remain educational only.
- Provider CTA includes List your center, View provider options and disabled Create account preview while documenting that auth/dashboard/payment are inactive.

## 9. Arabic typography fixes

- Arabic hero and section headings use smaller RTL clamps, comfortable line-height and no negative letter spacing.
- Spotlight headings have dedicated RTL sizing.
- Chips and cards wrap safely for Arabic labels.

## 10. RTL/mobile/accessibility/performance notes

- Semantic sections, headings, labels, fieldsets, buttons and links are used.
- Pending header/account items are non-links with disabled semantics.
- Search chips remain keyboard-operable native radio controls or submit buttons.
- Mobile search stacks cleanly; CTA buttons become full-width where needed.
- Horizontal rails use CSS only.
- Carousel is CSS-only and respects `prefers-reduced-motion`.
- No new dependency, remote font, heavy JS, large image, background video or client-only SEO-critical content was added.

## 11. SEO/route safety notes

- Supported locales remain `en` and `ar`; supported country remains `om`.
- No Persian/Hindi route expansion.
- No sitemap, robots or llms changes.
- No schema.org output or fake structured data.
- No sign-in, create-account, offers, articles or hospital route was added.
- Disabled/pending header items are not dead links.

## 12. Forbidden areas untouched

Confirmed untouched:

- `supabase/**`
- `migrations/**`
- `scripts/db/**`
- generated database types
- API routes
- auth backend
- payment backend
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `public/llms.txt`
- `package.json`
- `pnpm-lock.yaml`
- database schema
- seed data
- route-check scripts
- `src/lib/routes/public.ts`
- `src/lib/i18n/config.ts`

## 13. Validation results

- `git status --short` — run before commit.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Forbidden path/content scans — passed.
- Built-page HTML checks for `/en/om` and `/ar/om` — passed.

## 14. Remaining limitations

- Sign in and Create account remain disabled/preview-safe because no approved auth routes/backend are in scope.
- Hospitals, Offers and Articles remain disabled/preview-safe in the header because those route families are not approved.
- Search is UI-only/static-safe and does not perform live autocomplete, provider ranking or backend search.
- Ads/spotlight carousel is a premium UI shell only with no advertiser backend, pricing, checkout or billing.
- Screenshot tooling was unavailable in the container, so visual QA relied on build output, HTML checks and CSS review.

## 15. Next PR recommendation

UI-K-HOME-2026-POLISH — final visual QA and Claude UI Kit alignment pass

## 16. Search Fix — PR #157-FIX05

### What was wrong with the previous search

- The search command center was premium in direction but still too tall, too form-like and too visually spread out.
- Content/provider chips, location filters and suggestions consumed too much vertical space on laptop widths.
- Suggestions were complete but too noisy for the primary homepage search surface.

### What changed

- Search markup was tightened so the badge, title, subtitle, dominant input, chips, location controls, suggestions and CTAs live inside one compact premium glass command panel.
- The main input remains the visual hero, with a pill/glass shell, search icon, strong Search button and clearer focus state.
- Content type chips are the primary compact segmented row; provider type chips are visually secondary.
- Country, city and area are presented as compact pill-like selects.
- Popular suggestions were reduced to curated rows that stay horizontally scrollable instead of noisy.

### Search layout summary

- Main input: dominant horizontal command bar.
- Row 1: compact content type chips.
- Row 2: secondary provider type chips.
- Row 3: Country, City and Area location controls.
- Row 4: curated suggestion chips and small user-facing safety copy.
- Bottom CTAs: Search and List your center.

### English/Arabic behavior

- English placeholder remains: “Search doctors, clinics, services, offers or areas…”
- Arabic placeholder remains: “ابحث عن طبيب، عيادة، خدمة، عرض أو منطقة…”
- Arabic labels use the same command-center layout with smaller RTL heading sizing and no negative letter spacing.

### RTL/mobile/accessibility notes

- Search fields keep labels, semantic fieldsets, real radio controls, real submit buttons and real provider link.
- Chip rows are horizontally scrollable where needed and avoid horizontal overflow.
- Mobile stacks the main input button and keeps touch targets at least 44px where interactive.
- Focus states remain visible on the command input and chips.

### Validation results

- `git status --short` — run before commit.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Built-page HTML checks for `/en/om` and `/ar/om` — passed.
- Source checks confirmed smart suggestion filtering hooks, city-area dependency mappings and preview labels are present.
- Interactive browser typing QA was not run because no browser/screenshot binary is installed in the container.

### Forbidden areas untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check or migration files were changed.

## 17. Search Fix — PR #157-FIX06

### Reduced search height/spacing summary

- Tightened the search panel spacing again while preserving the main command input as the visual hero.
- Kept content/provider chips compact and horizontally scrollable to reduce vertical height on desktop, laptop and tablet.

### Smart suggestions added

- Added UI-only client-side suggestion filtering from static data.
- English matching is case-insensitive through normalized text.
- Arabic matching uses the same static label/helper text matching and remains backend-free.
- Suggestions are grouped by Services, Provider types, Areas, Offers and Guides, with Arabic equivalents.

### City/area dependency added

- City selection now controls the Area options in UI state.
- Muscat, Salalah, Sohar and Seeb each expose city-specific areas.
- Other Oman cities fall back to `City-wide discovery` / `اكتشاف على مستوى المدينة`.
- Changing city resets the area to the first valid option for that city.

### Suggestion overflow fix

- Popular suggestions are capped to a curated visible set and include a `More` / `المزيد` chip.
- Suggestion rows use horizontal scrolling and fade-edge masking to prevent clipped text and line-break clutter.

### Hover/focus preview behavior

- Added an in-panel glass preview card that updates on suggestion hover/focus.
- Preview content includes the suggestion label, type, safe helper sentence and a `Use this suggestion` / `استخدام هذا الاقتراح` submit action.
- The preview stays inside the search panel and stacks below suggestions on smaller widths.

### Search preview decision

- Full search result preview after submit was not implemented in this fix to avoid fake result behavior.
- Search still submits to the existing approved search route with query parameters only.

### Arabic/RTL notes

- Arabic suggestions, chips and preview content use the same compact layout and avoid negative letter spacing.
- RTL layout remains scoped to the search component and CSS only.

### Accessibility/performance notes

- Search uses a client component only for local UI state; no API, Supabase, backend search or dependency was added.
- Form labels, fieldsets, radio controls, selects, submit buttons and focusable suggestion controls remain semantic.
- Hover/focus micro-interactions respect reduced-motion CSS safeguards.

### Validation results

- `git status --short` — run before commit.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Built-page HTML checks for `/en/om` and `/ar/om` — passed.
- Source checks confirmed smart suggestion filtering hooks, city-area dependency mappings and preview labels are present.
- Interactive browser typing QA was not run because no browser/screenshot binary is installed in the container.

### Forbidden areas untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, header, footer or other homepage section files were changed.

## 18. Search Fix — PR #157-FIX07

### Problems fixed

- Tightened the search command center so it is slimmer, less form-like and less vertically bulky.
- Replaced the previous simple suggestion filtering with deterministic one-character autocomplete from a richer static dataset.
- Kept the city-to-area dependency from FIX06 and expanded Bawshar-specific area support inside the search layer.

### Files changed

- `src/components/home/HomeSearch2026.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_FULL_COMPLETION.md`

### Controlled input/autocomplete behavior

- The main input remains controlled by local React state only.
- Local state now covers query, selected content type, selected provider type, selected country, selected city, selected area, active/focused suggestion, selected suggestion, suggestion panel visibility and discovery preview visibility.
- Typing one or more characters opens the smart suggestion panel immediately.
- Clicking a suggestion updates the input and mapped filters where safe, then collapses the suggestion panel.

### Suggestion dataset and groups

- Added an internal static suggestion dataset inside `HomeSearch2026.tsx` with IDs, English/Arabic labels, groups, helpers, keyword lists and optional mapped filters.
- Groups are Services, Provider types, Areas, Offers and Guides with Arabic equivalents.
- The dataset includes the required services, provider types, Muscat/Oman areas, offers and guide suggestions without fake providers, fake ratings or backend data.

### One-character suggestion behavior

- English filtering is case-insensitive.
- Arabic filtering removes common diacritics and normalizes common variants such as `أ/إ/آ` to `ا`, `ة` to `ه`, and related forms.
- Ranking prioritizes label starts-with, keyword starts-with, label contains, keyword contains and helper contains matches.
- Source checks cover expected examples for `D`, `B`, `L`, `pet`, `q`, `ط`, `أس` / `اس`, and `مخت` matching paths.

### Popular suggestions overflow fix

- Empty-query popular suggestions are capped to the curated list and include a `More` / `المزيد` button.
- The `More` button expands additional suggestions inside the search card on desktop while mobile keeps a horizontal rail with fade edges.
- Chip text is no longer dumped into one long clipped row.

### Hover/focus preview behavior

- Hovering or keyboard-focusing a suggestion updates the in-panel glass preview.
- The preview remains inside the search panel with label, group, helper sentence and a safe `Use this suggestion` / `استخدام هذا الاقتراح` action.

### City/area dependency preservation

- City changes reset the area to the first valid area for the selected city.
- Muscat, Sohar, Salalah, Seeb and Bawshar use city-specific areas.
- Limited-data cities fall back to `City-wide discovery` / `اكتشاف على مستوى المدينة`.

### Search preview decision

- A compact local discovery preview was added after Search click.
- It summarizes query/content type/city/area and states that reviewed public profiles will appear after provider data is approved.
- No fake result cards, provider names, doctor names, ratings, reviews or availability are shown.

### Arabic/RTL notes

- Arabic matching handles common spelling variants without external libraries.
- Arabic suggestion rows, preview and discovery preview remain RTL-safe with compact typography and no negative letter spacing.

### Accessibility/performance notes

- The input, chips, select controls, suggestion rows, More control and preview actions are real form controls/buttons.
- The autocomplete input uses `aria-expanded` and `aria-controls`; suggestion rows are keyboard-focusable and update preview on focus.
- All behavior is local UI state only; no API, Supabase, backend search, new dependency or route change was added.

### Validation results

- `git status --short` — run before commit.
- `pnpm lint` — passed with existing repository warnings and no errors.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- Source checks confirmed deterministic matching, city-area maps, More expansion, preview state and forbidden-area safety.
- Browser screenshot tooling remains unavailable in the container; interactive visual typing QA is documented as an environment limitation.

### Forbidden areas untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check, migration, header, footer, route page or other homepage section files were changed.
