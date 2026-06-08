# UI-K-LAYOUT-2026-A Completion — Header/Footer Pathname i18n Root Fix

## Task

PR #163-FIX02 — Scope Cleanup: Keep Header/Footer i18n Only, Revert Unrelated Special Offers Changes.

## Scope Cleanup Summary

PR #163 is now scoped to header/footer i18n only. The unrelated Special Offers copy and CSS guardrail edits from the prior iteration were removed from this PR so homepage content sections remain unchanged by the final header/footer i18n fix.

## Root Cause

The public header and footer visible labels previously depended on request-derived locale state, including `x-drmuscat-locale` and other server-side request header fallbacks. Those values can be missing or unreliable for the rendered route, so `/ar/om` could still display English header or footer labels.

## Fix

Visible header and footer labels now derive from the actual client pathname via `usePathname()` and a shared local resolver:

- first pathname segment `/ar` resolves to Arabic
- all other pathnames resolve to English
- second pathname segment resolves country when it is `om`, otherwise defaults safely to `om`

No request headers, proxy headers, middleware headers, cookies, browser language, `referer`, or `x-next-url` values are used for visible header/footer labels.

## Special Offers Revert Confirmation

The following unrelated Special Offers changes were removed/reverted from this PR:

- Special Offers copy changes in `src/components/home/HomeSpecialOffersShowcase2026.tsx`
- Special Offers guardrail note rendering
- Special Offers guardrail CSS in `src/styles/dm2026-home.css`

No Smart Search, Featured Provider Board, Discovery Categories, Special Offers Showcase, Provider CTA, FAQ, Trust, or other homepage content section changes remain in the final PR scope.

## Final Files Changed

- `src/components/layout/layout-i18n-copy.ts`
- `src/components/layout/site-header.tsx`
- `src/components/layout/site-footer.tsx`
- `docs/product/UI_K_LAYOUT_2026_A_COMPLETION.md`

Cleanup touched these files only to remove the out-of-scope Special Offers edits from the PR:

- `src/components/home/HomeSpecialOffersShowcase2026.tsx`
- `src/styles/dm2026-home.css`

## Header i18n Result

- `/en/om` desktop header labels render in English.
- `/ar/om` desktop header labels render in Arabic.
- Header labels are sourced from pathname-derived locale copy.
- Header pending items remain disabled text for unfinished destinations.
- No new header routes were created.

## Mobile Menu i18n Result

- `/en/om` mobile menu labels use the same English copy as desktop.
- `/ar/om` mobile menu labels use the same Arabic copy as desktop.
- Mobile pending items remain disabled text.
- Mobile menu close behavior is preserved with the existing `data-dm2026-mobile-menu-close` contract, now wired from the client component.

## Footer i18n Result

- `/en/om` footer labels render in English.
- `/ar/om` footer labels render in Arabic.
- Footer labels are sourced from pathname-derived locale copy.
- Unfinished footer destinations such as hospitals and Special Offers remain disabled text.
- Footer behavior is bilingual without adding visual redesign or new routes.

## Language Switch Preservation

The existing `HeaderLanguageSwitch` remains unchanged and still uses `usePathname()`:

- English pages show `العربية`.
- Arabic pages show `English`.
- Header and footer both reuse this pathname-based switch behavior.

## Route and Link Safety Notes

- No new routes were created.
- No `/offers` route was created or linked.
- No pricing, onboarding, admin, backend, API, Supabase, sitemap, robots, `llms.txt`, package, lockfile, middleware, or proxy changes were made.
- Existing safe discovery links are preserved.
- Existing safe `/[locale]/[country]/for-providers` usage is preserved only for the provider/list-your-center destination.
- Unfinished destinations render as disabled text.

## Validation Results

Required validation passed for this scope cleanup and root i18n fix:

- `git status --short`
- `pnpm lint` — passed with existing warnings only
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`

Additional HTML smoke checks passed for `/en/om` and `/ar/om` after starting the local Next.js server with `pnpm exec next start -H 0.0.0.0 -p 3000`.

A forbidden-source scan also confirmed the final header/footer i18n files do not use request headers, proxy headers, middleware headers, cookies, browser language, `referer`, or `x-next-url` for visible header/footer labels.

## Manual QA Notes

Manual QA checklist status:

- `/en/om` desktop header labels are English.
- `/ar/om` desktop header labels are Arabic.
- `/en/om` mobile menu labels are English.
- `/ar/om` mobile menu labels are Arabic.
- `/en/om` footer labels are English.
- `/ar/om` footer labels are Arabic.
- Language switch labels remain `العربية` on English pages and `English` on Arabic pages.
- Mobile menu close hooks remain present on mobile menu items; no browser automation was available for a full popover interaction screenshot in this environment.
- Special Offers section copy/layout is unchanged by this final PR scope.
- No homepage content sections are changed by the final PR scope.
- No route creation occurred.
- No backend/database/API/Supabase/SEO/package changes occurred.

## Merge Readiness Recommendation

PR #163 is merge-ready after scope cleanup: it now contains the header/footer pathname i18n fix, documentation, and removal of unrelated Special Offers edits from the PR scope.

## Next PR Recommendation

UI-K-LAYOUT-2026-B — Premium header/footer visual polish after i18n is stable.
