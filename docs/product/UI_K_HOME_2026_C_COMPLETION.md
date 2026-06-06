# UI-K-HOME-2026-C Completion — Premium Discovery Categories with Motion Scenes

## 1. Final scope

Implemented the homepage-only, UI-only Discovery Categories section for PR #159 in `PHASED_BUILD_ONLY` mode. The section is static-safe, has no data fetching, and appears below the approved Smart Search top shell and Featured Provider Board.

## 2. Files changed

- `src/components/home/HomeDiscoveryCategories2026.tsx`
- `src/components/home/HomePage2026HeaderHero.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_C_COMPLETION.md`

No optional route page edits were required.

## 3. Category list and hierarchy

The section includes exactly seven approved category cards:

1. Dental
2. Beauty & Aesthetics
3. Special Offers
4. Doctors
5. Labs
6. Pet Clinic
7. Hospitals

No extra Pharmacies, Services, Articles, Wellness, Centers, or additional category cards were added.

## 4. Large cards

Large / bold cards:

- Dental
- Beauty & Aesthetics
- Special Offers

These cards use the top bento hierarchy on desktop and remain first in mobile order.

## 5. Medium cards

Medium supporting cards:

- Doctors
- Labs
- Pet Clinic
- Hospitals

These cards are compact on desktop, become two-column on tablet, and single-column on mobile.

## 6. Motion scene strategy

All category visuals are CSS/SVG/HTML-only micro-scenes:

- Dental: glass tooth contour with subtle sparkle and float.
- Beauty & Aesthetics: face contour and serum droplet with soft shimmer.
- Special Offers: premium tag/seal with muted gold highlight and shine.
- Doctors: stethoscope/pulse cue with subtle stroke motion.
- Labs: vial/fluid/molecule cue with very soft movement.
- Pet Clinic: paw with medical cross and calm pulse cue.
- Hospitals: hospital building with cross and authority beacon cue.

No photos, stock images, external icons, icon libraries, canvas, Lottie, video, or animation dependencies were used.

## 7. Route/link safety

Only existing approved route helpers and slugs were used:

- Doctors links to the existing `doctors` discovery route.
- Labs links to the existing `labs` discovery route.

Cards without a safe approved category route render as non-link preview-safe articles. No routes were created and no dead links were added.

## 8. Arabic/RTL status

Arabic copy is included for the section heading, subtitle, card titles, card descriptions, and CTA pill. The component accepts `dir` and renders with natural RTL direction. Arabic typography uses the existing DrMuscat typography behavior and avoids negative letter-spacing.

## 9. Responsive behavior

- Desktop: 12-column premium bento layout with three large cards and four medium supporting cards.
- Tablet: 6-column layout; large cards remain prominent and supporting cards can sit two-column.
- Mobile: single-column order is Dental, Beauty & Aesthetics, Special Offers, Doctors, Labs, Pet Clinic, Hospitals.
- No horizontal overflow is intentionally introduced.

## 10. Accessibility notes

- Semantic `<section>` with an accessible heading.
- Decorative SVG scenes are `aria-hidden` and not focusable.
- Valid route cards are links.
- Non-route cards are semantic articles, not div-buttons.
- Focus-visible state is provided for linked cards.
- Text contrast uses established DrMuscat 2026 tokens and glass-card language.
- Motion respects `prefers-reduced-motion`.

## 11. Performance notes

- Static component only.
- No fetch calls.
- No Supabase calls.
- No API calls.
- No image assets.
- No video.
- No external requests.
- No new dependency or package changes.
- Motion is CSS-only and limited to subtle transform, opacity, and stroke-dashoffset effects.

## 12. SEO/route safety status

No SEO infrastructure was changed. No sitemap, robots, llms.txt, route-check scripts, route architecture, or i18n route files were edited. No new public route patterns were introduced.

## 13. Database/Supabase/RLS untouched confirmation

