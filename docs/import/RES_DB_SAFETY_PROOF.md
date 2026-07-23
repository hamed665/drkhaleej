# RES-DB-SAFETY-PROOF

Program `v1.2.2` · phase `P03` · execution phase `2` · lock scope `3` · product module `2`.

P03 established test infrastructure only for proving the Pharmacy reservation transaction against an isolated real Supabase Preview database. P04-A retains that harness and requires it to prove the updated canonical RPC. The harness does not add a runtime failpoint, mutate a Pharmacy, publish or roll back an entity, or enable a route, index, sitemap, bulk, or public capability.

P04-A introduces `reservation_created` for new reservation writes with schema `drkhaleej.import.publishAudit.v2`. Legacy `execution_started` records with reservation phase remain reader-compatible; new reservation writes must not use that legacy event.

## Fail-closed prerequisites

- The database must be an isolated Supabase Preview project, never Production.
- The Preview project must have been created from an empty branch and migrated in order from `0001` through the repository's current migration.
- The database ledger must exactly match every four-digit migration in `supabase/migrations`; missing or additional repository-shaped versions fail the proof.
- The canonical `public.import_publish_reserve_snapshot_audit(...)` RPC must exist with its row lock and four persistence boundaries.
- GitHub Actions must contain `P03_PREVIEW_DATABASE_URL`, `P03_PREVIEW_PROJECT_REF`, and `P03_PRODUCTION_PROJECT_REF` as repository secrets. The two project references must differ.
- The database URL must use a direct or session-pooler connection on port `5432`; transaction pooling is rejected because temporary functions and row-lock observation require a stable session.
- `P03_RUN_ID` must be unique per hosted attempt. The workflow derives it from the run, attempt, and exact commit SHA.
- The workflow checks out the exact pull-request head and records that head in the evidence; the synthetic pull-request merge SHA is not accepted as the source anchor.

The runner binds the connection to the configured Preview project reference before any fixture write. Missing configuration, an identity mismatch, unavailable real database, migration drift, RPC drift, or missing hosted evidence is a hard failure. Do not paste either secret into issues, PR comments, screenshots, or chat.

## Proof matrix

The runner creates deterministic, private, short-lived fixtures with a hashed run reference and proves:

1. the first canonical request creates exactly one reservation, snapshot, audit, and consumed authorization link;
2. the same request replays the same three opaque persistence references without duplicate rows;
3. a different request hash conflicts without new rows;
4. two independent PostgreSQL clients contend on the authorization row, a real `Lock` wait is observed, and the final result is one creation plus one replay;
5. a forced exception after each write boundary rolls back the complete transaction:
   - reservation/idempotency insert;
   - rollback snapshot insert;
   - audit insert;
   - authorization update;
6. after every abort the authorization remains `issued` and unconsumed, all three persistence counts are zero, and the Pharmacy row is byte-for-byte unchanged;
7. duplicates, orphans, audit gaps, incomplete reservation links, entity changes, and route/index/sitemap changes are zero;
8. fixture cleanup leaves zero rows and permits deterministic reruns.

After the first cleanup, the runner recreates the same deterministic replay fixture, reserves it once again, verifies the same one-row invariants, and performs a second zero-row cleanup. `rerunSafe` is therefore observed, not inferred.

Fault injection is defined only as `pg_temp.p03_import_publish_reserve_snapshot_audit_fault` in the test client session. The SQL file is not a migration, grants no capability, and disappears when the client disconnects.

## Local contract and hosted proof

Static contract validation does not need database credentials:

```text
pnpm import:reservation-db-safety:validate
```

The real proof is intentionally not optional:

```text
P03_PREVIEW_DATABASE_URL=<server-only-preview-postgres-url>
P03_PREVIEW_PROJECT_REF=<exact-preview-project-ref>
P03_PRODUCTION_PROJECT_REF=<exact-production-project-ref-used-only-as-a-deny-guard>
P03_RUN_ID=<unique-run-id-at-least-12-characters>
pnpm test:db:reservation-safety
```

Never run that command against Production. The runner writes only `artifacts/p03/res-db-safety-proof.json`, and `.gitignore` excludes it. The artifact contains no database URL, project reference, UUID, raw snapshot, token, nonce, authorization material, or unrestricted row payload.

## Required redacted evidence

The hosted artifact must be anchored to the exact reviewed commit and show:

- isolated Preview identity verified;
- migration ledger exactly matched from first to current;
- canonical RPC present and hashed;
- replay, conflict, two-client lock wait, and one-created/one-replayed results;
- all four forced aborts rolled back with authorization still issued;
- duplicates, orphans, audit gaps, incomplete rows, and entity mutation equal to zero;
- route, index, sitemap, publish, and rollback implementation equal to false;
- `reservation_created` implementation equal to true with the exact v2 audit schema;
- cleanup remaining rows equal to zero;
- secret, raw ID, raw payload, and database URL redaction equal to true.

P03 must remain unmerged if the hosted proof is absent or fails, the PR head changes after evidence, checks are not green, review threads remain unresolved, or a different human has not approved the latest reviewable push under the active `main` ruleset.
