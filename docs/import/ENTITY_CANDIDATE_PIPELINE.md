# ENTITY-CANDIDATE-PIPELINE

## Decision

`ENTITY-CANDIDATE-PIPELINE` is the first database persistence gate for the v1.2.2 Entity Draft contract. It extends the existing staging authorities instead of creating a parallel entity system:

- `import_entity_candidates` owns the immutable contract-bound Entity Draft;
- `import_duplicate_candidates` owns unresolved duplicate candidates;
- `import_mapping_results` owns the unverified geo candidate;
- `import_source_observations` and `import_source_evidence` remain the P17 Observation/Evidence authority.

The gate persists only Candidate/Evidence state. A Candidate is either `collecting` or `needs_review`. It is not an approval, a duplicate decision, a verified location, a canonical entity or a publish authorization.

## Bound contracts

One service-role-only RPC binds all of the following in one transaction:

| Contract | Required identity |
| --- | --- |
| P16 intake | `drkhaleej.import.intake.v1` |
| P17 source evidence | `drkhaleej.import.sourceEvidenceLedger.v1`, accepted and active Observation, exact reference IDs and field paths |
| P18 duplicate / geo candidates | `drkhaleej.import.duplicateGeo.v1` and `drkhaleej.import.duplicateGeoPolicy.v1` |
| Entity Draft | schema `1.2.2`, policy version, UUID/version/family/status, canonical Draft hash |
| Canonical hashing | `drkhaleej.import.canonicalJson.v1` |
| Persistence | `drkhaleej.import.entityCandidatePipeline.v1`, actor/batch/raw-row/Observation binding, idempotency key and request hash |

The runtime planner rejects unknown keys, Agent authorship, stale Draft hashes, evidence-path drift, mismatched duplicate material, unsafe statuses and any reviewer, merge, canonical-write or publish claim.

## Persistence and readback

Migration `0093_import_entity_candidate_pipeline.sql` adds nullable contract columns so historical staging rows and P11–P15 Pharmacy proof fixtures remain compatible. Contract-bound rows are distinguished by `pipeline_schema_version` and must satisfy the stricter shape.

`import_persist_entity_candidate(...)`:

1. serializes both idempotency-key and Draft-ID races;
2. verifies the platform-admin actor and exact staging row relationship;
3. verifies the P17 Observation is accepted, active and owns every supplied evidence reference;
4. validates Candidate, duplicate and geo candidate bindings before any insert;
5. inserts the Entity Draft, unresolved duplicate candidates and unverified geo mapping atomically;
6. reads back the persisted rows and returns a SHA-256 receipt;
7. replays the exact request and rejects a changed request or payload under the same idempotency key.

Contract-bound parent and child rows are immutable in this gate. Direct service-role mutation cannot convert them to `approved`, resolve a duplicate, mark geo verified or delete evidence. The later review authority must be additive and independently audited.

## Closed authority

This gate deliberately keeps all of the following false:

- `duplicateResolutionAllowed: false`
- `duplicateMergeAllowed: false`
- `geoVerificationAllowed: false`
- `reviewDecisionAllowed: false`
- `directEntityWriteAllowed: false`
- `publishAllowed: false`

There is no Agent/Worker runtime, Content runtime, Human Review decision writer, canonical provider mutation, route activation, sitemap/index change or public exposure in this phase. Production remains disconnected; database behavior is proved only in the isolated Hosted Preview database and rolled back after the proof.

## Next gate

The next implementation is `ENTITY-RESOLUTION-GATE`. It may introduce a separately bound Human Review decision authority only after independent review. It must not infer approval from Candidate persistence, duplicate score or geo confidence.
