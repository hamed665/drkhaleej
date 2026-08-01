# Pharmacy Sitemap promotion

Status: `P15 PHARMACY-SITEMAP-PROMOTION`

P15 adds one independent, reversible Sitemap authority for the exact Pharmacy
already promoted by the P14 Index authority. It reuses the existing dynamic
import Sitemap reader and changes only the Queue fields required for inclusion.
The public route remains indexable, while JSON-LD, candidate-relation links,
another family, Agent runtime, Bulk and Production execution remain closed.

## Canonical phase mapping

| Axis | Value |
| --- | --- |
| Execution Phase | Phase 9 |
| Lock Scope | Phase 10 |
| Product Module | Phase 18 |
| Subphase ID | `PHARMACY-SITEMAP-PROMOTION` |

## Independent authority

Migration `0090_import_pharmacy_sitemap_promotion.sql` creates the protected
`import_pharmacy_sitemap_authorizations` and
`import_pharmacy_sitemap_events` tables. The authority binds one platform
Admin, one Pharmacy, the exact promoted P14 authority, its approved candidate,
Queue, bilingual canonical paths, protected hashes, request identity, and an
exact pre-Sitemap P14 Queue snapshot.

Three service-role-only, security-invoker RPCs implement the lifecycle:

```text
issued → included → rolled_back
```

- authorization server-selects and locks the latest promoted P14 authority;
- inclusion accepts only the issued P15 authority and re-verifies every hash,
  candidate, path and Queue field before writing;
- rollback accepts only actor, entity and schema version, server-selects the
  latest P15 authority, restores the exact P14 snapshot and reads it back;
- concurrent inclusion and rollback each produce one fresh result and one
  persisted replay;
- no raw authority, Queue, snapshot or persistence identity reaches browser
  results, logs or evidence artifacts.

## Exact state boundary

Inclusion moves the same Queue only from:

```text
publish_status = index_eligible
index_policy = index_eligible
sitemap_policy = excluded
robots_policy = index
index_promoted = true
sitemap_included = false
```

to:

```text
publish_status = index_eligible
index_policy = index
sitemap_policy = included
robots_policy = index
index_promoted = true
sitemap_included = true
```

The canonical public Sitemap already requires all three persisted values,
reviewed evidence, the exact Pharmacy P15 schema marker, a supported route
authority and a canonical resolver match. Missing, rolled-back, mismatched or
tampered state returns no Sitemap entry. No parallel Sitemap generator or
hard-coded URL is introduced.

## Rollback order

P15 rollback restores the exact P14 Index Queue. The public page therefore
stays live and indexable but disappears from Sitemap output. Lower-level
rollback is valid only in this order:

```text
P15 Sitemap rollback → optional P14 Index rollback → optional P13 public rollback
```

P14 and P13 intentionally fail closed while P15 is active because the Queue no
longer matches their protected prerequisite state.

## Hosted proof

The exact-SHA isolated Preview proof:

- verifies migration ledger, RLS, zero public policies, grants and all three
  RPC boundaries;
- creates one deterministic P11 public/noindex Pharmacy and promotes it through
  the real P14 Index authority;
- proves prerequisite Queue tamper blocks P15 authorization with zero writes;
- proves protected Queue tamper blocks inclusion before authority consumption;
- runs two concurrent inclusion clients and verifies one inclusion plus one
  replay;
- reads back `index_eligible/index/included`, the P15 schema marker and the
  canonical bilingual paths while the center remains draft/inactive;
- proves protected included-Queue tamper blocks rollback before consumption;
- runs two concurrent rollback clients and verifies one exact rollback plus one
  replay;
- verifies a later persisted replay and exact P14 Queue recovery;
- deletes only its deterministic fixture and records no secrets or raw
  persistence identifiers.

```json pharmacy-sitemap-promotion
{
  "schemaVersion": "drkhaleej.pharmacySitemapPromotion.v1",
  "status": "complete",
  "migration": "0090_import_pharmacy_sitemap_promotion.sql",
  "phaseMapping": {
    "executionPhase": 9,
    "lockScope": 10,
    "productModule": 18,
    "subphaseId": "PHARMACY-SITEMAP-PROMOTION"
  },
  "authority": "import_pharmacy_sitemap_authorizations",
  "indexAuthorityRequired": "import_pharmacy_index_authorizations:promoted",
  "promotionState": {
    "publishStatus": "index_eligible",
    "indexPolicy": "index",
    "robotsPolicy": "index",
    "sitemapPolicy": "included",
    "sitemapIncluded": true
  },
  "rollbackRecovery": "exact_p14_index_restore",
  "concurrencyProofRequired": true,
  "replayReadbackRequired": true,
  "tamperFailsBeforeConsumption": true,
  "jsonLdEnabled": false,
  "productionConnected": false,
  "next": "INTAKE-CONTRACT-CONVERGENCE"
}
```
