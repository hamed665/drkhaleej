# Duplicate / Geo Candidate Contract

## Decision

P18 adds one versioned, fail-closed boundary for duplicate and canonical-geo candidate output. It does not add a Worker, Agent runtime, migration, public route, entity mutation, duplicate resolution, merge, geo verification or publish authority.

## Existing authorities

- Duplicate candidates remain owned by `import_duplicate_candidates`; Human resolution remains owned by the existing Admin resolution path.
- Canonical geography remains owned by `geo_countries`, `geo_regions`, `geo_cities` and `geo_areas`.
- The program's proposed `governorateId` is reconciled to the repository's existing `geo_regions.id`. No parallel `geo_governorates` table is introduced.
- Entity families remain owned by `ImportEntityType`.
- Intake Evidence references come from P16 `drkhaleej.import.intake.v1`; Source Evidence references come from the accepted P17 ledger plan.

## Contract

The exact supported versions are:

- schema: `drkhaleej.import.duplicateGeo.v1`
- policy: `drkhaleej.import.duplicateGeoPolicy.v1`

Unknown versions, extra fields, missing or cross-unbound Evidence, invalid scores, duplicate candidate identities, unsupported families and invalid geography fail closed. Duplicate status is limited to `candidate`, `not_duplicate_candidate` or `requires_review`; Geo status is limited to `candidate` or `requires_review`. `confirmed_duplicate` is not a candidate state and remains a Human decision.

Every accepted plan is bound to a Draft id, positive Draft version and SHA-256 Draft hash. Candidate Evidence ids must exist in the P17 references, while each P16 intake reference must also be represented in P17.

## Authority boundary

Accepted output can be persisted only as candidate material. Every result fixes these capabilities:

- `duplicateResolutionAllowed: false`
- `duplicateMergeAllowed: false`
- `geoVerificationAllowed: false`
- `directEntityWriteAllowed: false`
- `publishAllowed: false`

The boundary neither calls a database client nor changes canonical records. Human Review, the next `CONTRACT-HARDENING` gate, runtime wiring, Production execution, Content, Hospital, Doctor, later families and Bulk remain gated.

## Validation

Run:

```bash
pnpm import:duplicate-geo-contract:validate
```

The validator checks the documentation, strict version and policy locks, Evidence binding, existing authority map, candidate-only output, ten focused tests and absence of mutation/runtime authority.
