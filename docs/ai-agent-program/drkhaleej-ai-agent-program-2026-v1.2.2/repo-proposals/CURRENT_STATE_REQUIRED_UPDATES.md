# CURRENT_STATE.md — Required Update Guide

این فایل جایگزین کورکورانه‌ی `CURRENT_STATE.md` نیست. چون Current State شامل بخش‌های گسترده‌ی پروژه است، PR هم‌ترازی باید بخش‌های factual زیر را روی نسخه‌ی تازه‌ی main اصلاح کند.

## Header/Baseline

```text
Aligned through: PR #943
Baseline commit: 74541b9
Last aligned: 2026-07-15
```

## Import Readiness

```text
Wave 0: complete (#936–#939)
Wave 1: complete (#940–#941)
Wave 2.1: partial (#942; atomic transaction complete, audit split open)
Wave 2.2: partial (#943; operation merged, integrity readback open)
Current next: RES-INTEGRITY-READBACK
```

## Database

- لیست migration باید تا migration واقعی فعلی main، از جمله `0079`, هم‌تراز شود.
- عبارت‌های قدیمی مانند «through 0053» حذف یا اصلاح شوند.
- status نباید ادعا کند `reservation_created` پیاده شده است.

## Capabilities

- Admin reservation: bounded operation موجود؛
- full integrity readback: open؛
- private publish through current Admin reservation: open؛
- exact rollback recovery: open؛
- public/index/sitemap: disabled/open؛
- AI-assisted intake: contract/planned، نه production؛
- Content Agent: planned، نه implemented.

## References

- PRهای #936 تا #943 با summary کوتاه ثبت شوند.
- #919 تا #921 به‌عنوان prior canary infrastructure ذکر شوند، نه proof فعلی.
- لینک roadmap canonical درج شود؛ ledger کامل دوباره کپی نشود مگر بخش خلاصه‌ی factual.
