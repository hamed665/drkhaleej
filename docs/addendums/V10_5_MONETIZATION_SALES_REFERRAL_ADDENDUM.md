# V10.5 Monetization, Sales, and Referral Addendum

## 1. Status and Authority

- This addendum is documentation-only.
- This addendum does not authorize implementation.
- This addendum does not replace V10.4 master-spec files.
- If this addendum conflicts with V10.4 master-spec files, `README.md`, `AGENTS.md`, `docs/project-state/CURRENT_STATE.md`, `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`, or any stricter guardrail, the V10.4 master-spec files, current-state documentation, agent instructions, alignment matrix, and stricter guardrail win.
- This addendum registers future monetization, billing-term, payment-method, sales, commission, referral, credit, and revenue add-on requirements only.
- This addendum is not evidence that gateways, card storage, billing routes, sales panels, roles, tables, policies, audit logs, ledger writes, provider dashboards, admin mutations, referral dashboards, or cash payouts may be implemented.

## 2. Four-Axis Mapping Requirement

Every future implementation task derived from this addendum must use the existing V10.4 four-axis mapping model:

1. Execution Phase
2. Lock Scope
3. Product Module
4. Subphase ID

The future task must map work to existing V10.4 execution phases, lock scopes, product modules, and subphase namespaces. It must not invent replacement phase numbers, informal phase labels, or parallel architecture.

## 3. Non-Implementation Boundary

This addendum does not create, modify, or approve:

- routes
- migrations
- RLS policies
- API handlers
- server actions
- UI components
- business logic
- validators
- Supabase types
- route checks
- SEO checks
- seed data
- gateways
- card storage
- billing routes
- sales panels
- roles
- tables
- audit logs
- ledger writes
- provider dashboards
- admin mutations
- referral dashboards
- cash payouts

## 4. Future Implementation Gate

Implementation requires a future `PHASED_BUILD_ONLY` task with:

- Execution Phase
- Lock Scope
- Product Module
- Subphase ID
- allowed files
- forbidden scope
- database impact
- route impact
- RLS/security impact
- validation
- human approval checkpoint

No implementation may proceed from this addendum alone.

## 5. Existing V10.4 Monetization Boundary Preserved

Future monetization must preserve the V10.4 boundary:

- Manual billing and plan work require explicit future monetization approval.
- Live gateway integration remains unapproved unless explicitly approved in a future phase.
- Card data storage is forbidden.
- Ledger behavior must be balanced, auditable, and server-side.
- Entitlement changes must be auditable and cannot be provider self-edited.
- Payment, receipt, plan, and credit workflows require role-scoped access and RLS/security approval before implementation.

## 6. Billing-Term Requirements

Future billing-term support may include:

- 3-month billing term
- 6-month billing term
- 12-month billing term
- ability to make a plan annual-only
- allowed billing terms per plan
- default billing term per plan
- plan pricing by term

Future implementation must define server-side validation, admin permissions, audit requirements, migration impact, RLS/security impact, and validation commands. This addendum does not create plan tables, term tables, config records, pricing logic, validators, or billing UI.

## 7. Payment Method Requirements

Future manual payment-method support may include:

- cash
- bank transfer
- cheque
- manual adjustment
- gateway later as future option only
- admin-only payment methods
- payment method restrictions by plan and term

`gateway later` is a future option only. It does not authorize gateway implementation, checkout, webhook handling, card storage, payment secrets, provider self-service payment flows, or live payment processing.

Payment method restrictions must be explicit, server-side, auditable, and validated in a future approved phase.

## 8. Custom Deal Override and Audit Requirements

Future custom deal overrides may allow approved admin users to adjust terms, pricing, or payment conditions for a specific provider deal. Any future implementation must include:

- explicit authorization rules
- audit logging requirements
- immutable or append-only change history where appropriate
- reason capture
- prevention of silent entitlement escalation
- validation against allowed plan, term, and payment-method rules

This addendum does not create audit logs, tables, admin mutations, server actions, validators, or UI.

## 9. Manual Invoice and Payment Approval Requirements

Future manual invoice and payment approval workflows may include:

- admin-created or admin-reviewed invoice records
- uploaded or recorded proof of payment where approved
- payment approval/rejection status
- review notes visible only to authorized users
- audit trail for approval, rejection, and adjustment

This addendum does not implement invoices, receipt storage, payment approval actions, payment review screens, file uploads, database tables, RLS policies, or admin routes.

## 10. Entitlement Activation Rules

Future entitlement activation must follow this rule:

- entitlement activation only after approved payment

Entitlements must not activate from unapproved invoices, pending payments, unverified manual adjustments, provider self-claims, client-side state, or unaudited admin changes. Future implementation must define fail-closed behavior, audit logging, and role-scoped access.

## 11. Sales Agent Panel Future Requirements

Future sales-agent functionality may include:

- `sales_agent` role
- `sales_manager` role
- sales lead ownership
- sales deal tracking

These are requirement labels only. This addendum does not create roles, role enums, permissions, sales panels, admin routes, dashboards, CRM tables, lead ownership records, deal tables, server actions, RLS policies, or UI.

## 12. Sales Commission and Payout Requirements

