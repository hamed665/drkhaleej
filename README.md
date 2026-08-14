# DrMuscat

DrMuscat is an SEO-first healthcare discovery and provider visibility platform for Oman, designed to scale later to other GCC countries.

Canonical specification path:

- `docs/master-spec/`
- `docs/platform/DRMUSCAT_PLATFORM_ARCHITECTURE_V1.md` — documentation-only future platform architecture map.
- `docs/platform/DRMUSCAT_ROLES_AND_PERMISSIONS_SPEC_V1.md` — documentation-only role, permission, ownership, audit, and RLS implication spec.
- `docs/platform/DRMUSCAT_PROVIDER_ENTITY_MODEL_SPEC_V1.md` — documentation-only provider, doctor, center, branch, claim, verification, and public/private entity model spec.
- `docs/platform/DRMUSCAT_TAXONOMY_AND_PROVIDER_PROFILE_MODEL_SPEC_V1.md` — documentation-only taxonomy, provider profile, doctor, specialty, service, insurance, license, media, review, bilingual label, and WhatsApp CTA planning spec.
- `docs/platform/DRMUSCAT_TAXONOMY_SCHEMA_PLAN_SPEC_V1.md` — documentation-only schema plan for verticals, center categories, center taxonomy assignments, doctor languages, education, insurance, license authority, hours, and activation gates.
- `docs/platform/DRMUSCAT_TAX_C1_VERTICAL_CATEGORY_MIGRATION_PLAN_V1.md` — documentation-only TAX-C1 plan for future vertical/category migration scope, RLS boundary, seed boundary, and public activation stop conditions.
- `docs/platform/DRMUSCAT_GEO_FULL_CATALOG_PLAN_V1.md` — documentation-only regional geo catalog plan for Gulf, Arab, and Iran country/city/area coverage, source strategy, seed phases, and dependent location UI behavior.
- `docs/platform/DRMUSCAT_SEO_AI_CONTENT_OPERATING_SYSTEM_SPEC_V1.md` — documentation-only SEO, AI content, CMS, media, review, and reporting operating system specification.
- `docs/platform/DRMUSCAT_KEYWORD_UNIVERSE_CONTENT_INTELLIGENCE_SPEC_V1.md` — documentation-only keyword universe and content intelligence planning specification.
- `docs/platform/DRMUSCAT_AI_BRIEF_DRAFT_WORKFLOW_SPEC_V1.md` — documentation-only AI brief and draft workflow, prompt governance, output validation, review, and approval specification.
- `docs/platform/DRMUSCAT_EXISTING_REVIEW_SCHEMA_RECONCILIATION_SPEC_V1.md` — documentation-only reconciliation of existing review tables, policies, migration numbering, conflicts, and safe future review implementation paths.
- `docs/platform/DRMUSCAT_IMPORT_READINESS_CONTROLLED_PUBLISHING_ARCHITECTURE_V1.md` — documentation-only import readiness, controlled publishing, domain separation, canonical geo, internal linking, sitemap eligibility, schema validation, admin readiness, and performance guardrail architecture.
- `docs/master-spec/82_COMMERCIAL_CONTENT_PLACEMENT_AI_OPERATING_MODEL.md` — documentation-only commercial content, placement, article, media, and AI operating model.
- `docs/ai-agent-program/drkhaleej-ai-agent-program-2026-v1.2.2/README_FA.md` — approved staged AI Agent execution program; canonical guardrails and its explicit gates remain binding.

Build mode:

- `PHASED_BUILD_ONLY`

## Current project phase status

