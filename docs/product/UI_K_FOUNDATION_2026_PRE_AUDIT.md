# UI-K-FOUNDATION-2026-PRE Audit

**Task title:** PR #155-A — UI-K-FOUNDATION-2026-PRE: Legacy PR #153 Decision + Premium Foundation Audit  
**Execution mode:** `PHASED_BUILD_ONLY`  
**Mode:** Plan only / audit only / decision only  
**Four-axis mapping:**

- **Execution Phase:** Phase 0 / Phase 3 planning bridge for public UI foundation
- **Lock Scope:** Documentation and planning only
- **Product Module:** UI/UX design foundation planning / Premium Polish planning
- **Subphase ID:** `UI-K-FOUNDATION-2026-PRE`

## 0. Scope lock

This document is the only approved artifact for this phase. It does not authorize implementation.

- No production CSS was changed.
- No component was changed.
- No route was changed.
- No Supabase query, migration, RLS policy, seed data, API route, auth backend, payment backend, sitemap, robots, `llms.txt`, package file, lockfile, or route-check script was changed.
- Claude UI Kit remains the **visual source of truth only**.
- DrMuscat production repo remains the source of truth for **architecture, routes, SEO, database, Supabase/RLS, RTL, validation, and security**.

## 1. Executive decision

### Decision for PR #153

PR #153 should remain **frozen/reference only** and should not be merged as an implementation baseline for the 2026 Premium Design System Foundation.

Recommended handling:

1. Keep PR #153 frozen until this audit and the follow-up implementation contract are accepted.
2. Close PR #153 later after PR #155-B successfully establishes a clean, minimal foundation from current `main`/current baseline.
3. Reuse **ideas only**, not code, from PR #153.
4. Start the next implementation from clean current `main`/current baseline unless a human explicitly approves cherry-picking a specific file or commit.

### What may be reused from PR #153

Only high-level visual and planning ideas may be reused:

- Desire for premium healthcare polish.
- Need for reusable public UI primitives.
- Need to reduce old aqua/cyan marketplace-template dominance.
- Need for mobile-first DrMuscat layout foundations.
- Need for bilingual English/Arabic visual parity.

### What is explicitly forbidden to reuse from PR #153

The following are forbidden unless a future human-approved phase explicitly scopes them:

- Any blind copy of `public-2026` components or styles.
- Any PR #153 route changes.
- Any PR #153 homepage rebuild.
- Any PR #153 header/footer behavior or navigation changes.
- Any PR #153 data-flow changes.
- Any mock/fake ratings, reviews, comments, availability, phone numbers, WhatsApp numbers, payment states, auth states, or backend assumptions.
- Any code that bypasses current route helpers, locale/country restrictions, SEO rules, Supabase/RLS rules, validation gates, or TypeScript-first rules.

### Clean-start rule

The next implementation PR must begin from clean current `main`/current baseline. PR #153 is not a base branch, not a merge target, and not an approved code source.

## 2. PR #153 inspection

### Inspection limitation

The environment did not provide GitHub CLI, and shell access to GitHub was blocked by a `CONNECT tunnel failed, response 403` error when attempting to inspect PR #153 remotely. The local repository also has no configured `origin` remote. Therefore this phase cannot truthfully list exact PR #153 filenames from the live pull request.

This limitation does **not** permit guessing or copying. It strengthens the decision that PR #153 must remain frozen/reference only until a human or an environment with GitHub access provides exact metadata.

### Changed file categories to treat as high risk

Based on the task context and the explicit `public-2026` warning, the following PR #153 categories must be treated as high risk unless verified otherwise:

- Public UI component categories.
- CSS/global style categories.
- Homepage/public route categories.
- Header/footer/shell categories.
- Route helper or route-check categories.
- Mock data, demo data, or visual prototype data categories.

### Why PR #153 became too large or risky

PR #153 is unsafe as an implementation source because it appears to mix multiple concerns that must remain phase-gated:

- Design-system foundation and page implementation are likely coupled.
- Visual components may be entangled with routes, data assumptions, or mock content.
- Header/footer logic could be changed together with styling.
- Prototype-style content can introduce fake medical trust signals.
- Large CSS/component drops increase the chance of regressions across existing localized public pages.
- Any route or SEO drift risks duplicate/deprecated URL patterns.

### Reusable ideas only, not code

Reusable ideas:

- Premium teal/gold healthcare palette direction.
- Soft glass/liquid surfaces.
- Pill buttons, calm cards, and polished search surfaces.
- Mobile-first sticky action and sheet concepts.
- Bilingual typography as a first-class visual requirement.

