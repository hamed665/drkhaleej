# SEO-D3H3D-A — Local Relevance Source Decision Map

## 1. Status and Authority

This document is documentation-only for SEO-D3H3D-A. It records a conservative future local relevance source policy for DrMuscat area-bearing landing page families.

This document does not authorize SQL, migrations, RLS implementation, generated database type changes, Supabase usage, service-role usage, data-bearing query helpers, route integration, route-check changes, metadata, `generateMetadata`, `generateStaticParams`, canonical tags, hreflang tags, Open Graph output, sitemap changes, schema output, robots changes, `llms.txt` changes, visible noindex pages, indexable pages, CMS UI, API handlers, seed rows, crawler behavior, analytics/background jobs, public UI, provider listings, center listings, landing content, medical content, service descriptions, specialty descriptions, local area descriptions, content generation, keyword seed runtime usage, payment logic, monetization logic, sponsored placement, ranking, referral, commission, entitlement, or plan logic.

Future implementation requires a separate approved `PHASED_BUILD_ONLY` task with explicit four-axis mapping, allowed files, forbidden files, database/RLS impact, route impact, SEO/crawler impact, validation commands, and human approval. If this document conflicts with `AGENTS.md`, `README.md`, project-state files, V10.4 master-spec files, V10.5 addendums, SEO-D3H3D, SEO-D3H3C-A, SEO-D3H3B-A, SEO-D3H3A, SEO-D3H2, existing helper contracts, existing route checks, or stricter SEO/security guardrails, the stricter guardrail wins.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / local relevance source documentation-only decision map
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D3H3D-A

## 3. Relationship to Prior Phases

### SEO-D3H3D Plan

SEO-D3H3D was a PLAN ONLY task. It concluded that DrMuscat needs a conservative local relevance source policy before any area-bearing landing page, data-bearing landing query helper, visible noindex page, indexable page, metadata, sitemap, schema, crawler behavior, or local content work.

SEO-D3H3D-A implements only this documentation artifact. It does not create runtime behavior or public content.

### SEO-D3H3C-A Landing Content RLS Decision Map

SEO-D3H3C-A concluded that a future public helper may expose derived booleans/status only and must not expose draft, review, admin, internal, or raw content fields. It also concluded that the helper must fail closed on unresolved local relevance and that no RLS implementation or helper integration is approved yet.

SEO-D3H3D-A preserves those boundaries. It does not implement RLS and does not create a public-safe projection.

### SEO-D3H3B-A Landing Content Migration Decision Map

SEO-D3H3B-A documented a conservative future migration direction for landing content, but it deferred local relevance details to SEO-D3H3D. It did not authorize a landing content migration, generated types, helper changes, route integration, or public rendering.

SEO-D3H3D-A fills the local relevance planning gap only as documentation. It does not alter any migration plan.

### SEO-D3H3A Landing Content Review Model Decision Map

SEO-D3H3A concluded that `hasLocalRelevance` cannot be inferred from slugs, counts, provider density, area names, city names, service names, specialty names, generated text, keyword seeds, provider copy, reviews, or media captions. It also concluded that local relevance needs an approved source tied to canonical identity.

SEO-D3H3D-A makes that policy explicit for the affected area-bearing landing families.

### SEO-D3H2 Area Canonicalization

SEO-D3H2 concluded that `areaSlug` alone is not a canonical area identity because current `geo_areas.slug` uniqueness is scoped by `city_id`. Area-bearing routes must remain fail-closed until city-context routing, a canonical area key, or another separately approved canonical identity model exists.

SEO-D3H3D-A depends on that conclusion. Local relevance cannot become true until area identity is canonical.

### SEO-D3H1 Blocker Resolution

SEO-D3H1 concluded that no further route integration and no data-bearing public landing query helper should proceed until blocker resolution occurs. SEO-D3H3D-A records one blocker class: unresolved local relevance source policy.

### SEO-D3F2 / SEO-D3E2 Fail-Closed Routes

