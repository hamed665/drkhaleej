# Content & SEO Agent — Authority-Gated

## وضعیت

این جریان تا Merge شدن `CONTENT-AUTHORITY-GATE` مسدود است. Import Roadmap به‌تنهایی مجوز Article CMS، AI content یا publish ایجاد نمی‌کند.

## مرز

Content Agent فقط opportunity، source pack، brief و revision candidate می‌سازد. Candidate payload نمی‌تواند editorial/medical gate را `pass` اعلام کند. Human Editorial/Medical Decision رکورد جدا، revision/hash-bound و server-authenticated دارد. Approval، schedule، publish و rollback توسط CMS authority و Human Reviewer انجام می‌شود.

## Pipeline

```text
GSC/Analytics/Crawl Signals
→ Rule-based Opportunity
→ Intent Cluster
→ Source Pack
→ Brief
→ EN/AR Revision Draft
→ SEO QA
→ Editorial Review
→ Medical Review if required
→ Human Approval
→ CMS Executor
→ Readback/Revision Rollback
```

## Authority prerequisites

- article/revision schema؛
- transition RPC؛
- editorial و medical roles؛
- approval audit؛
- schedule executor؛
- public route/canonical/hreflang authority؛
- revision rollback؛
- tracking issue و stop conditions.

## Opportunity Engine

ابتدا SQL/Rules:

- impression بالا و CTR پایین؛
- position drop؛
- query/page cannibalization؛
- duplicate/missing title/meta؛
- canonical/noindex issue؛
- content freshness؛
- broken/orphan links؛
- missing family/city coverage؛
- EN/AR parity gap.

LLM فقط ambiguity را توضیح یا cluster می‌کند.

## Source Pack

هر source شامل URL، publisher، dates، trust tier، supported claims، locale، citation scope، medical sensitivity، conflicts و retrieval time است.

Claims باید source ID معتبر داشته باشند. مدل اجازه‌ی اختراع URL یا citation ندارد.

## Agent States

Agent output حداکثر تا این stateها می‌رود:

```text
idea
researched
brief_ready
drafted
editorial_review
medical_review
```

`approved`، `scheduled` و `published` فقط CMS authority با reviewer identity تولید می‌شوند.

## Quality Gates

- factual citation coverage 100٪؛
- medical claim بدون Human Medical Review ممنوع؛
- prohibited personalized diagnosis/treatment؛
- title/meta/canonical/hreflang/schema؛
- bilingual parity؛
- internal links فقط eligible؛
- similarity/duplication؛
- revision diff و rollback؛
- no auto-publish.

## GEO/LLM Visibility

فقط بعد از SEO پایه و budget approval:

- 30 query EN؛
- 30 query AR؛
- 10 query حیاتی دو‌هفته‌ای؛
- 20 query مهم ماهانه؛
- بقیه سه‌ماهه؛
- حداکثر دو موتور در شروع.

Response text طولانی ذخیره نشود؛ فقط bounded observation، citation domains، hash، wrong-answer category و delta.