Not reusable as code:

- PR #153 components.
- PR #153 CSS selectors.
- PR #153 page files.
- PR #153 route logic.
- PR #153 mock data.
- PR #153 backend/API assumptions.

### Exact PR #153 rule

No blind copy from `public-2026` components. Any future reuse request must identify the exact source file, exact destination file, exact lines, exact reason, and exact validation gate before implementation begins.

## 3. Current visual/CSS audit

### Current token namespaces

Current `src/styles/globals.css` already contains DrMuscat token namespaces:

- `--dm-teal-*`
- `--dm-gold-*`
- `--dm-ink-*`
- `--dm-line`, `--dm-line-soft`
- `--dm-bg`, `--dm-bg-soft`, `--dm-bg-warm`
- `--dm-surface`, `--dm-surface-glass`
- `--dm-text`, `--dm-text-soft`, `--dm-text-muted`
- `--dm-border`, `--dm-border-soft`
- Backward aliases such as `--dm-brand`, `--dm-brand-strong`, `--dm-brand-mint`, `--dm-brand-aqua`, and `--dm-accent-gold`
- `--dm-radius-*`
- `--dm-space-*`
- `--dm-shadow-*`
- `--dm-font-*`
- `--dm-type-*`
- `--dm-motion-*`

### Existing UI foundation

The current foundation already includes:

- Tailwind v4 import and `@theme inline` mappings.
- Global body background, text, font, and direction-aware Arabic font handling.
- Skip link foundation.
- App shell/header/footer CSS.
- General utility classes such as `.container`, `.ui-card`, `.ui-button`, `.glass-soft`, and public page/homepage classes.
- Homepage visual upgrade classes from a prior phase.

### Old visual language remnants

Risks still present:

- Several selectors still visually lean toward older aqua/cyan gradients via `--dm-brand-mint`, `--dm-brand-aqua`, `rgba(0, 166, 184, ...)`, and `rgba(0, 194, 168, ...)`.
- Some homepage classes contain hardcoded blues such as `#39546a` and `#173d55` rather than semantic `--dm-*` tokens.
- There are mixed selector eras: generic `.ui-*`, `.glass-soft`, `.public-*`, `.home-*`, and route-specific homepage classes all coexist.
- The CSS file already carries page-level styles, so adding the full 2026 system directly to `globals.css` would increase sprawl.

### Possible CSS conflicts

Potential conflicts for the next PR:

- New token aliases could collide with existing `--dm-*` names if semantics are changed instead of extended.
- Generic class names like `.ui-button`, `.ui-card`, `.container`, and `.glass-soft` can conflict with future 2026 primitives if reused casually.
- Page-specific classes inside global CSS increase cascade risk.
- Backdrop blur and glass surfaces already exist and may become overused if not budgeted.

### Hardcoded colors and aqua/cyan dominance

The token layer is calmer than older phases, but component/page CSS still includes hardcoded colors and bright aqua/cyan visual cues. The next PR should reduce dominance by adding a namespaced 2026 foundation instead of rewriting all old selectors at once.

### Typography issues

- `Readex Pro` is listed in CSS tokens but no production-safe font loading phase has been approved.
- Arabic uses safe fallbacks, but future UI must avoid negative Arabic tracking and must maintain readable line-height.
- Existing mixed page styles may use font weight and letter spacing inconsistently.

### Arabic/RTL risks

- Current root direction is locale-driven, and existing CSS has `[dir='rtl'] body` support.
- Future CSS must use logical properties where possible.
- Visual primitives must not assume left-to-right icon placement, transform direction, or focus order.
- Story rails, search sheets, and carousels require dedicated RTL testing in later UI PRs.

### Header/footer visual risks

- Current header/footer include route and language switch logic.
- A visual foundation PR must not change navigation links, language-switch behavior, footer copy, or header/footer behavior.
- Header/footer visual polish should be a dedicated later PR unless explicitly approved.

### Mobile layout risks

- Existing navigation is broad for mobile and may need a dedicated mobile header phase.
- Global CSS must avoid introducing fixed-width surfaces or desktop-first grids.
- New glass/search/card primitives must prevent horizontal overflow and preserve 44px touch targets.

## 4. Claude UI Kit visual extraction

The locked Claude UI Kit was inspected only as a visual reference. Its route logic, data flow, mock data, ratings, reviews, comments, payments, auth states, backend assumptions, standalone HTML, bundled scripts, and copied assets are not approved for production import.