SEO-D3E2 integrated the service scaffold route only in a fail-closed manner. SEO-D3F2 integrated the service-area scaffold route only in a fail-closed manner. Both selected routes validate locale/country, pass fail-closed gate input into the decision helper, and still end in `notFound()`.

SEO-D3H3D-A does not alter either route.

### SEO-D3D2B Skeleton Helper

SEO-D3D2B introduced the skeleton landing gate helper. All landing helpers currently return fail-closed output with no database queries, no Supabase usage, no source tables, no content payload, `hasLocalRelevance: false`, `hasUniqueVisibleIntro: false`, `medicalReviewStatus: 'missing'`, `canonicalIsUnique: false`, and `helperAvailable: false`.

SEO-D3H3D-A does not change the skeleton helper.

### Decision Helper

The decision helper remains a pure evaluator over supplied gate input. It does not fetch, canonicalize, publish, render, create crawler signals, or expose content. It currently requires local relevance for area-bearing families and keeps `safeForVisibleNoindex` and `safeForIndexing` false.

SEO-D3H3D-A does not change the decision helper.

### Route-Check Guardrails

Current route-check guardrails protect the fail-closed posture by checking selected route integrations, route absence/shape expectations, forbidden runtime/crawler/content tokens, skeleton helper behavior, and sitemap exclusion. SEO-D3H3D-A does not authorize route-check changes.

## 4. Current Blocker Posture

- No approved local relevance source exists.
- No dedicated landing content table exists.
- No SQL or migration is authorized by this document.
- No RLS implementation is authorized by this document.
- The skeleton helper remains fail-closed.
- `hasLocalRelevance` remains `false`.
- Public helpers cannot expose local relevance payloads.
- No route, crawler, metadata, sitemap, schema, robots, `llms.txt`, visible noindex, indexable page, or public rendering change is authorized.
- Area canonicalization still blocks area-bearing publishability.
- The local relevance source remains unresolved at runtime.

## 5. Current Repo Evidence and Source Inventory

### 5.1 Geography: `geo_countries`, `geo_cities`, and `geo_areas`

Current geo schema provides country, city, and area records with localized names, active/deleted flags, and scoped slug constraints. `geo_countries.slug` is unique. `geo_cities.slug` is unique only by `country_id`. `geo_areas.slug` is unique only by `city_id`.

#### Area name / city name

Area and city names are not sufficient as local relevance sources. They are geographic labels, not reviewed page-specific evidence. They do not prove that an area-bearing landing page has specific healthcare relevance, unique public content, editorial approval, medical approval or explicit non-medical classification, or safe public helper projection.

#### `areaSlug` / `citySlug`

Slugs are not sufficient as local relevance sources. `areaSlug` alone is especially unsafe because area slug uniqueness is scoped by city, not by country or globally. Even a future city slug can only help resolve identity; it still does not prove reviewed local relevance.

### 5.2 Taxonomy: `services` and `specialties`

Current taxonomy tables include names, descriptions, medical flags, active/deleted fields, and related metadata.

#### Service descriptions

Service descriptions are not sufficient. They describe taxonomy/service concepts, not a specific local page for a resolved area. They must not be reused as proof of local relevance for `service_area` pages.

#### Specialty descriptions

Specialty descriptions are not sufficient. They describe specialty taxonomy, not an area-specific healthcare context. They must not be reused as proof of local relevance for `specialty_area` pages.

### 5.3 Providers and Relationships: `centers`, `doctors`, `center_services`, and `doctor_services`

Current provider tables include center descriptions, doctor bios, service relationship rows, status fields, active/deleted fields, availability fields, and relationship references.

#### Provider counts

Provider counts are not sufficient. Counts may support a future density gate, but they do not prove reviewed local relevance, content uniqueness, canonical identity, editorial approval, medical review, or public-safe content handling.

#### Center counts

Center counts are not sufficient. Counts may support a future density gate, but they do not prove that a local landing page has meaningful, reviewed, area-specific value.

#### Center descriptions

