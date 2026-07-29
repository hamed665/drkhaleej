# Pharmacy public rollback

Status: `P13 PHARMACY-PUBLIC-ROLLBACK`

P13 extends the existing P11 Pharmacy public/noindex authority with one
server-selected, exact Queue rollback. It does not create a second authority
and it does not authorize Index, Sitemap, JSON-LD, another family, Agent
runtime, Bulk, or Production execution.

## Canonical phase mapping

| Axis | Value |
| --- | --- |
| Execution Phase | Phase 9 |
| Lock Scope | Phase 10 |
| Product Module | Phase 18 |
| Subphase ID | `PHARMACY-PUBLIC-ROLLBACK` |

## Authority extended

Migration `0088_import_pharmacy_public_rollback.sql` extends the protected
tables created by migration `0087`:

- the existing authority admits the terminal state `rolled_back`;
- one append-only `public_noindex_rolled_back` event records the exact
  recovery result;
- the service-role-only RPC accepts only actor, entity, and the existing
  schema version;
- the RPC selects and locks the published authority itself, so no raw
  authorization, Queue, snapshot, or rollback reference is accepted from the
  browser;
- the original Queue snapshot and candidate/publication hashes are verified
  before any state is consumed;
- a Queue that existed before P11 is restored field-for-field;
- a Queue created by P11 is deleted;
- persisted readback is hashed again before success or replay is returned.

The authority moves to `rolled_back` before a P11-created Queue is deleted.
This preserves the existing `ON DELETE SET NULL` foreign-key behavior without
temporarily violating the published lifecycle constraint. Any later write or
readback mismatch raises inside the same transaction and rolls back the entire
operation.

## Fail-closed behavior

Rollback stops before consumption when the Pharmacy private boundary,
candidate hash, snapshot hash, published terminal hash, exact bilingual paths,
Queue identity, noindex state, Sitemap exclusion, or protected metadata does
not match. Concurrent execution produces exactly one fresh rollback and one
bounded replay.

After rollback, the P12 route fails closed because the protected authorization
is no longer `published`. Index and Sitemap remain unpromoted in both recovery
scenarios.

## Hosted proof

The exact-SHA isolated Preview proof covers two scenarios:

1. a pre-existing Queue is published and restored exactly;
2. no Queue exists before publish, the P11-created Queue is removed exactly.

The second scenario first tampers with protected published Queue metadata and
proves rollback leaves authority and audit state untouched. Both scenarios
then run two concurrent clients, prove one rollback plus one replay, verify a
later persisted replay, require exactly one rollback event, confirm zero
public/Index/Sitemap authority, and delete only their deterministic fixtures.
Evidence contains no secrets or raw persistence identifiers.

```json pharmacy-public-rollback
{
  "schemaVersion": "drkhaleej.pharmacyPublicRollback.v1",
  "status": "complete",
  "migration": "0088_import_pharmacy_public_rollback.sql",
  "phaseMapping": {
    "executionPhase": 9,
    "lockScope": 10,
    "productModule": 18,
    "subphaseId": "PHARMACY-PUBLIC-ROLLBACK"
  },
  "authorityReused": "import_pharmacy_public_noindex_authorizations",
  "rpcInputs": ["actor_profile_id", "entity_id", "schema_version"],
  "preExistingQueueRecovery": "exact_restore",
  "createdQueueRecovery": "exact_delete",
  "concurrencyProofRequired": true,
  "replayReadbackRequired": true,
  "tamperFailsBeforeConsumption": true,
  "publicRouteAfterRollback": false,
  "indexPromoted": false,
  "sitemapPromoted": false,
  "jsonLdEnabled": false,
  "productionConnected": false,
  "next": "PHARMACY-INDEX-PROMOTION"
}
```