### Primary colors

- Deep teal-green family:
  - `#07302C`
  - `#0A3D39`
  - `#0B4F4A`
  - `#0E6E64` as primary brand
  - `#14857A`
  - `#2AA192`
  - `#5BBEB1`
  - `#8ECEC2`
  - `#B9DED8`
  - `#DCEEEB`
  - `#EFF6F4`

### Accent colors

- Omani gold family:
  - `#9C7327`
  - `#B4862F`
  - `#C9A24B` as primary accent
  - `#D8B871`
  - `#E6CE92`
  - `#F6EFDD`

### Background colors

- Page background: `#F7FAF9`
- Warm alternate background: `#FBFBF8`
- Card/surface background: `#FFFFFF`
- Soft brand background: `#EFF6F4`

### Text colors

- Primary ink: `#0F1A1C`
- Strong/secondary ink: `#1C2A2B`, `#2E3A3B`, `#45514F`
- Muted text: `#5C6B6B`, `#7D8A89`
- Disabled/placeholder direction: `#9BA8A7`

### Border colors

- Hairline border: `#E2E9E7`
- Soft border: `#EDF1F0`

### Font direction

- Preferred visual direction: Readex Pro for bilingual harmony.
- Production-safe implementation must not add remote fonts unless separately approved.
- Arabic fallback direction should include Arabic-capable fonts such as Noto Naskh Arabic / Noto Sans Arabic.

### Arabic typography direction

- Arabic should use generous line-height, no negative tracking, and right-aligned layout where semantic direction requires it.
- Arabic headings should feel premium and readable rather than compressed.
- Arabic eyebrow/overline text should avoid forced uppercase and letter spacing.

### English typography direction

- English headings use semibold weight with tight but controlled tracking.
- Body copy uses 16px baseline and approximately 1.6 line-height.
- Display text uses clamp-based scaling for responsive polish.

### Spacing scale

The reference uses a 4-based scale:

- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px.

### Radius scale

- XS: 6px
- SM: 8px
- MD: 12px
- LG: 16px
- XL: 22px
- 2XL: 28px
- Pill: 999px

### Shadow/elevation style

- Soft, low-contrast, greenish ink shadows.
- Resting cards use subtle elevation.
- Menus/search/modals may use larger but still soft shadows.
- Harsh marketplace-card shadows are not part of the desired visual language.

### Button style

- Pill-shaped buttons.
- Primary teal fill.
- Secondary/outline surfaces with soft borders.
- Gold accent used sparingly, not as a dominant CTA color.
- Focus ring must remain visible.

### Card style

- White or lightly glassed surfaces.
- Soft borders.
- 16px+ radii.
- Low-contrast shadows.
- Clear internal hierarchy and spacing.

### Input/select style

- Rounded surfaces.
- Soft border color.
- Calm focus ring tied to teal.
- Labels required for real forms.
- Placeholder contrast must remain accessible.

### Search surface style

- Large, premium, calm search panel.
- Rounded/pill control clusters.
- Mobile-first sheet behavior in later phases.
- No autocomplete/data behavior in the foundation PR.

### Glass/liquid style

- Light translucent surfaces can be used for premium polish.
- `backdrop-filter` must be limited and not applied globally.
- Glass must never reduce text contrast.
- Heavy blur or many stacked glass surfaces are not allowed.

### Mobile-first patterns

- Compact stacked sections.
- Bottom sticky action base.
- Touch-friendly filters/chips.
- Search sheet and filter drawer foundations only, without behavior implementation.
- Safe-area support for sticky mobile UI.

### Desktop polish patterns

- Wider containers with generous whitespace.
- Soft cards and search surfaces.
- Balanced header/logo placement in future header PR.
- Premium healthcare aesthetic without fake trust metrics.

## 5. Token naming contract

The next implementation PR must use these naming strategies:

- **Tokens:** `--dm-...`
- **Classes:** `dm2026-...`
- **Components:** `*2026.tsx`

### Approved token examples

- `--dm-color-bg`
- `--dm-color-bg-soft`
- `--dm-color-surface`
- `--dm-color-surface-glass`
- `--dm-color-text`
- `--dm-color-text-muted`
- `--dm-color-brand`
- `--dm-color-brand-strong`
- `--dm-color-accent-gold`
- `--dm-color-border`
- `--dm-radius-sm`
- `--dm-radius-md`
- `--dm-radius-lg`
- `--dm-radius-xl`
- `--dm-radius-2xl`
- `--dm-radius-pill`
- `--dm-shadow-sm`
- `--dm-shadow-md`
- `--dm-shadow-lg`
- `--dm-shadow-glass`
- `--dm-space-1`
- `--dm-space-2`
- `--dm-space-3`
- `--dm-space-4`
- `--dm-space-6`
- `--dm-space-8`
- `--dm-space-12`
- `--dm-space-16`

