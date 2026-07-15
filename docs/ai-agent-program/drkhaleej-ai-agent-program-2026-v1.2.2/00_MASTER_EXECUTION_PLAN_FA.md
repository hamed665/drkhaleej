# برنامه‌ی مادر اجرایی اصلاح‌شده

## هدف

DrKhaleej باید یک پلتفرم کنترل‌شده برای Entity و Content باشد. Agentها فقط Observation، Evidence، Candidate، Draft و Proposal می‌سازند. Authorization، Reservation، Mutation، Rollback، Public، Index و Sitemap در authorityهای اصلی پروژه باقی می‌مانند.

```text
Sources
→ Immutable Observation
→ Field Evidence
→ Unified Draft
→ Human Review
→ Exact Review
→ Server Authorization
→ Reservation + Snapshot + Reservation Audit
→ Verified Handoff
→ Private Mutation
→ Publish Readback
→ Rollback + Exact Recovery
→ Independent Public/Index/Sitemap Promotions
```

## واژگان برنامه

برای جلوگیری از تعارض با V10.4، این سند از `Program Milestone` استفاده می‌کند، نه Phase. هر PR واقعی باید جداگانه این چهار مقدار را اعلام کند:

```text
Execution Phase
Lock Scope
Product Module
Subphase ID
```

## Program Milestoneها

| Milestone | خروجی | Gate خروج |
|---|---|---|
| M0 | Truth Alignment | همه‌ی اسناد یک baseline و current-next داشته باشند |
| M1 | Pharmacy Private Proof | P09 و integrity صفر |
| M2 | Registry Truth + Pharmacy Public | public/noindex/index/sitemap مستقل و rollbackable |
| M3 | Intake + Contract Foundation | همه‌ی entrypointها فقط Unified Draft بسازند |
| M4 | Automation Runtime Foundation | queue/fencing/lease/budget/identity/outbox proven |
| M5 | Entity Agent Draft MVP | Evidence کامل، canonical mutation صفر |
| M6 | Hospital سپس Doctor | canary مستقل و relation verified |
| M7 | Shared Core + Later Families | regression سه family و policy packs |
| M8 | Content/CMS/SEO | فقط پس از Content Authority Gate |
| M9 | Monitoring/Reporting | deterministic-first و bounded costs |
| M10 | Bulk | single executor reuse، soak و exact recovery |

## چهار جریان

### A — Controlled Publish

Authority مشترک Review، Authorization، Reservation، Snapshot، Mutation، Rollback و promotionهای Public/Index/Sitemap.

### B — Entity Intelligence

کشف، fetch امن، normalization، duplicate candidate، evidence و Draft. بدون Canonical Mutation.

### C — Content & SEO Intelligence

فقط پس از CMS/Content Authority Gate: signal، research pack، brief، draft، editorial/medical review و revision-based publish.

### D — Automation, Monitoring and Reporting

Job runtime، hard budget، trace، change detection، outbox و گزارش فارسی.

## Gateهای اجباری

### Gate A — Post-P09

برای بازشدن M2 باید P09، Hosted Preview، rollback exact recovery و integrity zero سبز باشند.

### Gate B — Contract Hardening

قبل از schema/migration Agent، قراردادهای پیشنهادی باید با DB فعلی تطبیق، version و contract test شوند.

### Gate C — Worker Runtime ADR

قبل از P19 باید Queue، Worker Host، Service Identity، Storage، Egress، Retention، Observability و fencing semantics تصمیم‌گیری و ثبت شوند.

### Gate D — Content Authority

قبل از هر P46+ باید Article CMS authority، revision lifecycle، approval roles و tracking issue جدا Merge شوند.

### Gate E — Bulk

حداقل ده publish و ده rollback موفق، سه lifecycle اصلی کامل، soak موفق و integrity zero.

### Gate F — Compliance و Source Governance

قبل از P21 و P47 باید source licensing/terms، privacy، copyright، AI vendor processing، retention، takedown/correction و medical accountability توسط Owner مسئول تأیید و ثبت شوند. `robots.txt` به‌تنهایی مجوز حقوقی استفاده یا بازنشر نیست.

## Definition of Done سراسری

یک قابلیت Done نیست مگر اینکه:

- scope و authority موجود مشخص باشد؛
- phase mapping چهارگانه ثبت شود؛
- unit/contract/integration متناسب سبز باشد؛
- DB change در Postgres واقعی تست شود؛
- RLS/grant/RPC signature و compatibility بررسی شود؛
- هر write دارای server readback باشد؛
- replay/concurrency/timeout ambiguity حل شده باشد؛
- rollback exact comparator داشته باشد؛
- secret و raw payload از client/log/tracing حذف باشد؛
- GitHub Actions و Vercel سبز باشد؛
- runtime behavior دارای Hosted Preview proof باشد؛
- status docs و Issue در همان PR هم‌تراز شوند؛
- rollback plan کد، migration و data را جدا پوشش دهد.
- compliance/source policy برای هر connector و هر خروجی قابل انتشار ثبت شده باشد.
- PRهای migration، authorization، rollback، security و runtime activation حداقل یک review مستقل ثبت‌شده داشته باشند.

## ممنوعیت‌ها

- Agent/Worker publish یا rollback؛
- direct Excel/CSV/API write به Canonical Entity؛
- Service Role کامل در n8n/crawler؛
- Route/SEO/Sitemap موازی؛
- public link از candidate relation؛
- Hospital و Doctor به‌صورت موازی؛
- Content LLM پیش از Gate D؛
- auto-retry برای mutation مبهم؛
- blind Publish All؛
- ادعای موفقیت بدون hosted evidence.
- source connector بدون approved source policy و compliance record.

## خروجی Launch اصلی

Index launch فقط برای `doctor`، `hospital` و `pharmacy` است. سایر familyها تا تکمیل policy، canary، content completeness و promotion مستقل `noindex` یا disabled می‌مانند.
