# Registry Authority Audit

## Decision

`REGISTRY-AUTHORITY-AUDIT` is complete as a documentation and contract audit. It authorizes no runtime change.

The repository has the required authorities, but they do not yet form one converged provider contract. The next implementation is:

```text
REGISTRY-CONVERGENCE
```

Public Pharmacy, route activation, index promotion, sitemap promotion, Production execution, Agent, Content, Hospital, Doctor, later-family implementation, and Bulk remain closed.

The canonical four-axis mapping for this audit is:

| Axis | Value |
| --- | --- |
| Execution Phase | Phase 9 |
| Lock Scope | Phase 10 |
| Product Module | Phase 18 |
| Subphase ID | `REGISTRY-AUTHORITY-AUDIT` |

The repository snapshot audited is `main` at merge commit `2149fb798d4b6743d61d3edf712dfcacf698b6c2`. The unchanged import-readiness runtime baseline remains PR #958 at `baba0cc91508ef8fad16e43650cf425099c8908a`.

## Authority owners

| Concept | Canonical source | Authority |
| --- | --- | --- |
| Import entity vocabulary | `src/server/admin/import-entity-domain.ts` | `ImportEntityType` / `IMPORT_ENTITY_DOMAIN_BY_TYPE` |
| Public family vocabulary | `src/lib/catalog/public-entity-family-registry.ts` | `publicEntityFamilyRegistry` |
| Canonical provider route | `src/lib/catalog/public-provider-route-resolver.ts` | `resolvePublicProviderCanonicalRoute` |
| Public storage | `src/lib/catalog/public-eligible-queries.ts` | `doctors` / `centers` queries |
| Import staging | `supabase/migrations/0061_import_staging_foundation.sql` | `import_entity_candidates` / `import_publish_queue` constraints |
| SEO readiness | `src/server/admin/import-seo-profile-contract.ts` | `getImportSeoProfileReadiness` |
| Schema projection | `src/server/admin/import-schema-generator.ts` | `IMPORT_SCHEMA_TYPES_BY_ENTITY_TYPE` |
| Relation policy | `src/server/admin/import-link-rule-matrix.ts` | `IMPORT_ENTITY_LINK_RULES` |
| Sitemap eligibility | `src/server/admin/import-sitemap-eligibility-2026.ts` | `getImportSitemapEligibility2026` |
| Import sitemap reader | `src/server/public/import-sitemap.ts` | `listPublicImportSitemapEntries` |

Status meanings:

- `supported`: an executable canonical authority exists and agrees with the mapping.
- `planned`: vocabulary or staging exists, but the final adapter/authority is not converged.
- `disabled`: the family is known and an authority currently blocks activation.
- `unsupported`: no safe canonical mapping exists; coercion is forbidden.

The generic SEO readiness contract and schema generator cover every `ImportEntityType`. That does not itself approve a public route, indexing, or sitemap inclusion.

## Machine-readable audit

The compact rows use the `columns` order below. This block is validated fail-closed against the current TypeScript authorities.

