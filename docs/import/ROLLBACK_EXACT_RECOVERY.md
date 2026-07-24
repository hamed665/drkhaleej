# P07 Rollback Exact Recovery

## Mapping

- Execution Phase: `Phase 9`
- Lock Scope: `Phase 11`
- Product Module: `Phase 18`
- Subphase ID: `ROLLBACK-EXACT-RECOVERY`

## Purpose

P07 extends the proven P06 Pharmacy rollback path with a server-only logical comparator. It must prove that the original protected snapshot and the persisted post-rollback Pharmacy state are logically identical except for explicitly allowlisted operational metadata.

## Planned file scope

Implementation may modify only the existing Pharmacy rollback canary/readback/comparator path, focused tests and static validators, the isolated Preview proof workflow and runner, and factual alignment documents after exact-head proof is green.

A database migration is not expected unless the current persisted snapshot contract cannot support exact readback without changing authority. If that boundary is encountered, implementation stops rather than inventing a parallel snapshot or rollback subsystem.

## Required comparison surface

- bounded Pharmacy entity fields captured by the existing snapshot contract;
- locale and country;
- canonical slug/path identity;
- geo and projection metadata;
- protected metadata;
- snapshot-governed relation state;
- private publication, route, index and sitemap state;
- deletion and sort state.

## Allowed differences

- append-only audit/history timestamps;
- monotonic entity version metadata;
- rollback metadata;
- consumed rollback-authority state.

## Bounded diagnostics

Every unexpected mismatch must identify only a normalized field path plus deterministic expected and actual hashes. Raw protected values, database identifiers not already allowlisted, payloads, and secrets must never enter errors, logs, artifacts, browser DTOs, or UI state.

## Closed boundaries

- no rollback UI or Admin state-machine activation reserved for P08;
- no real Admin UI canary reserved for P09;
- no second rollback or snapshot authority;
- no direct entity-table mutation path;
- no public, index, sitemap or route promotion;
- no Agent, Content, Hospital, Doctor or Bulk scope;
- no Production connection, migration, mutation or read.

## Validation

- focused comparator unit and integration tests;
- static secret/raw-value and client-boundary guards;
- isolated Preview publish, rollback and exact logical recovery proof;
- mismatch fixture proving bounded hashed diagnostics;
- P03, P05 and P06 hosted regressions;
- full repository CI, Vercel and exact-SHA evidence;
- independent approval before merge.