Future commission and payout planning may include:

- commission rules
- commission ledger
- payout tracking
- commission only after paid invoice

Commission must never be credited from unpaid, rejected, fake, or pending invoices. Any future commission ledger must be auditable, role-scoped, and consistent with approved billing and payment records. Cash payout workflows require separate explicit approval and are not approved by this addendum.

## 13. Provider Referral Partner Program Requirements

Future provider referral partner planning may include:

- provider referral codes
- provider referral dashboard
- provider referral reward rules
- provider credit ledger
- provider rewards should start as internal credit, not cash payout

Future referral implementation must prevent fake attribution, duplicate attribution, unapproved rewards, private-data exposure, and unaudited credit changes. Provider referral dashboards and credit ledgers require separate route, database, RLS/security, and validation approval.

## 14. Revenue Add-ons

Future revenue add-ons may include:

- profile boost
- featured placement
- pay-per-lead
- SEO article packages
- branded monthly reports
- premium microsite/subdomain add-on

Each add-on requires separate approval before implementation. Sponsored or boosted placements must be clearly labeled where surfaced. Revenue add-ons must not create hidden organic ranking boosts, unsupported medical claims, thin SEO pages, unapproved public pages, private-data exposure, or unaudited billing/ledger effects.

## 15. Compliance-Sensitive Warnings

Future monetization, sales, referral, and add-on implementation must include compliance-sensitive review for:

- healthcare referral
- offers
- discounts
- advertising
- medical claims
- sponsored placement labels
- no hidden ranking boosts

Healthcare referral rewards, discounts, advertising, paid placement, medical content, and provider promotions may require legal/compliance approval before implementation. This addendum does not define final legal policy or approve regulated workflows.

## 16. Phase Mapping Table

| Requirement group | Execution Phase | Lock Scope | Product Module | Subphase ID namespace |
| --- | --- | --- | --- | --- |
| Documentation-only monetization/sales/referral registration | Phase 0 | Phase 0 — Repository Readiness | Phase 0 — Setup Only | `ALIGN-*` |
| Billing terms and pricing by term | Phase 6 — Monetization Foundation | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger | `MON-*` |
| Payment method restrictions, manual invoices, approved-payment activation | Phase 6 — Monetization Foundation | Phase 9 — Plans and Manual Billing | Phase 7 — Billing/Ledger | `MON-*` |
| Sales Agent Panel, sales roles, lead ownership, deal tracking | Phase 7 or Phase 4 if admin-only | Phase 5 or future approved sales/admin lock mapping | Phase 14 — Sales CRM, Proposals and Contracts | `SALES-*`, `ADM-*` |
| Commission ledger and payout tracking | Phase 6 or Phase 7 depending billing/reporting scope | Phase 9 — Plans and Manual Billing | Phase 7; Phase 14 | `SALES-*`, `MON-*` |
| Provider referral partner program and provider credit ledger | Phase 6 or Phase 7 depending ledger/reporting scope | Phase 8 or Phase 9 depending event/ledger files | Phase 7, Phase 12, or Phase 14 | `REF-*`, `MON-*`, `ANL-*` |
| Revenue add-ons | Phase 6; Phase 7; Phase 3 if public SEO content is involved | Phase 8, Phase 9, or Phase 10 depending files | Phase 7, Phase 9, Phase 12, or Phase 15 | `MON-*`, `SEO-*`, `ANL-*` |

## 17. Explicitly Out of Scope

This addendum does not approve or implement:

- payment gateways
- checkout
- webhook handling
- card storage
- payment secrets
- billing routes
- provider billing routes
- admin billing routes
- invoice tables
- receipt storage
- payment approval mutations
- sales panels
- `sales_agent` or `sales_manager` roles
- role enums or permissions
- sales lead ownership tables
- sales deal tracking tables
- commission ledger writes
- payout workflows
- provider referral codes
- provider referral dashboards
- provider credit ledger tables or writes
- cash payouts
- profile boost logic
- featured placement logic
- pay-per-lead logic
- SEO article package implementation
- branded report generation
- premium microsites or subdomains
- sponsored wallet
- hidden ranking boosts
- public route changes
- admin mutations
- provider dashboards
- migrations
- RLS policies
- seed data
- validators
- API handlers
- server actions
- UI components

## 18. Future Validation Expectations

A future implementation task derived from this addendum must run the validation commands specified by that task. Depending on approved scope, future validation may include environment checks, migration validation, RLS tests, route checks, typecheck, build, lint, billing/ledger tests, auth/permission tests, audit-log checks, and SEO checks for any public surface.

No validation command may be faked, skipped silently, weakened, or replaced with a non-equivalent check.

## 19. Human Approval Requirements

Before implementation of any requirement registered here, a human must approve a future `PHASED_BUILD_ONLY` task that includes the full four-axis mapping, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation gate, and human approval checkpoint.

This addendum must not be treated as human approval for monetization, billing, payment methods, gateways, invoices, entitlement activation, sales roles, sales panels, commission ledgers, payouts, referral dashboards, provider credit ledgers, revenue add-ons, admin mutations, provider dashboards, sponsored placements, or cash payouts.
