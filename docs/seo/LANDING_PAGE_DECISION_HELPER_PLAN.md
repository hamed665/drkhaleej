# Landing Page Decision Helper Plan

## 1. Status and Authority

This document is documentation-only for SEO-D3C1. It does not authorize implementation, runtime helpers, query helpers, TypeScript runtime types, tests, database queries, Supabase access, route rendering, visible noindex pages, indexable pages, metadata, canonical tags, hreflang tags, sitemap changes, schema output, robots changes, `llms.txt` changes, CMS records, database imports, seed rows, migrations, API handlers, analytics events, crawlers, background jobs, AI chat, provider dashboard pages, payment logic, monetization logic, sponsored placement, boosts, ranking logic, article pages, branded hospital/clinic pages, Persian/Hindi routes, GCC expansion routes, plural doctor detail routes, medical content, service descriptions, or local area descriptions.

Keyword data remains planning-only. `data/seo/drmuscat-keyword-seed.json` must not be used as a runtime source and must not generate routes, pages, content, CMS records, schema, sitemap entries, metadata, seed rows, database imports, TypeScript runtime data, tests, or medical publication.

Medical content requires human approval before publication. This includes service descriptions, local area descriptions with healthcare claims, treatment or procedure language, symptom or condition content, safety warnings, disclaimers, AI-search summaries, and any claim that could be interpreted as clinical guidance, pricing, availability, insurance, or outcome information.

If this document conflicts with V10.4 master-spec files, current repository state, route checks, SEO-A, SEO-B, SEO-C, SEO-D documents, V10.5 addendums, `AGENTS.md`, `README.md`, project-state files, or any stricter guardrail, the stricter guardrail wins.

Future implementation requires separate `PHASED_BUILD_ONLY` tasks with four-axis mapping, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation commands, and human approval checkpoints. No future agent may infer runtime authorization from this documentation-only plan.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only pure decision-helper planning
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3C1

## 3. Relationship to SEO-D3A and SEO-D3B1

SEO-D3A documented future landing page noindex and query-helper planning while preserving the current SEO-D2 fail-closed route scaffold behavior.

SEO-D3B1 documented a future landing page query-helper contract and planning-only gate result type examples. SEO-D3B1 explicitly withheld runtime helper authorization, query helper authorization, TypeScript runtime type authorization, database query authorization, route rendering authorization, visible noindex page authorization, indexable page authorization, metadata/canonical/hreflang authorization, sitemap/schema/robots/`llms.txt` authorization, keyword runtime use, and medical content publication.

SEO-D3C1 narrows the next planning layer to a future pure decision helper. It does not supersede SEO-D3A or SEO-D3B1. It adds no runtime contract and creates no import path. It only documents how a future deterministic decision helper could be evaluated if a later phase separately approves implementation.

## 4. Why the Decision Helper Is Not Implemented in SEO-D3C1

The decision helper is not implemented in SEO-D3C1 because even a pure helper would introduce an importable runtime module, runtime type names, test expectations, and possible downstream route integration assumptions.

SEO-D3C1 therefore does not create or modify:

- `src/lib/seo/landing-page-indexability.ts`;
- `src/lib/seo/landing-page-indexability.test.ts`;
- `src/lib/catalog/public-landing-page-queries.ts`;
- route files under `src/app`;
- TypeScript runtime type files;
- query helper files;
- generated Supabase types;
- migrations;
- route checks;
- sitemap, robots, or `llms.txt` files;
- schema or metadata helpers;
- tests.

Future implementation must be split into separately approved phases.

## 5. Current SEO-D2 Fail-Closed Contract

SEO-D2 scaffold routes now exist for:

- `src/app/[locale]/[country]/centers/[specialtySlug]/page.tsx`
- `src/app/[locale]/[country]/centers/[specialtySlug]/[areaSlug]/page.tsx`
- `src/app/[locale]/[country]/areas/[areaSlug]/page.tsx`
- `src/app/[locale]/[country]/services/[serviceSlug]/page.tsx`
- `src/app/[locale]/[country]/services/[serviceSlug]/[areaSlug]/page.tsx`