### Approved class examples

- `dm2026-shell`
- `dm2026-container`
- `dm2026-section`
- `dm2026-card`
- `dm2026-button`
- `dm2026-input`
- `dm2026-select`
- `dm2026-badge`
- `dm2026-glass`
- `dm2026-search`
- `dm2026-story`
- `dm2026-floating-dock`

### Compatibility rule

New semantic `--dm-color-*` aliases may map to current `--dm-*` foundation values, but existing tokens must not be redefined in a way that breaks current pages.

## 6. CSS strategy

### Recommendation

Split the 2026 foundation into a separate CSS file in the next implementation PR, imported once from the existing global CSS entry point, rather than adding a large block directly into `globals.css`.

Recommended next-file direction:

- Keep `src/styles/globals.css` as the global entry point.
- Add `src/styles/dm2026-foundation.css` for namespaced `dm2026-*` classes and `--dm-color-*` semantic aliases.
- Import the foundation file once from `globals.css` if the framework/build setup permits.

### How to avoid CSS sprawl

- Keep tokens, primitive classes, and utilities grouped by section.
- Do not place page-specific homepage/profile/pricing styles in the foundation file.
- Do not duplicate existing `.home-*`, `.public-*`, `.ui-*`, or `.site-*` selectors.
- Prefer small composable primitives over one-off visual classes.

### Backward compatibility

- Preserve current aliases such as `--dm-brand`, `--dm-brand-strong`, `--dm-border`, `--dm-text`, and existing route/page class behavior.
- New 2026 classes must be opt-in.
- Existing pages should render unchanged unless they explicitly opt into `dm2026-*` classes in a later approved PR.

### Avoiding old/new conflicts

- Use `dm2026-*` for all new classes.
- Avoid generic class names such as `.button`, `.card`, `.glass`, `.search`, `.container`, or `.shell`.
- Do not override `.ui-button`, `.ui-card`, `.glass-soft`, `.site-header`, `.site-footer`, `.home-*`, or `.public-*` in the foundation PR.

### Phasing out old template styles safely

- Do not remove old selectors in the foundation PR.
- Introduce the 2026 foundation first.
- Migrate pages one at a time in later approved PRs.
- Remove or deprecate old selectors only after all consuming pages have moved away from them and validation passes.

## 7. Header/footer rule

For PR #155-B, allowed header/footer scope:

- Shared visual classes for future header/footer.
- Base visual styling primitives only.

Forbidden unless a dedicated header/footer implementation PR is approved:

- Changing navigation logic.
- Changing route links.
- Changing language switch logic.
- Changing footer content.
- Changing header/footer behavior.
- Changing server/header locale detection.
- Replacing the current header/footer components.

## 8. Mobile-first strategy

PR #155-B foundation requirements:

- Mobile header foundation classes only; no header behavior changes.
- Bottom sticky action base with `safe-area-inset-bottom` support.
- Mobile search sheet foundation classes only; no search/autocomplete behavior.
- Mobile filter drawer foundation classes only; no filter behavior.
- Story rail foundation classes only; no carousel behavior.
- Minimum touch target: 44px.
- No horizontal overflow at 320px+ viewport widths.
- Responsive container strategy using fluid widths and safe padding.
- Avoid desktop-only layouts.
- Prefer CSS logical properties for RTL safety.

## 9. Accessibility contract

Every future UI PR that consumes the foundation must satisfy:

- Visible `:focus-visible` states.
- Keyboard-accessible controls.
- No `div` buttons.
- Proper labels for all form fields.
- Sufficient color contrast for text, placeholders, borders, and focus states.
- Readable Arabic line-height.
- RTL must not break focus order.
- `prefers-reduced-motion` support.
- Meaningful ARIA only; no decorative ARIA noise.
- Stories, carousels, command palette, search sheet, and filter drawer must receive dedicated accessibility handling in later phases before behavior ships.

## 10. Performance budget

PR #155-B and future visual PRs must preserve Core Web Vitals:

