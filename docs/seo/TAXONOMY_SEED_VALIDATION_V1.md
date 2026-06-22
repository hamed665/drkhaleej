# Taxonomy Seed Validation V1

## Purpose

This document defines the Prompt 3 taxonomy validation and seed-preparation layer for the Master Taxonomy Registry V1 under `src/config/taxonomy/`.

This PR does not make taxonomy data public. It prevents invalid, inconsistent, or embarrassing taxonomy records from becoming database seed data or public UI labels in later prompts.

## Four-axis mapping

- Execution Phase: Phase 3 — Public SEO Platform preparation only
- Lock Scope: Taxonomy seed-readiness validation only
- Product Module: SEO taxonomy/content planning support
- Subphase ID: `TAX-SEED-VALIDATION-V1`

## What is validated

The validator checks the static registry families:

- verticals
- entity types
- doctor levels
- specialties
- services
- schema hints

Validation covers duplicate slugs, cross-registry references, schema hint references, excluded/deferred vertical guardrails, pet-clinic/shop hybrid mapping, and required semantic healthcare mappings for physiotherapy, counseling, women’s health, IVF/fertility, and dental services.

## Arabic label QA rules

Arabic QA blocks registry records when:

- `labelAr` is empty.
- `labelAr` equals `labelEn`, except approved acronyms and acronym-style labels such as `MRI`, `CT`, `CT Scan`, `IVF`, `ICSI`, `CBC`, `HbA1c`, `ECG`, `OPG`, and `CBCT`.
- `labelAr` contains known machine-like fragments such as `صحة المرأة الصحة`, `حمل متابعة متابعة`, `دم اختبار`, or `مفتوح رنين مغناطيسي`.
- a non-acronym Arabic label is mostly Latin letters.
- a label contains placeholder text from planning scaffolds.
- `descriptionAr` is empty or English-only.
- a non-acronym Arabic label is suspiciously short.
- adjacent Arabic words are duplicated.

## Why machine-like Arabic is blocked

Taxonomy labels are seed candidates and future public UI labels. Broken word-by-word translations can damage trust, search quality, provider confidence, and Arabic user experience. This layer intentionally fails fast before taxonomy records can be exported for seed review or reused by future public rendering work.

## Seed-ready JSON contents

The export script writes `data/taxonomy/master-taxonomy-seed.json` with this shape:

```json
{
  "version": "v1",
  "generatedFrom": "src/config/taxonomy",
  "registries": {
    "verticals": [],
    "entityTypes": [],
    "doctorLevels": [],
    "specialties": [],
    "services": [],
    "schemaHints": []
  }
}
```

Registry arrays are sorted by slug in ascending English locale order. This makes the output deterministic for review diffs and future seed-preparation work.

The JSON is seed-ready as a static artifact only. It is not SQL and is not applied to Supabase.

## What this PR does not do

This validation/export layer does not:

- add Supabase migrations
- change Supabase schema
- change RLS policies
- generate SQL seed files
- apply seed rows
- read or write the database
- read `.env`
- fetch remote data
- call AI or translation APIs
- change public routes, admin routes, rendering, metadata, JSON-LD, sitemap, robots, or `llms.txt`
- implement import workflows, QA gates, internal linking, local pages, service pages, provider dashboards, payments, or commercial features

## How to run

```bash
pnpm taxonomy:validate
pnpm taxonomy:export
```

The export script validates first and refuses to write the seed JSON if validation fails.

## Prompt 4 usage

Prompt 4+ work should treat `src/config/taxonomy/` as the reviewed source registry and `data/taxonomy/master-taxonomy-seed.json` as the deterministic review artifact. Future SQL seed generation must start from the exported JSON only after human review confirms labels, descriptions, mappings, and seed eligibility.

## Human review still required

Before any database seed or public UI usage, humans must still review:

- Arabic labels and descriptions for local Oman/GCC tone
- medical sensitivity and regulatory suitability
- final seed inclusion/exclusion decisions
- public display readiness
- route, metadata, JSON-LD, internal linking, and indexability plans in separately approved prompts

This PR is a safety layer only; it does not publish or activate the taxonomy.