Center descriptions are not sufficient. They are provider profile copy, not landing-local evidence tied to a canonical area-bearing landing identity.

#### Doctor descriptions

Doctor bios and descriptions are not sufficient. They are provider profile copy, not landing-local evidence tied to a canonical area-bearing landing identity.

#### `center_services` and `doctor_services` descriptions

Relationship-level service descriptions are not sufficient. They may describe provider-specific service availability or display text, but they do not prove a reviewed local landing page source.

### 5.4 Reviews

Current reviews include target relationships, ratings, title/body fields, verification/feature flags, approval status, and deleted state.

Reviews are not sufficient as local relevance sources. Approved reviews may be public-safe in their own context, but they are user/provider-level evidence, not a controlled editorial source for local landing relevance. Reviews may also contain claims, private context, or subjective opinions that should not be collapsed into a landing page local relevance boolean.

### 5.5 Media: `media_assets` and `entity_media`

Current media assets and entity media include media status, entity attachment, alt text, captions, usage kind, visibility, media review status, deleted state, and public media hardening fields.

Media captions and alt text are not sufficient. They support image accessibility and media display, not canonical local landing relevance. Media review approval is not the same as editorial/medical approval for landing-local claims.

### 5.6 Keyword Seed JSON

Keyword seed JSON is not sufficient and must not be used at runtime. Keyword planning data must not generate routes, pages, content, CMS records, schema, sitemap entries, metadata, seed rows, database imports, TypeScript runtime data, or medical publication.

### 5.7 Generated Copy

Generated copy is not sufficient and must not be used as an approved local relevance source. It lacks default human editorial and medical approval, risks hallucinated/local medical claims, and can create thin or duplicated SEO pages.

### 5.8 Future `landing_page_contents` Sections

A future `landing_page_contents` model could be sufficient only if it includes an explicitly reviewed local relevance section or equivalent field tied to canonical landing identity, publication state, editorial approval, medical approval or explicit non-medical classification, and public-safe RLS/projection rules.

This is the preferred first-version source model if later approved, but this document does not create that table or field.

### 5.9 Possible Future `landing_local_relevance` Table

A separate future `landing_local_relevance` table could be sufficient only if it includes canonical identity, lifecycle state, editorial review, medical review or explicit non-medical classification, uniqueness constraints, RLS policy design, and helper-safe projection rules.

This option is more complex than embedding a reviewed section in `landing_page_contents` and should be deferred unless the integrated model proves insufficient.

## 6. Definition of Local Relevance

For future gate helpers, `hasLocalRelevance` means there is approved, reviewed, public-safe evidence that a requested area-bearing landing page has specific local relevance.

The evidence must be:

- approved and reviewed;
- public-safe under future RLS/projection rules;
- tied to the canonical landing identity;
- tied to resolved canonical area identity for area-bearing families;
- specific to the requested family, entity, and area context;
- not generic service, specialty, provider, taxonomy, area, or city text;
- not inferred from counts, slugs, names, provider density, center density, keyword data, route existence, or generated copy;
- safe for a public helper to reduce to a boolean/status without exposing raw content.

`hasLocalRelevance` is a gate signal, not content. A true value should never imply that routes, metadata, sitemap, schema, robots, `llms.txt`, visible noindex behavior, or indexable publication are authorized.

## 7. Affected Families

| Family | Local relevance required | Required canonical identity | Required content/review state | Medical/editorial review dependency | Fail-closed default |
| --- | --- | --- | --- | --- | --- |
| `area` | Yes | Supported country plus resolved city/area identity, or an approved canonical area key model | Future published reviewed local relevance source tied to the area landing identity | Editorial review always; medical review if claims are medical; explicit non-medical classification required for `not_required` | `hasLocalRelevance: false`; publishability blocked |
| `service_area` | Yes | Canonical service identity plus supported country plus resolved city/area identity, or an approved canonical area key model | Future published reviewed local relevance source tied to the service-area landing identity | Editorial review always; medical review if service/local healthcare claims exist; explicit non-medical classification required for `not_required` | `hasLocalRelevance: false`; publishability blocked |
| `specialty_area` | Yes | Canonical specialty identity plus supported country plus resolved city/area identity, or an approved canonical area key model | Future published reviewed local relevance source tied to the specialty-area landing identity | Editorial review always; medical review if specialty/local healthcare claims exist; explicit non-medical classification required for `not_required` | `hasLocalRelevance: false`; publishability blocked |

