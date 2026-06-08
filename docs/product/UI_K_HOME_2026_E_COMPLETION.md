# UI-K-HOME-2026-E Completion — Premium Special Offers Showcase Carousel

## 1. Final scope

PR #162 adds a UI-only homepage Special Offers Showcase section for the DrMuscat 2026 homepage. The section is mounted after Discovery Categories and before the existing Provider CTA.

Scope is limited to:

- a new provider-led special offer showcase component;
- local static preview offer data only;
- lightweight client-side carousel state and timing;
- DrMuscat 2026 visual-system CSS for the section;
- homepage mounting only;
- this completion document.

No backend, database, route, Supabase, admin, API, form, payment, or real media work was added.

## 2. Files changed

- `src/components/home/HomeSpecialOffersShowcase2026.tsx`
- `src/components/home/HomePage2026HeaderHero.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_E_COMPLETION.md`

## 3. Provider-led Special Offers strategy

The showcase uses provider-led preview cards rather than category-only tiles. Each card represents a safe mock offer from a preview provider or center, with provider name, provider type, area, city, offer title, category chips, media readiness, and confirmation microcopy.

The local preview dataset includes eight scalable offer items covering:

- Dental
- Beauty
- Labs
- Pet Clinic
- Medical Center / Center
- Doctors / Specialist
- Wellness / Nutrition
- Family care package

All provider names are preview-safe mock names and do not represent real approved providers.

## 4. Carousel/rotation behavior

The carousel uses lightweight React state. Desktop shows a three-card stage: previous, active, and next. The active center card is more elevated and visually stronger, while side cards remain visible and selectable.

Behavior:

- auto-rotates every 4.5 seconds;
- loops continuously through all eight preview offers;
- includes previous and next button controls;
- includes dot/progress controls for every offer;
- pauses while the section is hovered or focused;
- clears the interval on effect cleanup.

Mobile and tablet collapse to one active card per slide with the same controls and dots.

## 5. Image/video-ready media slot strategy

No real media, remote images, generated assets, or video files were added. Each preview item includes:

- `mediaType: image | video`;
- localized media label;
- accent category;
- media readiness indicator.

Video-ready cards show a refined glass play button and “Video-ready preview” language. Image-ready cards show a premium framed photo slot and “Photo-ready preview” language. No video playback or autoplay is implemented.

## 6. Future offers page readiness

The data shape and UI are ready for a future `/offers` planning phase, paid homepage placements, category offer placements, area offer placements, provider campaigns, and provider/admin uploaded offer media.

This PR intentionally does not create `/offers`, offer detail routes, backend offer records, admin upload flows, provider panel features, or SEO pages.

## 7. CTA behavior

The card CTAs are preview-safe `<button>` elements. They are styled as interactive UI controls but do not link to nonexistent offer routes and do not trigger backend behavior.

English labels:

- View offer
- View profile

Arabic labels:

- عرض التفاصيل
- عرض الملف

## 8. Content safety notes

The section avoids fake commercial or medical claims. It does not include:

- fake prices;
- fake discounts;
- fake percentages;
- fake urgency;
- fake availability;
- fake booking;
- fake ratings;
- fake review counts;
- best/top claims;
- guaranteed results;
- medical outcome claims.

Safe wording is limited to preview and review language such as provider-approved offer, public discovery only, photo-ready preview, video-ready preview, and confirm details with provider.

## 9. Arabic/RTL notes

The section includes localized Arabic copy for the section header, controls, CTAs, offer content, chips, media labels, and trust notes. RTL-specific CSS removes negative Latin-style letter spacing from Arabic headlines and card titles, keeps text aligned to logical start, and avoids clipped Arabic by using flexible wrapping and responsive sizing.

## 10. Responsive notes

Desktop uses a premium three-card carousel stage with a stronger center card. Tablet and mobile show one main active card. Mobile media remains prominent while content, chips, CTA buttons, dots, and trust notes remain visible without horizontal overflow.

## 11. Performance notes

The implementation uses no animation library, no new dependency, no real media assets, no video playback, and no remote requests. Motion is limited to CSS transforms/transitions and a single interval when reduced motion is not requested.

## 12. No backend/database/SEO changes confirmation

Confirmed not changed or added:

- database migrations;
- Supabase files;
- API routes;
- admin routes;
- backend logic;
- package files;
- sitemap files;
- robots files;
- `llms.txt`;
- generated database types;
- seed files;
- public route creation.

