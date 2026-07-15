# قراردادهای داده و API

## وضعیت

نام جدول‌ها و schemaهای این بسته `PROPOSED` هستند. قبل از migration باید با schema فعلی repository تطبیق داده شوند. برای مفهوم موجود جدول یا lifecycle موازی ساخته نمی‌شود.

## قواعد سراسری قرارداد

هر payload باید داشته باشد:

```text
schema_version
policy_version
stable identity
bounded fields
actor/source identity
created/observed timestamp
idempotency or revision identity where applicable
```

- `additionalProperties=false` در boundaryهای خارجی؛
- string/array/object دارای max bounds؛
- null، absent و empty semantics مستند؛
- schema validation قبل از persistence؛
- runtime invariants علاوه بر JSON Schema؛
- no publish/approval state از Agent output؛
- no raw secret یا raw HTML در response.

## Source Registry

```text
id
schema_version
name
source_type
base_url
trust_tier
allowed_families
allowed_domains
fetch_policy_id
rate_limit_policy_id
terms_status
robots_status
enabled
reviewed_by / reviewed_at
created_at / updated_at
```

## Source Observation

Append-only:

```text
id
source_id
job_id
requested_url
final_url
redirect_chain_bounded
http_status
content_type
content_length
content_hash
selected_content_hash
raw_storage_reference
observed_at
fetch_duration_ms
parser_version
retention_until
error_class
```

Raw body در object storage خصوصی است؛ DB اصلی فقط reference و hash دارد.

## Field Evidence

```text
id
draft_id
field_path
proposed_value_bounded
normalized_value_bounded
observation_id
source_tier
extraction_method
confidence
evidence_excerpt_bounded
conflict_group_id
observed_at
expires_at
review_status
reviewer_id / reviewed_at
```

## Unified Draft

```text
id
schema_version
policy_version
entity_family
candidate_entity_id
status
locale_payloads
canonical_patch_candidate
duplicate_candidates
required_fields_status
evidence_coverage
created_by_type / created_by_id
version
created_at / updated_at
```

Draft status فقط:

```text
collecting
needs_review
approved_for_exact_review
rejected
superseded
```

`approved_for_exact_review` فقط با Human Review record مجاز است و Publish Authorization نیست.

### Candidate/Review separation

- Agent/Worker Candidate payload فقط `collecting` یا `needs_review` تولید می‌کند.
- `accepted`، `edited`، `rejected`، `resolved`، `confirmed_duplicate` و `approved_for_exact_review` در Agent boundary ممنوع‌اند.
- Human decision در record مستقل با reviewer identity، role، draft version، draft hash، reason و timestamp ثبت می‌شود.
- projection خواندنی Admin می‌تواند Candidate و Review record را compose کند؛ authority آن‌ها ادغام نمی‌شود.

## Duplicate Contract

Agent فقط این وضعیت‌ها را تولید می‌کند:

```text
candidate
not_duplicate_candidate
requires_review
```

`confirmed_duplicate` فقط در reviewer decision جدا با reviewer identity، reason، evidence refs و timestamp ثبت می‌شود. Auto merge ممنوع است.

## Automation Job

Job typeها publish/rollback ندارند:

```text
entity_discovery
entity_fetch
entity_extract
entity_monitor
content_opportunity
content_research
content_draft
content_monitor
report
```

Job fields:

```text
id
schema_version
job_type
priority
status
scope_bounded
idempotency_key
requested_by
scheduled_for
lease_owner / lease_expires_at
lease_epoch / lease_token_hash / heartbeat_at
attempt_count / max_attempts
budget_policy_id
parent_job_id
created_at / started_at / finished_at
```

Transitions باید در DB/RPC allowlist شوند؛ browser status نمی‌تواند transition حساس ایجاد کند.

Job status vocabulary واحد:

```text
queued
leased
running
waiting_review
succeeded
failed_retryable
failed_terminal
deferred_budget
cancelled
```

هر write/heartbeat/complete باید owner، token hash، `lease_epoch` و non-expired lease را اتمیک تأیید کند.

## Article Candidate و Human Review

- `article-draft` فقط revision candidate، source pack، claims و automated checks را حمل می‌کند.
- `editorial=pass` و `medical=pass` در Candidate ممنوع‌اند.
- Human decision در `article-review-decision` جدا با reviewer role، revision ID/hash، source/claim references، reason و timestamp ثبت می‌شود.
- Medical approval فقط از `medical_reviewer` و Editorial approval فقط از role مجاز پذیرفته می‌شود.
- projection خواندنی CMS می‌تواند Candidate و Decisionها را compose کند، اما writer authority آن‌ها ادغام نمی‌شود.

## AI Call Ledger

```text
attempt_id
purpose
model_provider / model
prompt_version
policy_version
tokens_in / tokens_out
tokens_cached
estimated_cost / actual_cost
currency
cache_hit
reason_for_ai_call
quality_score
latency_ms
trace_id_redacted
```

## Notification Outbox

```text
id
event_type
severity
recipient_policy_id
channel
template_version
payload_bounded
dedupe_key
status
attempts
next_attempt_at
sent_at
```

Outbox row با transaction مربوط به event ساخته می‌شود. Notification provider source of truth نیست.

## Internal API

```text
POST /internal/automation/jobs
GET  /internal/automation/jobs/:id
POST /internal/automation/jobs/:id/cancel
POST /internal/entity-drafts/:id/request-review
GET  /internal/entity-drafts/:id/readback
POST /internal/content/opportunities/scan   (بعد از Content Gate)
GET  /internal/reports/:period
```

الزامات:

- signed service identity؛
- audience/scope/jti/expiry validation؛
- body hash؛
- schema validation؛
- rate limit؛
- idempotency برای write؛
- bounded response؛
- actor/reason audit؛
- no authorization/rollback material؛
- no public exposure.

## Runtime validation فراتر از JSON Schema

- unique field paths؛
- claim source IDs واقعاً در Source Pack موجود باشند؛
- evidence coverage از evidence rows محاسبه شود، نه ورودی client؛
- hard budget ≥ actual reservation before call؛
- status transition مطابق state machine؛
- approved state دارای reviewer record؛
- medical draft بدون medical review قابل publish نباشد؛
- internal link target واقعاً eligible باشد؛
- entity family با registry authority تطبیق داشته باشد.
- reviewer decision از service/role مجاز آمده و draft version/hash فعلی باشد؛
- Job attempt_count از max_attempts عبور نکند؛
- budget actual/reserved/hard-limit relationship معتبر باشد؛
- stale lease epoch هیچ write انجام ندهد؛
- source policy موجود، approved و منقضی‌نشده باشد.

## Retention اولیه

| داده | پیش‌فرض | تغییر با |
|---|---:|---|
| raw fetch body | 30 روز | approved dispute/evidence تا 90 روز |
| bounded evidence | عمر Draft + audit policy | policy review |
| hashes/metadata | بلندمدت | legal/retention policy |
| job attempts | 12 ماه | ops review |
| AI cost ledger | 24 ماه | finance/privacy review |
| notification payload | 90 روز | بدون secret/PII |
| authorization/audit | existing security policy | authority owner |