## 8. Candidate Source Models

### Option A: Local Relevance Section Inside `landing_page_contents`

Pros:

- Keeps landing intro, local relevance, lifecycle, review status, and canonical landing identity in one future content model.
- Minimizes join complexity for a first version.
- Aligns with the future helper boundary where helpers derive booleans/status without exposing content payload.
- Easier to keep publication, editorial review, medical review, and local relevance synchronized.

Cons:

- Requires a future migration/RLS/content model phase.
- Can grow into broad CMS scope if not constrained.
- Requires careful field classification so helpers do not expose raw content.

Schema impact:

- Future `landing_page_contents` may need a dedicated local relevance section, field, or structured subdocument.
- This document authorizes no schema change.

RLS impact:

- Future RLS or a public-safe projection must ensure public helper access only to derived approval/boolean signals or narrowly approved public rows.
- Drafts, review notes, admin fields, reviewer identities, rejected content, and private metadata must remain hidden.

Medical/editorial review impact:

- Editorial review is always required.
- Medical review is required when local relevance includes healthcare, service, specialty, procedure, condition, treatment, outcome, risk, or access claims.
- `not_required` requires explicit non-medical classification.

Helper impact:

- A future helper may derive `hasLocalRelevance: true` only when exactly one canonical, published, reviewed, public-safe source exists.
- The helper must not return local relevance text.

SEO risk:

- Low if strictly canonical, unique, reviewed, and RLS-safe.
- Medium if content rendering/crawler behavior is bundled too early.

Implementation risk:

- Moderate due to migration, RLS, review, and helper integration sequencing.

Recommendation:

- Preferred conservative first-version source model if later explicitly approved.

### Option B: Separate `landing_local_relevance` Table

Pros:

- Strong separation of local relevance from general landing content.
- Can model multiple evidence records or review workflows if future product requirements need them.
- Can enforce dedicated uniqueness and lifecycle rules.

Cons:

- Adds schema, RLS, join, helper, and review workflow complexity.
- Risks synchronization problems between landing content publication and local relevance approval.
- More likely to require additional public-safe projection design.

Schema impact:

- Would require a new table, canonical identity references, uniqueness constraints, lifecycle fields, editorial review fields, medical review fields, and indexes.
- This document authorizes no schema change.

RLS impact:

- Requires a separate RLS model and likely a public-safe view/projection.
- Must prevent raw text, draft evidence, reviewer notes, and private metadata from leaking.

Medical/editorial review impact:

- Requires dedicated editorial and medical review status mapping.
- Must not conflict with landing content review state.

Helper impact:

- Future helper would need to resolve landing content and local relevance source consistently.
- Must fail closed on missing, multiple, ambiguous, unreviewed, rejected, or stale local relevance records.

SEO risk:

- Low if implemented carefully; higher if synchronization fails.

Implementation risk:

- High relative to Option A.

Recommendation:

- Defer unless Option A proves insufficient.

### Option C: Derived From Provider/Center Distribution

Pros:

- Uses existing provider and center data.
- Avoids new content authoring fields.

Cons:

- Counts and distribution do not prove reviewed local relevance.
- Creates risk of thin, doorway-like local SEO pages.
- Collapses independent density gates and content/review gates into one unsafe inference.

Schema impact:

- No new table required, but the model is not acceptable as a local relevance source.

RLS impact:

- Would rely on existing public catalog RLS, which was not designed to certify landing-local relevance.

Medical/editorial review impact:

- No editorial or medical review of local relevance claims exists.

Helper impact:

- Would incorrectly allow helper logic to infer `hasLocalRelevance` from counts.

SEO risk:

