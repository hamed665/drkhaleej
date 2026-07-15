# Changelog

## 1.2.2 — 2026-07-16

### Corrected

- `ajv` از نسخه آسیب‌پذیر `8.17.1` به `8.20.0` ارتقا یافت و production audit صفر شد.
- validator اکنون علت دقیق rejection را با schema keyword/path یا runtime invariant code تأیید می‌کند؛ invalid شدن به علت نامرتبط test pass محسوب نمی‌شود.
- duplicate field/source ID، stale review binding، stale lease epoch و unknown policy به runtime invariantهای قابل بازتولید اضافه شدند.
- تناقض سند درباره integer رفع شد: integer به‌عنوان JSON number معتبر است، اما schema branch هم‌پوشان جداگانه ممنوع می‌ماند.

### Added

- vectorهای مستقل برای oversized string/array/object؛
- vectorهای مستقل برای duplicate field/source، resolved conflict، unsupported family/locale/scheme؛
- vectorهای stale draft hash/version، stale lease epoch، unknown schema/policy version؛
- positive integer-scalar vector و `npm test` alias.

## 1.2.1 — 2026-07-16

### Corrected

- validation بسته از structural-only به AJV Draft 2020-12 compile، vector validation، runtime invariants و checksum verification ارتقا یافت.
- dependencyهای validation pin و lock شدند تا فرمان بازتولیدپذیر باشد.
- vocabulary scopeهای Service Identity روی `job:*`، `draft:write`، `evidence:write` و `report:write` یکسان شد.
- `alg` و `kid` از JWT claims حذف و به JOSE header verification سپرده شدند.
- Article Candidate دیگر نمی‌تواند editorial/medical approval را اعلام کند؛ Human Article Review قرارداد مستقل دارد.
- Source Policy متناقض نمی‌تواند `approved` شود و observation ردشده نمی‌تواند raw payload ذخیره کند.
- approval و duplicate decisionهای Entity بدون Evidence رد می‌شوند.
- مرز P04-B/P05 صریح شد: P04-B فقط handoff/refactor و Private Publish تا P05 disabled است.
- P01 شامل اصلاح صریح root README و alignment guard غیرruntime شد.

### Added

- 9 schema versioned و 20 vector مثبت/منفی/adversarial؛
- runtime checks برای service TTL، budget relationship، attempt limit، timestamp order و reference consistency؛
- Branch Protection و Independent Review policy پیشنهادی؛
- Import Readiness Alignment Guard specification؛
- full-program cost register و schedule assumptions؛
- test-only fault-injection boundary برای P03.

## 1.2.0 — 2026-07-15

### Corrected

- Baseline و Wave Ledger با `main@74541b9` تثبیت شد.
- P01 به‌عنوان alignment اجباری پیش از runtime ثبت شد.
- DB proof واقعی و isolated برای P03 اجباری شد.
- Reservation→Execution handoff و ممنوعیت reservation invocation دوم صریح شد.
- زمان تک‌نفره از 12–18 هفته به بازه‌ی قابل دفاع 20–36 هفته اصلاح شد.
- برنامه‌ی دو جریان به 16–28 هفته‌ی واقع‌بینانه اصلاح شد.
- PRهای بعد از P09 از شماره‌ی قطعی به backlog candidate تبدیل شدند.
- PRهای بیش‌ازحد بزرگ دارای split rule اجباری شدند.
- P04 به دو PR مستقل migration/audit و verified runtime handoff شکسته شد.
- Candidate Agent از Human Reviewer Decision در contract جدا شد.
- entity taxonomy با vocabulary فعلی `ImportEntityType` در main تطبیق داده شد.
- ابهام `number`/`integer` در bounded scalar حذف شد.
- vocabulary job state، lease epoch و fencing token یکپارچه شد.

### Added

- Architecture Decision Gates برای Worker/Queue/Auth/Storage؛
- Content/CMS/AI Authority Gate؛
- Post-P09 Go/No-Go checklist؛
- Contract hardening و schema versioning؛
- Service identity و request replay protection؛
- initial AI budget caps و evaluation sample requirements؛
- Preview DB isolation، fixture lifecycle و evidence bundle؛
- canonical phase mapping در PR template.
- Source/Compliance Governance Gate و source policy contract؛
- service identity claim contract با body binding؛
- source observation contract با raw-data boundary؛
- stratified AI quality confidence bounds؛
- versioned price table و reserve safety buffer؛
- validation script و validation report.

### Security

- Agent و Worker فاقد publish/rollback scope باقی می‌مانند.
- n8n فقط schedule/job-create scope دارد.
- scraped content به‌عنوان untrusted data نگهداری می‌شود.
- raw payload در Canonical DB ذخیره نمی‌شود.
- stale worker بدون lease epoch معتبر قادر به write نیست.
- policy منبع ناموجود یا منقضی fail-closed است.
