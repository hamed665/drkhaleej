# DATA-SEED-PLAN-A — Controlled MVP Public Provider Seed Plan

## 1. Phase Control

- Task ID: `DATA-SEED-PLAN-A`
- Mode: `PHASED_BUILD_ONLY`
- Task type: Documentation-only planning PR
- Execution Phase: Phase 3 — Public SEO Platform / public discovery completeness planning
- Lock Scope: Documentation-only project-state seed planning
- Product Module: Public catalog data quality and discovery readiness
- Subphase ID: `DATA-SEED-PLAN-A`

This document is a controlled plan for future MVP public provider seed data. It does not authorize inserting provider rows, creating import scripts, editing migrations, changing RLS, changing application behavior, or publishing any listing.

If this document conflicts with `AGENTS.md`, `README.md`, project-state files, V10.4 master-spec files, V10.5 addendums, data-import protocols, SEO protocols, RLS/security protocols, privacy requirements, or stricter future human instructions, the stricter guardrail wins.

## 2. Purpose of MVP Seed Data

MVP seed data is intended only to improve initial public discovery completeness for Oman public catalog pages after a separate future approval permits controlled seed/import execution.

MVP seed data must not imply, create, or simulate:

- DrMuscat verification;
- sponsorship, paid placement, advertising, or boosted ranking;
- provider claim ownership;
- patient review history;
- rating quality;
- medical endorsement;
- professional credential validation;
- clinical outcome guarantees; or
- platform recommendation.

Seeded public listings, if approved in a future PR, must be neutral directory records. They exist to help users discover publicly available provider contact/location information and broad service categories, not to rank or endorse providers.

## 3. Allowed Provider Categories for MVP

A future MVP seed/import PR may propose only Oman public listings in these categories:

- clinics / medical centers;
- dental clinics;
- dermatology / beauty / wellness providers;
- pharmacies;
- labs;
- hospitals / polyclinics;
- pet clinics.

Categories outside this list require separate explicit human approval before inclusion.

## 4. Initial Target Volume

The initial MVP public provider seed target is:

- 30 to 50 public provider listings;
- Oman only;
- English and Arabic where available from provider-submitted, official, or confidently public sources.

Arabic or English translations must not be invented when they would imply legal, clinical, credential, licensing, or service claims. A neutral transliteration or omission is safer than an unsupported translation. If a bilingual name or description cannot be safely confirmed, the row must remain incomplete, be marked for review, or be skipped in the future seed/import phase.

## 5. Allowed Public Fields

A future controlled seed/import PR may include only the following public fields when each value is provider-submitted, official, confidently public, or manually reviewed as safe:

- provider or center name;
- provider type;
- city;
- area;
- public phone, only if verified from a public source or submitted by the provider;
- public WhatsApp, only if verified from a public source or submitted by the provider;
- website, if public;
- public address;
- map link or coordinates, only if confidently public;
- short neutral description;
- public service categories;
- source reference note for internal review.

The internal source reference note is required for review and audit context. It must not expose private reviewer notes, private contact details, patient information, credentials, secrets, or non-public data on public pages.

## 6. Forbidden Data

Future MVP seed/import work must not include or derive any of the following:

- private medical data;
- patient data;
- reviews;
- ratings;
- fake verified status;
- fake claimed status;
- fake offers;
- fake sponsored status;
- unsupported medical claims;
- before/after claims;
- scraped personal doctor data without manual review;
- insurance acceptance unless verified from the provider or an official source;
- prices unless provider-submitted or officially public and still marked as subject to confirmation;
- private phone numbers, private emails, direct personal contacts, or non-public staff data;
- license or credential claims unless explicitly confirmed through an approved future source/review model;
- ranking labels such as “best,” “top,” “recommended,” “trusted,” or similar qualitative endorsements;
- clinical outcome statements, cure claims, guaranteed results, or comparative claims;
- copied marketing copy that cannot be safely reused;
- scraped content from sources that prohibit reuse or create rights/privacy uncertainty.

Uncertain, disputed, sensitive, or unsupported data must not be inserted.

## 7. Listing Status Rules

All future MVP seed listings must default to conservative public-directory statuses:

- unclaimed by default;
- unverified by default;
- not sponsored by default;
- no reviews by default;
- no ratings by default;
- no offers by default.

Provider contact information must be confirmation-safe. Public phone, WhatsApp, website, address, map, or coordinates must be included only when they are provider-submitted, official, confidently public, and manually reviewed. If a contact field could route users to a private person, stale number, patient channel, or unsupported destination, it must be omitted until confirmed.

## 8. Source and Approval Rules

Future seed rows must follow this source hierarchy and approval model:

1. Provider-submitted data is preferred.
2. Official/public provider websites are acceptable for basic public facts.
3. Public map or business listings are acceptable only for basic public contact/location fields.
4. Social media may be used only for public contact, location, or service-category hints, not clinical claims.
5. Every row must be manually reviewed before insertion.
6. Every row must keep an internal source/review note.
7. Disputed or uncertain data must not be inserted.

Manual review must confirm that each row is suitable for a neutral public directory. Review must reject rows with unclear ownership, stale contact details, unsupported service claims, prohibited reuse concerns, private data exposure, or source conflicts.

## 9. Future Implementation Path

This PR creates only the controlled documentation plan.

Future work must remain separately approved and narrowly scoped:

- A future `DATA-SEED-TEMPLATE-A` PR may create a blank CSV/JSON template or import specification without actual provider rows.
- A future `DATA-SEED-MVP-A` PR may add approved seed data only after explicit human approval.
- Seed insertion must remain separate from this planning PR.
- Any seed/import implementation must list the exact files to create/edit before editing.
- Any seed/import implementation must not modify existing SQL migrations unless explicitly approved.
- Any RLS policy change requires an explicitly approved RLS phase.
- Any public route, sitemap, schema, ranking, review, offer, sponsorship, dashboard, or admin mutation change requires separate explicit approval.

## 10. Validation Expectations for Future Seed/Import PRs

A future seed/import PR must run the validation commands that match its touched files and risk level. The expected baseline is:

- `git diff --check`;
- `pnpm env:check`;
- `pnpm db:validate:migrations` if DB/migration files are touched;
- `pnpm test:db:rls` if DB/RLS-sensitive files are touched;
- `pnpm typecheck`;
- `pnpm build`;
- `pnpm routes:check`;
- `pnpm seo:check`.

Validation must not be faked, skipped silently, weakened, or made to pass by disabling TypeScript, lint, route, SEO, env, migration, RLS, seed, or build checks.

## 11. Explicit Non-Goals

This plan does not implement, approve, or imply approval for:

- review feature;
- rating feature;
- ranking algorithm;
- ads;
- payment;
- provider dashboard;
- claim workflow;
- AI;
- multi-country data;
- scraping pipeline;
- automated publication;
- admin mutation workflows;
- provider lead conversion workflows;
- public review display;
- provider reply workflows;
- sponsored placement;
- offers;
- insurance workflows;
- booking workflows;
- analytics or notification features.

## 12. Documentation-Only Confirmation

This document intentionally contains no real provider rows, no seed data files, no import scripts, no migrations, no RLS policy changes, no generated type changes, no route changes, no source-code changes, no package changes, and no application behavior changes.