- High.

Implementation risk:

- High policy risk despite low code complexity.

Recommendation:

- Reject.

### Option D: Generated Local Relevance Text

Pros:

- Fast to produce text.

Cons:

- Not reviewed by default.
- Risks hallucinated, duplicated, inaccurate, or unsafe healthcare/local claims.
- Violates current no-generation/no-keyword-runtime posture.

Schema impact:

- Would still require storage, review, publication, and RLS if ever allowed later.
- This document authorizes none of that.

RLS impact:

- Generated text would still require private draft handling and public-safe projection.

Medical/editorial review impact:

- Editorial review and likely medical review would be mandatory before any use.

Helper impact:

- Helper must not use generated text.

SEO risk:

- Very high.

Implementation risk:

- Very high.

Recommendation:

- Reject.

### Option E: Keep `hasLocalRelevance` False Until Later Human-Reviewed Source Exists

Pros:

- Safest current posture.
- Preserves fail-closed behavior.
- Avoids premature route, crawler, metadata, helper, RLS, or content work.
- Prevents bypassing unresolved area canonicalization.

Cons:

- Area-bearing pages remain unpublished and not visible.
- Requires future documentation and implementation phases before runtime behavior can progress.

Schema impact:

- None now.

RLS impact:

- None now.

Medical/editorial review impact:

- None now.

Helper impact:

- Current skeleton remains unchanged with `hasLocalRelevance: false`.

SEO risk:

- Lowest.

Implementation risk:

- Lowest.

Recommendation:

- Adopt now.

## 9. Recommended Conservative Decision

The conservative decision is:

- Do not infer local relevance from counts, slugs, names, provider density, center density, route existence, area labels, city labels, service descriptions, specialty descriptions, provider copy, reviews, media captions, keyword seeds, or generated text.
- Do not use generated local relevance.
- Prefer a reviewed local relevance section inside a future `landing_page_contents` model for the first version if later explicitly approved.
- Defer a separate `landing_local_relevance` table unless the future integrated `landing_page_contents` model proves insufficient.
- Keep `hasLocalRelevance: false` now.
- Area-bearing helpers remain fail-closed until canonical identity plus exactly one published, reviewed, public-safe local relevance source exists.

## 10. Future Helper Implications

- `hasLocalRelevance` remains `false` now.
- A future helper may set `hasLocalRelevance: true` only from an approved, reviewed local relevance source.
- A future helper must not expose local relevance content payload.
- A future helper must fail closed on missing, ambiguous, multiple, draft, pending, rejected, archived, deleted, unreviewed, stale, private, or unresolved local relevance.
- A future helper must not use keyword seed data or generated text.
- A future helper must not use service-role access.
- A future helper must not set crawler, visible noindex, or indexability flags.
- A future helper must return generic public-safe failures rather than raw database or Supabase errors.

## 11. RLS / Security Implications

- A public helper may derive only a local relevance boolean/status.
- Raw local relevance text must not leak through the helper.
- Drafts, review notes, reviewer identities, admin notes, private metadata, rejected content, archived content, and internal fields must remain hidden.
- Service-role access is forbidden for public landing helpers.
- A future public-safe view/projection may be needed, but this document does not authorize it.
- Public helpers should not directly read raw payload fields unless a later RLS/security phase explicitly approves a safe projection and helper contract.

## 12. Area / Canonical Dependency

This decision map depends on `docs/seo/AREA_CANONICALIZATION_DECISION_MAP.md`.

- `areaSlug` alone remains insufficient.
- Local relevance cannot become true until area identity is canonical.
- `service_area` and `specialty_area` remain fail-closed for publishability until area identity is resolved.
- Content existence is not enough without canonical uniqueness.
- Canonical identity must be resolved independently from content and local relevance existence.

## 13. Medical / Editorial Review Dependency

