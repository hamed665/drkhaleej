# چک‌لیست اجرای فوری P01 تا P09

شناسه‌ی `P04` برای reviewability به دو PR مستقل شکسته شده است؛ بنابراین این موج ده PR دارد.

## قواعد مشترک

- [ ] fresh main و baseline SHA
- [ ] چهار phase mapping
- [ ] authority موجود مشخص
- [ ] allowed/forbidden files
- [ ] unrelated changes excluded
- [ ] no weakened validator
- [ ] evidence روی current head

## P01 ALIGN-CURRENT-STATE

- [ ] roadmap ledger صحیح
- [ ] CURRENT_STATE factual through 0079/#943
- [ ] V10.4 rows
- [ ] Issue #934 body/checklist
- [ ] README فقط pointer
- [ ] root README factual migration/status references updated
- [ ] static alignment guard for roadmap/CURRENT_STATE/matrix/README
- [ ] Issue #934 post-merge update + readback
- [ ] no runtime/migration/schema/capability؛ فقط non-runtime validator/workflow مجاز

## P02 RES-INTEGRITY-READBACK

- [ ] existing verifier extended
- [ ] server-only readback
- [ ] consumed authorization linkage
- [ ] reservation/snapshot/audit exact counts
- [ ] entity/review/family/version/fingerprint/patch/request/scope
- [ ] current and future audit signatures
- [ ] duplicate/orphan/audit-gap
- [ ] entity unchanged
- [ ] bounded output
- [ ] unit/integration/Preview evidence

## P03 RES-DB-SAFETY-PROOF

- [ ] isolated real Postgres/Supabase
- [ ] migrations clean→current
- [ ] same request replay
- [ ] different payload conflict
- [ ] two-client parallel transaction
- [ ] row lock behavior
- [ ] abort injection after each write stage
- [ ] zero incomplete rows
- [ ] authorization unconsumed on rollback
- [ ] fixture cleanup/TTL
- [ ] evidence artifact no secrets

## P04-A RESERVATION-AUDIT-SPLIT

- [ ] reservation_created introduced
- [ ] audit schema version bumped
- [ ] old reader compatibility
- [ ] execution_started mutation-only

## P04-B VERIFIED-RESERVATION-HANDOFF

- [ ] verified reservation handoff
- [ ] private publish does not call reservation RPC
- [ ] stale/foreign reservation rejected
- [ ] handoff is version/fingerprint/request/scope bound
- [ ] replay and expiry behavior proven
- [ ] private_publish capability remains disabled
- [ ] no Admin mutation operation before P05

## P05 PRIVATE-ADMIN-WIRING

- [ ] Admin calls existing executor
- [ ] no new SQL mutation path
- [ ] exact canonical patch
- [ ] terminal persistence
- [ ] publish readback
- [ ] private/noindex/no-route/no-sitemap
- [ ] bounded UI result

## P06 ROLLBACK-AUTHORITY-HARDENING

- [ ] existing durable reference reused
- [ ] raw reference server-side only
- [ ] terminal/version binding
- [ ] atomic consumption
- [ ] replay behavior
- [ ] no second rollback authority

## P07 ROLLBACK-EXACT-RECOVERY

- [ ] original logical snapshot
- [ ] publish
- [ ] rollback
- [ ] field-level exact comparator
- [ ] bounded mismatch diagnostics
- [ ] allowed differences only
- [ ] recovery readback

## P08 ADMIN-STATE-MACHINE

- [ ] 10 server-authoritative stages
- [ ] refresh/stale/expiry
- [ ] replay vs fresh
- [ ] multi-tab/double-submit
- [ ] retry readback only
- [ ] no optimistic success
- [ ] bounded audit history

## P09 REAL-ADMIN-CANARY

- [ ] isolated Preview DB
- [ ] real allowlisted Pharmacy
- [ ] UI path only، no bypass
- [ ] reserve/publish/readback/rollback/recovery
- [ ] integrity zero
- [ ] secret/public/index/sitemap leakage zero
- [ ] GitHub Actions and Vercel green
- [ ] post-P09 Go/No-Go completed
