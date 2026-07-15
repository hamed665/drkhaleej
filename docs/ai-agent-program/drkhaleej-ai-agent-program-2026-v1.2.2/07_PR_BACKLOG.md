# Backlog اجرایی اصلاح‌شده

## قانون شماره‌گذاری

`P01–P09` شناسه‌های اجرایی فوری هستند. برای رعایت reviewability، شناسه‌ی P04 به دو PR مستقل `P04-A` و `P04-B` شکسته شده است؛ بنابراین تحویل فوری ده PR دارد. `P10–P61` candidate backlog هستند، نه تعهد به دقیقاً 61 PR. هر candidate در زمان اجرا بر اساس authority، migration و reviewability ممکن است split شود.

## Immediate Execution — Conditional Go

| ID | Primary Mapping | خروجی |
|---|---|---|
| P01 ALIGN-CURRENT-STATE | Exec 9 / Lock 10 / Module 6 | factual docs alignment + non-runtime drift guard |
| P02 RES-INTEGRITY-READBACK | Exec 9 / Lock 10 / Module 6 | authorization-linked readback |
| P03 RES-DB-SAFETY-PROOF | Exec 2 / Lock 3 / Module 2 | real DB replay/concurrency/abort proof |
| P04-A RESERVATION-AUDIT-SPLIT | Exec 2 / Lock 3 / Module 2 | `reservation_created` + reader compatibility |
| P04-B VERIFIED-RESERVATION-HANDOFF | Exec 2 / Lock 10 / Module 6 | verified server-only handoff؛ no second reservation |
| P05 PRIVATE-ADMIN-WIRING | Exec 4 / Lock 10 / Module 6 | existing executor + publish readback |
| P06 ROLLBACK-AUTHORITY-HARDENING | Exec 9 / Lock 11 / Module 6 | atomic durable reference consumption |
| P07 ROLLBACK-EXACT-RECOVERY | Exec 9 / Lock 11 / Module 18 | field-level exact recovery |
| P08 ADMIN-STATE-MACHINE | Exec 4 / Lock 5 / Module 6 | server-authoritative UX |
| P09 REAL-ADMIN-CANARY | Exec 9 / Lock 11 / Module 18 | real UI canary + integrity zero |

Mapping نهایی باید هنگام branch creation با V10.4 current main بازبینی شود.

### P01 — ALIGN-CURRENT-STATE

- roadmap، CURRENT_STATE، matrix، README pointer و Issue #934؛
- root `README.md` factual migration/status references؛
- static alignment guard برای baseline/migration/current-next در docs؛
- Wave 2.1/2.2 برابر PARTIAL؛
- no runtime/migration/schema/capability؛ فقط docs و non-runtime validator/workflow.

### P02 — RES-INTEGRITY-READBACK

- extend existing verifier؛
- authorization linkage؛
- current `execution_started+phase=reservation` و future `reservation_created`؛
- exact counts، duplicate/orphan/gap و entity unchanged؛
- unit/integration/Preview evidence.

### P03 — RES-DB-SAFETY-PROOF

- isolated real DB harness؛
- same request replay؛
- different request conflict؛
- concurrent transactions؛
- row lock behavior؛
- forced abort after each write boundary؛
- authorization remains issued on rollback؛
- zero incomplete rows.

### P04-A — RESERVATION-AUDIT-SPLIT

- audit schema version جدید؛
- `reservation_created`؛
- old reader compatibility؛
- `execution_started` mutation-only؛
- migration/RPC contract tests؛
- هیچ Admin/private publish activation.

### P04-B — VERIFIED-RESERVATION-HANDOFF

- pass verified reservation IDs server-side؛
- no reservation RPC invocation in private publish؛
- reject stale/foreign/incomplete reservation؛
- invocation-count integration proof؛
- no raw DB IDs در browser/client DTO.
- `private_publish` capability و Admin mutation operation تا P05 disabled؛
- proof با injected port/stub و بدون mutation activation.

### P05 — PRIVATE-ADMIN-WIRING

- Admin→existing executor؛
- exact canonical patch؛
- terminal persistence؛
- publish readback؛
- private/noindex/no-route/no-sitemap؛
- bounded result.

### P06 — ROLLBACK-AUTHORITY-HARDENING

- existing durable reference reused؛
- server-only raw token؛
- bind terminal identity/current version؛
- atomic consume؛
- replay-safe readback.

### P07 — ROLLBACK-EXACT-RECOVERY

- original logical snapshot؛
- publish؛
- rollback؛
- exact comparator؛
- bounded diagnostics؛
- allowed differences only.

### P08 — ADMIN-STATE-MACHINE

- ten server-authoritative stages؛
- refresh/stale/expiry؛
- replay vs fresh؛
- multi-tab/double-submit؛
- readback-only retry؛
- bounded history.

### P09 — REAL-ADMIN-CANARY