All current SEO-D2 scaffold pages must remain fail-closed. They:

- validate locale and country;
- call `notFound()`;
- render no indexable content;
- emit no schema;
- emit no canonical or hreflang metadata;
- import no keyword seed data;
- import no private, admin, provider-dashboard, or service-role data.

SEO-D3C1 does not change route behavior.

## 6. Pure Decision Helper Purpose Boundaries

A future pure decision helper may be considered only as an internal gate evaluation function. It must not gather data, render pages, generate content, or publish SEO signals.

A future helper, if separately approved, must preserve these boundaries:

- accepts explicit inputs only;
- no Supabase;
- no database queries;
- no file reads;
- no keyword JSON imports;
- no route rendering;
- no metadata output;
- no canonical output;
- no hreflang output;
- no schema output;
- no sitemap output;
- no robots output;
- no `llms.txt` output;
- no content generation;
- no medical guidance;
- no ranking logic;
- no boost logic;
- no sponsored placement logic;
- no payment, monetization, entitlement, or referral logic.

The helper must only transform explicit, already-supplied, public-safe gate inputs into a deterministic internal result.

## 7. Proposed Future Helper Name

Recommended future name:

```ts
decideLandingPageGate(...)
```

This is safer than `decideLandingPageIndexability(...)` because the word `indexability` can be misread as authorizing indexing. The future helper must not make a page currently indexable. Even a successful future result should return `indexable_later_only` with `safeForIndexing: false` until a separate route/indexing phase explicitly approves page rendering, metadata, sitemap behavior, and publication.

`decideLandingPageGate(...)` better communicates that the function is an internal gate decision helper, not an indexing publisher, route renderer, metadata generator, or sitemap eligibility engine.

## 8. Proposed Input Contract

The following TypeScript-like shape is planning-only. It is not a runtime type declaration and must not be copied into `src` without a separate approved implementation task.

```ts
type LandingPageGateFamily =
  | 'specialty'
  | 'specialty_area'
  | 'area'
  | 'service'
  | 'service_area';

type MedicalReviewStatus =
  | 'not_required'
  | 'required'
  | 'approved'
  | 'missing';

type LandingPageGateInput = {
  locale: string;
  country: string;
  family: LandingPageGateFamily;
  entityExists: boolean;
  providerCount: number;
  centerCount: number;
  exactCombinationCount: number;
  hasUniqueVisibleIntro: boolean;
  hasLocalRelevance: boolean;
  medicalReviewStatus: MedicalReviewStatus;
  canonicalIsUnique: boolean;
  privateDataExcluded: boolean;
  helperAvailable: boolean;
  entityIsAmbiguous: boolean;
  routeFamilyAllowed: boolean;
};
```

Input planning rules:

- `locale` is required and must fail closed when unsupported.
- `country` is required and must fail closed when unsupported.
- `family` must be one of the approved planning families.
- Entity existence must be supplied explicitly; the helper must not look up slugs.
- Counts must be supplied explicitly; the helper must not query counts.
- Review, canonical, private-data, availability, ambiguity, and route-family signals must be supplied explicitly.
- Inputs must not come from keyword seed JSON at runtime.
- Inputs must not include private records, raw database errors, raw Supabase errors, unpublished notes, claim evidence, billing data, CRM data, or provider-dashboard-only context.

## 9. Proposed Output Contract

The following TypeScript-like shape is planning-only. It is not a runtime type declaration and does not authorize exported TypeScript types.

```ts
type LandingPageGateResult = {
  status: LandingPageGateStatus;
  reasons: LandingPageGateReasonCode[];
  safeForVisibleNoindex: false;
  safeForIndexing: false;
};
```

Output planning rules:

- `status` must be one stable machine-readable status.
- `reasons` must be deterministic and machine-readable.
- `safeForVisibleNoindex` must default to `false` and remain `false` unless a later approved phase explicitly changes the contract.
- `safeForIndexing` must default to `false` and remain `false` unless a later approved phase explicitly changes the contract.
- The output must not contain SEO copy, medical copy, metadata payloads, canonical payloads, hreflang payloads, schema payloads, sitemap entries, robots rules, `llms.txt` content, ranking scores, sponsored flags, payment data, or private fields.

