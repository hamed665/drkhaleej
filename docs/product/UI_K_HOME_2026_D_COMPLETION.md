# UI-K-HOME-2026-D — Provider CTA Completion

## 1. Final scope

Implemented and refined a UI-only homepage Provider CTA section for DrMuscat 2026. The section promotes a reviewed public provider profile with photos, services, special offers and direct contact actions for healthcare providers in Oman.

No backend, dashboard, form submission, payment, subscription, database, Supabase, API, SEO infrastructure, route creation, package or migration work was included.

## 2. Files changed

- `src/components/home/HomeProviderCTA2026.tsx`
- `src/components/home/HomePage2026HeaderHero.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_D_COMPLETION.md`

## 3. Asset existence check result

The required asset existence check passed before implementation. All three local assets were found:

- `public/images/home/provider-cta-healthcare-platform-preview.webp`
- `public/images/home/provider-cta-healthcare-platform-preview-mobile.webp`
- `public/images/home/provider-cta-healthcare-platform-preview.jpg`

## 4. Image asset paths used

The Provider CTA uses only the committed local homepage assets:

- Desktop WebP: `/images/home/provider-cta-healthcare-platform-preview.webp`
- Mobile WebP: `/images/home/provider-cta-healthcare-platform-preview-mobile.webp`
- Fallback JPG: `/images/home/provider-cta-healthcare-platform-preview.jpg`

No remote image URLs, generated images, placeholder images, renamed images or duplicated images were used.

## 5. Provider CTA layout strategy

The section is mounted after the existing Smart Search, Featured Provider Board and Discovery Categories sections. It uses a large rounded premium CTA block with:

- left-side localized provider copy, feature pills, CTA links and trust microcopy;
- right-side supporting healthcare visual treatment;
- a compact preview card communicating photos, services, special offers and contact actions without fake metrics or fake reviews.

## 6. Background/supporting image treatment

The healthcare-platform image is art-directed as a supporting visual rather than a text background. CSS adds a soft glass surface, gradient mask, controlled opacity, rounded clipping and overlay protection so the copy remains readable and the visual does not overpower the message.

## 7. Accessibility notes

- The section has a locale-stable accessible heading via `aria-labelledby` and trust note via `aria-describedby`.
- The image has concise localized alt text because it provides contextual support.
- CTA links have visible, localized accessible names.
- Feature, preview item and preview action chips are semantic lists.
- Focus-visible styling is included for CTA links.
- The content does not require hover or motion to understand.

## 8. Performance notes

- Only local committed images are used.
- No video, remote media, new dependencies or animation libraries were added.
- The visual area has controlled dimensions to reduce layout shift.
- CSS is scoped to the `dm2026-provider-cta-*` namespace and does not add broad global selectors.

## 9. Arabic/RTL status

Arabic copy is included inside the component and selected by locale. The component respects the received `dir` prop, uses logical CSS properties and includes RTL-specific headline sizing to avoid oversized Arabic layout.

## 10. CTA behavior

Both CTA actions link to the existing approved provider route supplied by the homepage through `publicProviderRoute(locale, country)`. No new route was created and no dead or fake backend action was introduced.

## 11. No backend/database/SEO changes confirmation

Confirmed: this implementation does not change backend code, API routes, Supabase files, migrations, schema, seed data, SEO infrastructure, sitemap, robots, route-check scripts, package files or lockfiles.

## 12. Validation results

Required validation commands were run after implementation:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

All validation commands passed after the refinement pass.

## 13. Manual QA notes

Code-level and build QA confirms the Provider CTA remains mounted after Discovery Categories and uses responsive LTR/RTL-safe markup and scoped CSS. Browser screenshot capture was attempted for desktop and mobile, but the workspace does not provide the Playwright CLI, so visual screenshot artifacts could not be produced in this environment.

Manual/browser QA checklist for `/en/om` and `/ar/om` desktop/mobile:

- Provider CTA appears after Discovery Categories.
- Local image assets were checked before implementation.
- Local image assets are used through `<picture>` sources and JPG fallback.
- No random placeholder image is used.
- Image supports the design without hurting readability.
- Text remains readable on desktop and mobile.
- Arabic layout uses RTL direction and tuned headline sizing.
- CTA buttons use the existing premium DrMuscat button language.
- Feature pills wrap cleanly.
- No search/header/language/footer files were changed.
- No DB/API/Supabase/migration changes were made.
- No SEO infrastructure changes were made.
- No package changes were made.
- No fake provider counts, fake ratings, fake reviews or booking claims are included.
- CSS uses clipped overflow and responsive stacking to avoid horizontal overflow.