```json registry-authority-audit
{
  "schemaVersion": "drkhaleej.registryAuthorityAudit.v1",
  "auditStatus": "complete",
  "repositoryBaseline": "2149fb798d4b6743d61d3edf712dfcacf698b6c2",
  "runtimeBaseline": "baba0cc91508ef8fad16e43650cf425099c8908a",
  "phaseMapping": {
    "executionPhase": 9,
    "lockScope": 10,
    "productModule": 18,
    "subphaseId": "REGISTRY-AUTHORITY-AUDIT"
  },
  "next": "REGISTRY-CONVERGENCE",
  "allowedStatuses": ["supported", "planned", "disabled", "unsupported"],
  "authorities": {
    "importEntityType": ["src/server/admin/import-entity-domain.ts", "ImportEntityType"],
    "publicFamily": ["src/lib/catalog/public-entity-family-registry.ts", "publicEntityFamilyRegistry"],
    "route": ["src/lib/catalog/public-provider-route-resolver.ts", "resolvePublicProviderCanonicalRoute"],
    "publicStorage": ["src/lib/catalog/public-eligible-queries.ts", "doctors/centers"],
    "importStaging": ["supabase/migrations/0061_import_staging_foundation.sql", "import_entity_candidates/import_publish_queue"],
    "seo": ["src/server/admin/import-seo-profile-contract.ts", "getImportSeoProfileReadiness"],
    "schema": ["src/server/admin/import-schema-generator.ts", "IMPORT_SCHEMA_TYPES_BY_ENTITY_TYPE"],
    "relation": ["src/server/admin/import-link-rule-matrix.ts", "IMPORT_ENTITY_LINK_RULES"],
    "sitemapEligibility": ["src/server/admin/import-sitemap-eligibility-2026.ts", "getImportSitemapEligibility2026"],
    "sitemapReader": ["src/server/public/import-sitemap.ts", "listPublicImportSitemapEntries"]
  },
  "columns": [
    "entityType",
    "publicFamily",
    "publicFamilyStatus",
    "routeFamily",
    "routeStatus",
    "storageFamily",
    "storageStatus",
    "seoStatus",
    "schemaStatus",
    "relationStatus",
    "sitemapFamily",
    "sitemapStatus"
  ],
  "entities": [
    ["doctor", "doctor", "supported", "doctor", "supported", "doctors", "supported", "supported", "supported", "supported", "doctors", "supported"],
    ["hospital", "hospital", "supported", "hospital", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "hospitals", "disabled"],
    ["clinic", "clinic", "supported", "clinic", "disabled", "centers", "supported", "supported", "supported", "planned", "clinics", "disabled"],
    ["pharmacy", "pharmacy", "supported", "pharmacy", "disabled", "centers", "supported", "supported", "supported", "supported", "pharmacies", "disabled"],
    ["lab", "lab", "supported", "lab", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", null, "unsupported"],
    ["imaging_center", "imaging_center", "supported", "imaging_center", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", null, "unsupported"],
    ["dental_clinic", "dental_clinic", "supported", "dental_clinic", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "dental", "disabled"],
    ["dentist", "dentist", "supported", "dentist", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "dental", "disabled"],
    ["dermatologist", "doctor", "planned", "doctor", "planned", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "doctors", "planned"],
    ["gynecologist", "doctor", "planned", "doctor", "planned", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "doctors", "planned"],
    ["fertility_clinic", "clinic", "planned", "clinic", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "clinics", "disabled"],
    ["ivf_center", "clinic", "planned", "clinic", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "clinics", "disabled"],
    ["reproductive_medicine_doctor", "doctor", "planned", "doctor", "planned", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "doctors", "planned"],
    ["embryology_lab", "lab", "planned", "lab", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", null, "unsupported"],
    ["andrology_lab", "lab", "planned", "lab", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", null, "unsupported"],
    ["hair_transplant_clinic", "beauty_clinic", "planned", "beauty_clinic", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "beauty", "disabled"],
    ["hair_transplant_doctor", "doctor", "planned", "doctor", "planned", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "doctors", "planned"],
    ["plastic_surgeon", "doctor", "planned", "doctor", "planned", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "planned", "doctors", "planned"],
    ["aesthetic_doctor", "doctor", "planned", "doctor", "planned", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "planned", "doctors", "planned"],
    ["medical_beauty_clinic", "beauty_clinic", "planned", "beauty_clinic", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "beauty", "disabled"],
    ["salon", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", null, "unsupported"],
    ["spa", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "planned", null, "unsupported"],
    ["gym", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", null, "unsupported"],
    ["fitness_center", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", null, "unsupported"],
    ["personal_trainer", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", null, "unsupported"],
    ["yoga_studio", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "planned", null, "unsupported"],
    ["pilates_studio", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "planned", null, "unsupported"],
    ["sports_medicine_doctor", "doctor", "planned", "doctor", "planned", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "doctors", "planned"],
    ["physiotherapy", "clinic", "planned", "clinic", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "clinics", "disabled"],
    ["wellness_center", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "planned", null, "unsupported"],
    ["vet_doctor", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "planned", null, "unsupported"],
    ["pet_clinic", "pet_clinic", "supported", "pet_clinic", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "pet", "disabled"],
    ["pet_pharmacy", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", null, "unsupported"],
    ["pet_shop", "pet_shop", "supported", "pet_shop", "disabled", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "supported", "pet", "disabled"],
    ["pet_grooming", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "planned", null, "unsupported"],
    ["pet_boarding", null, "unsupported", null, "unsupported", "import_entity_candidates/import_publish_queue", "planned", "supported", "supported", "planned", null, "unsupported"]
  ],
  "findings": [
    ["AUTH-001", "unsupported", "ImportEntityType, AdminImportEntityType, staging constraints, and PublicProviderEntityType are split vocabularies without one total adapter."],
    ["AUTH-002", "disabled", "Pharmacy has an app route and sitemap reader pattern, while the canonical route resolver disables pharmacy."],
    ["AUTH-003", "disabled", "Hospital is registered in SEO and sitemap vocabularies, while its canonical route is disabled and no hospital detail page exists."],
    ["AUTH-004", "unsupported", "human_pharmacy is forced into ImportEntityType inside the relation matrix but is not a canonical ImportEntityType."],
    ["AUTH-005", "planned", "Public family capability flags describe potential capability and are not route, index, or sitemap approval."],
    ["AUTH-006", "planned", "Import public projection table names are contract vocabulary, not verified database storage authority."],
    ["AUTH-007", "disabled", "The legacy sitemap inclusion helper promotes index_policy and sitemap_policy in one write, so it is not an authority for the required independent promotions."],
    ["AUTH-008", "unsupported", "The public-family registry lookup falls back to doctor when a typed family is unexpectedly absent instead of failing closed."]
  ],
  "convergenceGates": [
    "one-total-import-to-public-family-adapter",
    "remove-noncanonical-human-pharmacy-alias",
    "sitemap-consumes-canonical-route-authority",
    "capability-flags-cannot-enable-release",
    "unknown-family-lookup-fails-closed",
    "index-and-sitemap-promotions-remain-independent",
    "all-public-route-families-remain-disabled-except-existing-doctor-and-center"
  ]
}
```