- Import-readiness runtime is aligned through **PR #976** at baseline **`1b33835ceda3ebce9b1bc671f87e7e67b7594ee9`**.
- Database/migration status: **validates through `0095_import_automation_job_runtime.sql`**.
- Completed migration set: **`0001` through `0095`**.
- Current import-readiness implementation: **`AUTOMATION-JOB-RUNTIME`** adds the closed-by-default Preview queue, service identity boundary, lease fencing, bounded outbox, internal API and idle Worker shell recorded in [`docs/import/AUTOMATION_JOB_RUNTIME.md`](docs/import/AUTOMATION_JOB_RUNTIME.md). All controls and identities remain disabled, Render is not provisioned, and **`AUTOMATION-JOB-PREVIEW-ACTIVATION`** is the next independently reviewable gate. The completed decision gate is recorded in [`docs/import/WORKER_RUNTIME_ADR_GATE.md`](docs/import/WORKER_RUNTIME_ADR_GATE.md), and the accepted choices remain in [`docs/import/WORKER_RUNTIME_ARCHITECTURE_DECISION.md`](docs/import/WORKER_RUNTIME_ARCHITECTURE_DECISION.md); decision application and every downstream/Production authority remain gated.
- P11 adds the isolated Preview Pharmacy public/noindex authority recorded in [`docs/import/PHARMACY_PUBLIC_NOINDEX_AUTHORITY.md`](docs/import/PHARMACY_PUBLIC_NOINDEX_AUTHORITY.md). P12 activates only its exact bilingual route as recorded in [`docs/import/PHARMACY_BILINGUAL_LIVE_VERIFY.md`](docs/import/PHARMACY_BILINGUAL_LIVE_VERIFY.md). P13 adds exact server-selected public rollback as recorded in [`docs/import/PHARMACY_PUBLIC_ROLLBACK.md`](docs/import/PHARMACY_PUBLIC_ROLLBACK.md). P14 adds independent, reversible Index promotion as recorded in [`docs/import/PHARMACY_INDEX_PROMOTION.md`](docs/import/PHARMACY_INDEX_PROMOTION.md). P15 adds independent, reversible Sitemap inclusion as recorded in [`docs/import/PHARMACY_SITEMAP_PROMOTION.md`](docs/import/PHARMACY_SITEMAP_PROMOTION.md); forward-only `0091` aligns the pre-existing Queue constraint with its reviewed terminal `index` state. The Sitemap reader requires the exact P15 evidence marker and canonical route match; JSON-LD, candidate links, other families and Production execution remain disabled.
- Implementation remains phase-gated. Do not infer approval for new business features from the existence of current public/admin baselines.

Canonical current-state sources:

- [`docs/project-state/CURRENT_STATE.md`](docs/project-state/CURRENT_STATE.md) — concise factual repository state.
- [`docs/import/import-readiness-roadmap-after-933.md`](docs/import/import-readiness-roadmap-after-933.md) — authoritative import wave ledger and machine-readable alignment manifest.
- [`docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`](docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md) — mapping to the canonical phase systems; not a parallel roadmap.

## Completed database and platform foundation scope

- core extensions/enums
- profiles/auth base and approved profile RLS baseline
- geo hierarchy
- taxonomy/services
- centers/locations/services/claims
- doctors/practice locations/services/schedules/exceptions
- appointment slots/core/operations
- reviews/reports
- media assets/entity media
- monetization foundation without payment gateways
- legal/consent/audit foundation
- RLS auth helpers and approved access-helper foundations
- public catalog read RLS policies
- center access helpers and center claims/memberships RLS foundation
- patient contact profile link and patient appointment access-helper/RLS foundations
- reviews/reports/media private RLS foundation
- monetization sponsored RLS foundation
- legal/consent/audit RLS foundation
- contact visibility foundation
- callback request foundation
- provider license verification foundation
- media public visibility/RLS hardening
- provider onboarding lead database/RLS foundation through `0050_provider_onboarding_leads.sql`
- landing content foundation through `0051_landing_page_contents.sql`
- review companion table foundation through `0052_review_companion_tables.sql` only; this does not complete the review feature
- provider onboarding lead event-history database foundation through `0053_provider_onboarding_lead_events.sql`

## Current implemented app surface

The repository now includes approved public and admin baselines. These are not permission to expand product scope without a dedicated phase approval.

- public localized app routes under `/:locale/:country`
- supported public locales: `en` and `ar`
- supported public country: `om`
- public catalog/discovery surfaces for doctors, centers, pharmacies, labs, services, and search
- public center detail pages
- public doctor detail pages
- public provider plans/onboarding page at `/:locale/:country/for-providers`
- public articles shell routes at `/:locale/:country/articles` and `/:locale/:country/articles/:slug`
- contact/callback, media, and license display foundations
- public callback request API
- public provider onboarding lead capture API
- provider onboarding form success/error handling baseline
- protected root-level `/admin` baseline
- minimal platform-admin sign-in at `/admin/login` using Supabase Auth magic links and `/auth/callback`
- read-only admin provider onboarding lead list/detail baseline
- admin provider onboarding lead status/priority mutation baseline
