## Canonical mapping

- Execution Phase:
- Lock Scope:
- Product Module:
- Subphase ID:
- Baseline main SHA:

## Purpose

<!-- One responsibility only. -->

## Existing authority extended

<!-- Exact existing file/table/RPC/registry. Explain why no parallel subsystem is created. -->

## Allowed files

-

## Scope

-

## Non-goals / forbidden scope

-

## Database and routes

- Database change: none / migration details
- RPC signature change: none / compatibility plan
- Route change: none / route authority
- Public/index/sitemap impact: none / independent promotion

## Security boundary

- [ ] No raw authorization/rollback/service secret crosses client/log/analytics/tracing.
- [ ] Credentials are least-privileged, scoped and server-only.
- [ ] Untrusted source/LLM output is bounded and schema-validated.
- [ ] No Agent/Worker publish, rollback or promotion scope.
- [ ] Error output is bounded and redacted.

## Data and compatibility

- [ ] Existing migration/RPC/audit readers remain compatible.
- [ ] RLS/grants/RPC privileges validated when applicable.
- [ ] No direct canonical write outside the existing executor.
- [ ] Null/absent/empty semantics documented.
- [ ] Schema/policy version recorded.

## Tests

- [ ] Focused unit tests
- [ ] Contract/static checks
- [ ] Real DB integration when applicable
- [ ] Replay/concurrency/abort when applicable
- [ ] Persistence readback for every write
- [ ] Exact recovery for rollback
- [ ] AI evaluation/golden dataset when applicable

## Hosted proof

- [ ] GitHub Actions green on current head SHA
- [ ] Vercel green
- [ ] Isolated Preview DB canary/readback when behavior changes
- [ ] Evidence bundle attached/linked
- [ ] Integrity report attached/linked

## Independent review

- [ ] Scope does not require independent review
- [ ] Migration/authorization/rollback/security/runtime/public scope has at least one independent human approval
- Reviewed commit SHA:
- Reviewer:
- Unresolved review threads: 0 / not applicable

## Documentation/state

- [ ] Canonical roadmap updated only if factual state changed.
- [ ] CURRENT_STATE/matrix/Issue remain aligned.
- [ ] No duplicate ledger introduced.

## Rollback plan

- Code rollback:
- Migration forward-fix/compatibility:
- Data rollback:
- Verification:

## Stop conditions

-
