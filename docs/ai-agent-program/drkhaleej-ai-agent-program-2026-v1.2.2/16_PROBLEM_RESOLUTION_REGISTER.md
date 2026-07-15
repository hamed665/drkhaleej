# Problem Resolution Register

این فایل فهرست بسته‌ی مشکلات شناسایی‌شده و اقدام لازم است. هر مورد فقط با evidence تعیین‌شده Closed می‌شود.

| ID | شدت | مشکل | اقدام | Owner پیشنهادی | Gate/PR | Evidence پایان |
|---|---|---|---|---|---|---|
| PRB-001 | Critical | roadmap/CURRENT_STATE/matrix/Issue drift | factual alignment بدون runtime | Architecture | P01 | چهار مرجع هم‌تراز، diff runtime صفر |
| PRB-002 | Critical | Reservation readback ناقص | extend existing verifier | Core | P02 | exact authorization-linked counts |
| PRB-003 | Critical | concurrency/abort فقط static | isolated real DB harness | DB/Core | P03 | parallel/abort artifact و zero partial rows |
| PRB-004 | Critical | Private publish reservation runner را دوباره invoke می‌کند | verified handoff، no second RPC | Core | P04-B | invocation proof و audit split |
| PRB-005 | High | publish readback/terminal chain ناقص | existing executor wiring + readback | Core | P05 | exact patch و terminal integrity |
| PRB-006 | High | rollback reference hardening لازم | atomic consume/version binding | Core/Security | P06 | replay/concurrency tests |
| PRB-007 | Critical | exact recovery اثبات نشده | field-level comparator | Core/QA | P07 | original=post-rollback except allowlist |
| PRB-008 | High | UI state refresh/multi-tab ناقص | server-authoritative state machine | Admin | P08 | browser behavior tests |
| PRB-009 | Critical | full UI canary اجرا نشده | isolated real Preview canary | Admin/QA | P09 | integrity zero و Go/No-Go |
| PRB-010 | High | Phase terminology با V10.4 متعارض | Program Milestone + four mappings | Architecture | P01/package | PR template و matrix mapping |
| PRB-011 | High | JSON contracts unbounded/unsafe | versioned bounded schemas + runtime invariants | Platform | Gate C | contract tests و compatibility |
| PRB-012 | High | Agent duplicate/publish authority leak | candidate-only schemas و reviewer records | Platform/Admin | Gate C | schema rejects agent approval/publish |
| PRB-013 | High | Worker/Queue host نامشخص | ADR-001..006 | Architecture/Ops | Gate W | accepted ADRs و threat review |
| PRB-014 | High | service credential protocol مبهم | scoped signed identity، TTL/jti/rotation | Security | Gate W | replay/key rotation tests |
| PRB-015 | High | raw payload storage/retention مبهم | private object storage + retention | Security/Ops | P17/P21 | deletion/access audit tests |
| PRB-016 | High | Content Agent authority ندارد | CMS/Content tracking issue + ADR | Product/Architecture | Gate D | revision/approval/rollback authority |
| PRB-017 | High | timeline از نظر جمع ریاضی نادرست | bottom-up rebaseline | Delivery | package/P09 | actual cycle-time based forecast |
| PRB-018 | Medium | 61 PR به‌عنوان تعداد قطعی | candidate epics + split rule | Architecture | backlog | reviewable PR scopes |
| PRB-019 | High | Preview DB isolation تعریف نشده | isolated harness/fixture/cleanup | Ops/DB | P03/P09 | no Production access و repeatable run |
| PRB-020 | Medium | AI percentages/budgets غیرقابل enforce | atomic budget reservation و caps | Automation | P20 | ledger و alert thresholds |
| PRB-021 | Medium | 99٪ quality بدون sample size | versioned dataset، ≥500 observations و CI | AI/Reviewer | P23/P26 | evaluation report |
| PRB-022 | High | Hospital lifecycle epic بزرگ | split private/rollback/public/index/sitemap | Architecture | P28 | separate authority PRs |
| PRB-023 | High | Doctor lifecycle epic بزرگ | split + relation audit first | Architecture | P31/P32 | separate authority PRs |
| PRB-024 | Medium | launch scope ممکن است گسترده شود | index فقط Doctor/Hospital/Pharmacy | Product/SEO | all public work | registry/index proof |
| PRB-025 | Critical | P04 migration/audit و runtime handoff را مخلوط می‌کند | split به P04-A/P04-B | Architecture/Core | P04-A/P04-B | دو PR مستقل و hosted proof |
| PRB-026 | Critical | Entity Draft schema reviewer authority را در Agent payload می‌پذیرد | candidate schema و Human Review record جدا | Platform/Security | Gate C | Agent schema فاقد approval/resolution state |
| PRB-027 | High | `number` و `integer` در `oneOf` تداخل دارند | حذف integer branch یا استفاده از anyOf | Platform | Gate C | Draft 2020-12 compile + integer vector |
| PRB-028 | High | family vocabulary با registry فعلی یکسان نیست | current-main registry reconciliation | Architecture | P10/Gate C | mapping بدون alias موازی |
| PRB-029 | High | Queue فاقد fencing صریح است | lease epoch + stale-worker rejection | Automation/DB | ADR-009/P19 | two-worker reclaim test |
| PRB-030 | High | source/privacy/copyright approval gate صریح نیست | Compliance/Source Governance Gate | Product/Security | ADR-010/Gate F | approved source records |
| PRB-031 | Medium | 99٪ point precision می‌تواند ضعف field/locale را پنهان کند | lower CI + stratified evaluation | AI/QA | P23/P26 | per-field/family/locale report |
| PRB-032 | Medium | budget hard cap می‌تواند با actual cost رد شود | provider caps + p99 reserve buffer | Automation/FinOps | P20 | bounded overrun test |
| PRB-033 | Medium | GitHub Issue update داخل PR اتمیک نیست | post-merge issue update + readback | Architecture | P01 | merged SHA در Issue و alignment check |
| PRB-034 | High | validator قبلی AJV/vectorها را بازتولید نمی‌کرد | pinned dependencies + strict compile + vectors + checksums | Platform | package 1.2.1 | `npm ci && npm run validate` |
| PRB-035 | High | service scope vocabulary در docs/schema متفاوت بود | canonical `job:*`/`draft:write` vocabulary | Security | Gate W/package | schema/doc parity test |
| PRB-036 | Critical | Article Candidate می‌توانست human gate pass اعلام کند | Candidate/Review contract separation | Content/Security | Gate D/package | adversarial vector rejected |
| PRB-037 | High | approved Source Policy با blocked statuses ممکن بود | conditional fail-closed policy schema + runtime | Compliance | Gate F/package | invalid policy rejected |
| PRB-038 | High | denied observation می‌توانست raw payload نگه دارد | denied/needs-review storage prohibition | Security | P17/package | adversarial vector rejected |
| PRB-039 | High | P04-B ممکن بود با P05 activation مرز مبهم داشته باشد | P04-B refactor-only؛ capability disabled | Core | P04-B | no Admin mutation operation/capability |
| PRB-040 | High | docs alignment پس از P01 دوباره قابل drift بود | non-runtime alignment guard + Issue readback | Architecture | P01 | drift fixtures fail |
| PRB-041 | High | PRهای DB/security بدون review مستقل Merge شده‌اند | branch protection + CODEOWNERS + human approval | Owner/Security | before P02 behavior merge | review ID روی commit نهایی |
| PRB-042 | Medium | AI budget به‌اشتباه ممکن بود TCO تلقی شود | full-program cost register | FinOps | P19/Public | owner/cap/actual for every cost center |
| PRB-043 | Medium | `ajv@8.17.1` دارای advisory شناخته‌شده بود | upgrade و lock روی `8.20.0` | Platform/Security | package 1.2.2 | production audit صفر |
| PRB-044 | High | invalid vector می‌توانست به علت نامرتبط pass شود و vectorهای الزامی ناقص بودند | exact schema reason/runtime code assertion + full required vector set | Platform/QA | package 1.2.2 | تمام vectorها علت دقیق مورد انتظار را اثبات کنند |

## Closure policy

- `Implemented` بدون evidence برابر Closed نیست.
- docs claim قبل از merge behavior ممنوع است.
- Critical item با unit test تنها بسته نمی‌شود اگر DB/Hosted behavior دارد.
- هر item که main جدید آن را تغییر دهد دوباره Open و re-baseline می‌شود.