## 10. Status Values

Planning-only future status values:

| Status | Planning meaning |
| --- | --- |
| `not_found` | Entity, combination, or route state is absent, unsupported, non-public, or unsafe. |
| `noindex_required` | Future visible noindex may be possible only if separately approved; SEO-D3C1 does not authorize visible noindex pages. |
| `indexable_later_only` | Inputs may be promising, but the page is not currently indexable and no indexing behavior is authorized. |
| `blocked` | Route, data, security, canonical, medical, or compliance condition blocks use. |
| `unsupported_locale` | Locale is outside the approved `en` and `ar` launch locales. |
| `unsupported_country` | Country is outside the approved `om` launch country. |
| `medical_review_required` | Medical or local content review is required and incomplete. |
| `insufficient_public_data` | Public data density, exact-combination count, or visible quality signal is insufficient. |
| `helper_unavailable` | Future helper failed, is unavailable, received invalid input, or cannot safely determine gate state. |
| `ambiguous_entity` | Entity mapping is ambiguous or conflicts with canonical expectations. |

## 11. Reason Code Values

Planning-only future reason code values:

| Reason code | Planning meaning |
| --- | --- |
| `unsupported_locale` | Locale is not approved for public SEO use. |
| `unsupported_country` | Country is not approved for public SEO use. |
| `missing_entity` | Required public entity or combination was not established. |
| `ambiguous_entity` | Entity or route intent is ambiguous. |
| `insufficient_provider_count` | Provider count is below the future family threshold. |
| `insufficient_center_count` | Center count is below the future family threshold. |
| `insufficient_exact_combination_count` | Exact entity-location or entity-combination count is below the future family threshold. |
| `missing_visible_intro` | Unique visible introductory content is not available from an approved source. |
| `missing_local_relevance` | Local relevance signal is missing for a local landing family. |
| `medical_review_missing` | Required human medical review is missing or incomplete. |
| `canonical_conflict` | Canonical uniqueness is not established. |
| `private_data_risk` | Private data exclusion is not established. |
| `forbidden_route_family` | Route family is blocked or not approved for the helper context. |
| `helper_error` | Helper cannot safely evaluate because an input is invalid, missing, or unavailable. |

## 12. Deterministic Status Priority Rules

Future implementation, if separately approved, should evaluate statuses in this exact conservative order:

1. Unsupported locale before content gates.
   - Unsupported locale returns `unsupported_locale` with `unsupported_locale`.
2. Unsupported country before content gates.
   - Unsupported country returns `unsupported_country` with `unsupported_country`.
3. Forbidden route, private data, and canonical conflict before data sufficiency.
   - `routeFamilyAllowed !== true` returns `blocked` with `forbidden_route_family`.
   - `privateDataExcluded !== true` returns `blocked` with `private_data_risk`.
   - `canonicalIsUnique !== true` returns `blocked` with `canonical_conflict`.
4. Helper unavailable and ambiguous entity fail closed.
   - `helperAvailable !== true` returns `helper_unavailable` with `helper_error`.
   - `entityIsAmbiguous === true` returns `ambiguous_entity` with `ambiguous_entity`.
5. Missing entity returns `not_found`.
   - `entityExists !== true` returns `not_found` with `missing_entity`.
6. Invalid counts fail closed.
   - Missing, undefined, `NaN`, non-finite, non-number, or negative counts return a fail-closed status with stable count or helper error reasons.
7. Medical review missing before indexability.
   - `required`, `missing`, unknown, or invalid medical review status returns `medical_review_required` with `medical_review_missing`.
8. Insufficient public data before noindex or indexable planning.
   - Count, intro, or local relevance failures return `insufficient_public_data` with the relevant reason codes.
9. Successful gate returns `indexable_later_only`, not currently indexable.
   - A successful future result must still return `safeForVisibleNoindex: false` and `safeForIndexing: false`.

`indexable_later_only` must never mean currently indexable. It only means a future route publication phase may evaluate the candidate again under separately approved rendering, metadata, canonical, sitemap, schema, and medical review rules.

## 13. Reason Code Generation Rules

