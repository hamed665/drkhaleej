# DrMuscat Agent Instructions

You are working on the DrMuscat platform.

Before doing any implementation, read:

- master specs in `docs/master-spec/`
- current root `README.md`
- current root `AGENTS.md`

Use `PHASED_BUILD_ONLY` mode.

Do not build the full platform in one pass.

Current completed phase: **Phase 3.0A**.

Completed migrations: **`0001` through `0032`**.

Do not implement business features yet.
Do not implement payment gateways.
Do not implement AI chat.
Do not create Persian or Hindi public SEO routes.
Do not use doctor_centers as a writable canonical table.
Do not use legacy areas as a writable canonical table.
Do not create deprecated routes such as /en/dentist/al-khuwair.
Do not fake passing tests.
Do not disable TypeScript, lint, RLS, or validation to make the build pass.

Private data RLS is not complete yet.
Frontend/backend features are still out of scope until explicitly approved.
No seed rows are allowed yet unless a seed phase is explicitly approved.

Future phases must not modify existing SQL migrations unless explicitly approved.
`CREATE POLICY` / `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` are only allowed in explicitly approved RLS phases.

TypeScript-first is required for future app/auth/API/security/backend code.
Scripts may remain `.mjs` if intentionally script-only.

If any conflict, failed command, missing dependency, route ambiguity, schema conflict, RLS ambiguity, or unclear requirement occurs:
STOP.
Do not guess.
Report the blocker and propose the smallest safe fix.

For every phase:

- List files you plan to create/edit before editing.
- Implement only allowed scope.
- Run validation commands.
- Produce a phase completion report.
- Stop after the phase and wait for approval.

## Future UI/UX guardrails

- Any future UI work must be mobile-first and responsive across phones, tablets, laptops, and desktops.
- Do not build desktop-only layouts.
- Do not build generic low-quality UI.
- Do not create placeholder-looking pages.
- Any future UI must include proper layout hierarchy, spacing, typography, responsive grids, and professional logo placement.
- Logo placement must be deliberate, responsive, and visually balanced.
- Future UI should support premium animated/motion elements only when performance-safe and accessibility-safe.
- Respect `prefers-reduced-motion`.
- Do not add heavy animation libraries without explicit approval.
- Do not sacrifice Core Web Vitals for visual effects.
- Any future image/media UI must use optimized responsive images and proper alt text.

## Future SEO guardrails

- SEO is mandatory for all future public pages.
- Public pages must be indexable and not depend on client-only rendering for SEO-critical content.
- Any public page must include metadata, canonical strategy, Open Graph basics, and semantic HTML.
- Future doctor/center/service/location pages must be designed for SEO from the start.
- URL structures must be clean, stable, localized where approved, and Oman-first.
- Do not create Persian/Hindi SEO routes unless explicitly approved.
- Do not create duplicate route patterns that compete with canonical URLs.
- Do not create thin/empty SEO pages.
- Do not fake structured data.
- Do not add schema.org markup unless the content supports it.

## Phase 3.0C TypeScript Safety Baseline

Phase 3.0C establishes a strict TypeScript-first baseline for upcoming private RLS/auth/backend/API/dashboard phases.

- Future app/auth/API/security/backend code must be TypeScript-first.
- Do not introduce new `.js` app/backend/security files without explicit approval.
- `.mjs` scripts/config files may remain `.mjs` when intentionally script-only.
- Agents must not weaken `tsconfig`, lint, build, route, env, migration, seed, or RLS checks to make work pass.
- Do not perform mass JS-to-TS conversion or file renaming without an approved dedicated phase.
- Preserve `PHASED_BUILD_ONLY` execution and file-plan-before-editing workflow.
- Preserve STOP-on-blocker/no-guessing behavior, and never fake passing tests.
- Preserve existing RLS/private-data/seed restrictions unless a specific approved phase expands scope.
