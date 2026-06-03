# UI-K-ALIGN-B — Token and Typography Alignment

## Phase identity

- **Task ID:** `UI-K-ALIGN-B`
- **Mode:** `PHASED_BUILD_ONLY`
- **Execution Phase:** Frontend foundation alignment only
- **Lock Scope:** Token and typography foundation files only
- **Product Module:** UI/UX design foundation system
- **Subphase ID:** `UI-K-ALIGN-B`

## Files read

Required guardrails and project state were read before implementation:

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

Task-specific files read:

- `docs/product/UI_K_DESIGN_REFERENCE_IMPORT_A.md`
- `docs/prototype-reference/drmuscat-ui-kit-2026-v2/DrMuscat Design System (2).zip`
- Extracted reference files from the zip for inspection only: `README.md`, `SKILL.md`, and `colors_and_type.css`
- `docs/prototype-reference/drmuscat-ui-kit-2026-v2/DrMuscat Web UI Kit (1).html`
- `package.json`
- `postcss.config.mjs`
- `src/styles/globals.css`
- `src/app/layout.tsx`

## Current token and typography audit

- **Tailwind setup:** The project uses Tailwind CSS v4 through `@import "tailwindcss"` in `src/styles/globals.css` and `@tailwindcss/postcss` in `postcss.config.mjs`. No standalone `tailwind.config.*` file is present.
- **Colors:** Production colors were defined as `--dm-*` custom properties in `src/styles/globals.css`. The previous dominant palette leaned brighter aqua/cyan (`#00a6b8`, `#00c2a8`, `#4fd1ff`) than the UI kit's deeper teal-green direction.
- **Fonts:** Fonts were defined directly on `body` and `[dir='rtl'] body` in `src/styles/globals.css`. English used an `Inter`-first stack. RTL used an Arabic stack beginning with `IBM Plex Sans Arabic` and `Noto Sans Arabic`. No external font loader was configured in `src/app/layout.tsx`.
- **Spacing/radius/shadow:** Radius and shadow were already represented as CSS variables in `src/styles/globals.css`. A formal spacing token scale did not exist in production CSS variables before this phase.
- **Global CSS variables:** Existing global CSS variables were present in `:root`, but they did not yet expose the UI kit's full teal, gold, neutral, typography, radius, spacing, and elevation naming direction.
- **Arabic/RTL handling:** The root layout sets `<html lang={locale} dir={localeDirection(locale)}>` and global CSS uses `[dir='rtl'] body` for Arabic font handling. This phase preserved that foundation without changing routes or layouts.
- **Old-template visual tokens:** Bright aqua/mint accents and gradients were still dominant at token level. This phase reduced that dominance at the foundational token layer without redesigning page structure.

## Safe UI kit token direction extracted

The imported UI kit establishes these foundation targets:

- **Primary family:** deep teal-green, centered on `#0E6E64`.
- **Accent family:** Omani gold, centered on `#C9A24B`, used sparingly.
- **Neutral/background:** warm-cool slate text, near-white page background `#F7FAF9`, white cards, and warm alternate background `#FBFBF8`.
- **Borders:** low-contrast greenish hairline borders (`#E2E9E7`, `#EDF1F0`).
- **Text:** primary `#0F1A1C`, secondary `#5C6B6B`, muted `#7D8A89`.
- **Radius:** soft rounded system from `6px` through `28px`, plus pill radius.
- **Elevation:** low-contrast greenish shadows, avoiding heavy marketplace-card shadows.
- **Typography:** one bilingual-friendly family direction, `Readex Pro`, with Arabic fallback to `Noto Naskh Arabic`; semibold headings; body line height `1.6`; no negative Arabic tracking.
- **Heading/body sizes:** semantic display, h1-h4, body, small, caption, and micro tokens.

## Files changed

- `src/styles/globals.css`
- `docs/product/UI_K_ALIGN_B_TOKEN_TYPOGRAPHY.md`

## Token changes made

- Added UI-kit-aligned teal scale variables under `--dm-teal-*`.
- Added Omani gold accent variables under `--dm-gold-*`.
- Added warm-cool neutral, surface, text, border, and background variables.
- Remapped existing production aliases (`--dm-brand`, `--dm-brand-strong`, `--dm-brand-mint`, `--dm-brand-aqua`, `--dm-border`, `--dm-text`, `--dm-text-soft`) to the calmer UI kit system so existing components remain backwards-compatible.
- Added spacing tokens (`--dm-space-*`) matching the 4-based direction.
- Refined radius and shadow tokens to the UI kit's softer scale while preserving existing alias names used by production CSS.
- Added Tailwind v4 `@theme inline` mappings for safe future use of DrMuscat color, font, radius, and shadow tokens without introducing a separate Tailwind config file.
- Toned down the global body background gradients to use teal/gold foundation colors instead of bright aqua/mint dominance.

## Font and typography decisions

- No dependency, package, lockfile, CDN, or root layout font loader was added in this phase.
- Production stability was prioritized: CSS now exposes `--dm-font-sans`, `--dm-font-arabic`, `--dm-font-display`, and semantic type-scale variables.
- `body` now consumes `--dm-font-sans`, and `[dir='rtl'] body` consumes `--dm-font-arabic`.
- `Readex Pro` is listed first to match the UI kit direction, but because this phase does not add font loading, browsers will safely fall back to installed/system fonts when it is unavailable.
- Arabic receives foundation-level line-height and letter-spacing variables to avoid negative tracking and preserve RTL readability.

## RTL/LTR notes

- Existing locale-driven document direction in `src/app/layout.tsx` was read and preserved.
- No Arabic route, page, component, layout, or copy was rewritten.
- The token names now include Arabic-specific typography variables (`--dm-font-arabic`, `--dm-arabic-letter-spacing`, `--dm-arabic-line-adjust`) for future RTL-aware UI work.
- Logical CSS direction support was not expanded beyond the foundation layer in this phase.

## Risks avoided

- Did not copy standalone prototype HTML, React, Babel, script tags, CDN imports, or mock data into production.
- Did not add new font-loading dependencies or external fragile imports.
- Did not redesign the homepage or any production page.
- Did not modify routes, runtime SEO files, data loading, provider cards, doctor cards, search components, registration/onboarding components, profile pages, dashboard/admin pages, or backend code.
- Did not add fake ratings, reviews, comments, provider data, seed data, or schema.org markup.

## Forbidden areas untouched

Confirmed untouched by this phase:

- `supabase/**`
- `migrations/**`
- generated database types
- `scripts/**`
- `scripts/db/**`
- RLS policies
- API routes
- auth backend
- payment backend
- `sitemap.ts`
- `robots.ts`
- `public/llms.txt`
- package and lock files
- database schema and seed data
- production route/page/component redesign files

## Validation

Validation commands for this phase:

- `git status --short`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

## Risks and limitations

- The preferred UI kit typeface is exposed as a CSS token but is not guaranteed to render unless it is installed locally or a future approved font-loading phase adds a production-safe loader.
- Existing component-level CSS still contains older visual decisions and hardcoded values outside the root token layer. Reworking those would require later approved UI alignment phases.
- This phase only aligns foundations; visible UI polish is intentionally limited and should not be treated as a completed UI kit implementation.

## Next recommended phase

`UI-K-ALIGN-C — Public shell/header/footer alignment`
