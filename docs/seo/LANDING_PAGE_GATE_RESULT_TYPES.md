# Landing Page Gate Result Types

## 1. Status and Authority

This document is documentation-only for SEO-D3B1. It does not authorize implementation, runtime helpers, query helpers, TypeScript runtime types, database queries, route rendering, visible noindex pages, indexable pages, metadata, canonical tags, hreflang tags, sitemap changes, schema output, robots changes, `llms.txt` changes, CMS records, database imports, seed rows, migrations, API handlers, analytics events, crawlers, background jobs, AI chat, provider dashboard pages, payment logic, monetization logic, sponsored placement, boosts, ranking logic, article pages, branded hospital/clinic pages, Persian/Hindi routes, GCC expansion routes, plural doctor detail routes, medical content, service descriptions, or local area descriptions.

Keyword data remains planning-only. `data/seo/drmuscat-keyword-seed.json` must not be used as a runtime source and must not generate routes, pages, content, CMS records, schema, sitemap entries, metadata, seed rows, database imports, TypeScript runtime data, or medical publication.

Medical content requires human approval before publication. This includes service descriptions, medical explanations, treatment/procedure language, symptom or condition content, safety warnings, disclaimers, AI-search summaries, or any claim that could be interpreted as clinical guidance, pricing, availability, insurance, or outcome information.

If this document conflicts with V10.4 master-spec files, current repository state, route checks, SEO-A, SEO-B, SEO-C, SEO-D docs, addendums, `AGENTS.md`, `README.md`, project-state files, or any stricter guardrail, the stricter guardrail wins.

Future implementation requires separate `PHASED_BUILD_ONLY` tasks with four-axis mapping, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation commands, and human approval checkpoints.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only query-helper contract planning
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3B1

## 3. Why TypeScript Runtime Types Are Not Implemented in SEO-D3B1

TypeScript runtime types are not implemented in SEO-D3B1 because even type-only runtime files would create an importable contract in `src` and could be mistaken for implementation authorization.

SEO-D3B1 does not create:

- `.ts` or `.tsx` runtime files;
- exported landing gate types;
- helper input or output modules;
- query helper modules;
- decision helper modules;
- route imports;
- generated Supabase type changes.

The examples below are planning references only. They have no import path, no runtime module, no API contract, and no route contract.

## 4. Planning-Only Type Examples

The following examples use TypeScript-like syntax for documentation clarity only. They must not be copied into runtime code without a separate approved implementation task.

The examples are intended to document conservative boundaries for future landing page gate results. They do not decide page rendering, noindex rendering, indexability, metadata, sitemap inclusion, schema output, or medical publication.

## 5. `LandingGateStatus` Planning Enum

```ts
type LandingGateStatus =
  | 'not_found'
  | 'noindex_required'
  | 'indexable_later_only'
  | 'blocked'
  | 'unsupported_locale'
  | 'unsupported_country'
  | 'medical_review_required'
  | 'insufficient_public_data'
  | 'helper_unavailable'
  | 'ambiguous_entity';
```

Planning meanings:

| Status | Planning meaning |
| --- | --- |
| `not_found` | Entity, combination, or route state is absent, unsupported, non-public, or unsafe. |
| `noindex_required` | Future visible noindex may be possible only if separately approved; current default remains not rendered. |
| `indexable_later_only` | Inputs may be promising, but indexing is not authorized by this document. |
| `blocked` | Route, data, security, canonical, medical, or compliance condition blocks use. |
| `unsupported_locale` | Locale is outside `en` and `ar`. |
| `unsupported_country` | Country is outside `om`. |
| `medical_review_required` | Medical or local content review is required and incomplete. |
| `insufficient_public_data` | Public data density or exact-combination count is insufficient. |
| `helper_unavailable` | Future helper failed, is unavailable, or cannot safely determine the gate state. |
| `ambiguous_entity` | Slug or entity mapping is ambiguous or conflicts with canonical expectations. |

## 6. `LandingGateReasonCode` Taxonomy

```ts
type LandingGateReasonCode =
  | 'unsupported_locale'
  | 'unsupported_country'
  | 'missing_entity'
  | 'ambiguous_entity'
  | 'insufficient_provider_count'
  | 'insufficient_exact_combination_count'
  | 'missing_visible_intro'
  | 'missing_local_relevance'
  | 'medical_review_missing'
  | 'canonical_conflict'
  | 'private_data_risk'
  | 'forbidden_route_family'
  | 'keyword_runtime_source_forbidden'
  | 'helper_error';
```

Reason codes are planning-only and must be treated as internal machine-readable signals unless a future task explicitly approves public rendering.

## 7. `LandingGateInput` Planning Type

```ts
type LandingGateInput = {
  locale: 'en' | 'ar' | string;
  country: 'om' | string;
  specialtySlug?: string;
  serviceSlug?: string;
  areaSlug?: string;
  limitConfig?: {
    providerCountLimit?: number;
    centerCountLimit?: number;
    exactCombinationCountLimit?: number;
  };
};
```

Input planning rules:

- `locale` is required.
- `country` is required.
- `specialtySlug` is required only for future specialty and specialty-area helper families.
- `serviceSlug` is required only for future service and service-area helper families.
- `areaSlug` is required only for future area, specialty-area, and service-area helper families.
- `limitConfig` may exist only if later approved.
- Any limit config must be bounded, conservative, and fail-closed when invalid.
- Inputs must not come from keyword seed JSON at runtime.

## 8. `LandingGateResult` Planning Type

```ts
type LandingGateResult = {
  status: LandingGateStatus;
  reasons: LandingGateReasonCode[];
  entityExists: boolean;
  entityType:
    | 'specialty'
    | 'specialty_area'
    | 'area'
    | 'service'
    | 'service_area'
    | null;
  providerCount: number;
  centerCount: number;
  exactCombinationCount: number;
  hasUniqueVisibleIntro: boolean;
  hasLocalRelevance: boolean;
  medicalReviewStatus:
    | 'not_required'
    | 'required'
    | 'approved'
    | 'missing';
  canonicalKey: string | null;
  supportedLocale: boolean;
  supportedCountry: boolean;
  usesPrivateData: false;
  sourceTables: string[];
  safeForVisibleNoindex: false;
  safeForIndexing: false;
};
```

The planning result is a gate input summary only. It must not contain SEO copy, medical copy, metadata payloads, schema payloads, sitemap entries, ranking scores, sponsored flags, payment data, or private fields.

## 9. Required Conservative Defaults

Future implementation, if separately approved, must preserve these conservative defaults:

- `usesPrivateData` must be `false`.
- `safeForVisibleNoindex` defaults to `false`.
- `safeForIndexing` defaults to `false`.
- Missing states fail closed.
- Ambiguous states fail closed.
- Error states fail closed.
- Private-risk states fail closed.
- Unsupported locale or country states fail closed.
- Medical-unreviewed states fail closed.
- Unknown counts must not be treated as passing counts.
- Partial helper results must not create public pages.

## 10. Entity Type Planning Values

```ts
type LandingGateEntityType =
  | 'specialty'
  | 'specialty_area'
  | 'area'
  | 'service'
  | 'service_area'
  | null;
```

Planning meanings:

| Entity type | Planning meaning |
| --- | --- |
| `specialty` | Future specialty landing family. |
| `specialty_area` | Future specialty plus area landing family. |
| `area` | Future area landing family. |
| `service` | Future service landing family. |
| `service_area` | Future service plus area landing family. |
| `null` | No valid public entity type was established, or the helper failed closed. |

## 11. Medical Review Status Planning Values

```ts
type MedicalReviewStatus =
  | 'not_required'
  | 'required'
  | 'approved'
  | 'missing';
```

Planning meanings:

| Medical review status | Planning meaning |
| --- | --- |
| `not_required` | No medical review requirement is known for the gate input under a future approved source. |
| `required` | Medical review is required before publication-oriented use. |
| `approved` | Medical review is approved by a separately approved human-reviewed source. |
| `missing` | Medical review status is absent, unavailable, or incomplete and must fail closed. |

Medical review values must not be inferred from keyword demand, provider counts, service existence, specialty existence, or area existence.

## 12. Reason Code Safety

Future reason codes must be:

- machine-readable;
- stable enough for internal tests;
- generic;
- free of raw database errors;
- free of raw Supabase errors;
- free of private context;
- free of admin-only details;
- free of provider-dashboard-only details;
- not public-rendered unless later approved.

Reason codes must not expose private records, security policy details, internal notes, claim evidence, CRM data, billing data, moderation data, or unpublished content.

## 13. Separation from Runtime Code

These type examples are documentation examples only.

They provide:

- no import path;
- no runtime module;
- no API contract;
- no route contract;
- no query helper implementation;
- no decision helper implementation;
- no metadata implementation;
- no sitemap implementation;
- no schema implementation;
- no CMS implementation.

Future implementation may choose stricter or different runtime names if explicitly approved, but must preserve the fail-closed, public-data-only, RLS-safe, and medical-safety boundaries documented here.

## 14. Future Approval Requirements

Future runtime type or helper implementation requires a separate `PHASED_BUILD_ONLY` task with:

- four-axis mapping;
- allowed files;
- forbidden files;
- exact type names and export paths;
- data source authorization;
- route impact;
- RLS/security impact;
- validation commands;
- route-check impact, if any;
- tests, if implementation is approved;
- human approval checkpoint.

No future agent may infer approval from this documentation file.

## 15. Out-of-Scope Items

SEO-D3B1 does not approve or implement:

- runtime helpers;
- query helpers;
- TypeScript runtime types;
- database queries;
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
- local area descriptions.

## 16. Stop Conditions

Future agents must stop and report a blocker instead of guessing when any of the following occurs:

- unclear allowed files or task scope;
- unclear runtime type export path;
- query helper data source ambiguity;
- missing public RLS-safe data path;
- private-data exposure risk;
- proposed service-role use;
- proposed keyword seed runtime use;
- route ambiguity;
- provider or center count uncertainty;
- exact-combination count uncertainty;
- medical review uncertainty;
- canonical or hreflang ambiguity;
- sitemap or schema ambiguity;
- failed validation command;
- missing dependency;
- migration, RLS, or schema conflict.
