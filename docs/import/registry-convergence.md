# Registry Convergence

## Decision

`REGISTRY-CONVERGENCE` is complete.

The existing intake, public-family, storage, route, relation, and sitemap authorities now meet through one fail-closed adapter. This package creates no new registry, database authority, migration, route, public record, index promotion, or sitemap promotion.

The next implementation is:

```text
PHARMACY-PUBLIC-NOINDEX-LIFECYCLE
```

Production execution, AI Agent execution, Content automation, Hospital, Doctor, later families, Index, Sitemap, and Bulk remain closed.

The canonical four-axis mapping is:

| Axis | Value |
| --- | --- |
| Execution Phase | Phase 9 |
| Lock Scope | Phase 10 |
| Product Module | Phase 18 |
| Subphase ID | `REGISTRY-CONVERGENCE` |

The convergence baseline is `main` after PR #960 at merge commit `dfa0b63c34c9b8d1f369c535b7a2dfa540eabca4`. The guarded import-readiness runtime baseline remains PR #958 at `baba0cc91508ef8fad16e43650cf425099c8908a`.

## Converged boundaries

- `ImportEntityType` remains the canonical 36-value intake vocabulary.
- The six-value legacy Admin staging vocabulary resolves through an explicit canonical adapter.
- Every canonical intake type resolves to public-family, public-projection, storage, and route status without fallback.
- Unknown and ambiguous values fail closed; `center` is not silently coerced without a canonical candidate type.
- Public-family lookup returns `null` for an unknown family instead of falling back to Doctor.
- Relation rules use canonical `pharmacy`; the noncanonical `human_pharmacy` cast is removed.
- Capability flags describe potential product behavior only. Route release still comes exclusively from `resolvePublicProviderCanonicalRoute`.
- The public import sitemap consumes the canonical family adapter and route resolver. Pharmacy and Hospital remain excluded while their routes are disabled.
- The existing Doctor route remains enabled. No disabled route is activated.
- The legacy coupled index/sitemap writer remains quarantined for replacement by the later independent promotion packages.

## Machine-readable convergence record

```json registry-convergence
{
  "schemaVersion": "drkhaleej.registryConvergence.v1",
  "status": "complete",
  "repositoryBaseline": "dfa0b63c34c9b8d1f369c535b7a2dfa540eabca4",
  "runtimeBaseline": "baba0cc91508ef8fad16e43650cf425099c8908a",
  "phaseMapping": {
    "executionPhase": 9,
    "lockScope": 10,
    "productModule": 18,
    "subphaseId": "REGISTRY-CONVERGENCE"
  },
  "canonicalImportEntityCount": 36,
  "legacyAdminEntityCount": 6,
  "enabledRouteFamilies": ["center", "doctor"],
  "resolvedFindings": [
    "AUTH-001",
    "AUTH-002",
    "AUTH-003",
    "AUTH-004",
    "AUTH-005",
    "AUTH-006",
    "AUTH-008"
  ],
  "deferredFindings": [
    "AUTH-007"
  ],
  "next": "PHARMACY-PUBLIC-NOINDEX-LIFECYCLE",
  "forbiddenActivations": [
    "migration",
    "public-record-promotion",
    "route-activation",
    "index-promotion",
    "sitemap-promotion",
    "production-execution",
    "agent-execution",
    "content-automation",
    "bulk"
  ]
}
```

## Proof

The contract is protected by:

- total adapter coverage tests for all 36 canonical intake types;
- legacy Admin vocabulary normalization tests;
- unknown and ambiguous value rejection tests;
- capability/release separation tests;
- exact family lookup tests;
- canonical human/pet relation tests;
- sitemap route-authority tests proving Doctor acceptance and Pharmacy/Hospital rejection;
- static convergence validation;
- the full import readiness audit, typecheck, lint, unit tests, build, and hosted CI.

No Production connection or mutation is part of this package.
