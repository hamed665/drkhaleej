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

## 24. FIX02 summary

PR #162-FIX02 fixes the mobile card rendering blocker and applies final Special Offers-only polish. The carousel remains provider-led, preview-safe, route-free, backend-free, and dependency-free.

FIX02 changes:

- restored reliable mobile card rendering by forcing the active mobile card into a normal visible flex/block flow;
- made the mobile stage and shell overflow-visible where card content needs normal page scroll;
- disabled the full-card preview overlay on the active/mobile card so it cannot interfere with mobile stacking or content visibility;
- removed the duplicate in-body media badge so cards now keep one category badge, one Special Offer badge, and one media badge;
- strengthened the desktop headline locally without changing font family or global typography;
- improved active/side-card hierarchy while keeping side cards readable;
- added final mobile CTA, Arabic wrapping, media slot, and safe-area polish.

## 25. FIX02 mobile card rendering bug root cause

The mobile bug came from the showcase inheriting too much desktop carousel structure on small screens: grid-row sizing, transformed carousel cards, `overflow: hidden` shells/cards, and the full-card absolute preview overlay created a fragile stacking/clipping context. In that state the colored card/media surface could remain visible while the body content appeared clipped or not reliably visible in mobile layouts.

FIX02 addresses the root cause by switching the active mobile card to a normal visible column flow, making the mobile shell/stage/card overflow visible, explicitly restoring body visibility, and disabling the full-card preview overlay on mobile/active cards.

## 26. FIX02 mobile visibility fix

Mobile now guarantees the active card can show:

- media slot;
- category badge;
- Special Offer preview badge;
- Photo-ready or Video-ready badge;
- provider name;
- provider type;
- area/city;
- offer title;
- short description;
- chips;
- View offer / عرض التفاصيل CTA;
- View profile / عرض الملف CTA;
- trust note;
- dots/progress indicator.

The card remains compact but is not clipped into a fixed carousel viewport.

## 27. FIX02 heading typography polish

The desktop section headline now has stronger local weight and balanced line wrapping while keeping the existing DrMuscat font family and typography system. Arabic receives a separate local weight/line-height treatment with zero negative letter spacing.

## 28. FIX02 media slot polish

The media placeholder remains asset-free. FIX02 keeps the premium layered gradient/photo/video treatment and improves stacking so glass labels, play/photo elements, and media depth stay visible above decorative layers.

## 29. FIX02 carousel hierarchy polish

Desktop keeps the three-card stage. The active card is more clearly featured through elevation and scale, while side cards remain readable with calmer opacity and subtle hover/focus recovery.

## 30. FIX02 Arabic/RTL notes

FIX02 adds mobile wrapping protections for Arabic provider names, descriptions, labels, chips, and CTA buttons. RTL headline letter spacing remains zero, alignment stays logical-start, and CTA buttons remain visible and tappable.

## 31. FIX02 validation results

Required validation commands for FIX02:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Validation completed for FIX02:

- `git status --short` showed only the approved Special Offers component, CSS, and completion documentation changed before commit.
- `pnpm lint` passed with existing repository warnings only.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `pnpm routes:check` passed.

## 32. FIX02 merge-readiness recommendation

PR #162-FIX02 is intended to be merge-ready if visual QA confirms the active mobile card fully renders on `/en/om` and `/ar/om`, CTAs are visible/tappable, desktop headline and carousel hierarchy feel premium, media placeholders feel photo/video-ready, Arabic is unclipped, and validation passes.

## 33. FIX04 media slot aspect ratio polish

PR #162-FIX04 is a micro UI polish pass for the Special Offers Showcase media slot only. It keeps the existing carousel, copy, typography, colors, controls, dots, routes, and backend-free preview behavior unchanged.

FIX04 adjusts the mobile media slot toward a more useful future photo/video poster shape by increasing the mobile media area height slightly and applying a local `4 / 3` aspect-ratio intent with a capped block size. This improves photo/video readiness without making the full mobile card excessively tall.

## 34. FIX04 mobile photo/video readiness note

The media slot remains placeholder-only: no real images, generated images, external assets, video files, or autoplay were added. Provider details, chips, CTAs, trust note, Arabic/RTL wrapping, and normal page scroll remain preserved below the media area.

## 35. FIX04 unchanged-scope confirmation

FIX04 did not change:

- carousel behavior or auto-rotation;
- previous/next controls;
- dots/progress indicators;
- English or Arabic copy;
- typography family or global typography;
- color palette;
- routes;
- backend/API/database/Supabase/SEO/package files;
- unrelated homepage sections.

## 36. FIX04 validation results

Required validation commands for FIX04:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Validation completed for FIX04:

- `git status --short` showed only the approved Special Offers CSS and completion documentation changed before commit.
- `pnpm lint` passed with existing repository warnings only.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `pnpm routes:check` passed.

## 37. FIX04 merge-readiness recommendation

PR #162-FIX04 is intended to be merge-ready if visual QA confirms the mobile media slot feels better prepared for future photo/video posters while the full mobile card remains readable, compact, and stable in English and Arabic.

## 38. FIX05 desktop-only media slot polish

PR #162-FIX05 is a desktop-only micro polish pass for the Special Offers Showcase card media slot. It uses a `min-width: 68.01rem` media query so the accepted mobile layout, mobile media slot, mobile card height, mobile CTA spacing, and mobile carousel behavior remain unchanged.

FIX05 increases the desktop media/photo/video slot slightly by adjusting only the desktop card row allocation and media minimum height. It uses the existing lower-card breathing room by keeping the body row content-sized and reducing bottom-only padding, so future photo and video poster uploads have a more useful presentation area without shrinking text.

## 39. FIX05 text and readability confirmation

FIX05 does not shrink or compress text. It does not reduce provider detail text, offer title text, chips, CTA labels, or trust-note readability. It only adjusts desktop media row sizing and bottom breathing room so content continues to sit naturally below the larger media slot.

## 40. FIX05 desktop photo/video readiness note

The media slot remains placeholder-only. No real images, generated images, external assets, video files, autoplay, copy changes, carousel behavior changes, color changes, or route/backend changes were introduced.

## 41. FIX05 validation results

Required validation commands for FIX05:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Validation completed for FIX05:

- `git status --short` showed only the approved Special Offers CSS and completion documentation changed before commit.
- `pnpm lint` passed with existing repository warnings only.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `pnpm routes:check` passed.

## 42. FIX05 merge-readiness recommendation

PR #162-FIX05 is intended to be merge-ready if visual QA confirms desktop media/photo/video slots feel slightly taller and better prepared for future posters while desktop card height and carousel stability remain visually consistent, and mobile remains unchanged.
