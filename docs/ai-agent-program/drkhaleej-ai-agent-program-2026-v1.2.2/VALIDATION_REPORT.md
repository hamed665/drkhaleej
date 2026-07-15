# گزارش اعتبارسنجی بسته v1.2.2

تاریخ بسته: `2026-07-16`

Baseline: `hamed665/drmuscat@74541b9f32acb201a9bf94d54d0be757842f5b8c`، هم‌تراز تا PR `#943`

## دامنه GitHub

- current main و commit مبنا تأیید شد؛
- 300 PR record اخیر از `#943` تا `#643` بازیابی شد؛
- patchها و authorityهای بحرانی `#919–#943` برای reservation، readback، integrity، authorization و Admin wiring بررسی شدند؛
- PRهای `#936–#943` Merge شده‌اند؛
- head PR `#943` دارای 12 GitHub workflow موفق و Vercel موفق است؛
- Issue `#934`، CURRENT_STATE، V10.4 Matrix و root README drift واقعی دارند و P01 آن‌ها را اصلاح می‌کند؛
- PRهای حساس اخیر review مستقل ثبت‌شده نداشتند؛ policy اجباری آن در این نسخه اضافه شد.

## نتیجه بسته

| آزمون | نتیجه |
|---|---|
| ZIP path/symlink/secret safety | Pass |
| checksum syntax، coverage و byte hash | Pass |
| reproducible package checks | Pass — 305 |
| JSON parse | Pass |
| AJV strict compile، Draft 2020-12 | Pass — 9/9 schema |
| positive/negative/adversarial vectors | Pass — 34/34 |
| exact rejection reason assertions | Pass — تمام invalid vectorها |
| runtime invariant vectors | Pass — exact code match |
| manifest exact coverage | Pass |
| stale version references | صفر |
| `npm audit --omit=dev` | Pass — صفر vulnerability |

Final package inventory: `83` file، `9` schema و `34` vector.

## اصلاحات نسخه 1.2.2

- `ajv` روی نسخه‌ی امن و pin‌شده‌ی `8.20.0` است و production dependency audit صفر است.
- validator علاوه بر AJV compile و runtime invariant، schema keyword/path یا invariant code دقیق هر rejection را assert می‌کند.
- oversized string/array/object، duplicate field/source، unsupported family/locale/scheme، resolved conflict، stale draft binding، stale lease epoch و unknown schema/policy همگی vector مستقل دارند.
- integer scalar به‌عنوان JSON number پذیرفته می‌شود و branch هم‌پوشان integer/number وجود ندارد.
- Article Candidate از Human Editorial/Medical Review جدا شد.
- policy متناقض approved، medical approval با role اشتباه، Agent human-gate pass، denied raw observation، stale fencing و budget relationship نامعتبر رد می‌شوند.
- Service Identity scope vocabulary یکسان شد و JOSE header از claims جدا شد.
- P04-B صریحاً refactor-only است و Private Publish تا P05 disabled می‌ماند.
- P01 root README و non-runtime alignment guard را نیز پوشش می‌دهد.
- branch protection و independent human review برای scopeهای حساس اجباری شد.
- AI budget از Full TCO جدا و schedule assumptions شفاف شد.

## فرمان بازتولیدپذیر

```bash
npm ci
npm run validate
npm audit --omit=dev
sha256sum -c CHECKSUMS.sha256
```

این فرمان‌ها به network در مرحله validate نیاز ندارند؛ `npm ci` dependencyهای pin‌شده را از lockfile نصب می‌کند.

## تفسیر

این نتیجه سلامت و انسجام بسته اجرایی را اثبات می‌کند، نه Production readiness قابلیت‌هایی که هنوز در PRهای P01–P61 پیاده نشده‌اند. اجرای فوری فقط از P01 و با Gateهای همین بسته مجاز است. هر تغییر main نیازمند rebaseline است.
