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


## 17. Minimal embossed visual refinement

This refinement replaces the previous layered/animated graphic-card direction with the requested premium minimal embossed reference style while preserving the approved card grid, card structure, titles, descriptions, route-safe actions, and Explore pills.

### What changed

- Removed the rendered internal decorative scene stack from the cards and replaced it with one restrained embossed visual plate per card.
- Replaced the previous hero illustrations with minimal relief symbols: tooth, face/beauty contour, champagne diamond, medical care, lab vessel, veterinary paw/cross, and hospital facility.
- Rebuilt the discovery CSS block so the active card internals now use soft off-white/pearl/very-light-teal surfaces, subtle inner shadows, gentle outer shadows, and restrained DrMuscat teal accents.
- Kept Special Offers in the same minimal embossed style with only a subtle warm champagne accent.
- Reduced motion to minimal premium hover elevation and a tiny light sweep; no bouncing, rotating, playful, or cartoon motion remains in the active card internals.

### Scope confirmations

- The existing seven category cards remain in the same hierarchy.
- Card titles, descriptions, and Explore action text remain unchanged.
- The approved project font family was not changed or overridden.
- No header, Smart Search, Featured Provider Board, route, SEO infrastructure, i18n logic, backend, API, database, Supabase, RLS, migration, package, or lockfile files were changed.

### Validation results

Validation commands for this refinement:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

Results after command execution:

- `git status --short`: completed and showed only the three allowed visual-refinement files modified before commit.
- `pnpm lint`: passed with existing repository warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- Additional guardrail checks: `pnpm routes:check` and `git diff --check` also passed.

### Merge-readiness recommendation

Merge-readiness is recommended after automated validation passes and human desktop/mobile QA confirms `/en/om` and `/ar/om` show premium minimal embossed category cards matching the reference direction without changing the homepage architecture.

## 18. Raised icon relief refinement

This refinement keeps the card grid, titles, descriptions, Explore actions, routes, fonts, and homepage architecture unchanged while improving the icon artwork itself.

### Per-card refinements

- Dental was redrawn as a cleaner, stronger tooth silhouette with a dedicated relief shadow, raised fill, top highlight, and minimal enamel contour lines.
- Beauty & Aesthetics was redrawn into a clearer face/aesthetic silhouette with a face contour, facial highlight lines, and a restrained droplet accent so it reads as beauty rather than a messy abstract mark.
- Doctors was replaced with a clearer professional stethoscope and waveform composition, removing the previous ambiguous shape.
- Special Offers keeps the premium diamond direction and now has a stronger relief shadow, raised diamond fill, facet lines, and highlight line.
- Labs keeps the lab vessel direction and now has a stronger relief shadow, cleaner vessel placement, liquid fill, and highlight detail.
- Pet Clinic keeps the paw/care direction and now has a stronger raised paw pad, clearer toe shapes, cross cue, and highlight detail.
- Hospitals keeps the facility direction and now has a stronger structural relief shadow, cleaner building/cross geometry, and highlight strokes.

### Scope confirmations

- Layout, card structure, text content, Explore buttons, route-safe behavior, and approved font system were preserved.
- No backend, database, routing, SEO, Supabase, RLS, migration, package, Header, Smart Search, or Featured Board files were changed.

### Validation results

Validation commands for this refinement:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

Results after command execution:

- `git status --short`: completed and showed only the three allowed UI-refinement files modified before commit.
- `pnpm lint`: passed with existing repository warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- Additional guardrail checks: `pnpm routes:check`, `git diff --check`, and localized HTML smoke checks also passed.

## 19. Final embossed icon-surface redesign

This pass replaces the previous weak icon direction rather than slightly tweaking it. The existing card grid, card sizes, titles, descriptions, Explore actions, route-safe behavior, homepage section architecture, and approved typography remain unchanged.

### Card-by-card changes

- Dental was fully redesigned into a more elegant sculpted tooth form with a stronger premium silhouette, recessed contour grooves, and icon-level relief shadow.
- Beauty & Aesthetics was fully redesigned into a clearer face-based aesthetic mark with a calm facial silhouette, refined contour grooves, and a restrained droplet form.
- Doctors was replaced with a stronger doctor-care emblem using a shield-like medical form, raised cross, and pulse mark so it no longer resembles an unclear body/organ shape.
- Special Offers keeps the diamond/luxury direction but now uses the final emboss classes for a cleaner raised gemstone surface without glitter or cheap shine.
- Labs keeps the lab identity while refining the vessel, liquid surface, molecule mark, and raised icon relief.
- Pet Clinic keeps the pet-health identity while refining the paw/cross geometry and icon-level raised surface.
- Hospitals keeps the hospital direction while refining the facility geometry and embossed authority mark.

