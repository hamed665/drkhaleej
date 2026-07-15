# Proposed Contracts

Status: `PROPOSED / NOT DATABASE AUTHORITY`

این schemaها boundary پیشنهادی نسخه `1.2.2` هستند و قبل از استفاده باید:

1. با types و DB فعلی repository تطبیق داده شوند؛
2. format validator برای UUID/URI/date-time فعال شود؛
3. runtime invariants سند `06_DATA_API_CONTRACTS.md` پیاده شوند؛
4. contract tests و backward compatibility تعریف شود؛
5. توسط PR مستقل `CONTRACT-HARDENING` تأیید شوند.

JSON Schema به‌تنهایی unique field path، foreign-key source reference، computed evidence coverage، role authorization یا state transition را اثبات نمی‌کند.

## قراردادهای بسته

| فایل | مرز پیشنهادی | writer مجاز |
|---|---|---|
| `entity-draft.schema.json` | Candidate و evidence؛ بدون approval | Agent/Admin draft service |
| `entity-review-decision.schema.json` | تصمیم نسخه/hash-bound | Human Reviewer از مسیر server-authenticated |
| `article-draft.schema.json` | Revision candidate، claim و source pack؛ بدون approval | Content Agent/Editor draft service |
| `article-review-decision.schema.json` | Editorial/Medical Decision نسخه/hash-bound | Human Reviewer از مسیر server-authenticated |
| `automation-job.schema.json` | Job، budget، lease و fencing metadata | Scheduler/Worker control plane |
| `service-identity-claims.schema.json` | claimهای توکن سرویس و body binding | Identity issuer |
| `source-policy.schema.json` | policy منبع، purpose، retention و compliance | Compliance owner |
| `source-observation.schema.json` | observation غیرقابل‌اعتماد و bounded | Connector ingestion boundary |
| `persian-report.schema.json` | گزارش bounded فارسی | Reporting service |

## قواعد غیرقابل واگذاری به Schema

- `exp > nbf >= iat` و TTL حداکثر پنج دقیقه؛
- یکتایی `jti` و replay cache؛
- تطابق body hash، issuer، audience، key status و clock skew؛
- `expires_at > reviewed_at/captured_at`؛
- claim/source foreign-key و پوشش citation؛
- Agent فاقد reviewer/publish/rollback scope؛
- lease epoch فعلی و fencing روی هر write؛
- budget relation و price-table freshness؛
- policy منقضی/ناموجود برابر fail-closed.

`npm ci && npm run validate` تمام schemaها را با AJV Draft 2020-12 در strict mode کامپایل می‌کند، vectorهای مثبت/منفی و runtime invariantهای قابل بازتولید را اجرا می‌کند، علت دقیق هر rejection را assert می‌کند و پوشش و hash تمام فایل‌های بسته را می‌سنجد. `npm test` alias همین validation است.
