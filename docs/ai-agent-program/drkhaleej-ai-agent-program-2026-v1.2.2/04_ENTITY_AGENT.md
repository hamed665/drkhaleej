# Entity Intelligence Agent

## هدف

Agent باید مرکز یا متخصص را پیدا کند، منابع را ثبت کند، اطلاعات را استخراج و مقایسه کند، Duplicate را پیشنهاد دهد و یک Unified Draft مستند بسازد.

Agent runtime با service identity محدود اجرا می‌شود و هیچ scope برای publish، rollback، public/index/sitemap promotion یا verified relation ندارد.

## Agent مجاز است

- جست‌وجوی منابع allowlisted؛
- fetch با rate limit؛
- ثبت Observation؛
- extraction و normalization؛
- پیشنهاد family/category؛
- پیشنهاد duplicate؛
- ساخت field evidence؛
- ساخت یا به‌روزرسانی Draft؛
- ایجاد Review Task؛
- ارسال گزارش فارسی.

## Agent مجاز نیست

- write مستقیم به Canonical Entity؛
- مصرف Authorization؛
- ساخت Reservation خارج از authority موجود؛
- Private/Public Publish؛
- Index/Sitemap promotion؛
- ایجاد verified relation بدون Review؛
- حذف conflict یا source history؛
- ساخت داده‌ی فاقد Evidence.

## Pipeline

### مرحله 1 — Discovery

ورودی:

- entity name؛
- family/city؛
- source registry؛
- scheduled monitoring event؛
- Admin on-demand request.

خروجی: `source_candidates[]`.

### مرحله 2 — Fetch

- SSRF-safe URL validation؛
- domain allowlist/denylist؛
- robots/terms check؛
- redirect limit؛
- body size limit؛
- timeout و rate limit؛
- content hash و selected DOM hash.

### مرحله 3 — Extraction

ترتیب:

1. JSON-LD/structured data؛
2. DOM selectors؛
3. regex و deterministic parser؛
4. small-model structured extraction؛
5. strong-model فقط برای conflict پیچیده.

### مرحله 4 — Normalize

- Arabic/English whitespace و punctuation؛
- phone country code؛
- URL canonicalization؛
- ساعات و timezone عمان؛
- address component؛
- geo precision؛
- null/empty/absent semantics؛
- stable key ordering و hashes.

### مرحله 5 — Match/Duplicate

سیگنال‌ها:

- licence exact match؛
- normalized phone؛
- official domain؛
- bilingual name؛
- address؛
- geo؛
- branch identifier.

Agent فقط score و reason تولید می‌کند. Merge مبهم Human Approval می‌خواهد.

### مرحله 6 — Draft

هر field شامل:

```text
value
normalized_value
source_observation_id
source_tier
confidence
extraction_method
conflicts
observed_at
freshness
```

### مرحله 7 — Admin Review

Admin می‌تواند Approve، Edit، Reject، Mark Duplicate یا Request Re-fetch کند.

Approve در این مرحله فقط `approved_for_exact_review` است. Publish Authorization یا Reservation تولید نمی‌کند. Mark Duplicate باید در reviewer decision جدا ثبت شود؛ Agent اجازه‌ی `confirmed_duplicate` ندارد.

## MVP Scope

- یک منبع رسمی و یک منبع official website؛
- Pharmacy و Hospital canary؛
- EN/AR identity؛
- phone/address/hours/services/licence؛
- duplicate candidates؛
- Admin Draft Review؛
- Telegram/Email report؛
- بدون publish.

## Evaluation Dataset

قبل از Production حداقل dataset نسخه‌دار شامل موارد زیر ساخته شود:

- صفحات انگلیسی و عربی؛
- صفحه بدون structured data؛
- ساعات متفاوت و special hours؛
- چند شعبه با نام مشابه؛
- source conflict؛
- closed/moved facility؛
- pet/fitness/beauty برای جلوگیری از family اشتباه؛
- malicious prompt-injection page.

## Quality Gate

- Evidence coverage فیلدهای پیشنهادی: 100٪؛
- false canonical merge در Golden Dataset: صفر؛
- high-confidence phone/licence/name/address precision: point estimate حداقل 99٪ و lower bound بازه اطمینان 95٪ حداقل threshold مصوب؛
- گزارش جداگانه برای هر field، family، locale و source tier؛ aggregate score به‌تنهایی قابل قبول نیست؛
- حداقل 500 labeled critical-field observations در مجموع و حداقل sample مصوب برای هر stratum؛ strata کم‌نمونه فقط `insufficient_evidence` هستند؛
- coverage، abstention rate، recall و false-omission rate همراه precision گزارش شوند؛
- ambiguous case همیشه Review؛
- direct canonical mutation: صفر؛
- budget و trace برای هر AI call: 100٪.

Dataset حداقل 100 صفحه Pharmacy/Hospital با EN/AR، multi-branch، conflict، closed/moved، missing structured data، negative family و prompt-injection را پوشش می‌دهد.

Production Go فقط با versioned evaluation report و dataset hash مجاز است. اگر lower confidence bound یا sample floor هر critical stratum رد شود، Agent باید برای آن stratum abstain و Human Review ایجاد کند.