Future reason codes must be:

- deterministic;
- machine-readable;
- stable for tests;
- generic;
- free of raw database errors;
- free of raw Supabase errors;
- free of private context;
- free of admin-only details;
- free of provider-dashboard-only details;
- free of unpublished content details;
- not public-rendered unless later approved.

Reason codes must not include slugs, UUIDs, provider names, center names, patient data, private notes, claim evidence, CRM data, billing data, moderation data, security policy internals, raw exception messages, or raw database/Supabase error payloads.

## 14. Family-Specific Threshold Planning

Thresholds below are planning concepts only. Exact threshold numbers are not approved in SEO-D3C1 and must be defined in a later approved implementation task before code is written.

### Specialty

Future `specialty` gate planning may require:

- `entityExists: true`;
- provider count meeting a conservative specialty threshold;
- center count meeting a conservative center-oriented threshold when the family is center-oriented;
- `hasUniqueVisibleIntro: true` from an approved source;
- medical review approved or explicitly not required by an approved source;
- `canonicalIsUnique: true`;
- `privateDataExcluded: true`.

### Specialty + area

Future `specialty_area` gate planning may require:

- `entityExists: true`;
- exact specialty-area combination count meeting a conservative threshold;
- provider count meeting a conservative specialty-area threshold;
- center count meeting a conservative specialty-area threshold;
- `hasLocalRelevance: true`;
- `hasUniqueVisibleIntro: true`;
- medical review approved or explicitly not required by an approved source;
- `canonicalIsUnique: true`;
- `privateDataExcluded: true`.

### Area

Future `area` gate planning may require:

- `entityExists: true`;
- provider or center count meeting a conservative area threshold;
- `hasLocalRelevance: true`;
- `hasUniqueVisibleIntro: true`;
- medical review approved or explicitly not required if healthcare claims are present;
- `canonicalIsUnique: true`;
- `privateDataExcluded: true`.

### Service

Future `service` gate planning may require:

- `entityExists: true`;
- provider count meeting a conservative service threshold;
- center count meeting a conservative service threshold;
- `hasUniqueVisibleIntro: true`;
- medical review approved unless an approved source explicitly marks review as not required;
- `canonicalIsUnique: true`;
- `privateDataExcluded: true`.

### Service + area

Future `service_area` gate planning may require:

- `entityExists: true`;
- exact service-area combination count meeting a conservative threshold;
- provider count meeting a conservative service-area threshold;
- center count meeting a conservative service-area threshold;
- `hasLocalRelevance: true`;
- `hasUniqueVisibleIntro: true`;
- medical review approved unless an approved source explicitly marks review as not required;
- `canonicalIsUnique: true`;
- `privateDataExcluded: true`.

## 15. Conservative Defaults

Future implementation, if separately approved, must preserve these conservative defaults:

- `safeForVisibleNoindex` is `false` by default.
- `safeForIndexing` is `false` by default.
- Missing counts fail closed.
- Undefined counts fail closed.
- `NaN` counts fail closed.
- Non-finite counts fail closed.
- Negative counts fail closed.
- Unknown medical review status fails closed.
- Unsupported locale fails closed.
- Unsupported country fails closed.
- `privateDataExcluded` must be exactly `true` to proceed.
- `routeFamilyAllowed` must be exactly `true` to proceed.
- `canonicalIsUnique` must be exactly `true` to proceed.
- `helperAvailable` must be exactly `true` to proceed.
- Ambiguous states fail closed.
- Partial states fail closed.
- Error states fail closed.
- Private-risk states fail closed.
- Keyword-derived runtime states fail closed.

## 16. Future Test Matrix

Future tests are not authorized in SEO-D3C1. If separately approved in SEO-D3C3, unit tests should cover:

| Test case | Expected planning result |
| --- | --- |
| Unsupported locale | `unsupported_locale`, `unsupported_locale`, safety flags false. |
| Unsupported country | `unsupported_country`, `unsupported_country`, safety flags false. |
| Route family forbidden | `blocked`, `forbidden_route_family`, safety flags false. |
| Private data risk | `blocked`, `private_data_risk`, safety flags false. |
| Canonical conflict | `blocked`, `canonical_conflict`, safety flags false. |
| Helper unavailable | `helper_unavailable`, `helper_error`, safety flags false. |
| Ambiguous entity | `ambiguous_entity`, `ambiguous_entity`, safety flags false. |
| Missing entity | `not_found`, `missing_entity`, safety flags false. |
| Insufficient provider count | `insufficient_public_data`, `insufficient_provider_count`, safety flags false. |
| Insufficient center count | `insufficient_public_data`, `insufficient_center_count`, safety flags false. |
| Insufficient exact combination count | `insufficient_public_data`, `insufficient_exact_combination_count`, safety flags false. |
| Missing visible intro | `insufficient_public_data`, `missing_visible_intro`, safety flags false. |
| Missing local relevance | `insufficient_public_data`, `missing_local_relevance`, safety flags false. |
| Medical review missing | `medical_review_required`, `medical_review_missing`, safety flags false. |
| Successful gate | `indexable_later_only`, no blocking reasons, `safeForIndexing: false`. |
| Invalid count handling | Fail closed with deterministic count/helper reason. |
| Priority stability | Multiple failures return the highest-priority status consistently. |

Tests must not query the database, use Supabase, render routes, generate metadata, inspect sitemap output, import keyword JSON, or create public pages.

## 17. Medical Safety Behavior

Medical safety is a blocking gate, not a content generation feature.

Future helper implementation, if separately approved, must:

- never generate medical explanations;
- never generate treatment or procedure content;
- never generate symptom or condition guidance;
- never generate safety warnings or disclaimers;
- never infer medical approval from provider counts, center counts, service existence, specialty existence, area existence, keyword demand, or route existence;
- fail closed when `medicalReviewStatus` is `required`, `missing`, unknown, invalid, or unavailable;
- accept `approved` only when supplied by a separately approved human-reviewed source;
- accept `not_required` only when supplied by a separately approved source.

Human approval is required before publication of medical content, local healthcare claims, AI-search summaries, or any clinical, pricing, availability, insurance, or outcome claim.

## 18. AI-search / GEO Constraints

The future helper must not create AI-search content, GEO content, hidden AI-only content, summaries, citations, answer-engine payloads, `llms.txt` entries, structured data, or schema output.

AI-search and GEO planning must remain based on visible, approved, public information only. The helper must not:

- create AI diagnosis;
- create AI treatment advice;
- create AI chat behavior;
- create symptom checker behavior;
- generate hidden LLM-only copy;
- derive public route eligibility from keyword demand;
- expand to Persian, Hindi, or GCC route targets;
- publish medical or local content without human approval.

## 19. Route Integration Constraints

SEO-D3C1 does not authorize route integration.

Future route integration, if separately approved, must:

- target one route family only;
- preserve locale/country validation;
- define route impact before editing;
- define data source authorization before editing;
- define noindex/index behavior before editing;
- define metadata, canonical, and hreflang behavior before editing;
- define sitemap, schema, robots, and `llms.txt` impact before editing;
- define medical, branded, and compliance review requirements before editing;
- update route checks only if explicitly approved;
- stop on route ambiguity.

No future task may use this document to add broad programmatic pages, route rendering, provider lists, service descriptions, local area descriptions, metadata, sitemap entries, schema output, or visible noindex pages.

## 20. Sitemap / Schema / Robots / llms.txt Constraints

SEO-D3C1 does not authorize any crawler-facing behavior.

Future helper implementation must not:

- add sitemap entries;
- compute sitemap eligibility;
- emit schema;
- emit JSON-LD;
- modify robots behavior;
- modify `llms.txt`;
- generate canonical URLs;
- generate hreflang alternates;
- generate Open Graph metadata;
- generate Twitter/social metadata;
- generate `generateMetadata` output;
- generate `generateStaticParams` output.

Sitemap, schema, robots, and `llms.txt` changes require separate approval with explicit route impact, indexability rules, canonical/hreflang strategy, validation, and human approval.

## 21. Route-Check / Validation Needs for Future Tasks

For SEO-D3C1 documentation-only implementation, expected validation commands are:

