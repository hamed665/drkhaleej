# Implementation Playbook

## الگوی اجرای هر PR

### 1. Grounding

- fresh `main`؛
- ثبت commit SHA؛
- بررسی worktree و unrelated files؛
- خواندن roadmap، CURRENT_STATE، matrix و AGENTS؛
- ثبت چهار mapping فاز؛
- تعیین authority موجود و files allowed.

### 2. Scope Contract

PR description قبل از کد شامل:

```text
Purpose
Authority Extended
Execution Phase
Lock Scope
Product Module
Subphase ID
Allowed Files
Forbidden Scope
Database Changes
Routes
Security Boundary
Validation
Acceptance
Rollback Plan
Stop Conditions
```

### 3. Implementation

- یک responsibility؛
- smallest coherent change؛
- no parallel subsystem؛
- compatibility before migration replacement؛
- no weakening validators؛
- no unrelated cleanup.

### 4. Verification

برحسب scope:

```text
focused unit tests
contract tests
real DB integration
migration-current
RLS/grants/RPC checks
replay/concurrency/abort
readback
exact recovery
typecheck
lint
build
import readiness audit
Vercel Preview
hosted canary
```

### 5. Review

- diff و changed-files review؛
- secret scan؛
- client serialization scan؛
- migration signature compatibility؛
- no new public route/index/sitemap؛
- evidence links؛
- docs update فقط اگر factual state عوض شده است.

### 6. Merge

- همه required checks green؛
- unresolved review صفر؛
- برای migration/authorization/rollback/security/runtime activation حداقل یک approval مستقل و غیرخودکار؛
- branch up-to-date یا evidence بر commit فعلی؛
- merge method مطابق repository؛
- post-merge main smoke؛
- Issue/roadmap status همان‌جا هم‌تراز.

## Stop Conditions

بلافاصله توقف شود اگر:

- DB test environment واقعی در دسترس نیست؛
- schema/RLS/RPC ambiguity وجود دارد؛
- فایل خارج از scope لازم است؛
- current main نسبت به baseline تغییر کرده است؛
- hosted proof قابل اجرا نیست؛
- authorization/rollback secret ممکن است serialize شود؛
- mutation نتیجه‌ی مبهم دارد؛
- rollback comparator mismatch دارد؛
- اجرای مرحله نیازمند authority آینده است.

## Read-only Retry Policy

- readback، fetch و deterministic extraction قابل retry محدود هستند؛
- reservation/mutation/rollback خودکار retry نمی‌شوند؛
- timeout مبهم ابتدا readback می‌شود؛
- فقط اثبات `no commit` اجازه‌ی retry تازه می‌دهد؛
- replay result باید جدا از fresh success نمایش داده شود.

## Evidence Bundle استاندارد

هر behavioral PR باید artifact یا PR note شامل این موارد داشته باشد:

- commit SHA؛
- environment class، بدون secrets؛
- migration range؛
- fixture/run ID؛
- commands؛
- test summary؛
- DB invariant counts؛
- readback result؛
- public/index/sitemap state؛
- rollback result در صورت applicable؛
- known limitations.

## P01 تا P09—تعریف اجرایی

### P01

Docs-only alignment. Runtime diff باید صفر باشد.

### P02

Verifier موجود توسعه یابد؛ Authorization linkage و dual audit signature اضافه شود. هیچ event rename یا mutation در این PR انجام نشود.

### P03

Harness واقعی DB؛ replay، different request conflict، parallel locking، forced abort و zero partial writes. fault injection فقط با test-only transaction wrapper/test migration variant انجام می‌شود و هیچ production flag یا failpoint باقی نمی‌گذارد. اگر migration bug پیدا شد، fix همان PR فقط در scope DB safety یا PR مستقل کوچک.

### P04-A

`reservation_created` با schema version جدید، reader compatibility و `execution_started` فقط در mutation. هیچ runtime handoff در این PR اضافه نمی‌شود.

### P04-B

Verified reservation handoff به executor با binding کامل version/fingerprint/request/scope. اجرای private publish نباید reservation RPC را دوباره invoke کند؛ stale/foreign/expired handoff fail-closed است.

این PR فقط refactor/contract/handoff است. `private_publish` capability، Admin operation و mutation execution تا P05 disabled می‌مانند. integration proof با port/stub کنترل‌شده انجام می‌شود و activation واقعی ممنوع است.

### P05

Admin فقط verified reservation را به existing Pharmacy executor می‌دهد. exact patch، terminal persistence و post-mutation readback.

### P06

Durable reference موجود reused، version-bound و atomically consumed. Raw reference server-only.

### P07

Original→Publish→Rollback comparator با diagnostics field-level و allowed differences محدود.

### P08

UI state فقط از server readback؛ refresh/stale/expiry/replay/multi-tab و no optimistic write success.

### P09

یک Pharmacy واقعی Preview از UI کامل، بدون bypass، publish و rollback، integrity zero و post-P09 checklist.
