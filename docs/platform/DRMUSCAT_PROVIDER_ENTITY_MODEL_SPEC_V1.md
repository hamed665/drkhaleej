# DrMuscat Provider Entity Model Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: Future provider/domain entity design only.
- This document does not authorize implementation.
- This document must be read together with:
  - `docs/platform/DRMUSCAT_PLATFORM_ARCHITECTURE_V1.md`
  - `docs/platform/DRMUSCAT_PLATFORM_EXECUTION_ROADMAP_V1.md`
  - `docs/platform/DRMUSCAT_ROLES_AND_PERMISSIONS_SPEC_V1.md`
- This document does not replace the V10.4 master spec or any stricter guardrails.
- Future implementation requires separate `PHASED_BUILD_ONLY` approval.
- No code, route, migration, RLS, API, dashboard, provider mutation, claim, verification, billing, ads, offers, CMS, AI, analytics, review, seed, or auth behavior is approved by this document.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-PROVIDER-ENTITY-MODEL-SPEC-V1`.

## 1. Purpose

This document defines the future DrMuscat provider/domain entity model before any future implementation. It translates the already-approved platform architecture, execution roadmap, and roles/permissions model into a canonical domain vocabulary and ownership model for provider data.

This document defines:

- future provider/domain entity model;
- canonical provider concepts;
- organization/center model;
- doctor model;
- doctor-center relationship model;
- branch/location model;
- category/specialty/service taxonomy relationship;
- claim model;
- verification model;
- public/private field boundary;
- ownership and editability rules;
- migration readiness requirements;
- RLS implications;
- stop rules before implementation.

This document does not create tables, policies, routes, APIs, dashboards, public projections, storage buckets, seed data, provider self-service behavior, claim workflows, verification workflows, billing behavior, ads, offers, analytics, auth flows, or any product behavior.

## 2. Core Entity Principles

1. Organization/center identity must be stable. A provider's canonical organization identity must survive branch changes, ownership changes, claims, profile edits, and temporary publication status changes.
2. Doctor identity must be stable and independent. A doctor's identity must not be permanently owned by a single center or erased when a center relationship ends.
3. Center owns the relationship context. A center may manage relationship-specific details such as role at center, services at that center, schedule context, branch context, and contact routing where approved.
4. Doctor owns identity/profile continuity. Doctor name, biography, credentials, language continuity, and professional identity must remain independent from any one organization relationship.
5. A doctor can work at multiple centers. The model must support multiple active doctor-organization relationships without duplicating canonical doctor identity.
6. A center can have multiple doctors. The model must support one-to-many center-to-doctor relationships through explicit relationship records.
7. A branch is not the same thing as an organization. A branch is a physical/service location under an organization and must not replace organization identity.
8. Services and specialties must be normalized enough for SEO/search. Taxonomy must avoid uncontrolled free-text fragmentation while allowing future localization, filtering, and canonical route planning.
9. Public profile data must be separated from private operational data. Public-safe profile fields must not be stored or exposed in a way that leaks license documents, internal notes, payments, private user data, or operational queues.
10. Claim and verification are admin-reviewed workflows. Claims establish requested ownership or management rights; verification reviews evidence about entity legitimacy. They must not be conflated.
11. Provider self-service must use draft/review/publish, not direct overwrite. Provider-originated edits should enter drafts and review queues before changing public profiles when sensitive or public-impacting.
12. Paid/sponsored/verified status must not be provider-self-assigned. These statuses are platform-controlled, admin-reviewed, entitlement-controlled, or system-controlled as applicable.
13. Pet clinics are included from launch but must not be treated as human medical care. Pet/veterinary categories require clear taxonomy separation and safe public labeling.
14. Insurance and appointment booking remain future-only but schema-ready. Entity design may reserve conceptual room for future insurance and booking but does not approve those features.
15. Future implementation must fail closed. If ownership, privacy, RLS scope, publication status, or route eligibility is unclear, data must remain private/unpublished and implementation must stop.

## 3. Canonical Entity Glossary

| Term | Meaning | Examples | Public/private nature | Future implementation notes |
| --- | --- | --- | --- | --- |
| `organization` | Canonical provider business/entity identity. It represents the stable provider umbrella, not a single address. | Clinic, medical center, hospital, pharmacy, lab, wellness center, pet clinic. | Mixed: public identity fields may be public after approval; ownership, billing, internal notes, and documents are private/admin-only. | Future migrations must avoid using legacy writable tables as the canonical writable source unless explicitly approved. |
| `organization_profile` | Public-facing and draftable descriptive profile for an organization. | Name, description, logo, public phone, website, category display. | Public-safe only after approval; drafts and sensitive fields are private until reviewed. | Should support draft/review/publish and revision history before provider self-service. |
| `organization_branch` | Physical or service location under an organization. | Muscat branch, Al Khuwair branch, mobile service branch if later approved. | Address and coordinates may be public after approval; internal notes and operational flags are private. | Single-location providers may still have one default branch. |
| `organization_member` | User-to-organization relationship granting scoped management access. | Owner, manager, staff member, billing contact. | Private/admin-controlled; membership existence should not be broadly public. | Created/activated only through approved claims, admin action, or future invited membership workflow. |
| `organization_document` | Private file/evidence associated with an organization. | License document, claim proof, payment proof, identity proof if ever approved. | Private and admin/reviewer scoped; never public. | Requires private storage bucket, file validation, audit, and RLS plan before implementation. |
| `organization_verification` | Verification state and evidence review for an organization. | Clinic license review, phone confirmation, registration review. | Public profile may show approved verification label if allowed; evidence and review notes are private. | Separate from claims and paid/sponsored status. |
| `doctor` | Stable doctor/professional identity independent from any center. | Dermatologist, dentist, pediatrician, veterinarian where taxonomy allows. | Approved public identity fields may be public; ownership, license documents, claims, and notes are private. | Must not be deleted or duplicated when a doctor changes centers. |
| `doctor_profile` | Public/draft professional profile for a doctor. | Full name, title, biography, languages, specialties, photo. | Public-safe after approval; drafts, sensitive documents, and internal notes are private. | Center may request relationship-specific updates but cannot silently own global doctor identity. |
| `doctor_organization_relationship` | Explicit relationship between a doctor and an organization, optionally branch-scoped. | Doctor works at a dental clinic, doctor visits two branches, veterinarian at pet clinic. | Public only if active/approved and visible; review status, disputes, and requester data are private. | Critical join model that prevents identity duplication and center takeover of doctor identity. |
| `doctor_schedule_context` | Relationship/branch-specific future scheduling context for a doctor. | Monday at branch A, Friday at branch B, WhatsApp-only availability. | Public schedule snippets may be public if approved; operational scheduling details can be private. | Future-only; must not implement appointment booking through this spec. |
| `category` | Broad directory grouping for discovery and SEO. | Dental, dermatology, pharmacy, lab, pet clinic, wellness. | Public taxonomy terms may be public; internal taxonomy notes are private/admin-only. | Route generation requires separate route/SEO inventory approval. |
| `specialty` | Professional or medical specialization, usually tied to doctors or professional services. | Orthodontics, dermatology, pediatrics, veterinary medicine. | Public taxonomy terms may be public after approval. | Must support English/Arabic names and SEO-safe slugs. |
| `service` | Specific service, treatment, test, package, or offering. | Teeth whitening, laser hair removal, blood test, pet vaccination. | Public if approved for provider profile/search; pricing, operational notes, or regulated details may be private. | Service pages are future-only and must pass SEO readiness gates. |
| `language` | Language associated with profile content or provider/doctor communication. | English, Arabic, Hindi if display language is approved later for staff communication only. | Usually public when shown as profile capability; internal notes remain private. | Public route locales remain limited to approved locales; language ability is not route approval. |
| `country` | Top-level geography model. | Oman; future GCC countries. | Public for locations/routes when approved. | Oman is the only approved launch country. |
| `region` | Governorate/region under a country. | Muscat Governorate, Dhofar. | Public for addresses/routes when approved. | Route expansion requires SEO inventory approval. |
| `city` | City/locality under a region. | Muscat, Salalah, Sohar. | Public for addresses/routes when approved. | Must support future GCC expansion without route sprawl. |
| `area` | Neighborhood or area under a city. | Al Khuwair, Qurum, Ruwi. | Public only when approved and not deprecated/duplicative. | Area pages require supply/content/indexing gates and must avoid forbidden deprecated routes. |
| `claim_request` | Request to gain ownership/management rights over an organization or doctor profile. | Center owner claims clinic profile, doctor later claims doctor profile. | Request metadata and evidence are private; public claim status display requires explicit approval. | Approval may create membership only in future approved implementation. |
| `verification_review` | Admin/platform review of evidence for verifying an entity. | License check, registration evidence, contact confirmation. | Verification label may be public if approved; evidence, notes, reviewer details are private. | Verification is not a claim and not a paid/sponsored status. |
| `profile_draft` | Provider/doctor/admin editable proposed profile revision before publication. | Edited phone number, biography update, new gallery image. | Private until approved; may contain provider-entered data not yet public-safe. | Requires review workflow, sensitive-field gates, and revision history. |
| `published_profile` | Current approved profile content used for public display or public projection. | Approved organization profile, approved doctor profile. | Public-safe subset only. | Should be derived from approved data and not include private operational fields. |
| `public_projection` | Safe public read model/view/API response exposing only approved fields. | Public provider cards, doctor detail read model, category listings. | Public-safe by design. | No public projection is implemented by this document; future RLS/policy must fail closed. |
| `internal_note` | Non-public staff note for admin, support, verification, sales, finance, or review context. | Reviewer concerns, sales follow-up, data quality note. | Private/admin or role-scoped only. | Must never appear in public projection, SEO metadata, or provider-visible views unless explicitly approved. |
| `audit_log` | Append-only or tamper-resistant record of important changes/actions. | Claim approval, verification status change, entitlement change, role assignment. | Private/admin scoped; raw logs are not public. | Required for ownership transfer, verification, paid status, and sensitive admin actions. |

## 4. Organization / Center Model

An `organization` is the stable canonical provider entity. The term can represent clinics, hospitals, pharmacies, labs, wellness providers, pet clinics, and other approved provider types. It is not synonymous with a branch, location, membership, claim, verification, or public route.

Future organization types include:

- clinic;
- medical center;
- hospital;
- dental clinic;
- beauty/aesthetic center;
- lab;
- pharmacy;
- wellness center;
- gym/fitness;
- healthy restaurant if approved by taxonomy;
- pet clinic;
- veterinary/pet wellness;
- other future approved type.

Future conceptual organization fields include:

- `id`;
- canonical name en/ar;
- slug;
- organization type;
- primary category;
- description en/ar;
- public phone;
- public WhatsApp;
- public email if approved;
- website;
- social links;
- license fields;
- verification status;
- claim status;
- profile status;
- owner/member relationships;
- `created_at` / `updated_at` / `deleted_at`;
- internal admin fields;
- public display flags.

No fields are implemented by this document. Future classification should follow these boundaries:

- Public-safe after approval: canonical public name, approved slug, approved category, approved description, approved public phone/WhatsApp, approved website/social links, public display flags, and approved branch/location display fields.
- Provider-editable draft: descriptive profile text, public contact fields, website/social links, media submissions, and non-sensitive service/category proposals, all subject to review rules.
- Private: license documents, claim proof, private contact details, payment records, invoices, internal ownership evidence, and private user data.
- Admin-only: internal notes, verification review notes, claim review notes, data quality flags, manual override reasons, and sensitive operational queues.
- System-controlled: `id`, slug uniqueness/canonicalization, verification status, claim status, sponsored status, plan entitlement, timestamps, deletion/deactivation status, audit references, and publication state transitions unless future policy allows scoped admin action.

## 5. Organization Branch Model

A branch represents a physical or service location under an organization. It must not replace the organization as the stable provider identity.

Future branch fields/concepts include:

- organization id;
- branch name en/ar;
- address en/ar;
- country/region/city/area;
- map coordinates;
- phone/WhatsApp override;
- working hours;
- branch services;
- branch doctors;
- branch media;
- active/inactive status.

Rules:

- Organization can have one or many branches.
- Single-location provider may still have one default branch.
- Branch address may be public after review/approval and route eligibility checks where relevant.
- Internal branch notes are private.
- Branch visibility must be reviewable.
- Branch deletion should be soft delete/deactivation in future.
- Branch services and branch doctors must not imply provider-wide availability unless explicitly modeled.
- Branch contact overrides must not expose private staff contact details.

## 6. Doctor Model

Doctor identity/profile belongs to the doctor, not permanently to a center. Centers may request or manage relationship-specific details only within approved role and review boundaries.

Future doctor fields/concepts include:

- `id`;
- full name en/ar;
- slug;
- profile photo;
- title;
- specialty links;
- service links;
- languages;
- biography en/ar;
- education/credentials;
- license/registration fields;
- years of experience if approved;
- gender if allowed/needed;
- verification status;
- claim status;
- profile status;
- `created_at` / `updated_at` / `deleted_at`.

Public/private rules:

- Public doctor profile fields must be approved before exposure.
- License documents are private.
- Admin review notes are private.
- Doctor can later claim profile through a separate doctor claim workflow.
- Center may request relationship-specific updates but cannot silently own identity.
- Doctor profile data must not imply active employment at a center unless an approved active doctor-center relationship exists.
- Doctor credentials may be public only as approved descriptive content and must not leak underlying private evidence documents.

## 7. Doctor-Center Relationship Model

The doctor-center relationship is separate from both doctor identity and organization identity. This is the critical model that allows doctors to work at multiple centers and centers to list multiple doctors without duplicating or capturing identity.

Future relationship concepts include:

- doctor id;
- organization id;
- branch id optional/required depending model;
- role/title at center;
- relationship status;
- start date;
- end date;
- services at this center;
- schedule context;
- contact routing context;
- booking/WhatsApp routing later;
- public visibility;
- admin approval status;
- requested by center/doctor/admin;
- `created_at` / `updated_at` / `deleted_at`.

Relationship statuses:

- `draft`;
- `pending_review`;
- `active`;
- `inactive`;
- `ended`;
- `rejected`;
- `disputed`.

Rules:

- Ending relationship must not delete doctor identity.
- Doctor can have multiple active relationships.
- Center can request doctor relationship.
- Doctor can confirm/reject later if doctor account exists.
- Admin can review conflicts.
- Relationship-specific data can differ by center/branch.
- Center cannot take over doctor identity.
- Doctor cannot modify center billing/verification/ads through relationship.
- Future public pages must distinguish doctor identity from center relationship context.
- Branch-specific relationship visibility must not create duplicate thin pages or misleading availability claims.
- Relationship disputes must fail closed by hiding or marking relationship data non-public until reviewed.

## 8. Category, Specialty, and Service Taxonomy

Taxonomy must separate broad discovery grouping, professional specialization, and specific services.

- Category: broad directory grouping.
- Specialty: professional/medical specialization.
- Service: specific offered service/treatment/package.
- Tag: optional future lightweight labeling, if approved.

Examples:

- Category: dental, dermatology, pharmacy, lab, pet clinic, wellness.
- Specialty: orthodontics, dermatology, pediatrics, veterinary medicine.
- Service: teeth whitening, laser hair removal, blood test, pet vaccination.

Rules:

- Taxonomy must support English and Arabic.
- Taxonomy must support SEO-safe slugs.
- Taxonomy must support public route generation only when approved.
- Taxonomy must not create thin pages automatically.
- Pet taxonomy must not mix with human medical taxonomy in a misleading way.
- Service pages are future and must pass SEO readiness gate.
- Insurance and appointment booking taxonomy remains future-only.
- Taxonomy aliases and redirects must be reviewed before public route use.
- Category, specialty, and service display must avoid unsupported medical claims.

## 9. Location Model

The location model is Oman-first while remaining future-scalable to GCC expansion.

Canonical location levels:

- country;
- region/governorate;
- city;
- area/neighborhood.

Rules:

- Oman is the only approved launch country.
- Public routes currently limited to en/ar and om.
- Location model must be future scalable to GCC.
- Area pages require supply/content/indexing gate.
- Coordinates may be public if used for map/directions.
- Internal location corrections and admin notes are private.
- No route expansion without Public Route and SEO Inventory Spec approval.
- Deprecated or duplicate public route patterns must not be created.
- Location data must not be used to infer private operational details beyond approved public display.

## 10. Claim Model

A claim request is a request for ownership or management rights over a provider entity. It is not verification and does not itself prove that the entity is licensed or endorsed.

Future claim request concepts include:

- requester user/contact;
- target organization;
- target doctor later;
- claim type;
- proof documents;
- contact match evidence;
- license match evidence;
- requested ownership role;
- status;
- admin reviewer;
- review notes;
- approval/rejection reason;
- audit link.

Claim statuses:

- `draft`;
- `submitted`;
- `pending_review`;
- `more_info_required`;
- `approved`;
- `rejected`;
- `cancelled`;
- `disputed`.

Rules:

- Public/anonymous claim requests may be allowed only through safe validated forms in future.
- Claim approval must be admin-reviewed.
- Claim approval can create/activate membership/ownership only in future approved implementation.
- Claim documents are private.
- Claim notes are private.
- Ownership transfer must be audited.
- Claim flow must not expose private provider data.
- Center claim and doctor claim are different workflows.
- Claim approval does not automatically verify a provider unless a separate verification review also approves verification.
- Claim status must fail closed if evidence, ownership, or reviewer scope is unclear.

## 11. Verification Model

Verification is separate from claim. Verification reviews whether an entity has evidence supporting legitimacy, registration, contact control, or other approved trust criteria. It does not grant ownership by itself.

Verification concepts include:

- entity type;
- entity id;
- license/registration evidence;
- contact confirmation;
- document review;
- reviewer;
- verification status;
- expiry date;
- `reviewed_at`;
- rejection reason;
- internal notes;
- audit reference.

Verification statuses:

- `unverified`;
- `pending_review`;
- `verified`;
- `rejected`;
- `expired`;
- `suspended`;
- `needs_update`.

Rules:

- Verified badge is admin/platform controlled.
- Provider cannot self-verify.
- Verification can expire.
- Verification evidence is private.
- Public profile may show verified label and last reviewed date if approved.
- Verification does not imply medical endorsement or ranking guarantee.
- Sponsored and verified are separate concepts.
- Verification review changes must be audited.
- Suspended or expired verification must fail closed for public badges.

## 12. Profile Draft / Published Profile Model

Future provider self-service must use a draft/review/publish model rather than direct public overwrites.

Concepts:

- provider editable draft;
- admin reviewed published profile;
- public projection;
- sensitive fields;
- non-sensitive fields;
- revision history;
- rejection notes;
- rollback.

Rules:

- Provider self-service should edit drafts, not directly overwrite public data.
- Sensitive fields require review.
- Public profile updates must be reviewable.
- Public projection must expose only approved fields.
- Admin/internal notes must never be public.
- Revision history is required for CMS-like provider edits later.
- Rollback must preserve audit context and must not silently erase review history.
- Draft data must not be indexed or exposed through public APIs.

## 13. Media and Documents Model

Public media and private documents must be separated conceptually and, in future implementation, through storage policies and access controls.

Public media:

- logo;
- cover image;
- gallery images;
- doctor photo;
- offer image;
- ad creative after approval.

Private documents:

- license document;
- claim proof;
- payment proof;
- identity proof if ever approved;
- internal review attachments.

Rules:

- Public media must be reviewed/approved where required.
- Private documents must never be public.
- Storage buckets/policies must separate public and private files in future.
- Before/after medical/beauty media requires policy and review.
- Pet clinic media must be category-safe.
- File validation required before implementation.
- Media metadata must not leak private uploader identity, private document paths, or internal review comments.
- Ad and offer creative must remain separate from organic profile media where labeling is required.

## 14. Public / Private / Admin-only Field Classification

| Field/concept | Public-safe | Provider-editable draft | Admin-only | Private | System-controlled | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Provider name | Yes, after approval | Yes | No, except overrides/review | No | Slug/canonical conflict handling | Must support en/ar and canonical identity continuity. |
| Slug | Yes | Proposed only | Review conflicts | No | Yes | Final slug uniqueness/canonicalization is system-controlled. |
| Category | Yes, after approval | Proposed only | Review taxonomy conflicts | No | Partly | Must use approved taxonomy, especially for pet/human separation. |
| Area | Yes, after approval | Proposed only | Review corrections | No | Partly | Route use requires SEO inventory approval. |
| Address | Yes, after approval | Yes | Review visibility | Partly if non-public premises | No | Public branch address may be displayed only after review. |
| Map coordinates | Yes, if approved for directions | Proposed only | Review corrections | Partly | No | Must not expose private/internal-only locations. |
| Phone | Yes, if public contact | Yes | Review sensitive changes | Private if internal number | No | Public phone must be intentionally public. |
| WhatsApp | Yes, if public contact | Yes | Review sensitive changes | Private if internal number | No | Future routing must avoid exposing private staff contact. |
| Email | Maybe, if approved public email | Yes | Review sensitive changes | Private if internal/admin email | No | Public email display requires explicit approval. |
| License number | Maybe limited display if policy approves | Proposed only | Yes | Partly | No | License documents are private even if a license number is displayed. |
| License document | No | Upload only in private draft/review | Yes | Yes | No | Must never enter public projections. |
| Verification status | Yes, badge only if approved | No | Yes | Evidence private | Yes | Provider cannot self-verify. |
| Claim status | Usually no; maybe claimed label if approved | No | Yes | Claim evidence private | Yes | Claim and verification are separate. |
| Sponsored status | Yes, clearly labeled where public | No | Yes | Billing details private | Yes | Cannot be self-assigned or hidden as organic ranking. |
| Plan entitlement | No, except public feature effects if approved | No | Finance/admin scoped | Yes | Yes | Activation only through approved future billing/entitlement rules. |
| Internal notes | No | No | Yes | Yes | No | Never public or provider-visible unless a future policy says otherwise. |
| Audit logs | No | No | Super/admin scoped | Yes | Yes | Raw logs are not public. |
| Doctor name | Yes, after approval | Doctor draft or admin/relationship request | Review conflicts | No | Canonical conflict handling | Must not be owned by one center. |
| Doctor credentials | Yes, approved summary only | Proposed only | Review evidence | Evidence private | No | Must avoid unsupported claims. |
| Doctor license document | No | Upload only in private draft/review | Yes | Yes | No | Never public. |
| Doctor-center relationship status | Active/approved public visibility only | Request/propose only | Yes | Disputes private | Yes | Draft/rejected/disputed should fail closed. |
| Payment status | No | No | Finance scoped | Yes | Yes | Must not leak invoices or receipts. |
| Lead records | No | Submitted form only where approved | Admin/sales scoped | Yes | Partly | Public lead forms do not imply public lead data. |
| Sales prospect notes | No | No | Sales/admin scoped | Yes | No | Scoped to sales roles and audit rules. |
| Offer status | Public only if approved/published | Proposed only | Review/approval | Draft/private notes | Yes | Requires separate ads/offers approval. |
| Ad status | Public label only if live/approved | Proposed/request only | Review/approval | Billing/review private | Yes | Sponsored content must be labeled. |

## 15. Public Projection Rules

Future public projections/views may include:

- approved organization fields;
- approved doctor fields;
- approved branch fields;
- approved service/category/location fields;
- approved doctor-center relationships;
- approved offer fields;
- verified/claimed/sponsored labels;
- public media;
- public disclaimers.

Future public projections/views must not include:

- private documents;
- internal notes;
- payment records;
- invoices;
- sales prospect data;
- admin review notes;
- unpublished drafts;
- raw audit logs;
- private user data;
- diagnosis/prescription/lab records.

No public projection is implemented in this PR. Future public read models must be explicit, reviewed, RLS-safe, SEO-safe, and fail closed when field classification or ownership is unclear.

## 16. SEO and Route Implications

Future SEO implications:

- Provider pages require canonical slug strategy.
- Doctor pages require canonical slug strategy.
- Category/area pages depend on approved taxonomy and location model.
- Doctor-center relationships may affect profile content but must not create duplicate thin pages.
- Branch pages are future-only unless route spec approves.
- Service pages are future-only unless route spec approves.
- Offer pages require offer workflow approval.
- Sponsored pages/content must be labeled.
- No fake schema.
- No `AggregateRating` until real review system exists.
- No Persian/Hindi routes.
- Empty/thin pages must noindex or not exist.
- Public route eligibility must distinguish canonical provider identity from relationship/branch context.
- Pet clinic pages must be labeled and structured so users do not confuse pet care with human medical care.

No route implementation is approved or performed by this document.

## 17. RLS and Security Implications

Future RLS implications:

- Organizations private write access scoped by membership.
- Doctor private write access scoped by doctor identity owner.
- Doctor-center relationships require relationship-level scope.
- Claim documents private.
- Verification evidence private.
- Public profiles exposed only via safe public projection/policy.
- Provider cannot self-verify.
- Provider cannot self-activate plan/sponsored status.
- Sales cannot access private provider docs unless approved.
- Finance cannot access medical/private documents unless approved.
- Admin access scoped to operational queues.
- Super admin access explicit and audited.
- No anon mutation.
- Service role not exposed to client.
- Drafts, private documents, review notes, payment status, and audit logs must default to private.
- Relationship-level permissions must prevent centers from editing global doctor identity or unrelated center data.

No RLS implementation is approved or performed by this document.

## 18. Migration Readiness Requirements

Before any provider entity migration, require:

- role/permission spec approved;
- provider entity model spec approved;
- public route/SEO inventory spec approved if public routes are involved;
- RLS policy plan approved;
- public/private field classification approved;
- audit log plan approved;
- storage bucket policy plan approved if media/documents involved;
- generated types plan approved;
- validator/check plan approved;
- rollback notes approved;
- existing table/function/view conflict check completed.

Any migration plan must also confirm that existing migrations remain immutable unless a future phase explicitly approves otherwise, no seed rows are introduced without approval, no public SELECT leaks private data, and no anon mutation is granted.

## 19. MVP Entity Priorities

MVP or near-MVP entities/concepts:

- organization;
- organization branch/default location;
- category;
- service/specialty basics;
- public provider profile;
- doctor profile;
- doctor-center relationship basics;
- claim/list interest;
- verification basics;
- public media basics;
- admin review notes/audit foundation.

Later entities/concepts:

- full provider dashboard drafts;
- insurance;
- appointment booking;
- complex schedules;
- reviews;
- AI content;
- advanced analytics;
- gateway billing;
- branch-specific pages;
- service pages;
- patient accounts.

These priorities are sequencing guidance only and do not approve implementation.

## 20. Stop Rules

Codex must stop if:

- existing schema conflicts with this model;
- organization/center naming is unclear;
- doctor identity vs center relationship is unclear;
- claim and verification are conflated;
- public/private field classification is missing;
- RLS ownership scope is unclear;
- a migration would expose private data;
- a public route would create thin/duplicate pages;
- pet clinic taxonomy is mixed incorrectly with human medical taxonomy;
- provider self-service mutation is attempted before ownership/draft model approval;
- verified/sponsored/paid status can be self-assigned;
- license documents would become public;
- seed data is required but not approved;
- route creation is required but not approved;
- storage policy boundaries are unclear for private documents or public media;
- doctor-center relationship changes would delete or overwrite canonical doctor identity;
- claim approval would silently activate verification, plan entitlement, sponsored placement, or public publishing without separate approval.

## 21. Explicitly Not Implemented

This document implements none of the following:

- no tables;
- no migrations;
- no RLS policies;
- no views/projections;
- no generated type changes;
- no routes;
- no APIs;
- no dashboards;
- no claim flow;
- no verification flow;
- no provider dashboard;
- no doctor dashboard;
- no media upload;
- no storage buckets;
- no search changes;
- no SEO route changes;
- no billing/ads/offers changes;
- no seed data.

## 22. Validation Expectations

For this PR:

- `git status --short`;
- `git diff --check`;
- `pnpm lint` if repository conventions require or if README/docs linting is included.

Do not fake validation. If validation cannot run, report why.

## 23. Completion Report Requirements

The final Codex report must include:

- Files created/changed;
- Confirmation this is documentation-only;
- Confirmation no source code changed;
- Confirmation no routes changed;
- Confirmation no migrations/RLS/API/server actions changed;
- Confirmation no dashboard/business logic was implemented;
- Summary of entity model;
- Summary of doctor-center relationship model;
- Summary of claim/verification model;
- Summary of public/private field boundary;
- Summary of RLS/security implications;
- Validation results;
- Any blockers or unresolved conflicts.
