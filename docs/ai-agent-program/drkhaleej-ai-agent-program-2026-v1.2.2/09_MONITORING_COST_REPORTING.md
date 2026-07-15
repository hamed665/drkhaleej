# مانیتورینگ، بودجه و گزارش

## اصل

```text
Crawler / Rule / SQL first
LLM only for justified ambiguity
```

هدف اولیه‌ی workload:

```text
deterministic ≥ 85%
small/local model ≤ 12%
strong model ≤ 5%
```

این درصدها از AI Call Ledger محاسبه می‌شوند، نه تخمین دستی.

## Monitoring Tiers

| Tier | داده | تناوب اولیه |
|---|---|---|
| A | licence، closure، relocation، critical facts | هفتگی/دوهفته‌ای |
| B | phone، hours، services، official website | ماهانه |
| C | description، social، images، amenities | سه‌ماهه |
| D | unpublished/dormant | event/شش‌ماهه |

هر source باید terms/robots/rate-limit policy داشته باشد.

## Change Detection

```text
Fetch selected content
→ Normalize
→ Compare stable hash
→ No meaningful delta: stop
→ Known delta: deterministic classify
→ Ambiguous delta: small model
→ Critical conflict: strong model + Admin Review
```

به مدل فقط bounded diff داده می‌شود.

## Budget defaults برای MVP

این اعداد conservative defaults هستند و پس از 30 روز actual data rebaseline می‌شوند:

| Cap | مقدار اولیه |
|---|---:|
| Daily AI total | 5 USD |
| Weekly AI total | 25 USD |
| Monthly AI total | 100 USD |
| Per entity draft | 0.50 USD |
| Per strong entity conflict | 1.50 USD |
| Per article draft | 5 USD |
| GEO visibility monthly | 15 USD |

Alerts در 50٪، 75٪، 90٪ و 100٪. در 100٪ call جدید رزرو نمی‌شود. In-flight call ثبت می‌شود و ممکن است actual اندکی بالاتر رود؛ این overrun باید گزارش شود.

این جدول فقط AI spend است و Total Cost of Ownership برنامه محسوب نمی‌شود.

## Full-program Cost Register

قبل از P19 و دوباره قبل از Public Launch باید owner، plan، hard/soft cap، billing alert و actual monthly cost برای این ردیف‌ها ثبت شود:

| Cost center | شامل | Gate |
|---|---|---|
| Database | Supabase/Postgres، backup، restore، egress | P03/Public |
| Worker compute | container host، CPU/RAM، autoscaling | P19 |
| Object storage | raw observations، retention، deletion | P17/P21 |
| Observability | logs، metrics، traces، retention | P19 |
| Source access | search/maps/business APIs، crawling proxies if approved | P21 |
| AI providers | extraction، content، evaluation، GEO visibility | P20/P23/P47 |
| Notifications | email/Telegram provider، delivery logs | P19 |
| Security | key management، secret scanning، incident tooling | P19/Public |
| Human review | entity، editorial، medical، compliance | P21/P46 |
| Legal/compliance | source terms، licensing، privacy، takedown | Gate F |

هیچ عدد نامعلوم `0` فرض نمی‌شود. Cost center فاقد owner/cap/alert برای Gate مربوطه blocker است. Management report باید AI spend و non-AI infrastructure/human cost را جدا و مجموع TCO را نیز نشان دهد.

## Budget reservation

قبل از AI call:

1. cost estimate؛
2. atomic budget reservation با p99 safety buffer؛
3. model policy check؛
4. provider-side max input/output tokens، timeout و model allowlist؛
5. call؛
6. actual reconciliation؛
7. unused reservation release؛
8. ledger write/readback.

Model downgrade فقط اگر quality policy اجازه دهد. strong call بدون reason ممنوع است.

قیمت provider/model باید versioned و effective-at داشته باشد. اگر price table نامعتبر یا قدیمی است، call defer می‌شود. `hard_limit` به معنای جلوگیری از call جدید است؛ overrun احتمالی in-flight باید سقف جدا، alert و incident policy داشته باشد.

## Reports

### Immediate

licence/closure/location critical change، repeated failure، budget hard limit، queue stuck، secret finding، public/index/sitemap leakage و rollback mismatch.

### Daily Telegram

jobs، drafts ready، critical changes، deferred budget و safe Admin links.

### Weekly Email

freshness، source health، conflicts، SEO opportunities، costs، failure actions و review backlog.

### Monthly Management

coverage، publication funnel، traffic/SEO، content outcomes، AI ROI signals، incidents و decisions.

## Fact Integrity

- هر metric دارای source query/reference و captured_at؛
- narrative فقط از bounded metrics payload؛
- number invention ممنوع؛
- PII/secret/raw payload صفر؛
- Admin dashboard source of truth؛
- notification dedupe key؛
- delivery failure در outbox باقی می‌ماند.

## Cost/Quality Review

ماهانه:

- cost per approved draft؛
- cost per source/family؛
- model quality by prompt version؛
- cache hit rate؛
- Admin edit/reject rate؛
- strong-call justification rate؛
- budget defer impact؛
- source fetch cost.
