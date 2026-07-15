# ماتریس تست و Acceptance اصلاح‌شده

## Test Layers

| لایه | هدف | محیط |
|---|---|---|
| Unit | normalization، hashing، policy | local/CI |
| Contract | JSON/API/RPC compatibility | CI |
| Static Security | client/secret/direct-write guards | CI |
| Migration | clean-forward migration current | ephemeral Postgres |
| RLS/Grant | least privilege و denied roles | ephemeral Postgres |
| Integration | Server↔RPC↔DB | ephemeral/Preview DB |
| Replay | stable existing result | real DB |
| Concurrency | row lock/conflict | real DB با clients موازی |
| Abort Injection | zero partial writes | transaction harness |
| Readback | persisted truth | server-only |
| Exact Recovery | original logical parity | Preview DB |
| Hosted Canary | deployment reality | Vercel Preview + isolated Preview DB |
| Evaluation | AI quality/drift | versioned dataset |
| Performance | latency/query/HTML/JS | Preview/live noindex |

Static SQL validator جایگزین integration/concurrency test واقعی نیست.

## Preview DB Harness Acceptance

- Production DB استفاده نشود؛
- migration از clean baseline تا current؛
- fixture با run ID یکتا؛
- two-client concurrency؛
- forced failure پس از reservation، snapshot، audit و authorization update؛
- fault injection test-only باشد و هیچ production RPC flag/failpoint ایجاد نکند؛
- transaction rollback در هر injection point؛
- cleanup/TTL؛
- artifact بدون secret/raw payload؛
- rerun همان نتیجه‌ی invariant را بدهد.

## Reservation Acceptance

- دقیقاً یک active authorization؛
- دقیقاً یک idempotency reservation؛
- دقیقاً یک rollback snapshot؛
- دقیقاً یک reservation audit؛
- consumed authorization linked to reservation؛
- entity/review/family/version/fingerprint/patch/request/scope برابر؛
- entity unchanged؛
- replay همان IDs و `replayed=true`؛
- different request conflict؛
- parallel same request یک success و یک replay/defined conflict؛
- forced failure صفر partial write و authorization issued؛
- browser هیچ DB ID/raw payload دریافت نکند.

## Reservation→Execution Gate

- `reservation_created` با schema version جدید؛
- old audit readers current signature را تا migration window می‌خوانند؛
- mutation `execution_started` جدا می‌نویسد؛
- executor فقط verified reservation را مصرف می‌کند؛
- private publish reservation RPC را فراخوانی نمی‌کند؛
- stale/foreign/consumed-invalid reservation رد می‌شود.
- audit split و verified handoff در دو PR مستقل Merge می‌شوند.

## Private Publish Acceptance

- exact canonical reviewed patch؛
- expected version atomically checked؛
- one mutation execution؛
- terminal result persisted؛
- protected metadata/locale preserved؛
- private/noindex/no-route/no-sitemap؛
- one durable rollback authority؛
- replay vs fresh distinguishable؛
- post-mutation readback؛
- no public leakage.

## Rollback Acceptance

Exact fields:

- bounded entity fields؛
- locale/country؛
- canonical path؛
- geo/projection metadata؛
- protected metadata؛
- relation snapshot contract؛
- visibility/index/sitemap؛
- deletion/sort state.

Allowed differences فقط:

- append-only audit/history timestamps؛
- monotonic version metadata؛
- rollback metadata؛
- consumed authority states.

هر mismatch باید field path، expected hash و actual hash bounded بدهد؛ raw protected value در error نمایش داده نشود.

## Public Acceptance

- EN/AR success؛
- canonical و reciprocal hreflang؛
- family-correct structured data؛
- public/noindex قبل از index؛
- sitemap excluded قبل از sitemap promotion؛
- no placeholder/thin content؛
- verified relations only؛
- independent rollback per promotion؛
- live performance budget؛
- rollback readback.

## Entity Agent Evaluation

حداقل dataset اولیه:

- 100 صفحه Pharmacy/Hospital برای MVP؛
- حداقل 500 labeled critical-field observations برای phone/licence/name/address؛
- EN و AR؛
- multi-branch، conflict، closed/moved، missing structured data؛
- pet/beauty/fitness negative families؛
- malicious prompt injection pages؛
- dataset و labels versioned.

Gates:

- suggested fields evidence coverage = 100٪؛
- auto canonical merge = 0؛
- high-confidence critical-field point precision ≥99٪ و lower 95٪ confidence bound از threshold مصوب پایین‌تر نباشد؛
- field/family/locale/source-tier strata جدا گزارش شوند و strata کم‌نمونه Go نشوند؛
- coverage، recall، abstention و false-omission rate گزارش شوند؛
- ambiguous case review = 100٪؛
- schema valid output = 100٪؛
- prompt-injection escape = 0؛
- direct canonical mutation = 0؛
- AI ledger coverage = 100٪.

## Content Acceptance

فقط پس از Content Gate:

- signal traceable؛
- factual claim source coverage = 100٪؛
- medical claim human medical review = 100٪؛
- Article Candidate حق `editorial=pass` یا `medical=pass` ندارد؛
- Human Article Review revision/hash-bound و role-checked است؛
- no approved/published state از Agent payload؛
- EN/AR revision identity؛
- SEO/editorial/medical gates؛
- link eligibility readback؛
- similarity check؛
- revision rollback؛
- no auto-publish.

## Integrity Zero Set

```text
orphan_authorizations = 0
orphan_reservations = 0
orphan_snapshots = 0
orphan_rollback_references = 0
duplicate_operations = 0
audit_gaps = 0
unfinished_executions = 0
state_mismatches = 0
public_leakage = 0
index_leakage = 0
sitemap_leakage = 0
secret_leakage = 0
unrestricted_payload_leakage = 0
unexpected_canonical_agent_mutations = 0
```

## Merge Commands

دستورهای repository current main authority هستند. حداقل عمومی:

```text
pnpm import:publish-readiness-audit:validate
pnpm db:validate:migrations
pnpm test:db:rls
pnpm typecheck
pnpm lint
pnpm build
focused unit/contract tests
real DB integration when applicable
hosted Preview evidence when behavior changes
```

## Contract Schema Acceptance

- تمام schemaها با Draft 2020-12 compile شوند؛
- integer/number overlap test؛
- Agent payload approval/reviewer/resolved state را رد کند؛
- Human Review Decision schema reviewer identity و draft version/hash را اجباری کند؛
- Agent-authored article با editorial/medical pass رد شود؛
- medical approval با reviewer role غیرپزشکی رد شود؛
- approved Source Policy با blocked/unknown authority status رد شود؛
- denied observation با raw storage رد شود؛
- taxonomy فقط بعد از reconciliation با current-main registry؛
- source URL فقط schemeهای approved؛
- max bounds و adversarial oversized vectors؛
- runtime invariants جدا از schema compile تست شوند.

## Worker Fencing Acceptance

- دو Worker یک Job را هم‌زمان lease نکنند؛
- reclaim باعث epoch جدید شود؛
- Worker قدیمی در heartbeat/checkpoint/draft write/complete رد شود؛
- cancel/kill-switch lease قبلی را invalid کند؛
- completion و outbox اتمیک و duplicate برابر صفر؛
- clock skew و lease expiry behavior تعریف و تست شود.
