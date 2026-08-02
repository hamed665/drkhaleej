# Source Evidence Ledger

## Decision

`SOURCE-EVIDENCE-LEDGER` is complete as a private, bounded persistence boundary for source observations and selected field evidence. It extends P16 references without creating a second Draft, entity, publish, route, Index or Sitemap authority.

This is P17 only. Worker and Agent execution, source connectors, Human approval records, duplicate/geo expansion and controlled publication remain gated.

## Four-axis mapping

- Execution Phase: 9
- Lock Scope: 10
- Product Module: 6
- Subphase: `SOURCE-EVIDENCE-LEDGER`

## Storage and privacy boundary

- Raw HTML, JSON, files and response bodies remain in encrypted private Object storage.
- The canonical database stores only a bounded private storage reference, content hash, selected hash, source identity, observed time, parser version and retention metadata.
- Selected Evidence excerpts are bounded to 1,000 characters and carry a digest plus P16-compatible `referenceId` and field paths.
- `denied` and `needs_review` observations persist policy metadata only; raw storage references, raw hashes and Evidence rows are forbidden.
- No table has a public, anonymous, authenticated or direct service-role policy/grant.
- Registration, bounded readback and deletion audit are exposed only through pinned, service-role-only RPCs with explicit platform-admin actor verification.

## Retention and deletion

- Standard raw retention is at most 30 days from `observedAt`.
- An active dispute can extend retention to at most 90 days and requires a bounded reason.
- Evidence and audit rows are append-only.
- A successful private-object deletion clears the storage reference and records a receipt hash and deletion event; content hashes remain for bounded audit proof.
- Access and deletion events are idempotent. An exact replay is returned before lifecycle-state rejection, while a mismatched reuse fails closed.

## Contract semantics

The only accepted schema is `drkhaleej.import.sourceEvidenceLedger.v1`. Accepted observations require a private storage reference, content and selected hashes, and at least one bounded Evidence item. Unknown sources, policy states, versions, retention windows and malformed Evidence fail closed.

AI-assisted input still requires Human Review. A successful ledger write means only that an Observation and its selected Evidence were recorded; it is never approval, canonical entity mutation, publication, public eligibility, Index eligibility or Sitemap eligibility.

## Explicit exclusions

- No Worker or Agent runtime
- No connector, crawl, network fetch or object upload implementation
- No Human approval or duplicate-resolution authority
- No canonical entity-table write
- No Reservation, mutation, rollback, route, JSON-LD, internal-link, Index or Sitemap change
- Production remains disconnected and untouched

## Validation

- ten focused contract tests cover accepted, denied, needs-review, AI, retention, malformed/unbounded Evidence, P16 references and authority-negative behavior;
- migration/RLS validation covers all three private tables, immutable Evidence/audit rows, pinned RPCs and absence of direct grants;
- the isolated Preview proof covers registration, exact replay, mismatched replay, bounded readback, audited deletion, replay after deletion and denied/needs-review storage prohibition;
- publish-readiness, state alignment, routes, SEO, typecheck, lint, full unit suite and production build remain required.

## Next gate

```text
DUPLICATE-GEO-CONTRACT
```

P18 may define candidate-only duplicate and geo contracts. It must not treat Agent output as Human resolution or publication authority.