- No heavy JavaScript.
- No animation library.
- No remote fonts unless separately approved.
- No background video.
- No large images.
- No avoidable layout shift.
- No infinite animation by default.
- Limited `backdrop-filter` usage.
- Limited heavy shadows.
- Respect `prefers-reduced-motion`.
- Premium visuals must not sacrifice load, interaction, or rendering performance.

## 11. Content safety contract

Future UI examples and components must not contain:

- “best doctor”
- “top clinic”
- fake “4.9”
- fake review counts
- fake “trusted by 10,000 patients”
- fake “available now”
- fake “book instantly”
- fake WhatsApp/phone numbers
- guaranteed medical results
- unsupported medical superiority claims

Allowed placeholder approach:

- Use neutral UI labels such as “Provider name”, “Service category”, “Location”, or “Public profile summary”.
- Prefer visibly generic skeletons over fabricated trust data.

## 12. Route and SEO contract

Confirmed route/SEO contract for PR #155-B:

- Supported locales remain `en` and `ar` only.
- Supported country remains `om` only.
- No Persian/Hindi routes.
- No duplicate route patterns.
- No deprecated route patterns such as `/en/dentist/al-khuwair`.
- No new routes in the foundation PR.
- No sitemap changes in the foundation PR.
- No robots changes in the foundation PR.
- No `public/llms.txt` changes in the foundation PR.
- Public pages must remain SEO-safe and server-rendered where applicable.
- Noindex strategy for sign-in/register/list-your-center must be handled in their dedicated PR, not in the foundation PR.

## 13. Visual QA checklist

Every future UI PR must manually check:

- English desktop.
- Arabic desktop.
- English mobile.
- Arabic mobile.
- RTL alignment.
- Header visual integrity.
- Footer visual integrity.
- Buttons.
- Forms.
- Cards.
- Search surfaces.
- Focus states.
- Touch targets.
- No horizontal overflow.
- Reduced motion.
- Visual consistency with the Claude UI Kit visual direction.
- No fake ratings/reviews/comments/availability/phone/WhatsApp/trust claims.

## 14. Success criteria for PR #155-B

PR #155-B succeeds when:

- Future homepage/profile/pricing pages can reuse shared tokens/classes.
- There is no random page-specific color system.
- There is no mixed design-language expansion.
- Old template visual dominance is reduced at the foundation level without breaking current pages.
- No database/backend/route damage occurs.
- Validation passes.
- Arabic/RTL foundation is safe.
- Performance budget is respected.
- The implementation remains opt-in and phase-safe.

## 15. Exact recommended next PR

**PR #155-B — UI-K-FOUNDATION-2026-B: Premium Design System Foundation Implementation**

### Exact allowed files

Recommended allowed files for PR #155-B:

- `src/styles/globals.css` — only to import the new foundation file or expose minimal stable aliases.
- `src/styles/dm2026-foundation.css` — new 2026 foundation tokens/classes.
- `src/components/ui/*2026.tsx` — optional primitive-only components if explicitly approved in the PR prompt.
- `docs/product/UI_K_FOUNDATION_2026_B_COMPLETION.md` — completion report.

### Exact forbidden files

PR #155-B must not modify:

- `supabase/**`
- `migrations/**`
- generated database types
- `scripts/**`
- `scripts/db/**`
- API routes
- auth backend
- payment backend
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `public/llms.txt`
- `package.json`
- `pnpm-lock.yaml`
- route-check scripts
- database schema
- seed data

### Page-file rule

Page files are forbidden in PR #155-B unless the human approval prompt explicitly adds them. The foundation PR should create reusable primitives only, not rebuild pages.

### Component primitive rule

Primitive components are allowed only if scoped as reusable visual primitives with no route logic, no data fetching, no mock medical claims, no search/autocomplete behavior, no auth state, and no payment state.

### Validation commands for PR #155-B

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- Existing route-check validation command, if available in `package.json` or scripts, without modifying route-check expectations.

### Stop rules for PR #155-B

Stop immediately if:

- A route/page file appears necessary.
- Header/footer logic appears necessary.
- A dependency or font-loading change appears necessary.
- A mock rating/review/availability/phone/WhatsApp/trust claim appears in examples.
- A CSS selector must override broad existing production pages.
- A validation command fails.
- A RLS/API/database/SEO route question appears.

## 16. Completion report

### 1. Files read

Required read-order files:

