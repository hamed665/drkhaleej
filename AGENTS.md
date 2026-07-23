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
21. `docs/platform/DRMUSCAT_TAX_C1_VERTICAL_CATEGORY_MIGRATION_PLAN_V1.md`
22. `docs/platform/DRMUSCAT_TAXONOMY_SEED_PLAN_V1.md`
23. `docs/platform/DRMUSCAT_GEO_FULL_CATALOG_PLAN_V1.md`
24. `docs/platform/DRMUSCAT_SEO_AI_CONTENT_OPERATING_SYSTEM_SPEC_V1.md`
25. `docs/platform/DRMUSCAT_KEYWORD_UNIVERSE_CONTENT_INTELLIGENCE_SPEC_V1.md`
26. `docs/platform/DRMUSCAT_AI_BRIEF_DRAFT_WORKFLOW_SPEC_V1.md`
27. `docs/platform/DRMUSCAT_EXISTING_REVIEW_SCHEMA_RECONCILIATION_SPEC_V1.md`

### E. V10.5 addendums

28. `docs/addendums/V10_5_BUSINESS_GROWTH_REVENUE_ADDENDUM.md`
29. `docs/addendums/V10_5_SEO_AI_SEARCH_EXPANSION_ADDENDUM.md`
30. `docs/addendums/V10_5_MONETIZATION_SALES_REFERRAL_ADDENDUM.md`

### F. Approved staged AI Agent program

31. `docs/ai-agent-program/drkhaleej-ai-agent-program-2026-v1.2.2/README_FA.md`

The AI Agent program is an approved staged execution plan, not permission to bypass the canonical V10.4 guardrails. The stricter rule always wins. Immediate execution is limited to the program's ordered `P01` through `P09` work and their explicit gates. `P10+`, Agent runtime, Content runtime, and Bulk remain blocked until the program's required Go/No-Go decisions are recorded.

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

Current import-readiness runtime baseline: **PR #954 at `9d0511ba6b2ff5a53e8fd857cb09273d269d602d`**. The current next implementation is **`ROLLBACK-AUTHORITY-HARDENING`**.

Completed migrations: **`0001` through `0082`**. Migration validation is expected through `0082_import_pharmacy_private_execution_audit.sql`.

Approved current surfaces include localized public catalog/detail surfaces, static public article shell routes, contact/callback/media/license foundations, provider onboarding lead capture, protected root `/admin`, minimal admin login, admin provider onboarding lead list/detail, limited status/priority lead mutation, read-only lead history UI, status/priority lead history writes, draft center creation from provider onboarding lead, admin center subscription view/assignment foundation, base plan catalog initializer, admin quick navigation, admin commercial add-on assignment shell, healthcare vertical/category taxonomy foundation, public read RLS for approved public taxonomy rows, and the Preview-only guarded Pharmacy private publish/readback authority. The Pharmacy path remains single-entity, private, noindex, excluded from sitemap and routes, and unavailable in Production.

Do not infer approval for broader business features from the current foundations.

Still out of scope unless explicitly approved:

- public provider ownership/claim workflow
- public review submission/display workflow
- appointment booking
- payments
- provider dashboard editing
- public activation workflow
