# زمان‌بندی، تیم و تحویل اصلاح‌شده

## اصل

زمان Proof، migration integration، concurrency، rollback، hosted canary و review از زمان نوشتن skeleton بیشتر است. زمان‌ها range هستند و تضمین نیستند.

## برآورد Bottom-up

| Milestone | زمان کاری خالص |
|---|---:|
| M0/M1 Pharmacy Private Proof | 8–15 روز |
| M2 Registry + Pharmacy Public | 5–10 روز |
| M3 Intake/Contracts | 5–10 روز |
| M4 Automation Foundation | 5–10 روز |
| M5 Entity Agent MVP | 10–20 روز |
| M6 Hospital/Doctor | 15–25 روز |
| M7 Shared Core/Family Packs | 15–30 روز |
| M8 Content/CMS | 10–20 روز |
| M9 Monitoring | 5–15 روز |
| M10 Bulk | 5–10 روز |

جمع خام فنی: حدود `83–165` روز کاری. این جمع قبل از تعطیلی، blocker خارجی، provisioning، data labeling، legal/medical/compliance review و review latency است.

## مسیر تک‌نفره واقع‌بینانه

| Checkpoint | زمان |
|---|---:|
| P01–P09، شامل split مستقل P04-A/P04-B | 2–4 هفته |
| تا Pharmacy Public | 4–6 هفته |
| تا Entity Draft MVP | 7–12 هفته |
| تا Pharmacy/Hospital/Doctor proven | 12–20 هفته |
| نسخه Premium بدون Bulk | 18–30 هفته |
| کل technical program با Bulk، در صورت آماده‌بودن تمام external prerequisites | 20–36 هفته |
| Production operational readiness با provisioning/reviewer/compliance latency | 30–52 هفته |

بازه‌ی 20–36 هفته فقط وقتی معتبر است که Preview DB، Worker host، storage، compliance owner، medical reviewer و source access در زمان Gate مربوط آماده باشند. نبود هرکدام schedule را متوقف و rebaseline می‌کند؛ تاریخ تقویمی بدون owner/dependency evidence تعهد محسوب نمی‌شود.

## مسیر دو جریان

فقط پس از Automation Foundation و با Reviewer مشترک:

```text
Stream A: Entity / Family / Controlled Publish
Stream B: Content Authority / CMS / SEO / Reporting
```

برآورد واقع‌بینانه کل: `16–28 هفته`. Hospital و Doctor موازی نمی‌شوند. Content فقط پس از Gate D موازی می‌شود.

## ظرفیت و WIP

- قبل از P09: فقط یک implementation PR فعال؛
- بعد از P09: حداکثر دو stream؛
- migration authorityهای مرتبط هم‌زمان اجرا نشوند؛
- هر stream حداکثر یک runtime activation باز؛
- review backlog بیشتر از 3 PR → توقف ایجاد PR جدید؛
- docs-only و dataset prep می‌توانند موازی باشند اگر runtime را تغییر ندهند.

## نقش‌ها

### Architecture/Reviewer

authority boundaries، DB/RPC review، phase mapping، merge gate و incident decisions.

### Core Engineer

reservation، executor، rollback، Admin، promotions و family adapters.

### Automation/AI Engineer

worker، fetch، extraction، evaluation، content و observability.

### Admin/Medical Reviewer

source conflict، entity approval، medical claim، canary signoff.

یک نفر می‌تواند چند نقش داشته باشد، اما Medical Approval و merge decision نباید صرفاً بر خروجی Agent متکی باشد.

## Delivery Checkpoints

- A: P09 — Pharmacy Private proven؛
- B: P15 candidate completion — Pharmacy public lifecycle؛
- C: P26 — Entity Draft MVP؛
- D: Hospital/Doctor + shared regression؛
- E: Content CMS authority + revision rollback؛
- F: Bulk soak and recovery.

## Schedule Re-baseline

در پایان هر checkpoint این موارد ثبت و timeline اصلاح شود:

- actual cycle time؛
- review wait؛
- failed/rework PR؛
- DB/environment blockers؛
- source conflict rate؛
- canary failures؛
- remaining critical path.

برنامه باید بر اساس actuals کوتاه یا بلند شود؛ تاریخ ساختگی ممنوع است.