### White shine/streak removal

- The previous visual-plate diagonal shine pseudo-element is disabled.
- No diagonal white stripe, gloss streak, or fake plastic shine line remains in the active icon surface treatment.
- Highlights now come from sculpted shadows and controlled embossed strokes rather than a sweeping white line.

### Scope confirmations

- Layout, card content, buttons, routes, fonts, backend, database, SEO, Supabase, RLS, migrations, packages, Header, Smart Search, and Featured Board were not changed.

### Validation results

Validation commands for this refinement:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

Results after command execution:

- `git status --short`: completed and showed only the three allowed icon-surface refinement files modified before commit.
- `pnpm lint`: passed with existing repository warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- Additional guardrail checks: `pnpm routes:check`, `git diff --check`, and localized HTML smoke checks also passed.

## 20. PR #159-FIX03 strengthened embossed symbols

FIX03 keeps the existing grid, card sizes, titles, descriptions, Explore actions, routes, fonts, and homepage section structure unchanged. The work is limited to the internal category symbol artwork and embossed surface treatment.

### Icon visibility and relief improvements

- Replaced the previous pale symbol classes with stronger `dm2026-symbol-*` emboss primitives for cast shadows, raised masses, ridges, carved detail, marks, and dots.
- Increased icon-level contrast using controlled DrMuscat teal/green strokes, stronger low/right cast shadows, and soft top/left highlights through shadow layering rather than a gloss streak.
- Enlarged the SVG symbol presence inside the existing plate so the symbols read clearly on desktop and mobile while staying minimal and premium.
- Kept Special Offers on a restrained champagne/gold variant without loud color or glitter.

### Dental / Beauty / Doctors corrections

- Dental was corrected into a cleaner sculpted tooth emblem with stronger proportions, raised mass, enamel-like carved grooves, and clearer premium dental identity.
- Beauty & Aesthetics was corrected into a clearer face/aesthetic mark with a stronger facial silhouette, refined contour, and restrained droplet accent.
- Doctors was corrected into a recognizable professional stethoscope plus pulse/care mark so it no longer reads as a vague organ/body shape.

### Scope confirmations

- No font, layout, text, button, header, Smart Search, Featured Board, route, SEO, backend, database, Supabase, RLS, migration, package, or lockfile changes were made.
- The diagonal white shine/streak remains removed; the icon plate pseudo-element is disabled in the active FIX03 CSS.

### Validation results

Validation commands for FIX03:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Results after command execution:

- `git status --short`: completed and showed only the three allowed FIX03 files modified before commit.
- `pnpm lint`: passed with existing repository warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.
- Additional checks: `git diff --check` and localized HTML smoke checks also passed.

### Merge-readiness recommendation

Merge-readiness is recommended after automated validation passes and human QA confirms `/en/om` and `/ar/om` desktop/mobile views show stronger premium embossed symbols without diagonal shine streaks or layout/text/button/font regressions.

## 21. PR #159-FIX04 font consistency lock and Beauty icon replacement

FIX04 keeps the existing card grid, card sizes, titles, descriptions, Explore actions, routes, homepage section structure, and all non-Beauty card artwork stable. The work is limited to section typography consistency and the Beauty & Aesthetics icon.

### Font consistency lock

- The discovery section now explicitly inherits the approved site typography behavior instead of introducing a local font stack.
- Headings, descriptions, card titles, and Explore pills were normalized to existing DrMuscat typography weight/letter-spacing tokens where applicable.
- Arabic/RTL letter spacing remains tied to the approved Arabic letter-spacing token.
- No new font family, remote font, fallback stack, or typography system was introduced.

### Beauty & Aesthetics icon replacement

- The previous face-plus-droplet composition was fully removed.
- Beauty & Aesthetics now uses a new sculpted side-profile/aesthetic contour symbol with a raised mass, profile line, refined face details, and a restrained brow/beauty mark.
- The new icon preserves the same premium embossed visual language as the other cards while improving clarity and elegance on desktop and mobile.

### Preserved cards and scope

- Dental, Special Offers, Doctors, Labs, Pet Clinic, and Hospitals were preserved.
- No layout, text, button, route, header, Smart Search, Featured Board, SEO, backend, database, Supabase, migration, package, or lockfile changes were made.

### Validation results

Validation commands for FIX04:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Results after command execution:

