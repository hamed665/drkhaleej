# P05 Private Admin Wiring

## Mapping

- Execution Phase: `Phase 4`
- Lock Scope: `Phase 10`
- Product Module: `Phase 6`
- Subphase ID: `PRIVATE-ADMIN-WIRING`

## Purpose

P05 wires the existing guarded Pharmacy private executor to the already verified Reservation handoff. It must apply only the exact reviewed canonical patch, persist terminal execution state, create one server-only durable rollback reference, and require post-mutation readback before the Admin operation can report success.

## Existing authorities only

P05 extends the existing Review, Authorization, Reservation, rollback snapshot, reservation audit, Pharmacy private mutation RPC, terminal persistence, durable publish-reference, public exposure guard, and Admin runtime authorities. It must not create a second Reservation, a parallel SQL mutation path, or a second publication authority.

## Required behavior

- require the persisted exact Review and its complete identity binding;
- require the entity-bound confirmation `EXECUTE PRIVATE PUBLISH <entity-id>`;
- consume the already verified Reservation without invoking the Reservation RPC again;
- append `execution_started` only at the real mutation boundary;
- apply the exact reviewed canonical Pharmacy patch;
- preserve protected metadata and keep the entity private;
- persist the terminal success result and audit in the mutation transaction;
- create or resolve one opaque durable rollback reference server-side;
- verify the final entity version, exact patch, protected metadata, audit counts, durable reference, and private/noindex/no-route/no-sitemap state;
- return a bounded result only after successful readback.

## Closed boundaries

- no rollback-reference consumption or hardening reserved for P06;
- no exact rollback recovery reserved for P07;
- no Admin state-machine expansion reserved for P08;
- no real UI canary reserved for P09;
- no public, index, sitemap, route, bulk, Agent, Content, Hospital, or Doctor activation;
- no Production connection, migration, or mutation.

## Database rule

Existing migrations are immutable. An additive migration is allowed only to align the existing Pharmacy private publish RPC with the P04-A Reservation audit split and the real mutation-time `execution_started` boundary. It must be applied and proven only against the isolated Preview database.

## Validation

- focused unit and contract tests;
- migration and RPC static validation;
- full import-readiness audit;
- typecheck, lint, build, route, SEO, RLS, and seed gates;
- Preview Migration Sync on the exact final SHA;
- hosted isolated Preview publish/readback proof on the exact final SHA;
- Vercel Preview;
- independent approval before merge.

## Stop conditions

Stop if implementation requires Production, a second Reservation, a parallel mutation authority, public promotion, P06/P07 rollback behavior, or weakening any existing safety validator.
