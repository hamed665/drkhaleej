# Security و Threat Model اصلاح‌شده

## دارایی‌های حساس

- authorization و rollback material؛
- service identities/keys؛
- Admin identity؛
- unpublished entity/content؛
- raw source payload؛
- audit history؛
- medical claims؛
- recipient data؛
- budget/billing metadata.

## Trust Zones

```text
Browser
Web/Admin Server
Automation Worker
n8n Scheduler
Database
Private Object Storage
Observability
Notification Providers
External Sources
```

هر zone identity، secret، egress و logging policy مستقل دارد.

## Threats و Controls

### Client/Log Secret Leakage

- bounded DTO؛
- no token/nonce/reference در HTML، hydration، forms، cookies، URL، analytics، trace؛
- structured redaction؛
- error codes، نه raw exception payload؛
- static serialization checks.

### Prompt Injection

- page content همیشه untrusted data؛
- model بدون network/tool privilege؛
- scripts/styles/forms حذف؛
- prompt و data delimiter؛
- schema-only output؛
- output allowlist و size bound؛
- malicious dataset؛
- source instruction هرگز authority نیست.

### SSRF/DNS Rebinding

- HTTPS only؛
- source/domain allowlist؛
- resolve و block private/loopback/link-local/multicast/metadata ranges؛
- DNS re-resolution و IP validation؛
- redirect validation در هر hop؛
- redirect count limit؛
- connection/read timeout؛
- compressed و decompressed body limits؛
- content-type allowlist؛
- egress network policy.

### Worker Privilege Escalation

- signed service identity با TTL≤5m؛
- scope/audience/jti؛
- Worker بدون publish/rollback/promotion؛
- n8n فقط `job:create` و `job:read`؛
- RLS/grant tests؛
- key rotation/revocation؛
- separate runtime identity؛
- no shared browser/admin secret.
- JWT algorithm allowlist و `kid` validation روی JOSE header؛ `alg`/`kid` داخل claims authority نیستند؛
- clock-skew window محدود؛
- canonical body hashing؛
- lease epoch/fencing validation برای هر write؛
- stale worker پس از reclaim رد شود.

### Replay/Duplicate

- stable idempotency؛
- request/patch hash؛
- transaction locks؛
- service request jti replay protection؛
- defined replay result؛
- no automatic mutation retry؛
- concurrency tests.

### Data Poisoning

- trust tiers؛
- immutable observations؛
- field provenance؛
- conflict preservation؛
- high-impact fields نیازمند Human Review؛
- no auto merge؛
- source health/quarantine.

### Medical Risk

- source pack؛
- sensitivity classification؛
- medical reviewer identity؛
- prohibited claims؛
- no personalized diagnosis/treatment؛
- correction/revision rollback؛
- reviewer conflict-of-interest policy ثبت شود.

### Raw Data/Privacy

- private encrypted storage؛
- retention default 30 days؛
- bounded DB excerpts؛
- recipient/PII minimization؛
- deletion job؛
- no raw payload in observability؛
- access audit.

### Source/Compliance Failure

- source policy record برای هر connector؛
- robots/terms/licensing/copyright جداگانه؛
- privacy/PII classification و approved purpose؛
- AI vendor boundary و data-processing record؛
- takedown/correction/deletion workflow؛
- source approval expiry و re-review؛
- connector fail-closed در صورت policy missing/expired.

### Supply Chain

- lockfile؛
- dependency review؛
- pinned runtime؛
- secret scanning؛
- build provenance where available؛
- container base update policy؛
- no unreviewed workflow permissions expansion.

## Kill Switches

- global automation؛
- per agent؛
- per source؛
- per family؛
- AI calls؛
- notifications؛
- content pipeline؛
- public/index/sitemap promotions؛
- publish capability مستقل و خارج از Agent.

## Audit Record

```text
actor_type / actor_id
service key id
job_id
operation
scope
reason
input/output hash
policy/schema version
request jti
timestamp
result
```

## Security Acceptance

- least privilege tests؛
- denied-role RPC tests؛
- client serialization scan؛
- log/trace redaction test؛
- SSRF corpus؛
- prompt injection corpus؛
- key rotation drill؛
- replay attack test؛
- zero Agent publish scope؛
- incident kill-switch drill.