- `git status --short`: completed and showed only the three allowed FIX04 files modified before commit.
- `pnpm lint`: passed with existing repository warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.
- Additional checks: `git diff --check` and localized HTML smoke checks also passed.

### Merge-readiness recommendation

Merge-readiness is recommended after automated validation passes and human QA confirms `/en/om` and `/ar/om` desktop/mobile views show typography consistent with the rest of DrMuscat and the fully replaced Beauty icon reads as premium, elegant, and embossed.

## 22. PR #159-FIX04 final embossed card polish

This final polish keeps the existing layout, grid, titles, descriptions, Explore actions, routes, fonts, and homepage architecture unchanged. The scope is limited to internal icon clarity, card rhythm, CTA surface polish, and documentation.

### Final embossed icon polish

- Beauty & Aesthetics was refined again with a clearer premium side-profile contour, stronger profile stroke, cleaner face detail lines, and a restrained brow/beauty mark.
- Doctors was polished with a clearer stethoscope form, larger chest piece, stronger pulse/care mark, and more professional medical-care identity.
- Dental was lightly polished with a clearer tooth mass, stronger enamel grooves, and a slightly stronger raised contour while staying minimal.
- Special Offers, Labs, Pet Clinic, and Hospitals were preserved, with only shared embossed weight refinements from the final symbol CSS.

### Secondary rhythm and CTA polish

- Secondary card rhythm was improved through consistent grid row rhythm and visual-area alignment for Doctors, Labs, Pet Clinic, and Hospitals.
- Explore pills retain the same text and behavior but now have a slightly cleaner glass surface, subtle border, and softer premium shadow.
- Section spacing was adjusted minimally to keep the heading-to-card rhythm consistent with the surrounding homepage.

### Scope confirmations

- No font family, layout structure, grid structure, card content, route, header, Smart Search, Featured Board, SEO, backend, database, Supabase, migration, package, or lockfile changes were made.
- No diagonal white shine/streak was reintroduced.

### Validation results

Validation commands for this final polish:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Results after command execution:

- `git status --short`: completed and showed only the three allowed final-polish files modified before commit.
- `pnpm lint`: passed with existing repository warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.
- Additional checks: `git diff --check` and localized HTML smoke checks also passed.

### Merge-readiness recommendation

Merge-readiness is recommended after automated validation passes and human QA confirms `/en/om` and `/ar/om` desktop/mobile views show the final embossed symbols, aligned secondary card rhythm, premium Explore pills, and no header/search/featured-board regressions.

## 23. PR #159-FIX05 Dental and Beauty rejected-icon replacement

FIX05 replaces only the rejected internal icon artwork for the Dental and Beauty & Aesthetics cards. The card grid, section heading, other category cards, card titles, descriptions, Explore actions, routes, responsive structure, and font family remain unchanged.

### Dental icon replacement

- Dental now uses a simpler premium tooth emblem with a smooth outer contour, balanced crown, and restrained root structure.
- Internal tooth detail was reduced to one subtle enamel contour and one minimal vertical contour so the symbol stays clean, readable, and not cluttered.
- The tooth itself keeps the established embossed effect through restrained teal stroke, pearl fill, and soft directional shadow/highlight treatment.
- No sparkle, diagonal shine streak, cartoon treatment, bulky outline, or extra decorative illustration layer was added.

### Beauty & Aesthetics icon replacement

- Beauty & Aesthetics now uses a completely replaced premium oval face/mirror-style medallion with one clear side-profile contour.
- The previous rejected shape direction was not continued; the new symbol avoids droplet-heavy, leaf-like, messy, or disconnected facial artwork.
- The icon uses minimal brow/lip contour cues for Beauty & Aesthetics readability while preserving the same calm DrMuscat teal, sage, and pearl embossed language.

### Preserved scope

- Special Offers, Doctors, Labs, Pet Clinic, and Hospitals were not redesigned or rebuilt.
- No font family, card layout, grid structure, spacing system, button system, header, Smart Search, Featured Board, routes, SEO, backend, database, Supabase, migration, dependency, package, or lockfile changes were made.

### Validation results

Validation commands for this FIX05 replacement pass:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`

Results after command execution:

- `git status --short`: completed and showed only the allowed FIX05 files modified before commit.
- `pnpm lint`: passed with existing repository warnings only.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- `pnpm routes:check`: passed.

### Merge-readiness recommendation

Merge-readiness is recommended once validation passes and human QA confirms `/en/om` and `/ar/om` desktop/mobile views show only Dental and Beauty internally replaced, no other category card rebuilt, no diagonal white shine/streak, and no typography/layout regressions.
