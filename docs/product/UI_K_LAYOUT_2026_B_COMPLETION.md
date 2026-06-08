# UI-K-LAYOUT-2026-B Completion — Premium Header/Footer Visual Polish

## 1. Precheck result

Precheck passed on the current `work` branch.

- Current branch was `work`.
- No local `main` branch was available.
- No Git remote was configured.
- `src/components/layout/layout-i18n-copy.ts` was present.
- `docs/product/UI_K_LAYOUT_2026_A_COMPLETION.md` was present.
- Header/footer visible labels were verified to use `usePathname` with `resolveLayoutPathnameI18n` from `layout-i18n-copy`.
- No request-header visible-label dependency was found in `src/components/layout/site-header.tsx` or `src/components/layout/site-footer.tsx` for `x-drmuscat-locale`, `x-next-url`, `referer`, or `headers(`.

Conclusion: the workspace contains the merged PR #163 header/footer i18n baseline, so this visual polish proceeded from the verified current `work` branch.

## 2. Final scope

This PR is visual polish only for the public layout header and footer.

Implemented scope:

- Premium/glassy header surface refinement.
- Slightly larger and slightly bolder desktop header nav labels.
- More intentional disabled/pending header nav treatment.
- Subtle desktop ECG/heartbeat-inspired micro-line in the header nav glass area.
- Premium dark teal/glass footer surface polish.
- Footer readability and structure refinements.

Out of scope and not implemented:

- No i18n logic changes.
- No pathname locale detection changes.
- No `HeaderLanguageSwitch` behavior changes.
- No route helper changes.
- No homepage section changes.
- No Offers page work.
- No route creation.
- No database, Supabase, RLS, migration, API, SEO infrastructure, package, or lockfile changes.

## 3. Files changed

- `src/components/layout/site-header.tsx`
- `src/components/layout/site-footer.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_LAYOUT_2026_B_COMPLETION.md`

`src/components/layout/layout-i18n-copy.ts` was not changed.

## 4. Header visual polish summary

- Added a decorative, non-interactive ECG accent element inside the desktop nav region.
- Refined the sticky header with a more translucent healthcare-branded glass surface.
- Added a more premium border, soft elevation, and safe backdrop blur/saturation treatment.
- Wrapped the nav row visually in its own subtle pill surface.
- Increased nav label size modestly with a responsive clamp.
- Increased nav label weight slightly while keeping the tone minimal and compact.
- Preserved the one-row desktop header structure.
- Preserved the existing mobile menu structure and behavior.

## 5. Footer visual polish summary

- Added a scoped `dm2026-site-footer` class to target the premium footer polish safely.
- Replaced the plain white footer feel with a soft dark teal/deep-green/blue-teal gradient.
- Added restrained radial highlights using teal and champagne tones.
- Added compact glass cards around brand, link, and utility groups for clearer structure.
- Preserved readable contrast for headings, links, trust text, and disabled labels.
- Preserved compact responsive layout and existing bilingual footer copy.

## 6. Heartbeat micro-line decision

The heartbeat/ECG detail is animated, but extremely subtly:

- It is a tiny, thin, low-opacity CSS-shaped accent in the desktop nav glass area.
- It uses a slow CSS opacity/position drift only.
- It is hidden at narrower layout widths to avoid mobile clutter.
- It is non-interactive and marked `aria-hidden="true"`.
- It does not create a route, link, button, or layout dependency.

Reduced-motion behavior:

- `prefers-reduced-motion: reduce` disables the animation and leaves a static low-opacity accent.

## 7. i18n confirmation

No i18n logic was changed.

- `layout-i18n-copy.ts` was not edited.
- `HeaderLanguageSwitch` was not edited.
- Pathname locale resolution was not changed.
- Header and footer still resolve visible labels from the PR #163 pathname/client-locale baseline.

## 8. Special Offers confirmation

Special Offers was not implemented as a route and was not linked.

- The header still renders `Special Offers` / `العروض الخاصة` as a pending, preview-safe, non-link item.
- The footer still renders offers copy as disabled/pending copy where already intended.
- `/offers` was not created.
- No offers homepage component was edited.

## 9. Arabic / RTL notes

- Arabic layout direction is still supplied by the existing pathname i18n resolver.
- Arabic nav labels remain Arabic on `/ar/om`.
- Arabic footer labels remain Arabic on `/ar/om`.
- Arabic nav typography avoids negative letter spacing.
- The ECG line mirrors to the inline end for RTL and is hidden on smaller widths.
- Footer glass cards keep RTL text readable and structured.

## 10. Accessibility notes

- Existing semantic `header`, `nav`, and `footer` elements were preserved.
- Existing mobile popover menu button and menu structure were preserved.
- Existing language switch behavior was preserved.
- The ECG accent is decorative and `aria-hidden`.
- Focus-visible states were refined with a visible champagne outline.
- Disabled/pending items remain marked with `aria-disabled="true"`.
- Reduced motion is respected for the ECG animation.

## 11. Route/link safety notes

- No new route files were created.
- No `/offers` link was added.
- No route helper was changed.
- No sitemap, robots, or `llms.txt` files were changed.
- No backend/API/database/Supabase/RLS files were changed.
- No package or lockfile files were changed.

## 12. Validation results

Required validation commands:

- `git status --short` — passed; showed only the approved visual/doc files changed before validation.
- `pnpm lint` — passed with existing warnings only.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.

Additional smoke checks:

- `curl -fsS http://localhost:3000/en/om` — passed.
- `curl -fsS http://localhost:3000/ar/om` — passed.
- Rendered HTML token checks confirmed English header/footer labels on `/en/om` and Arabic header/footer labels on `/ar/om`.
- Changed-file safety search found no `/offers`, Supabase, RLS, route header, or request-header label dependencies in the changed source/CSS files.

## 13. Manual QA notes

Environment limitation:

- No Chromium/Chrome binary was available in this environment, so screenshots could not be captured without adding/downloading tooling.

Manual/code QA completed:

- `/en/om` desktop: rendered HTML contains English header/footer labels and Special Offers as pending copy.
- `/ar/om` desktop: rendered HTML contains Arabic header/footer labels and `العروض الخاصة` as pending copy.
- `/en/om` mobile: mobile header/menu markup remains unchanged except inherited visual CSS; ECG accent is hidden on smaller widths.
- `/ar/om` mobile: Arabic direction and labels remain controlled by existing pathname i18n logic; ECG accent is hidden on smaller widths.
- Language switch markup and links remain present in rendered English and Arabic pages.
- No homepage section source files were changed.
- No Special Offers showcase file was changed.
- No database/API/Supabase/SEO/package files were changed.

## 14. Merge-readiness recommendation

Merge-ready after human visual review.

Recommended next PR:

- `UI-K-HOME-2026-G — Homepage FAQ + Trust/Safety Foundation`
