# Compliance و Source Governance Gate

## هدف

هیچ connector، crawler، Content Agent یا AI vendor فقط با وجود کد فنی مجاز نمی‌شود. این Gate قبل از P21 و P47 باید مالک، purpose، منبع، retention و مسئولیت انسانی را ثبت و تأیید کند.

این سند جایگزین نظر حقوقی متخصص نیست؛ ساختار evidence و stop condition را تعریف می‌کند.

## Source Policy Record

برای هر source/purpose یک record نسخه‌دار لازم است:

```text
source_policy_id
source_id
purpose
allowed_families
allowed_fields
allowed_content_types
terms_status
robots_status
licensing_status
copyright_status
privacy_classification
pii_allowed
raw_retention_days
excerpt_limit
ai_vendor_allowed
redistribution_scope
reviewed_by
reviewed_at
expires_at
decision
reason
```

`decision` فقط `approved | restricted | blocked | expired` است. Policy missing/expired برابر fail-closed است.

## الزامات

- robots، terms، licensing و copyright چهار بررسی جدا هستند.
- purpose جدید نیازمند reapproval است.
- Raw payload فقط در storage خصوصی و مطابق retention مصوب نگهداری می‌شود.
- PII غیرضروری قبل از persistence/AI call حذف یا mask می‌شود.
- ارسال داده به AI vendor نیازمند vendor policy و data-processing record است.
- excerpt قابل‌نمایش باید bounded و مطابق redistribution scope باشد.
- correction، takedown، deletion و dispute دارای owner و SLA هستند.
- medical claim دارای source tier، reviewer صلاحیت‌دار و correction path است.
- تغییر terms یا source ownership connector را تا re-review متوقف می‌کند.

## Go/No-Go

Go فقط زمانی مجاز است که:

- تمام sourceهای فعال policy approved و منقضی‌نشده داشته باشند؛
- connector enforcement test سبز باشد؛
- deletion/retention job و access audit اثبات شده باشد؛
- vendor boundary و notification recipients تأیید شده باشند؛
- Admin بتواند policy، expiry و blocker را ببیند.

هر ambiguity برابر `NO-GO` است، نه approval ضمنی.
