# معماری سیستم اصلاح‌شده

## Topology

```text
Admin Browser
    ↓ bounded Server Actions
Next.js Web/Admin ───────────────┐
    ↓ controlled authorities     │ signed internal API
Postgres/Supabase                │
    ↑ job RPC / draft RPC        │
Automation Worker ◄──────────────┘
    ↑ bounded schedule
n8n/Cron

Private Object Storage: raw observations
Observability: metrics/traces with redaction
Telegram/Email: approved outbox payload only
```

## Runtime separation

| Runtime | مجاز | غیرمجاز |
|---|---|---|
| Browser | bounded state، review input | token، service credential، raw payload |
| Web/Admin | review، authorization، controlled executor | unbounded response، hidden mutation |
| Worker | fetch، rules، AI، Draft، reports | publish، rollback، promotion |
| n8n | schedule، job create/status | DB SQL، Service Role، business policy |
| DB | canonical authority، transactions، RLS | browser-direct privileged write |

## Repository Decision

یک repository حفظ می‌شود. Worker از همان commit و shared contracts ساخته می‌شود، ولی deployment، identity، network policy و secrets جدا دارد. Worker باید container/process بلندمدت باشد؛ Vercel request runtime برای poller دائمی استفاده نمی‌شود.

ساختار هدف:

```text
src/server/
  agents/entity/
  agents/content/
  automation/jobs/
  automation/budgets/
  automation/notifications/
  policies/
  admin/
scripts/workers/
contracts/
docs/
supabase/
```

## Authority Matrix

| مفهوم | Authority | Writer |
|---|---|---|
| Canonical Entity | existing DB + policies | controlled executor only |
| Observation | evidence ledger | Worker bounded RPC |
| Unified Draft | intake authority | Manual/CSV/API/AI adapters |
| Exact Patch | canonical patch builder | Admin review workflow |
| Authorization | server persistence | Web/Admin only |
| Reservation/Snapshot | existing RPC/tables | controlled reservation RPC |
| Private Mutation | existing family executor | Web/Admin only |
| Rollback | existing rollback authority | Web/Admin only |
| Public Route | route registry | promotion executor |
| Index/Sitemap | eligibility authorities | independent promotions |
| Job/Budget | automation control plane | scheduler/worker bounded RPC |
| Article Revision | future CMS authority | editorial executor only |

## Job Flow

```text
Schedule
→ Create idempotent job
→ Atomic lease
→ Fetch/Rules
→ Optional AI with budget reservation
→ Schema validate
→ Persist Observation/Evidence/Draft
→ Readback
→ Complete job
→ Transactional outbox
```

## Entity Flow

```text
Source Registry
→ Safe Fetch
→ Raw Observation Reference
→ Deterministic Extraction
→ AI Fallback when justified
→ Normalization
→ Duplicate Candidates
→ Field Evidence
→ Unified Draft
→ Human Review
```

## Content Flow

این مسیر تا Content Authority Gate مسدود است:

```text
GSC/Analytics/Crawl
→ Opportunity
→ Source Pack
→ Brief
→ Revision Draft
→ Editorial Review
→ Medical Review if required
→ Human Approval
→ CMS Executor
→ Revision Readback/Rollback
```

## Trust Boundaries

1. Browser فقط bounded DTO دریافت می‌کند.
2. Worker با service identity محدود و بدون publish scope کار می‌کند.
3. n8n فقط `job:create` و `job:read` دارد.
4. Raw HTML، JSON-LD و LLM output untrusted هستند.
5. redirect و DNS در هر hop دوباره validate می‌شوند.
6. Canonical mutation فقط از executor موجود است.
7. public، index و sitemap سه authorization و rollback مستقل دارند.

## Availability و Failure Model

- job writeها idempotent؛
- lease reclaimable؛
- fetch retry bounded؛
- AI failure → defer/review؛
- ambiguous mutation → readback، نه retry؛
- notification از outbox؛
- DB unavailable → no optimistic success؛
- observability failure نباید secret یا payload را fallback-log کند.

## Non-functional Targets اولیه

- Control-plane API p95 کمتر از 800ms برای read/job operations؛
- worker lease heartbeat قابل تنظیم و حداقل دو برابر max observed task gap؛
- zero lost jobs در crash test؛
- zero duplicate canonical mutation؛
- audit coverage برای تمام privileged actions؛
- RPO برای canonical DB مطابق Supabase backup policy تأییدشده؛
- RTO عملیاتی بعد از incident drill ثبت شود، نه حدس زده شود.
