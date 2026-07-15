# Contract Invariants و Versioning

## Authority

فایل‌های `contracts/` پیشنهادی هستند و تنها پس از reconciliation با current main، contract tests و approval می‌توانند boundary اجرایی شوند. JSON Schema جایگزین DB/RPC authorization یا runtime invariant نیست.

## Version Rules

- `$id` و `schema_version` برای هر breaking change افزایش می‌یابد.
- Producer و consumer version matrix در همان PR ثبت می‌شود.
- unknown version fail-closed است.
- migration window و backward reader compatibility زمان‌دار است.
- enum جدید بدون registry mapping و policy اضافه نمی‌شود.
- hash canonicalization، Unicode normalization، null/empty semantics و key ordering versioned هستند.

## Candidate/Reviewer Boundary

- `entity-draft.schema.json` فقط Candidate/Evidence است.
- Agent اجازه‌ی approval، resolved conflict، confirmed duplicate یا publish state ندارد.
- `entity-review-decision.schema.json` فقط server-authenticated Human Reviewer record است.
- reviewer role، draft version، draft hash، evidence refs، reason و timestamp در runtime دوباره تأیید می‌شوند.
- Admin projection می‌تواند این دو record را compose کند، اما writer authority جدا می‌ماند.

## Current-main Vocabulary

Contract enum باید در Gate C از registry فعلی main تولید یا تطبیق داده شود. v1.2.2 نام‌های فعلی `ImportEntityType` را نگه می‌دارد و alias جدید را authority فرض نمی‌کند.

## Article Candidate/Reviewer Boundary

- `article-draft.schema.json` approval authority ندارد و editorial/medical pass را نمی‌پذیرد.
- `article-review-decision.schema.json` تصمیم Human Reviewer را به revision ID/hash، role، evidence و زمان bind می‌کند.
- medical approval فقط با `medical_reviewer` معتبر است.
- CMS projection می‌تواند Candidate و Decision را compose کند، اما Content Agent writer authority دریافت نمی‌کند.

## Validation Layers

1. JSON parse؛
2. Draft 2020-12 schema compile؛
3. positive/negative/adversarial vectors؛
4. runtime invariants؛
5. DB/RPC transition/authorization؛
6. persistence readback؛
7. compatibility test با consumerهای فعلی.

## Required Negative Vectors

- oversized string/array/object؛
- integer scalar به‌عنوان JSON `number` پذیرفته شود، بدون branch هم‌پوشان `integer`/`number`؛
- duplicate field path/source ID؛
- Agent approval/reviewer decision؛
- resolved conflict بدون Human record؛
- unsupported family/locale/scheme؛
- medical claim با editorial-only review؛
- Agent-authored article با editorial/medical pass؛
- medical approval با reviewer role غیرپزشکی؛
- stale draft version/hash؛
- stale lease epoch؛
- budget relationship invalid؛
- unknown schema/policy version.

هر vector نامعتبر باید علاوه بر نتیجه‌ی `invalid`، schema keyword/path یا runtime invariant code مورد انتظار را assert کند. ردشدن به علت نامرتبط، موفقیت تست محسوب نمی‌شود.

تا زمانی که همه‌ی لایه‌ها سبز نیستند، contract فقط `PROPOSED` باقی می‌ماند.