- Local relevance may become medical depending on claims.
- Medical review is required if the local relevance source includes healthcare, service, specialty, procedure, condition, treatment, care pathway, outcome, risk, access, availability, insurance, pricing, safety, or clinical claims.
- `not_required` is allowed only if the source is explicitly classified as non-medical under a later approved auditable process.
- Editorial review is required always.
- Missing, pending, rejected, unknown, ambiguous, stale, or unclassified review states fail closed.

## 14. Query Helper and Decision Helper Relationship

- The current decision helper requires local relevance for area-bearing families.
- The skeleton helper keeps `hasLocalRelevance: false`.
- No data-bearing landing helper is authorized now.
- A future data-bearing helper must still pass gate input through the decision helper.
- No helper, route, renderer, crawler, metadata function, sitemap function, schema function, or UI should bypass the decision helper by rendering content directly.
- Even a future successful gate result must not imply current indexability unless a separate approved publication/crawler phase changes the contract.

## 15. Route / Crawler Implications

- No route integration is authorized now.
- No visible noindex pages are authorized now.
- No indexable pages are authorized now.
- No metadata, canonical, hreflang, or Open Graph output is authorized now.
- No sitemap, schema, robots, or `llms.txt` change is authorized now.
- Future crawler/publication behavior must wait for canonical identity, reviewed local relevance, RLS/public-safe projection, helper readiness, route-check approval, validation, and human approval.

## 16. Implementation Decision

- No implementation now.
- No migration now.
- No SQL now.
- No RLS now.
- No generated database type change now.
- No Supabase usage now.
- No service-role usage now.
- No helper/runtime change now.
- No route/crawler/public rendering change now.
- No content generation now.
- No keyword seed runtime use now.

## 17. Recommended Next Subphase

Recommended conservative next subphase:

**No further action until human product/legal/medical decision.**

Rationale: the next meaningful decision is whether local relevance should be embedded in a future `landing_page_contents` model, separated into a dedicated `landing_local_relevance` table, or deferred entirely. That choice affects regulated healthcare content, editorial workflow, medical review scope, RLS exposure, and future publication risk. Human product/legal/medical stakeholders should approve the source model before more helper-readiness or RLS-test planning proceeds.

If stakeholders explicitly approve continued documentation-only planning, the next task may be a single narrowly scoped `docs/seo/*.md` file only.

## 18. Exact Allowed Files for Next Recommended Task

If a future plan/documentation-only task is approved, allow exactly one documentation file:

- one `docs/seo/*.md` file only

No implementation file should be included in the next task unless a separate explicit implementation phase is approved.

## 19. Exact Forbidden Files for Next Recommended Task

Forbidden for the next recommended task unless a later explicit implementation/test phase approves otherwise:

- routes under `src/app/**`;
- `scripts/routes-check.mjs`;
- helpers under `src/lib/catalog/**`;
- decision helpers under `src/lib/seo/**`;
- migrations under `supabase/migrations/**` unless an explicit migration implementation phase approves them;
- generated database types under `supabase/types/**`;
- Supabase client/type files under `src/lib/supabase/**`;
- package files including `package.json` and `pnpm-lock.yaml`;
- `vitest.config.ts`;
- `src/app/sitemap.ts`;
- `src/app/robots.ts`;
- `public/llms.txt`;
- `data/seo/**`;
- tests unless an explicit test phase approves them;
- public UI/content files;
- SQL, RLS policies, database queries, service-role usage, Supabase usage, metadata, canonical, hreflang, Open Graph, schema, sitemap, robots, `llms.txt`, crawler behavior, API handlers, CMS records, generated content, keyword seed runtime imports, payment, monetization, sponsored placement, ranking, referral, commission, entitlement, or plan logic.

## 20. Validation Expectations

For SEO-D3H3D-A, expected validation commands are:

- `git status --short`
- `test -f docs/seo/LOCAL_RELEVANCE_SOURCE_DECISION_MAP.md && echo "SEO-D3H3D-A local relevance source decision map exists"`
- `pnpm test:unit`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

No validation command may be faked or skipped silently. Any failure must be reported with the blocker and the smallest safe fix. `pnpm lint` may show warnings only, but must not report errors.