1. `AGENTS.md`
2. `README.md`
3. `docs/project-state/CURRENT_STATE.md`
4. `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`
5. `docs/master-spec/58_CODEX_PHASED_BUILD_MASTER_PLAN.md`
6. `docs/master-spec/66_PHASE_LOCKS_AND_ALLOWED_FILE_CHANGES.md`
7. `docs/master-spec/08_IMPLEMENTATION_TASKS_AND_PHASES.md`
8. `docs/master-spec/67_DATABASE_MIGRATION_PROTOCOL.md`
9. `docs/master-spec/68_TESTING_AND_VALIDATION_GATE.md`
10. `docs/master-spec/69_ERROR_HANDLING_AND_STOP_RULES.md`
11. `docs/master-spec/70_AGENT_OUTPUT_REPORT_TEMPLATE.md`
12. `docs/master-spec/72_SECURITY_RLS_AND_SECRET_HANDLING_PROTOCOL.md`
13. `docs/master-spec/73_SEO_BUILD_VALIDATION_PROTOCOL.md`
14. `docs/master-spec/76_HUMAN_APPROVAL_CHECKPOINTS.md`
15. `docs/addendums/V10_5_BUSINESS_GROWTH_REVENUE_ADDENDUM.md`
16. `docs/addendums/V10_5_SEO_AI_SEARCH_EXPANSION_ADDENDUM.md`
17. `docs/addendums/V10_5_MONETIZATION_SALES_REFERRAL_ADDENDUM.md`
18. `docs/product/UI_K_DESIGN_REFERENCE_IMPORT_A.md`
19. `docs/product/UI_K_ALIGN_B_TOKEN_TYPOGRAPHY.md`
20. `docs/prototype-reference/drmuscat-ui-kit-2026-v2/DrMuscat Web UI Kit (1).html`
21. `docs/prototype-reference/drmuscat-ui-kit-2026-v2/DrMuscat Design System (2).zip` reference contents, especially `colors_and_type.css` and preview HTML files.

Additional inspected files:

- `src/styles/globals.css`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/site-header.tsx`
- `src/components/layout/site-footer.tsx`
- `src/lib/routes/public.ts`
- `src/app/[locale]/[country]/page.tsx`
- Route-related files discovered with `rg --files`.

### 2. Files changed

- `docs/product/UI_K_FOUNDATION_2026_PRE_AUDIT.md`

### 3. PR #153 decision

PR #153 should remain frozen/reference only, later closed after a clean PR #155-B foundation lands, and must not be used as a code source. Ideas may be reused only as audited visual direction.

### 4. Claude UI Kit visual extraction summary

The visual source of truth is a calm premium teal-green healthcare system with sparse Omani gold accents, warm-cool neutral backgrounds, white/glass surfaces, soft greenish shadows, rounded radii, pill buttons, calm search surfaces, bilingual Readex Pro direction, and mobile-first layout feeling.

### 5. Current CSS conflict risks

Primary risks are old aqua/cyan remnants, mixed selector eras, hardcoded colors, global CSS sprawl, generic `.ui-*`/`.glass-soft` conflicts, and possible RTL/mobile issues if new classes are not opt-in and namespaced.

### 6. Token/class naming contract

Use `--dm-...` tokens, `dm2026-...` classes, and `*2026.tsx` component filenames. Keep new classes opt-in and do not redefine existing production tokens in breaking ways.

### 7. Accessibility/performance/mobile contracts

The next foundation must be mobile-first, 44px touch-safe, safe-area aware, keyboard/focus-visible safe, RTL-safe, reduced-motion aware, and performance-budgeted with no heavy JS, no animation library, no remote fonts without approval, and limited blur/shadow usage.

### 8. Visual QA checklist

Future UI PRs must check English/Arabic desktop, English/Arabic mobile, RTL alignment, header/footer, buttons, forms, cards, search, focus states, touch targets, horizontal overflow, reduced motion, and visual consistency with Claude UI Kit without fake trust/content claims.

### 9. Next PR recommendation

Proceed next with **PR #155-B — UI-K-FOUNDATION-2026-B: Premium Design System Foundation Implementation**, limited to opt-in CSS foundation and optionally explicitly-approved primitive `*2026.tsx` UI components. Page files should remain forbidden.

### 10. Forbidden areas untouched

Confirmed intended untouched areas for this phase:

- `src/**` implementation files
- `supabase/**`
- `migrations/**`
- `scripts/**`
- `scripts/db/**`
- generated database types
- API routes
- auth backend
- payment backend
- sitemap
- robots
- `public/llms.txt`
- `package.json`
- `pnpm-lock.yaml`
- route-check scripts
- database schema
- seed data
