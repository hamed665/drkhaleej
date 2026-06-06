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

### Forbidden areas untouched

No database, Supabase, RLS, API, auth, payment, sitemap, robots, llms, package, lockfile, route helper, i18n config, route-check or migration files were changed.