## Result

The audit found no safe basis for enabling another public family. `REGISTRY-CONVERGENCE` may reconcile the existing vocabularies and consumers, but it must preserve the current route disablement and must not create a second registry.

After convergence, the next large package is the Pharmacy public/noindex lifecycle. Index and sitemap promotions remain separate later packages with independent approval and rollback.

The next work is intentionally consolidated into four substantial review packages:

1. `REGISTRY-CONVERGENCE` — one total family/storage/route adapter, fail-closed lookup, canonical relation types, and sitemap consumption of the canonical route authority; no activation.
2. `PHARMACY-PUBLIC-NOINDEX-LIFECYCLE` — independent public/noindex authority, bilingual route verification, rollback, and exact recovery.
3. `PHARMACY-INDEX-PROMOTION` — independent index authority, readback, and rollback.
4. `PHARMACY-SITEMAP-PROMOTION` — independent sitemap authority, readback, and rollback; the legacy coupled helper cannot be reused unchanged.

Later families, intake convergence, workers, Agents, Content, Admin expansion, and Bulk remain separate gates rather than being pre-split into speculative pull requests.

## Post-audit resolution

`REGISTRY-CONVERGENCE` subsequently resolved the actionable findings while preserving the audit above as the immutable snapshot of what was discovered. The implementation and proof record are in [`registry-convergence.md`](registry-convergence.md). `AUTH-007` remains intentionally deferred to the independent Pharmacy Index and Sitemap promotion packages; the coupled legacy helper is not a release authority.
