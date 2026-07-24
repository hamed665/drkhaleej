# Post-P09 Go / No-Go Decision

## Current decision

```text
NO-GO_PENDING_LITERAL_UI_SESSION
```

This is a fail-closed interim decision. The exact-SHA isolated Preview database proof is green, but a human operator has not yet completed the protected Vercel Preview Admin workflow in an authenticated browser session.

## Exact hosted proof

- Source commit: `dc18cc1580500ef53e783516797bc1057b7fa77d`
- Environment class: isolated Preview
- Migration ledger: exact through `0084`
- Production connected or changed: no
- Ten persisted stages: complete
- One fresh Reservation plus one bounded replay: verified
- Second Reservation created: no
- Private mutation plus persisted publish readback: verified
- One fresh atomic rollback plus one bounded replay: verified
- Exact logical recovery: verified
- Bounded audit history: exactly one reservation, mutation-start, publish-success and rollback-success event
- Integrity-zero set: all zero
- Private/noindex/no-route/no-sitemap boundary: verified
- Secret, raw identifier, protected-value and unrestricted-payload leakage: zero
- Deterministic cleanup: verified
- Full CI, Vercel Preview, P03, P05, P06 and P07 regressions: green

Hosted artifact:

```text
p09-real-admin-canary-dc18cc1580500ef53e783516797bc1057b7fa77d
sha256:8e23da340f86a95b0e933e8bc81ed5f811379c7c891c187c5686a06e7a2145cd
```

## Remaining literal UI gate

One registered Supabase Preview Auth user whose profile is `is_platform_admin=true` must sign in through the Vercel Preview magic-link flow and execute the protected `/admin/imports/readiness` path:

```text
Dry Run
→ Exact Review
→ Authorization Ready
→ Reservation
→ Reservation Verified
→ Private Publish
→ Publish Verified
→ Rollback
→ Exact Recovery Verified
→ Bounded Audit History
```

The Vercel Preview deployment must already be fail-closed configured with exactly one allowed actor, exactly one fixed Pharmacy entity, the Preview-only activation flag and matching approval-token values. No raw actor ID, entity ID, approval token or authentication material belongs in this document, PR text, browser-visible evidence or workflow artifacts.

## GO requirements

`GO` may replace the current decision only when all of the following are recorded on one exact reviewable SHA:

- authenticated Preview Admin session completed;
- every visible stage matched persisted readback;
- no stale-tab or double-submit bypass;
- no automatic mutation retry;
- no orphan, duplicate, audit gap or unfinished execution;
- exact recovery remained verified;
- public, index, sitemap and route exposure remained zero;
- no secret, raw identifier, protected value or unrestricted payload leaked;
- independent reviewer approved the latest reviewable head;
- Production remained disconnected and unchanged.

A future `GO` opens only the separately approved Registry/Pharmacy-public planning gate. It does not open Agent, Content, Hospital, Doctor or Bulk execution.
