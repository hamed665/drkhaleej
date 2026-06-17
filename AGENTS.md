# DrMuscat Agent Instructions

You are working on the DrMuscat platform.

Before doing any implementation, read the required agent read order below.

## Required agent read order

Before planning or implementing any future task, agents must read the following files in this order.

### A. Root guardrails

1. `AGENTS.md`
2. `README.md`

### B. Current project state

3. `docs/project-state/CURRENT_STATE.md`
4. `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`

### C. Canonical V10.4 architecture

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
15. `docs/master-spec/82_COMMERCIAL_CONTENT_PLACEMENT_AI_OPERATING_MODEL.md`

### D. Platform planning specs

16. `docs/platform/DRMUSCAT_PLATFORM_ARCHITECTURE_V1.md`
17. `docs/platform/DRMUSCAT_ROLES_AND_PERMISSIONS_SPEC_V1.md`
18. `docs/platform/DRMUSCAT_PROVIDER_ENTITY_MODEL_SPEC_V1.md`
19. `docs/platform/DRMUSCAT_TAXONOMY_AND_PROVIDER_PROFILE_MODEL_SPEC_V1.md`
20. `docs/platform/DRMUSCAT_TAXONOMY_SCHEMA_PLAN_SPEC_V1.md`
21. `docs/platform/DRMUSCAT_SEO_AI_CONTENT_OPERATING_SYSTEM_SPEC_V1.md`
22. `docs/platform/DRMUSCAT_KEYWORD_UNIVERSE_CONTENT_INTELLIGENCE_SPEC_V1.md`
23. `docs/platform/DRMUSCAT_AI_BRIEF_DRAFT_WORKFLOW_SPEC_V1.md`
24. `docs/platform/DRMUSCAT_EXISTING_REVIEW_SCHEMA_RECONCILIATION_SPEC_V1.md`

### E. V10.5 addendums

25. `docs/addendums/V10_5_BUSINESS_GROWTH_REVENUE_ADDENDUM.md`
26. `docs/addendums/V10_5_SEO_AI_SEARCH_EXPANSION_ADDENDUM.md`
27. `docs/addendums/V10_5_MONETIZATION_SALES_REFERRAL_ADDENDUM.md`

Future tasks must still use the four-axis mapping model:

- Execution Phase
- Lock Scope
- Product Module
- Subphase ID

V10.5 addendums are documentation-only and do not authorize implementation.

If there is any conflict between files, the stricter guardrail wins. If interpretation is unclear, STOP rather than guessing and report the blocker.

Old informal phase labels such as `Phase 5.20`, `Phase 5.26`, and `Phase 5.27` must not be used as canonical task identifiers.

Use `PHASED_BUILD_ONLY` mode.

Do not build the full platform in one pass.

Current repo state: **after ADDON-A commercial add-on assignment shell and CENTER-A lead history event-type fix**.

Completed migrations: **`0001` through `0053`**. Migration validation is expected through `0053_provider_onboarding_lead_events.sql`.

Approved current surfaces include localized public catalog/detail surfaces, static public article shell routes, contact/callback/media/license foundations, provider onboarding lead capture, protected root `/admin`, minimal admin login, admin provider onboarding lead list/detail, limited status/priority lead mutation, read-only lead history UI, status/priority lead history writes, draft center creation from provider onboarding lead, admin center subscription view/assignment foundation, base plan catalog initializer, admin quick navigation, and admin commercial add-on assignment shell.

Do not infer approval for broader business features from the current foundations.

Still out of scope unless explicitly approved:

- payment, invoices, checkout, and billing integrations
- AI chat or AI article generation
- Persian/Hindi public SEO routes
- provider dashboard mutations
- Official Offers admin/data model
- public ads or special-offer rendering
- article CMS, admin article editor, or article placement engine
- full review moderation/display/reply workflows
- sales, referral, analytics, SEO AI, and other business expansion features

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
- Future doctor/center/service/location/article pages must be designed for SEO from the start.
- URL structures must be clean, stable, localized where approved, and Oman-first.
- Do not create Persian/Hindi SEO routes unless explicitly approved.
- Do not create duplicate route patterns that compete with canonical URLs.
- Do not create thin/empty SEO pages.
- Do not fake structured data.
- Do not add schema.org markup unless the content supports it.
- Sponsored or paid content must be clearly labeled and must never be disguised as organic ranking.

## Phase 3.0C TypeScript Safety Baseline

Phase 3.0C establishes a strict TypeScript-first baseline for upcoming private RLS/auth/backend/API/dashboard phases.

- Future app/auth/API/security/backend code must be TypeScript-first.
- Do not introduce new `.js` app/backend/security files without explicit approval.
- `.mjs` scripts/config files may remain `.mjs` when intentionally script-only.
- Agents must not weaken `tsconfig`, lint, build, route, env, migration, seed, SEO, or RLS checks to make work pass.
- Do not perform mass JS-to-TS conversion or file renaming without an approved dedicated phase.
- Preserve `PHASED_BUILD_ONLY` execution and file-plan-before-editing workflow.
- Preserve STOP-on-blocker/no-guessing behavior, and never fake passing tests.
- Preserve existing RLS/private-data/seed restrictions unless a specific approved phase expands scope.
