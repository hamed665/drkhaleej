# تصمیم‌های معماری و پیش‌نیازهای اجباری

## وضعیت تصمیم‌ها

| ID | تصمیم | وضعیت | باید قبل از |
|---|---|---|---|
| ADR-001 | یک repository، Web و Worker deployment جدا | Accepted | P19 |
| ADR-002 | Postgres/Supabase job control plane | Proposed/validate | P19 |
| ADR-003 | n8n فقط scheduler/orchestrator | Accepted | P19 |
| ADR-004 | Worker فاقد publish/rollback scope | Accepted | همیشه |
| ADR-005 | Service-to-service signed identity | Required design | P19 |
| ADR-006 | Raw observation در object storage | Required design | P17/P21 |
| ADR-007 | Content/CMS authority جدا | Required | P46 |
| ADR-008 | Real Preview DB integration harness | Required | P03 |
| ADR-009 | Lease fencing و stale-worker rejection | Required | P19 |
| ADR-010 | Compliance و Source Governance | Required | P21/P47 |

## ADR-001 — Repository و Deployment

- کد Web/Admin و Worker از یک repository و یک commit ساخته می‌شود.
- Worker یک container/process بلندمدت جدا از Vercel request runtime است.
- contractها و policyها shared هستند؛ runtime secrets و network identity جدا هستند.
- استخراج به monorepo/package مستقل فقط پس از اثبات نیاز و با PR جدا انجام می‌شود.

## ADR-002 — Job Control Plane پیشنهادی

برای MVP از Postgres/Supabase job tables استفاده شود:

```text
queued → leased → running → waiting_review/succeeded/failed_retryable/failed_terminal/deferred_budget/cancelled
```

الزامات:

- lease با `FOR UPDATE SKIP LOCKED` یا RPC اتمیک معادل؛
- lease expiry و reclaim؛
- monotonically increasing `lease_epoch` یا fencing token؛
- هر heartbeat/complete/write باید owner، token hash و lease epoch فعلی را اتمیک تأیید کند؛
- stale worker پس از reclaim حق هیچ persistence یا completion ندارد؛
- idempotency per job intent؛
- max attempts؛
- pause global/source/family؛
- outbox transactionally linked؛
- هیچ publish/rollback job type وجود نداشته باشد.

اگر load بعداً نیازمند queue خارجی شد، migration باید بدون تغییر domain contract انجام شود.

## ADR-003 — n8n Boundary

n8n فقط مجاز است:

- schedule trigger؛
- `job:create` bounded request؛
- `job:read` bounded status read؛
- notification delivery از outbox-approved payload.

n8n نباید SQL، Service Role، Canonical Entity write یا Publish RPC داشته باشد.

## ADR-005 — Service Identity

قبل از Worker runtime باید این قرارداد پیاده شود:

- asymmetric signed JWT یا workload identity؛
- `iss`، `sub`، `aud`، `scope`، `iat`، `exp`، `jti` اجباری؛
- TTL حداکثر 5 دقیقه؛
- audience جدا برای Web internal API؛
- scope vocabulary مجاز: `job:create`, `job:read`, `job:lease`, `job:execute`, `job:heartbeat`, `job:complete`, `draft:write`, `evidence:write`, `report:write`؛
- scopeهای ممنوع: `publish`, `rollback`, `public_promote`, `index_promote`, `sitemap_promote`؛
- `jti` replay cache؛
- key rotation با overlap محدود؛
- secret/key در browser، n8n عمومی، logs یا trace attributes نباشد؛
- request body hash و timestamp در audit ثبت شود.
- `alg` و `kid` فقط از JOSE header تأییدشده خوانده می‌شوند و داخل claims به‌عنوان authority پذیرفته نمی‌شوند.
- n8n فقط `job:create` و `job:read` می‌گیرد؛ lease/execute/complete فقط برای Worker identity است.

## ADR-006 — Observation Storage

- Raw HTML/JSON در Canonical DB ذخیره نشود.
- object storage خصوصی با encryption-at-rest و retention policy استفاده شود.
- DB فقط storage reference، content hash، selected hash، source، observed time و parser version را نگه دارد.
- raw body پیش‌فرض 30 روز؛ موارد dispute/evidence حداکثر 90 روز با reason؛
- bounded evidence excerpt در DB؛
- deletion job و legal/terms review قابل audit باشد.

## ADR-007 — Content Authority Gate

قبل از P46 باید یک tracking issue و ADR جدا تأیید کند:

- Article revision authority؛
- editorial و medical role separation؛
- state transition authorization؛
- schedule/publish executor؛
- revision rollback؛
- citation/source pack retention؛
- public route، canonical، hreflang و sitemap integration؛
- no auto-publish.

برنامه‌ی Import Readiness به‌تنهایی Content/CMS را مجاز نمی‌کند.

## ADR-008 — Preview DB Harness

P03 باید محیط واقعی Postgres/Supabase ایزوله داشته باشد:

- migration 0001→current روی DB تمیز؛
- deterministic canary fixture؛
- unique test run ID؛
- concurrent clients واقعی؛
- forced exception بعد از هر write boundary؛
- transaction rollback verification؛
- cleanup یا TTL؛
- evidence artifact بدون secret/raw payload؛
- عدم استفاده از Production DB.

Fault injection فقط در harness ایزوله و test-only مجاز است: transaction wrapper، test migration variant یا ephemeral function که وارد migration production و runtime build نمی‌شود. هیچ environment flag یا failpoint قابل‌فعال‌سازی در Production مجاز نیست.

## ADR-009 — Lease Fencing

- هر lease جدید یک `lease_epoch` افزایشی می‌گیرد.
- Worker برای heartbeat، checkpoint، draft write و completion همان epoch را ارسال می‌کند.
- DB/RPC فقط owner/token/epoch فعلی و lease منقضی‌نشده را می‌پذیرد.
- reclaim، cancel و kill-switch epoch قبلی را نامعتبر می‌کنند.
- retry یا network delay نباید به stale completion یا duplicate outbox منجر شود.
- تست دو Worker واقعی باید ثابت کند Worker قدیمی پس از reclaim رد می‌شود.

## ADR-010 — Compliance و Source Governance

قبل از فعال‌سازی connector یا Content Agent باید برای هر source/purpose ثبت شود:

- owner و approved use؛
- terms/robots/licensing/copyright status؛
- privacy/PII classification و retention؛
- AI vendor/data-processing boundary؛
- allowed excerpt/republication scope؛
- takedown، correction، deletion و dispute path؛
- medical reviewer accountability؛
- review date و expiry/reapproval date.

این ADR مشاوره حقوقی را جعل نمی‌کند؛ approval باید توسط مسئول مجاز پروژه ثبت شود.

## تصمیم‌های باز و Stop Condition

اگر Worker host، identity provider، storage retention، Preview DB isolation، fencing design، compliance owner یا ownership هزینه مشخص نشده باشد، P19/P21/P47 باز نمی‌شود. Placeholder implementation ممنوع است.
