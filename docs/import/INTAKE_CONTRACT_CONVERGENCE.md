# Intake Contract Convergence

## Decision

`INTAKE-CONTRACT-CONVERGENCE` is complete as a server-only, non-persistent contract boundary. Manual, CSV, Excel, API and AI-assisted entrypoints now converge through the same versioned envelope into the existing Unified Draft model.

This is P16 only. It does not implement P17 evidence persistence, P18 duplicate/geo expansion, Worker or Agent execution, Human approval records, controlled publish, public routes, Index, Sitemap or Bulk.

## Four-axis mapping

- Execution Phase: 9
- Lock Scope: 10
- Product Module: 6
- Subphase: `INTAKE-CONTRACT-CONVERGENCE`

## Accepted envelope

The only accepted version is `drkhaleej.import.intake.v1`. Unknown versions, unknown sources, extra envelope fields, a non-object payload or invalid evidence references fail closed without constructing a fallback Draft.

The five source identities are:

- `manual`
- `csv`
- `excel`
- `api`
- `ai_assisted`

Every accepted envelope contains the existing Unified Draft payload plus opaque Evidence references. References carry only a bounded `referenceId` and bounded field paths; raw observations, excerpts, response bodies, HTML and files are not accepted by this boundary.

## Draft and readiness semantics

Contract convergence and validation readiness are separate results:

- a structurally valid intake can create a Draft even while required entity fields remain incomplete;
- incomplete entity data leaves `readyForValidation=false` and exposes the existing bounded Draft blockers;
- a Contract/version/source/Evidence failure produces no Draft;
- `directEntityWriteAllowed` is always `false`;
- AI-assisted input is always forced to `needs_review`, even if its producer requests otherwise.

Convergence is not approval, exact review, authorization, reservation, publish eligibility, public eligibility, Index eligibility or Sitemap eligibility.

## Compatibility boundary

P16 composes the existing `ImportUnifiedDraftEntity` builder and blocker vocabulary. It does not change the Pharmacy mutation adapter, public lifecycle authorities, registry, route readers or migration inventory. Existing consumers therefore keep their current contract while new intake adapters receive a total fail-closed boundary.

## Explicit exclusions

- No Migration
- No database, RPC, RLS, grant or policy change
- No Worker or Agent runtime
- No connector or network fetch
- No Observation or Evidence ledger persistence
- No Human approval record
- No entity-table write
- No public route, JSON-LD, internal link, Index or Sitemap change
- Production remains disconnected

## Validation

- eight focused unit tests cover the five sources, incomplete Draft semantics, unknown version/source failure, bounded Evidence, forced AI review, non-authority semantics and existing family selection;
- the static contract validator rejects database and publish tokens;
- publish-readiness, state-alignment, migration/RLS, route/SEO, typecheck, lint, full unit suite and production build remain required.

## Next gate

```text
SOURCE-EVIDENCE-LEDGER
```

That gate must define its own authority, persistence, retention, privacy, RLS, reviewer and rollback boundaries before any ledger or runtime is implemented.
