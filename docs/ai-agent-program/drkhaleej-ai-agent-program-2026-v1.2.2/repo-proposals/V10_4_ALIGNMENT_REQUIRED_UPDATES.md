# V10_4 Phase Alignment Matrix — Required Updates

## هدف

Matrix باید mapping باشد، نه roadmap دوم.

## Required rows

| Capability | Current status | Evidence | Next gate |
|---|---|---|---|
| Client-safe authorization | Complete | #936 | maintain static checks |
| Canonical Pharmacy patch | Complete | #937 | executor parity |
| Metadata/locale preservation | Complete | #938 | publish/rollback regression |
| Stable operation identity | Complete | #939 | replay proof |
| Persisted authorization | Complete | #940 | lifecycle regression |
| Invalidation/readback | Complete | #941 | bounded UI regression |
| Atomic reservation transaction | Implemented/partial wave | #942 | DB safety proof + audit split |
| Admin reserve operation | Implemented/partial wave | #943 | integrity readback |
| Reservation integrity proof | Open | — | RES-INTEGRITY-READBACK |
| Existing private executor handoff | Open | — | PRIVATE-RESERVATION-GATE |
| Exact rollback recovery | Open | — | Wave 4 |
| Pharmacy public/index/sitemap | Disabled/Open | — | after Admin canary |
| AI-assisted intake | Planned | — | after intake convergence |
| Content/SEO Agent | Planned separate track | — | after CMS/automation authority |

## Database baseline

هر اشاره به migration `0053` به baseline واقعی main اصلاح شود. Matrix نباید شماره‌ی migration آینده را حدس بزند.

## Immediate task mapping

| Subphase | Execution Phase | Lock Scope | Product Module |
|---|---|---|---|
| ALIGN-CURRENT-STATE | Phase 9 | Phase 10 | Phase 6 |
| RES-INTEGRITY-READBACK | Phase 9 | Phase 10 | Phase 6 |
| RES-DB-SAFETY-PROOF | Phase 2 | Phase 3 | Phase 2 |
| PRIVATE-RESERVATION-GATE | Phase 2 | Phase 10 | Phase 6 |
| PRIVATE-ADMIN-WIRING | Phase 4 | Phase 10 | Phase 6 |
| ROLLBACK-AUTHORITY-HARDENING | Phase 9 | Phase 11 | Phase 6 |
| ROLLBACK-EXACT-RECOVERY | Phase 9 | Phase 11 | Phase 18 |
| ADMIN-STATE-MACHINE | Phase 4 | Phase 5 | Phase 6 |
| REAL-ADMIN-CANARY | Phase 9 | Phase 11 | Phase 18 |

این mapping primary است و باید روی current main هنگام شروع هر PR تأیید شود. Program Milestoneهای M0–M10 جایگزین phaseهای canonical نیستند.
