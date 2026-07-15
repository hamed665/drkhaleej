# Operations Runbook اصلاح‌شده

## Daily

- queue age و lease health؛
- failed/retryable/terminal jobs؛
- source fetch health؛
- budget consumption/reservations؛
- critical reviews؛
- authorization/reservation integrity؛
- public/index/sitemap leakage؛
- outbox؛
- worker version drift.

## Incident Severity

### SEV-1

public/index/sitemap leakage، secret leakage، Agent canonical mutation، rollback mismatch، mass duplicate/corruption.

اقدام:

1. global automation pause؛
2. publish/promotions disable؛
3. key revoke اگر لازم؛
4. evidence preserve؛
5. affected scope؛
6. existing rollback authority؛
7. integrity report؛
8. Admin notification؛
9. post-incident PR و approval قبل از resume.

### SEV-2

source poisoning، queue stuck، repeated worker failure، budget overrun، notification outage.

### SEV-3

single extraction failure، low-priority stale data، report formatting issue.

## Ambiguous Mutation

```text
Timeout/unknown result
→ Do not retry
→ Server readback
→ committed/replayed/failed classification
→ retry only with proof of no commit
```

## Worker Recovery

- lease expiry reclaim؛
- attempt input hash comparison؛
- fetch/extraction retry bounded؛
- Draft write idempotent؛
- Worker never executes publish/rollback؛
- poison job quarantine after max attempts.

## Preview DB Canary Lifecycle

1. isolated database/project؛
2. migrations current؛
3. fixture/run ID؛
4. execute exact UI path؛
5. readback/integrity؛
6. evidence artifact؛
7. cleanup or retention TTL؛
8. no Production credentials.

## Release

1. fresh main و worktree check؛
2. mapping/scope؛
3. focused implementation؛
4. tests and DB proof؛
5. PR review؛
6. GitHub Actions؛
7. Vercel Preview؛
8. Preview DB canary؛
9. integrity؛
10. merge؛
11. docs/Issue sync؛
12. post-merge smoke.

## Rollback Release

Code rollback، migration forward-fix و data rollback جدا تصمیم‌گیری می‌شوند. destructive down migration بدون backup verification ممنوع است.

## Backup/Restore Drill

قبل از public launch:

- backup policy verified؛
- restore به isolated environment؛
- sample integrity checks؛
- RPO/RTO actual ثبت؛
- owner و escalation path.

## Monthly Governance

source trust، model/prompt، budgets، permissions، retention، keys، incidents، family coverage، backup drill status و roadmap rebaseline.