```bash
git status --short
test -f docs/seo/LANDING_PAGE_DECISION_HELPER_PLAN.md && echo "SEO-D3C1 doc exists"
pnpm env:check
pnpm db:validate:migrations
pnpm test:db:rls
pnpm routes:check
pnpm typecheck
pnpm build
pnpm lint
```

If a future pure helper file is separately approved, validation should include at minimum:

```bash
git status --short
pnpm typecheck
pnpm build
pnpm lint
pnpm routes:check
```

Future route-check additions may be needed to confirm that an approved pure helper does not import Supabase, database clients, query helpers, keyword seed JSON, filesystem APIs, admin/provider/private modules, metadata helpers, schema helpers, sitemap files, robots files, or route files.

No validation command may be faked or skipped silently. `pnpm lint` may show warnings only, but must have no errors.

## 22. Future Implementation Split

Future work should be split conservatively:

1. `SEO-D3C2` — pure type plus decision helper implementation only.
   - May create a pure helper only if separately approved.
   - Must not query data, render routes, generate metadata, or create tests unless included in scope.
2. `SEO-D3C3` — unit tests for decision helper only.
   - Must test deterministic explicit-input behavior only.
   - Must not query database or render routes.
3. `SEO-D3D` — public query helper implementation only if separately approved.
   - Must be public-data-only, SELECT-only, RLS-safe, and separate from the pure decision helper.
4. `SEO-D3E` — route integration for one family only.
   - Must be separately approved with route impact, noindex/index rules, metadata rules, sitemap/schema/robots/`llms.txt` impact, validation, and human approval.

No phase may combine broad query helper implementation, route rendering, metadata, sitemap changes, schema output, and programmatic page generation without explicit separate approval.

## 23. Out-of-Scope Items

SEO-D3C1 does not approve or implement:

- runtime helpers;
- query helpers;
- TypeScript runtime types;
- tests;
- database queries;
- Supabase imports or usage;
- route rendering;
- visible noindex pages;
- indexable pages;
- metadata, canonical, or hreflang output;
- `generateMetadata`;
- `generateStaticParams`;
- sitemap changes;
- robots changes;
- `llms.txt` changes;
- schema output;
- CMS records;
- database imports;
- seed rows;
- migrations;
- API handlers;
- analytics events;
- crawlers;
- background jobs;
- AI chat;
- provider dashboard pages;
- payment, monetization, sponsored placement, boost, or ranking logic;
- article pages;
- branded hospital/clinic pages;
- Persian/Hindi routes;
- GCC expansion routes;
- plural doctor detail routes;
- runtime keyword seed JSON use;
- medical content;
- service descriptions;
- local area descriptions;
- modifications to existing SEO docs other than this new documentation file;
- modifications to `src`, `scripts`, `supabase`, `data/seo`, `package.json`, master specs, project-state docs, or addendums.

## 24. Stop Conditions and Human Approval Requirements

Future agents must stop and report a blocker instead of guessing when any of the following occurs:

- unclear allowed files or task scope;
- unclear four-axis mapping;
- unclear runtime type export path;
- unclear helper name or import path;
- query helper data source ambiguity;
- proposed Supabase usage in the pure helper;
- proposed database access in the pure helper;
- proposed filesystem access in the pure helper;
- proposed keyword seed runtime use;
- missing public RLS-safe data path for any future query helper;
- private-data exposure risk;
- route ambiguity;
- unsupported locale or country ambiguity;
- provider or center count uncertainty;
- exact-combination count uncertainty;
- medical review uncertainty;
- canonical or hreflang ambiguity;
- sitemap, schema, robots, or `llms.txt` ambiguity;
- metadata ambiguity;
- failed validation command;
- missing dependency;
- migration, RLS, or schema conflict;
- request to create visible noindex or indexable pages without explicit approval;
- request to publish medical, service, or local copy without human approval.

Human approval is required before any future implementation that affects runtime helpers, route rendering, public page output, metadata, sitemap/schema/robots/`llms.txt`, medical content, branded pages, articles, Persian/Hindi routes, GCC expansion, plural doctor detail routes, database access, RLS/security behavior, CMS records, seed rows, or migrations.