- real Preview Pharmacy؛
- UI path only؛
- full reserve/publish/rollback؛
- integrity zero؛
- post-P09 checklist.

## POST-P09 Gate

هیچ candidate بعدی قبل از ثبت `GO` باز نمی‌شود.

## Milestone M2 — Candidate Backlog

- P10 REGISTRY-AUTHORITY-AUDIT
- P11 PHARMACY-PUBLIC-NOINDEX-AUTHORITY
- P12 PHARMACY-BILINGUAL-LIVE-VERIFY
- P13 PHARMACY-PUBLIC-ROLLBACK
- P14 PHARMACY-INDEX-PROMOTION
- P15 PHARMACY-SITEMAP-PROMOTION

هر promotion authorization، snapshot، readback و rollback مستقل دارد.

## Milestone M3/M4 — Intake و Automation

- P16 INTAKE-CONTRACT-CONVERGENCE
- P17 SOURCE-EVIDENCE-LEDGER
- P18 DUPLICATE-GEO-CONTRACT
- G-C CONTRACT-HARDENING gate
- G-W WORKER-RUNTIME-ADR gate
- P19 AUTOMATION-JOB-RUNTIME + FENCING
- P20 AI-BUDGET-OBSERVABILITY

P16/P17 اگر migration و runtime بزرگ دارند split می‌شوند. P19 بدون ADR-001 تا ADR-006، ADR-009 و vocabulary واحد Job ممنوع است. P21 و P47 بدون Gate F ممنوع‌اند.

## Milestone M5 — Entity Agent Draft MVP

- P21 ENTITY-SOURCE-CONNECTORS
- P22 ENTITY-DETERMINISTIC-EXTRACTION
- P23 ENTITY-AI-FALLBACK
- P24 ENTITY-MATCH-EVIDENCE-DRAFT
- P25 ENTITY-ADMIN-REVIEW
- P26 ENTITY-AGENT-CANARY

Canary Hospital در P26 فقط Draft/Evidence است و Hospital publish lifecycle را باز نمی‌کند.

## Milestone M6 — Hospital سپس Doctor

Candidate epics:

- P27 HOSPITAL-ADAPTER
- P28 HOSPITAL-LIFECYCLE-EPIC
- P29 HOSPITAL-CANARY
- P30 DOCTOR-ADAPTER
- P31 DOCTOR-RELATION-AUDIT
- P32 DOCTOR-LIFECYCLE-EPIC
- P33 DOCTOR-CANARY

P28 و P32 باید حداقل به Private، Rollback، Public/Noindex، Index و Sitemap PRهای مستقل split شوند. Hospital و Doctor موازی نمی‌شوند.

## Milestone M7 — Shared Core و Family Packs

- P34 CONTROLLED-PUBLISH-CORE-EXTRACTION
- P35 POLICY-INTERFACES
- P36 SHARED-CORE-REGRESSION
- P37–P45 FAMILY-PACK-EPICS

هر family pack که medical/nonmedical یا facility/professional boundary متفاوت دارد split مستقل می‌خواهد. Launch index فقط سه family اصلی است.

## Milestone M8 — Content/CMS/SEO

قبل از این milestone، `CONTENT-AUTHORITY-GATE` باید Merge شده باشد.

- P46 ARTICLE-CMS-STATE-MACHINE-EPIC
- P47 SEO-SIGNAL-INGESTION
- P48 OPPORTUNITY-ENGINE
- P49 RESEARCH-SOURCE-PACK
- P50 BRIEF-GENERATOR
- P51 ARTICLE-DRAFT-GENERATOR
- P52 CONTENT-QUALITY-GATES
- P53 CONTENT-ADMIN-PUBLISH-EPIC

P46 باید schema/revision، transition authority و Admin UI را جدا کند. P53 باید publish، schedule و rollback را در PRهای مستقل نگه دارد.

## Milestone M9 — Monitoring

- P54 ENTITY-CHANGE-MONITOR
- P55 CONTENT-EVENT-MONITOR
- P56 PERSIAN-REPORTING
- P57 OPERATIONS-DASHBOARD
- P58 GEO-LLM-VISIBILITY

## Milestone M10 — Bulk

- P59 BULK-QUEUE-WORKER
- P60 BULK-ADMIN-CONTROLS
- P61 BULK-SOAK-AND-RECOVERY

شرط ورود: حداقل 10 private publish، 10 rollback، Pharmacy/Hospital/Doctor کامل، representative family canaries، integrity zero و no ambiguous unresolved mutation.

## Split Rule

PR باید split شود اگر بیش از یکی از این موارد را هم‌زمان تغییر دهد:

- authority مستقل؛
- migration contract مستقل؛
- runtime activation؛
- public route/promotion؛
- rollback behavior؛
- family policy متفاوت؛
- reviewer role/approval lifecycle.

تعداد کمتر PR هدف نیست؛ reviewability و proof هدف است.