No database files, migrations, Supabase files, RLS policies, generated DB types, seed files, API routes, or backend code were edited.

## 14. Validation results

Required validation commands for this phase:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Results after command execution:

- `git status --short`: completed before validation and after implementation review.
- `pnpm lint`: passed with existing repository warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.

## 15. Manual QA checklist

Manual QA targets:

- `/en/om` desktop
- `/ar/om` desktop
- `/en/om` laptop
- `/ar/om` laptop
- `/en/om` tablet
- `/ar/om` tablet
- `/en/om` mobile
- `/ar/om` mobile

Checklist status:

Visual browser screenshots could not be captured in this container because no Playwright/Chromium executable is available. Static HTML smoke checks confirmed `/en/om` and `/ar/om` render the new section copy. Full human visual QA should be completed in browser before merge.

Checklist:

- Smart Search still works.
- Featured Provider Board still works.
- Header language switch still works.
- Mobile hamburger still works.
- Category section appears below Featured Board.
- Dental, Beauty, Special Offers are visually larger/bolder.
- Doctors, Labs, Pet Clinic, Hospitals are medium cards.
- Special Offers says “Special Offers”, not just “Offers”.
- Motion is subtle and premium.
- Reduced motion is respected.
- No fake counts/ratings/availability.
- No new routes.
- No DB/API/Supabase/migration changes.
- No SEO infra changes.
- No package/lockfile changes.
- No horizontal overflow.
- Arabic typography is clean.
- Mobile layout is clean.

## 16. Next PR recommendation

UI-K-HOME-2026-D — Provider CTA / List Your Center Section

## 17. UI polish follow-up

A focused polish pass upgraded the existing discovery category section without changing routes, data, backend, SEO infrastructure, fonts, category hierarchy, or surrounding homepage sections.

- Hero cards now have stronger glass depth, larger visual stages, elevated CTA pills, and more premium idle/hover motion.
- Dental now uses a refined glass tooth scene with enamel sweep, chrome arcs, internal glow, and tiny glints.
- Beauty & Aesthetics now uses elegant facial contour linework, serum-drop motion, shimmer, and soft glow.
- Special Offers now uses a champagne-gold jewel/diamond scene with facets, shine, sparkle, and premium glow.
- Secondary cards received cleaner glass stages, stronger icon treatment, and calmer premium motion while remaining visually subordinate to the hero row.
- Reduced-motion handling remains enabled for the added motion classes.

## 18. High-fidelity graphic scene pass

A second focused visual pass moved the section further away from simple icon cards and toward layered premium motion panels. The card content, routes, fonts, brand palette, backend, SEO, and i18n logic were not changed.

- Added reusable cinematic scene layers around every category SVG: ambient light field, dimensional halo, reflective ribbon, contact shadow, and foreground object stage.
- Hero cards now read more like 2.5D graphic panels with deeper material layering, controlled parallax, natural light travel, and stronger premium presence.
- Dental, Beauty & Aesthetics, and Special Offers retain their distinct SVG objects while gaining more immersive lighting, reflection, and depth composition.
- Secondary cards keep a calmer visual hierarchy but no longer read as plain icon boxes because they share the same premium glass stage system.
- Reduced-motion coverage was extended to the new scene layers.

## 19. Sculpted reference-inspired card pass

A third focused visual pass adapted the newly shared reference direction into the DrMuscat system without copying it literally.

- Added explicit `hero` and `secondary` card variant classes for clearer hierarchy and maintainable styling.
- Shifted cards toward calmer sculpted editorial tiles with softer relief surfaces, disciplined borders, stronger whitespace, and embossed scene panels.
- Strengthened SVG object material quality using subtle relief shadows, inner highlights, and restrained brand-compatible teal/champagne accents.
- Added a minimal premium Special Offers cue while preserving the exact “Special Offers” wording and avoiding discount-style visuals.
- Refined CTA pills to feel more crisp, glassy, and modern while preserving accessibility and reduced-motion behavior.
