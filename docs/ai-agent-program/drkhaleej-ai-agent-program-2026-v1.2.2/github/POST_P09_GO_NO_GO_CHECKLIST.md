# Post-P09 Go/No-Go

## Evidence identity

- Main/PR SHA:
- Preview deployment:
- Preview DB run ID:
- Canary Pharmacy ID:
- Evidence bundle link:
- Integrity report link:

## Required GO conditions

- [ ] P01–P09، شامل P04-A/P04-B، merged and docs aligned
- [ ] authorization→reservation chain verified
- [ ] DB replay/concurrency/abort proof green
- [ ] no second reservation invocation
- [ ] private publish exact readback green
- [ ] rollback exact recovery green
- [ ] UI path executed without bypass
- [ ] orphan/duplicate/audit-gap/unfinished = 0
- [ ] public/index/sitemap leakage = 0
- [ ] secret/unbounded payload leakage = 0
- [ ] unresolved critical review = 0
- [ ] migration/RLS/grant checks green
- [ ] GitHub Actions/Vercel green on evidence SHA
- [ ] incident/known critical limitation = none

## Decision

```text
Decision: GO | NO-GO
Approved by:
Approved at:
Next allowed milestone:
Conditions/notes:
```

`NO-GO` یعنی فقط remediation PR مجاز است. `GO` فقط M2 را باز می‌کند و به‌تنهایی Agent، Content یا Bulk را مجاز نمی‌کند.
