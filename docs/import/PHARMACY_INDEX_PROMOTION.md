# Pharmacy Index promotion

Status: `P14 PHARMACY-INDEX-PROMOTION`

P14 adds one independent, reversible Index authority for an exact Pharmacy
already published by the P11 public/noindex authority and verified by P12.
It changes only the Index and robots state. Sitemap inclusion, JSON-LD,
candidate-relation links, another family, Agent runtime, Bulk and Production
execution remain closed.

## Canonical phase mapping

| Axis | Value |
| --- | --- |
| Execution Phase | Phase 9 |
| Lock Scope | Phase 10 |
| Product Module | Phase 18 |
| Subphase ID | `PHARMACY-INDEX-PROMOTION` |

## Independent authority

Migration `0089_import_pharmacy_index_promotion.sql` creates the protected
`import_pharmacy_index_authorizations` and
`import_pharmacy_index_events` tables. The authority binds one platform Admin,
one Pharmacy, the exact published P11 authority, its approved candidate,
Queue, bilingual canonical paths, candidate/publication hashes, request
identity, and an exact pre-Index Queue snapshot.
Authorization also requires the shared Index content signals: a textual Oman
location, reviewed source and freshness, at least one language, at least one
service or department, and contact or map evidence.

Three service-role-only, security-invoker RPCs implement the lifecycle:

```text
issued → promoted → rolled_back
```

- authorization selects and locks the P11 authority and Queue on the server;
- promotion accepts only an issued authority identity inside the server
  boundary, verifies every protected hash/state, writes Index state and reads
  it back before success;
- rollback accepts only actor, entity and schema version, selects the latest
  authority on the server, restores the exact pre-Index Queue snapshot and
  reads it back before success;
- concurrent promotion and rollback each produce one fresh result and one
  persisted replay;
- no raw authority, Queue, snapshot or persistence identity reaches the
  browser result.

## Exact state boundary

Promotion moves the Queue only from:

```text
publish_status = published_noindex
index_policy = noindex
sitemap_policy = excluded
robots_policy = noindex
index_promoted = false
sitemap_included = false
```

to:

```text
publish_status = index_eligible
index_policy = index_eligible
sitemap_policy = excluded
robots_policy = index
index_promoted = true
sitemap_included = false
```

The public Pharmacy guard requires both the still-published P11 authority and
the promoted P14 authority before returning indexable metadata. Missing,
rolled-back, mismatched or tampered authority state fails closed. The Route
also reapplies the shared profile eligibility gate, so content drift returns
to `noindex` even while persistence is being investigated. It keeps its
bilingual canonical/hreflang metadata and still emits no JSON-LD.
Imported discovery and Sitemap output remain excluded.

## Rollback order

P14 rollback restores the exact P11 public/noindex Queue and keeps the
published P11 authority and bilingual route intact. Therefore the page becomes
`noindex` again without disappearing. A full public rollback remains the P13
operation and is valid only after P14 has returned the Queue to P11 state:

```text
P14 Index rollback → optional P13 public rollback
```

P13 intentionally fails closed while a valid P14 Index promotion is active.

## Hosted proof

The exact-SHA isolated Preview proof:

- verifies migration ledger, RLS, zero public policies, grants and all three
  RPC boundaries;
- creates one deterministic P11 public/noindex Pharmacy fixture;
- proves missing language/content signals block Index authorization with zero
  authority or event writes;
- proves protected Queue tamper blocks promotion before authority consumption;
- runs two concurrent promotion clients and verifies one promotion plus one
  replay;
- reads back Index metadata with Sitemap still excluded and the center still
  draft/inactive;
- proves protected promoted Queue tamper blocks rollback before consumption;
- runs two concurrent rollback clients and verifies one exact rollback plus
  one replay;
- verifies a later persisted replay and exact P11 Queue recovery;
- deletes only its deterministic fixture and records no secrets or raw
  persistence identifiers.

```json pharmacy-index-promotion
{
  "schemaVersion": "drkhaleej.pharmacyIndexPromotion.v1",
  "status": "complete",
  "migration": "0089_import_pharmacy_index_promotion.sql",
  "phaseMapping": {
    "executionPhase": 9,
    "lockScope": 10,
    "productModule": 18,
    "subphaseId": "PHARMACY-INDEX-PROMOTION"
  },
  "authority": "import_pharmacy_index_authorizations",
  "publicAuthorityRequired": "import_pharmacy_public_noindex_authorizations:published",
  "promotionState": {
    "publishStatus": "index_eligible",
    "indexPolicy": "index_eligible",
    "robotsPolicy": "index",
    "sitemapPolicy": "excluded",
    "sitemapIncluded": false
  },
  "rollbackRecovery": "exact_public_noindex_restore",
  "concurrencyProofRequired": true,
  "replayReadbackRequired": true,
  "tamperFailsBeforeConsumption": true,
  "jsonLdEnabled": false,
  "productionConnected": false,
  "next": "PHARMACY-SITEMAP-PROMOTION"
}
```