## 13. Validation results

Required validation commands for this phase:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Validation completed successfully after implementation:

- `git status --short` showed only the approved UI/documentation files changed before commit.
- `pnpm lint` passed with existing repository warnings only.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `pnpm routes:check` passed.

## 14. Manual QA notes

Manual QA checklist for reviewers:

- `/en/om` desktop: Special Offers appears after Discovery Categories and before Provider CTA.
- `/ar/om` desktop: Arabic layout is RTL-safe and readable.
- `/en/om` mobile: one strong active card appears without horizontal overflow.
- `/ar/om` mobile: Arabic card content, controls, and dots remain usable.
- Local HTML smoke check confirmed the English and Arabic section headings render on `/en/om` and `/ar/om`.
- Desktop: three-card carousel/stage is visible.
- Auto-rotation advances every 4–5 seconds.
- Reduced motion disables auto-rotation.
- Image/video-ready placeholders appear without real media.
- CTAs do not link to missing `/offers` route.
- No prices, discounts, ratings, fake availability, or medical outcome claims appear.
- Existing Search, Featured Provider Board, Discovery Categories, and Provider CTA remain in order.

## 15. Next PR recommendation

UI-K-HOME-2026-F — Offers Page Planning or Footer/Trust Polish

## 16. FIX01 polish summary

PR #162-FIX01 keeps the existing provider-led carousel implementation and applies targeted polish only to the Special Offers Showcase.

FIX01 changes:

- improved mobile top rhythm with local section `scroll-margin-block-start` and tighter-but-safe mobile top padding so the badge/headline remains readable under the sticky mobile header;
- reduced mobile card height by tightening media height, body gaps, chip spacing, CTA sizing, and card max width;
- upgraded image/video-ready placeholders with richer layered gradients, category accent depth, glass highlights, refined play/photo treatments, and softer premium shadows;
- enhanced controlled emotional color by refining dental, beauty, labs, pet, center, doctor, and wellness accent tokens without introducing loud discount styling;
- strengthened desktop hierarchy with clearer active-card scale/elevation and calmer side cards that remain visible and readable;
- refined arrows/dots so carousel controls feel integrated and do not dominate the section;
- preserved preview-safe non-navigating CTAs, no fake prices/discounts/ratings/availability, and no route/backend behavior.

## 17. FIX01 mobile spacing and card-height polish

Mobile spacing now gives the section enough local top breathing room for sticky-header contexts without adding a large blank gap. The mobile card is shorter and cleaner: the media area remains prominent, while provider name, offer title, chips, CTAs, and trust note sit closer together with compact but tappable controls.

## 18. FIX01 media slot visual polish

The media slot remains asset-free and future-ready. FIX01 adds layered ivory/teal/champagne gradients, subtle category accent orbs, glass panels, refined label pills, a more premium video play button, and a more polished photo-frame shape. No real images, generated images, remote assets, video files, or autoplay were added.

## 19. FIX01 controlled color enhancement

The section now uses slightly warmer and more emotional accent tuning while staying premium:

- dental: soft aqua/teal;
- beauty: restrained rose/champagne;
- labs: clean clinical blue/cyan;
- pet: soft green/mint;
- centers: teal/ivory/champagne;
- doctors: blue-teal trust tone;
- wellness: sage/warm neutral.

## 20. FIX01 desktop active-card hierarchy

Desktop keeps the three-card carousel but gives the active card clearer elevation, scale, and saturation. Side cards are calmer through subtle opacity, scale, and shadow reduction while remaining visible and readable.

## 21. FIX01 Arabic/RTL notes

Arabic and RTL behavior remains local to the showcase. FIX01 preserves logical-start alignment, avoids negative Arabic letter spacing, keeps CTAs compact, and maintains flexible wrapping for Arabic labels/chips to avoid clipping.

## 22. FIX01 validation results

Required validation commands for FIX01:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Validation completed for FIX01:

- `git status --short` showed only the approved Special Offers CSS and completion documentation changed before commit.
- `pnpm lint` passed with existing repository warnings only.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `pnpm routes:check` passed.

## 23. FIX01 merge-readiness recommendation

PR #162-FIX01 is intended to be merge-ready if visual QA confirms the mobile heading is readable, mobile cards feel shorter and cleaner, media slots feel premium, desktop hierarchy is clear, Arabic/RTL remains unclipped, and validation passes.
