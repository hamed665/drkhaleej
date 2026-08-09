# Contract Hardening

## Decision

Gate B hardens the nine v1.2.2 AI program schemas against current `main` at PR #970 / `d17ce242ae442ca607a9167abfcf01ede1261ceb`. It does not activate an Agent, Worker, Content runtime, Human Review writer, database migration, RPC, route, canonical entity mutation or Production execution.

The machine-readable reconciliation is [`contract-hardening-reconciliation.json`](contract-hardening-reconciliation.json). Every schema remains a closed Draft 2020-12 boundary with an exact `$id`, `schema_version: 1.2.2`, positive and adversarial vectors, and separately checked runtime invariants. Unknown schema or policy versions fail closed.

## Current-main reconciliation

- `entity-draft.schema.json` uses exactly the current `ImportEntityType` vocabulary; no alias becomes authority.
- P16 remains the intake authority at `drkhaleej.import.intake.v1`.
- P17 remains the Source Evidence authority at `drkhaleej.import.sourceEvidenceLedger.v1`.
- P18 remains the candidate-only duplicate/geo authority at `drkhaleej.import.duplicateGeo.v1` plus `drkhaleej.import.duplicateGeoPolicy.v1`.
- Duplicate candidates remain in `import_duplicate_candidates`; governorate identity remains `geo_regions.id`.
- Entity and Article Candidate schemas cannot carry reviewer approval. Human Review records stay separate and their writers remain gated.
- Automation Job and Service Identity schemas are hardened only as schemas. Worker host, fencing persistence and credential runtime remain behind the Worker Runtime ADR gate.
- Article schemas are hardened only as schemas. Content authority, CMS mutation, medical/editorial approval and publication remain gated.

## Canonical hash contract

Draft/revision binding uses `drkhaleej.import.canonicalJson.v1` with SHA-256 domain separation by contract id and schema version. The implementation:

- normalizes strings and object keys to Unicode NFC;
- sorts normalized object keys while preserving array order;
- preserves distinct `null` and empty-string semantics;
- normalizes negative zero to zero and gives JSON integers no overlapping integer-only branch;
- rejects non-finite numbers, unsupported values, cycles, normalized-key collisions and exceeded depth/size bounds;
- returns bounded hash metadata only, never the canonical payload.

Gate B supplied hashing and contract validation only. Candidate persistence was subsequently completed in `ENTITY-CANDIDATE-PIPELINE`; reviewer authority remains for `ENTITY-RESOLUTION-GATE`.

## Authority boundary

The reconciliation fixes every authority claim to false:

- `agentReviewAllowed: false`
- `duplicateResolutionAllowed: false`
- `geoVerificationAllowed: false`
- `workerRuntimeAllowed: false`
- `contentRuntimeAllowed: false`
- `directEntityWriteAllowed: false`
- `publishAllowed: false`
- `productionExecutionAllowed: false`

No migration, route, RPC, dependency version or lockfile change is part of Gate B.

## Validation

Install the already pinned validator package once, then run the repository gate:

```bash
npm --prefix docs/ai-agent-program/drkhaleej-ai-agent-program-2026-v1.2.2 ci --ignore-scripts
pnpm import:contract-hardening:validate
```

The gate strict-compiles all nine schemas with AJV Draft 2020-12, runs 305 package checks and exact negative-vector reasons, verifies package checksums, compares the Entity family enum with current `ImportEntityType`, checks P16/P17/P18 authority tokens, validates the reconciliation manifest, runs canonical-hash tests and rejects forbidden runtime wiring.
