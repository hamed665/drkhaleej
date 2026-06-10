# DrMuscat Roles and Permissions Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: Future authorization design only.
- This document does not authorize implementation.
- This document must be read together with:
  - `docs/platform/DRMUSCAT_PLATFORM_ARCHITECTURE_V1.md`
  - `docs/platform/DRMUSCAT_PLATFORM_EXECUTION_ROADMAP_V1.md`
- This document does not replace the V10.4 master spec or any stricter guardrails.
- Future implementation requires separate `PHASED_BUILD_ONLY` approval.
- No code, route, migration, RLS, API, dashboard, billing, ads, offers, CMS, AI, analytics, sales CRM, review, seed, provider mutation, or auth behavior is approved by this document.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-ROLES-PERMISSIONS-SPEC-V1`.

## 1. Purpose

This document defines the canonical future authorization model for DrMuscat before any future roles, permissions, migrations, dashboards, APIs, server actions, or RLS policies are implemented. It translates the already-merged Platform Architecture V1 and Platform Execution Roadmap V1 into a detailed documentation-only authorization specification.

This document defines:

- canonical future role names;
- role boundaries;
- ownership scopes;
- resource/action permission model;
- admin vs `super_admin` boundary;
- provider, center, doctor, and staff boundaries;
- sales/marketer boundaries;
- finance boundaries;
- content/editorial/medical review boundaries;
- audit requirements;
- RLS implications;
- future permission helper concepts;
- stop rules before implementation.

This is not an implementation document. It does not create roles, permissions, tables, enums, policies, helpers, dashboards, APIs, server actions, auth flows, or data in the database.

## 2. Authorization Principles

1. Deny by default.
2. Server-side authorization is required.
3. RLS is required for private data.
4. Client-side checks are UX only and never security.
5. Public users can only access approved public projections/content.
6. Anonymous users must not mutate private data.
7. Providers can only act within owned/linked organization scope.
8. Doctors own identity continuity, centers own relationship context.
9. Admin handles daily operations.
10. Super Admin controls dangerous/global settings.
11. Sales users are scoped to assigned prospects unless sales manager.
12. Finance changes must be audited.
13. Content publishing must follow review workflow.
14. Medical-sensitive content requires medical reviewer/human approval.
15. Entitlements and paid features cannot be self-activated by providers.
16. Every sensitive mutation must be auditable.
17. Future implementation must fail closed.

## 3. Canonical Role Catalog

Future implementation must use `center_owner`, not `clinic_owner`, and must use `center_*` role naming consistently for organization staff roles. Existing legacy role names, if present, must be reconciled in a future implementation task and must not be guessed or silently mapped here.

| Role | Role type | User class | Primary scope | Can access | Must not access | MVP status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `public_visitor` | Public discovery | Anonymous or unauthenticated public user | `public` | Approved public provider, doctor, category, area, offer, CMS, legal, and CTA surfaces | Private raw tables, dashboards, billing, CRM notes, documents, unpublished drafts, admin comments, audit logs | MVP | Public browsing only; no private mutation. |
| `patient_user` | Public account | Authenticated patient/public user | `own_user` | Own saved items and preferences later, plus approved public content | Provider private data, admin data, medical records unless separately approved, diagnosis/prescription/lab-result data | Later | Does not imply medical-record access. |
| `doctor` | Professional identity owner | Authenticated doctor | `own_doctor_profile`; `doctor_center_relationship` | Own profile draft, allowed doctor fields, linked center relationships | Center billing, verification, ads, sponsored fields, unrelated doctors, admin notes | Later | Doctor identity continuity remains independent from center relationships. |
| `center_owner` | Provider organization owner | Authenticated provider owner | `own_center` | Own center profile, branches, staff, service/media drafts, claim context, entitlement status view where approved | Self-verification, self-activation of paid plan, sponsored/featured self-assignment, own offer/ad approval | Later | Organization owner, not global operator. |
| `center_manager` | Delegated center operator | Authenticated center staff | `assigned_center`; `center_staff_scope` | Assigned center drafts, services, doctor relationship drafts, leads where delegated | Ownership transfer, verification, payment changes, global settings | Later | Delegated management only. |
| `center_receptionist` | Front-desk staff | Authenticated center staff | `assigned_center`; `center_staff_scope` | Assigned center leads/contact follow-up where approved | Profile identity, verification, billing, ads, offers unless future policy allows | Later | Operational lead/contact scope only. |
| `center_marketing_staff` | Center marketing contributor | Authenticated center staff | `assigned_center`; `center_staff_scope` | Draft media, offer requests, ad requests, campaign drafts | Publish or activate ads/offers, payment approval, verification | Later | Draft/request role only. |
| `center_billing_viewer` | Finance visibility delegate | Authenticated center staff | `assigned_center`; `center_staff_scope` | Invoices, plan/payment status where approved | Approve payments, change plan, activate entitlement | Later | Read-only billing visibility unless future policy expands. |
| `center_content_editor` | Center content contributor | Authenticated center staff | `assigned_center`; `center_staff_scope` | Profile/content drafts for assigned center | Direct publish, verification, billing, sponsored placement | Later | Draft-only provider content scope. |
| `sales_agent` | Sales contributor | Internal sales user | `assigned_sales_prospect` | Assigned prospects, activities, follow-ups, notes, stage updates | Other agents' prospects, provider verification, payment approval, commission approval, plan activation | Later | May be called marketer in legacy prose, but canonical role key is `sales_agent`. |
| `sales_manager` | Sales team manager | Internal sales manager | `sales_team` | Team prospects, assignment queues, performance summaries | Global settings, provider verification, finance approval by default, entitlement activation | Later | Sales scope only; finance approval requires separate policy. |
| `content_editor` | Editorial contributor | Internal content user | `assigned_content` | Assigned CMS/content drafts, articles, FAQs, SEO metadata drafts | High-risk medical publish alone, global SEO/canonical settings unless approved, finance/CRM private data | Later | Draft/edit role with review workflow. |
| `medical_reviewer` | Medical safety reviewer | Internal or approved reviewer | `medical_review_queue` | Medical-sensitive content queue, source notes, safety checklist | Billing, CRM, global settings, provider entitlement controls | Later | Review power does not grant admin/finance power. |
| `finance_manager` | Finance operator | Internal finance user | `finance_scope` | Finance records, invoices, manual payments, receipts, adjustments where approved | Global settings, provider medical/content verification unless separately approved, secrets/card storage | Later | All finance changes audited. |
| `admin` | Operational admin | Internal platform operator | `admin_operational` | Operational queues, onboarding leads, claims, verification, offers/ads review, support, internal notes | Dangerous global settings, roles/permission definitions, secrets, audit override, unapproved billing bypass | MVP | Daily operations only. |
| `super_admin` | Global/dangerous controller | Restricted platform owner/operator | `global_super_admin` | Roles, permissions, global settings, feature flags, plan builder/pricing later, danger zone, audit logs | Secrets outside approved secret management, unlogged sensitive changes, unsupported medical/advertising claims | MVP | Not merely admin plus UI; global actions require audit. |

## 4. Role Hierarchy and Non-Hierarchy

- `super_admin` is not just “admin plus UI”; it controls dangerous/global settings, role and permission definitions, feature flags, global SEO/system settings, plan/pricing builder later, emergency overrides, and danger-zone actions.
- `admin` is operational, not global. Admins handle daily queues and approved operational reviews but do not automatically control platform-wide configuration.
- `finance_manager` is not `super_admin`. Finance scope does not grant role management, feature flags, global SEO, danger-zone access, or provider verification authority.
- `content_editor` cannot publish high-risk medical content alone.
- `medical_reviewer` does not get billing/admin power.
- `sales_manager` manages sales scope, not provider verification or finance.
- `center_owner` owns organization access but cannot self-verify, self-activate payment, or self-assign sponsored/featured status.
- `doctor` owns professional identity continuity but not center-owned relationship data.
- `patient_user` is later and must not imply medical record access.

## 5. Ownership Scopes

| Scope | Meaning | Example resources | Who can hold this scope | Must not include |
| --- | --- | --- | --- | --- |
| `public` | Approved public/indexable access only | Published provider page, published doctor page, category page, area page, public offer page, legal content | `public_visitor`, `patient_user`, any authenticated user | Private raw tables, unpublished drafts, admin notes, audit logs, private documents |
| `own_user` | A user's own account-level data | Preferences, saved providers later, notification settings later | `patient_user`, authenticated roles for their own account settings | Provider private records, medical records unless separately approved, admin data |
| `own_doctor_profile` | Doctor identity owned or claimed by the doctor | Doctor profile draft, credentials fields where allowed, biography, languages, specialties | `doctor` | Center billing, center verification, sponsored status, unrelated doctors |
| `own_center` | Organization owned by the center owner | Center profile, branches, services, media drafts, staff membership, entitlement status view | `center_owner` | Self-verification, entitlement activation, public ranking controls, admin audit logs |
| `assigned_center` | Organization assigned to delegated staff | Assigned center leads, drafts, contact follow-up, services, relationship drafts | `center_manager`, `center_receptionist`, `center_marketing_staff`, `center_billing_viewer`, `center_content_editor` | Ownership transfer, self-verification, plan activation, unrelated centers |
| `center_staff_scope` | Fine-grained staff permission within a center | Role-specific staff permissions, lead follow-up, draft sections, billing read-only view | Center staff roles | Any permission not delegated; global provider data; admin-only queues |
| `doctor_center_relationship` | Relationship context between a doctor and center | Branch schedules, service association, relationship status, public visibility context | `doctor`, `center_owner`, `center_manager`, `admin` where approved | Doctor identity takeover, center billing takeover, deleting canonical doctor identity |
| `assigned_sales_prospect` | Prospect assigned to an individual sales user | Prospect, activities, notes, follow-up tasks, stage | `sales_agent` | Other agents' prospects, provider verification, payment approval, commission approval |
| `sales_team` | Sales records assigned to a manager's team | Team prospects, assignment queue, performance summaries | `sales_manager` | Finance approval by default, entitlement activation, public ranking changes |
| `assigned_content` | Content explicitly assigned for drafting/editing | CMS draft, article draft, FAQ draft, SEO metadata draft | `content_editor` | High-risk medical publishing alone, global SEO/canonical settings unless approved |
| `medical_review_queue` | Medical-sensitive content awaiting human review | Medical claim review queue, safety notes, reviewer checklist | `medical_reviewer` | Billing, sales CRM, global settings, unrelated admin operations |
| `finance_scope` | Approved finance operations | Invoices, manual payments, receipts, adjustments, entitlements where approved | `finance_manager` | Global settings, secrets/card storage, unaudited changes, provider verification unless separately approved |
| `admin_operational` | Daily platform operation scope | Onboarding leads, claims, verification queue, offer/ad review, data quality, support, internal notes | `admin` | Role/permission definitions, feature flags, danger zone, secrets, audit override |
| `global_super_admin` | Restricted global/dangerous platform control | Roles, permissions, settings, feature flags, plan builder/pricing later, danger zone, audit logs | `super_admin` | Unlogged changes, secrets outside approved handling, unsupported medical/legal/advertising overrides |

## 6. Resource Families

### Public discovery

- public provider profile;
- public doctor profile;
- public category page;
- public area page;
- public offer page;
- public CMS/legal content.

### Provider/doctor

- organization;
- organization profile draft;
- organization published profile;
- organization branch;
- organization service;
- organization media;
- organization documents;
- organization verification;
- organization members;
- doctor identity/profile;
- doctor-center relationship;
- provider leads;
- provider analytics.

### Admin operations

- onboarding leads;
- claim requests;
- verification queue;
- data quality queue;
- support requests;
- internal notes;
- audit logs.

### Sales

- prospects;
- activities;
- follow-ups;
- conversion attribution;
- commission tracking later.

### Finance

- plans;
- entitlements;
- invoices;
- manual payments;
- receipts;
- adjustments.

### Monetization

- offers;
- ads;
- sponsored placements;
- featured placement requests;
- campaign requests.

### CMS/content

- homepage CMS;
- category/area intro;
- article draft;
- FAQ;
- legal snippets;
- SEO metadata;
- AI draft/brief.

### System

- roles;
- permissions;
- settings;
- feature flags;
- global SEO settings;
- AI policy settings;
- danger zone.

## 7. Action Vocabulary

Future implementation should avoid ad-hoc action names. Permission decisions should use a controlled action vocabulary and must be reconciled with the approved schema and policy design before implementation.

### Read actions

- `view_public`
- `view_private`
- `list`
- `export` later

### Write actions

- `create`
- `edit_draft`
- `submit_for_review`
- `update_status`
- `approve`
- `reject`
- `publish`
- `archive`
- `delete_soft`
- `restore`
- `assign`
- `transfer`
- `comment_internal`
- `upload`
- `verify`
- `activate`
- `deactivate`

### Finance actions

- `issue_invoice`
- `record_payment`
- `approve_payment`
- `reject_payment`
- `activate_entitlement`
- `adjust_balance`

### Ads/offers actions

- `request_offer`
- `review_offer`
- `activate_offer`
- `request_ad`
- `review_ad`
- `schedule_ad`
- `pause_ad`

### System actions

- `manage_role`
- `manage_permission`
- `manage_global_setting`
- `manage_feature_flag`
- `view_audit_log`

## 8. Permission Matrix V1

This matrix is documentation-only and establishes intended future boundaries. It does not grant any permission or implement any policy.

| Resource family | Action | Allowed roles | Scope | Approval requirement | Audit requirement | MVP status |
| --- | --- | --- | --- | --- | --- | --- |
| Public provider profile | `view_public` | `public_visitor`, `patient_user`, authenticated roles | `public` | Must be approved public projection/content | No for normal page view | MVP |
| Public doctor profile | `view_public` | `public_visitor`, `patient_user`, authenticated roles | `public` | Must be approved public projection/content | No for normal page view | MVP |
| Public CTAs | Use WhatsApp/call/directions CTA | `public_visitor`, `patient_user`, authenticated roles | `public` | CTA content must be approved public data | Event analytics later only if approved | MVP |
| Claim/list interest form | `create` | `public_visitor`, `patient_user` later | `public` with safe form constraints | Future approved form/rate-limit/validation policy required | Yes for submitted lead/claim interest | Later |
| Patient saved provider | `create`; `delete_soft` | `patient_user` | `own_user` | Future patient account approval required | Yes if sensitive account event policy requires | Later |
| Patient preferences | `view_private`; `edit_draft` | `patient_user` | `own_user` | Future patient account approval required | Yes for privacy-sensitive changes | Later |
| Doctor profile draft | `view_private` | `doctor` | `own_doctor_profile` | Doctor identity ownership/claim must be approved | Yes for access to sensitive draft if required | Later |
| Doctor allowed fields | `edit_draft` | `doctor` | `own_doctor_profile` | Sensitive fields require admin/medical/verification review | Yes for sensitive field changes | Later |
| Doctor profile changes | `submit_for_review` | `doctor` | `own_doctor_profile` | Admin/medical review where required | Yes | Later |
| Doctor-center relationships | `view_private`; `list` | `doctor` | `doctor_center_relationship` | Relationship ownership/link must be approved | Yes for private relationship access where required | Later |
| Center-owned billing/verification/sponsored fields | Not allowed | `doctor` | None | Not permitted | Attempted unauthorized access should fail closed | Later |
| Own center profile | `view_private` | `center_owner` | `own_center` | Ownership/membership must be approved | Yes for private profile access where required | Later |
| Own center profile draft | `edit_draft` | `center_owner` | `own_center` | Sensitive fields require admin review | Yes for sensitive edits | Later |
| Center staff membership | `assign`; `update_status` | `center_owner` | `own_center` | Future staff-management policy required | Yes | Later |
| Own profile changes | `submit_for_review` | `center_owner` | `own_center` | Admin review for sensitive fields | Yes | Later |
| Center offer request | `request_offer` | `center_owner`, `center_marketing_staff` where delegated | `own_center` or `assigned_center` | Admin/content/medical review as applicable | Yes | Later |
| Center ad request | `request_ad` | `center_owner`, `center_marketing_staff` where delegated | `own_center` or `assigned_center` | Admin/ad review required | Yes | Later |
| Own leads/analytics | `view_private`; `list` | `center_owner` | `own_center` | Entitlement and privacy policy required | Yes for exports/status changes; no for ordinary view unless policy requires | Later |
| Provider verification | Not allowed | `center_owner` | None | Cannot self-verify | Unauthorized attempt should fail closed and be logged if security policy requires | Later |
| Paid plan activation | Not allowed | `center_owner` | None | Cannot self-activate paid plan | Unauthorized attempt should fail closed and be logged if security policy requires | Later |
| Sponsored/featured placement | Not allowed | `center_owner` | None | Cannot self-assign sponsored/featured placement | Unauthorized attempt should fail closed and be logged if security policy requires | Later |
| Own offer/ad approval | Not allowed | `center_owner`, `center_marketing_staff` | None | Cannot approve own offer/ad | Unauthorized attempt should fail closed | Later |
| Profile/service/doctor relationship drafts | `edit_draft`; `submit_for_review` | `center_manager` | `assigned_center`; `center_staff_scope` | Delegation and review policy required | Yes for relationship and sensitive changes | Later |
| Assigned center leads | `view_private`; `list`; `update_status` | `center_manager`, `center_receptionist` | `assigned_center`; `center_staff_scope` | Delegation/entitlement policy required | Yes for status/follow-up changes | Later |
| Billing management | Not allowed by default | `center_manager` | None unless explicitly delegated later | Explicit future billing delegation required | Yes if ever delegated | Later |
| Ownership/verification/payment changes | Not allowed | `center_manager` | None | Not permitted | Unauthorized attempt should fail closed | Later |
| Lead/contact follow-up | `view_private`; `update_status`; `comment_internal` | `center_receptionist` | `assigned_center`; `center_staff_scope` | Delegation policy required | Yes for follow-up/status notes | Later |
| Profile identity/verification/billing/ads/offers | Not allowed by default | `center_receptionist` | None unless future policy allows | Explicit future policy required | Yes if ever delegated | Later |
| Media/offers/ad drafts | `edit_draft`; `request_offer`; `request_ad`; `upload` | `center_marketing_staff` | `assigned_center`; `center_staff_scope` | Owner/admin review required | Yes for uploads and requests | Later |
| Publish or activate ads/offers | Not allowed | `center_marketing_staff` | None | Admin/ad review required | Unauthorized attempt should fail closed | Later |
| Invoices/plan/payment status | `view_private`; `list` | `center_billing_viewer` | `assigned_center`; `center_staff_scope` | Delegated billing-view policy required | Yes for exports; view audit if policy requires | Later |
| Payment approval/plan change | Not allowed | `center_billing_viewer` | None | Not permitted | Unauthorized attempt should fail closed | Later |
| Profile/content draft | `edit_draft`; `submit_for_review` | `center_content_editor` | `assigned_center`; `center_staff_scope` | Review required before publish | Yes for submitted changes | Later |
| Direct publish | Not allowed | `center_content_editor` | None | Not permitted | Unauthorized attempt should fail closed | Later |
| Assigned prospect | `create`; `edit_draft`; `update_status` | `sales_agent` | `assigned_sales_prospect` | Assignment policy required | Yes | Later |
| Prospect notes/follow-up | `comment_internal`; `update_status` | `sales_agent` | `assigned_sales_prospect` | Assignment policy required | Yes | Later |
| Prospect stage | `update_status` | `sales_agent` | `assigned_sales_prospect` | Manager/admin review for conversion/commission where applicable | Yes | Later |
| Verification/payment/commission approval | Not allowed | `sales_agent` | None | Not permitted | Unauthorized attempt should fail closed | Later |
| Team prospects | `view_private`; `list` | `sales_manager` | `sales_team` | Team management policy required | Yes for sensitive access if required | Later |
| Prospect assignment | `assign` | `sales_manager` | `sales_team` | Sales policy required | Yes | Later |
| Sales performance | `list`; `view_private` | `sales_manager` | `sales_team` | Sales policy required | Yes for exports | Later |
| Commission approval | Conditional future action | `sales_manager` only if finance policy allows | `sales_team` plus finance approval rules | Future finance policy required; default is not allowed | Yes, mandatory | Future-only |
| Provider plan/payment activation | Not allowed by default | `sales_manager` | None | Finance/admin policy required; default not allowed | Unauthorized attempt should fail closed | Later |
| CMS/article draft | `create`; `edit_draft`; `submit_for_review` | `content_editor` | `assigned_content` | Content workflow approval required | Yes for submit/status changes | Later |
| Assigned content edit | `edit_draft` | `content_editor` | `assigned_content` | Content workflow approval required | Revision history required | Later |
| High-risk medical content publish | Not allowed alone | `content_editor` | None | Medical reviewer/human approval required | Unauthorized attempt should fail closed | Later |
| Canonical/global SEO changes | Not allowed by default | `content_editor` | None unless admin/super_admin policy allows | Admin/super_admin SEO policy required | Yes | Later |
| Medical review queue | `view_private`; `list` | `medical_reviewer` | `medical_review_queue` | Medical reviewer assignment/role required | Yes for sensitive queue access if policy requires | Later |
| Medical-sensitive content | `approve`; `reject`; `comment_internal` | `medical_reviewer` | `medical_review_queue` | Human medical review required | Yes, mandatory | Later |
| Finance/global settings | Not allowed | `medical_reviewer` | None | Not permitted | Unauthorized attempt should fail closed | Later |
| Finance scope | `view_private`; `list` | `finance_manager` | `finance_scope` | Finance role policy required | Yes for exports/sensitive views | Later |
| Invoices | `issue_invoice` | `finance_manager` | `finance_scope` | Approved manual billing workflow required | Yes, mandatory | Later |
| Manual payments | `record_payment` | `finance_manager` | `finance_scope` | Proof/status/reason policy required | Yes, mandatory | Later |
| Allowed payments | `approve_payment`; `reject_payment` | `finance_manager` | `finance_scope` | Approval policy and separation controls required | Yes, mandatory | Later |
| Global settings/provider medical/content verification | Not allowed unless separately approved | `finance_manager` | None | Separate role/policy required | Unauthorized attempt should fail closed | Later |
| Operational provider/admin queues | `view_private`; `list` | `admin` | `admin_operational` | Admin role policy required | Yes for sensitive queue views/exports as required | MVP |
| Onboarding leads | `view_private`; `list`; `update_status`; `comment_internal` | `admin` | `admin_operational` | Approved admin operations policy required | Yes for status/internal notes | MVP |
| Claim requests | `approve`; `reject`; `comment_internal` | `admin` | `admin_operational` | Claim review policy required | Yes, mandatory | Later |
| Verification queue | `verify`; `approve`; `reject` | `admin` | `admin_operational` | Verification policy required | Yes, mandatory | Later |
| Offers/ads review | `review_offer`; `review_ad`; `approve`; `reject`; `schedule_ad`; `pause_ad` | `admin` | `admin_operational` | Ads/offers policy required | Yes, mandatory | Later |
| Internal notes | `comment_internal` | `admin` | `admin_operational` | Admin operations policy required | Yes | MVP |
| Operational status changes | `update_status`; `archive`; `restore` | `admin` | `admin_operational` | Approved operational workflow required | Yes | MVP |
| Dangerous global settings | Not allowed unless `super_admin` | `admin` | None | Super Admin required | Unauthorized attempt should fail closed | MVP |
| Roles/permissions | `manage_role`; `manage_permission` | `super_admin` | `global_super_admin` | Super Admin-only with reason | Yes, mandatory | MVP |
| Global settings | `manage_global_setting` | `super_admin` | `global_super_admin` | Super Admin-only with reason | Yes, mandatory | MVP |
| Feature flags | `manage_feature_flag` | `super_admin` | `global_super_admin` | Super Admin-only with reason | Yes, mandatory | MVP |
| Plan builder/pricing later | `create`; `edit_draft`; `approve`; `activate`; `deactivate` | `super_admin` | `global_super_admin` | Future plan/pricing policy required | Yes, mandatory | Future-only |
| Danger zone | `manage_global_setting`; `delete_soft`; `restore`; emergency override | `super_admin` | `global_super_admin` | Emergency/dual-control policy should be considered | Yes, mandatory | MVP |
| Audit logs | `view_audit_log` | `super_admin`; selected `admin`/`finance_manager` only if approved | `global_super_admin` or restricted operational/finance scope | Audit visibility policy required | Yes for sensitive audit access | MVP |

## 9. Admin vs Super Admin Boundary

### Admin can

- run daily operations;
- review providers;
- review claims;
- review offers/ads;
- review data quality;
- manage operational content where allowed;
- manage support/internal notes.

### Admin cannot by default

- manage global role definitions;
- manage permission definitions;
- manage feature flags;
- change global SEO/canonical/indexing settings;
- alter plan builder/pricing;
- override audit logs;
- manage danger zone;
- access secrets;
- bypass payment/verification rules.

### Super Admin can

- manage global/dangerous settings;
- manage roles and permissions;
- manage feature flags;
- manage plan/pricing builder later;
- manage global SEO/system settings;
- perform emergency overrides;
- perform all of the above only with audit logging.

## 10. Provider and Doctor Boundary

- Center owns organization profile and relationship context.
- Doctor owns professional identity continuity.
- Doctor-center relationship carries branch, schedule, service, contact, and visibility context.
- A doctor can be linked to multiple centers.
- A center can request doctor relationship changes.
- A doctor can later claim/confirm identity.
- Ending a doctor-center relationship must not delete doctor identity.
- Centers cannot silently take over doctor identity.
- Doctors cannot edit center-owned billing/verification/ads.
- Both doctor and center sensitive changes may require admin review.

## 11. Center Staff Boundary

| Role | Allowed future scope | Forbidden actions | Audit needed |
| --- | --- | --- | --- |
| `center_owner` | Own center profile/draft, staff management later, offer/ad requests, own entitled leads/analytics | Self-verification, self-activation of paid plan, self-assigned sponsored/featured placement, own offer/ad approval, global settings | Yes for staff, sensitive profile, request, entitlement-visible, and status-affecting changes |
| `center_manager` | Assigned center profile/service/doctor relationship drafts, assigned center leads where delegated | Ownership transfer, verification, payment changes, global settings, billing unless explicitly delegated | Yes for relationship, profile, lead status, and internal notes |
| `center_receptionist` | Assigned center leads/contact follow-up | Profile identity edits, verification, billing, ads, offers unless future policy allows | Yes for lead/contact status and notes |
| `center_marketing_staff` | Draft media, offer requests, ad requests, campaign drafts | Publish/activate ads or offers, approve ads/offers, payment approval, verification | Yes for uploads, requests, and campaign-affecting edits |
| `center_billing_viewer` | View invoices, plan status, payment status where delegated | Approve payment, reject payment, change plan, activate/deactivate entitlement | Yes for exports or sensitive finance access; no mutation should be allowed |
| `center_content_editor` | Draft profile/content changes for assigned center | Publish directly, verify, approve, change billing, activate sponsored placement | Yes for submitted drafts and sensitive content changes |

## 12. Sales Boundary

- `sales_agent` owns/edits assigned prospects.
- `sales_manager` manages team scope.
- Sales roles cannot approve payments.
- Sales roles cannot verify providers.
- Sales roles cannot activate paid plans.
- Sales roles cannot alter public ranking.
- Sales conversion attribution must be auditable.
- Commission tracking is future/manual and only after approved payment.

## 13. Finance Boundary

- `finance_manager` can handle allowed manual billing workflows.
- `finance_manager` cannot bypass audit.
- Payment approval must be auditable.
- Entitlement activation follows approved payment.
- Provider cannot self-activate entitlement.
- Sales cannot self-approve commission/payment.
- Gateway/card storage is out of scope.
- Finance actions are sensitive and must have reason/status/history.

## 14. Content and Medical Review Boundary

- `content_editor` drafts content.
- Admin/content lead may review operational content where future policy allows.
- `medical_reviewer` reviews medical-sensitive content.
- High-risk content cannot publish without human medical review.
- AI cannot publish directly.
- `super_admin` controls global AI/content policy.
- Content changes with SEO impact require SEO/canonical/indexing review.
- Article/CMS workflow remains future-only until separate approval.

## 15. Public/Private Boundary

### Public-safe data

- published provider name;
- approved category;
- approved area;
- approved phone/WhatsApp if public;
- approved address/map;
- approved services;
- approved doctors/relationships;
- approved offers;
- verified/claimed/sponsored labels;
- public disclaimers.

### Private data

- license documents;
- internal notes;
- claim documents;
- payment records;
- invoices/receipts;
- sales notes;
- prospect data;
- unpublished drafts;
- admin review comments;
- audit logs;
- private user profile fields;
- any medical records/diagnosis/prescription/lab results, which are not in scope.

Public views/projections must never expose private raw tables.

## 16. Audit Requirements

Audit is required for:

- role changes;
- permission changes;
- provider verification changes;
- claim approval/rejection;
- ownership transfer;
- doctor-center relationship changes;
- profile sensitive field approval;
- payment approval/rejection;
- entitlement activation/deactivation;
- plan changes;
- offer approval/rejection;
- ad approval/rejection;
- sponsored placement activation;
- CMS publish/archive/rollback;
- medical review decisions;
- admin internal status changes;
- sales conversion/commission changes;
- `super_admin` danger-zone actions.

Future audit records should include:

- actor user id;
- actor role;
- action;
- resource type;
- resource id;
- before;
- after;
- reason;
- timestamp;
- request/source metadata where safe.

No audit implementation is included in this PR.

## 17. RLS Implications

Future RLS principles:

- RLS must be enabled on private tables.
- No anon mutation.
- No public SELECT from raw private tables.
- Public data should use safe projections/views or approved public policies.
- Provider access must be scoped by organization membership.
- Doctor access must be scoped by doctor identity ownership.
- Sales access must be scoped by assignment/team.
- Admin access must be scoped by platform admin flags/roles.
- Super Admin access must be explicit and audited.
- Finance/private document access must be tightly scoped.
- Storage buckets must separate public media and private documents.
- Service-role access must not be exposed to client.
- Future policies must fail closed.

No RLS policies are implemented in this PR.

## 18. Future Permission Helper Concepts

The following names are conceptual only and do not authorize implementation. Names must be reconciled with the existing schema, functions, RLS helper conventions, and approved future entity specs before any implementation.

- `is_platform_admin(user_id)`
- `is_super_admin(user_id)`
- `has_role(user_id, role_key)`
- `has_center_role(user_id, organization_id, role_key)`
- `can_manage_center(user_id, organization_id)`
- `can_view_center_leads(user_id, organization_id)`
- `owns_doctor_profile(user_id, doctor_id)`
- `can_review_medical_content(user_id)`
- `can_manage_finance(user_id)`
- `can_manage_sales_team(user_id)`
- `can_view_assigned_prospect(user_id, prospect_id)`

## 19. Role Conflict and Migration Stop Rules

Codex must stop if:

- existing role names conflict with this spec;
- legacy `clinic_owner` appears where `center_owner` is required;
- role enum/table already exists with different values;
- permission model conflicts with existing RLS;
- public/private boundary is unclear;
- ownership relationship is unclear;
- doctor-center relationship model is not approved;
- admin vs `super_admin` boundary is unclear;
- finance permissions are ambiguous;
- sales commission/payment approval is ambiguous;
- content/medical review boundary is ambiguous;
- any implementation would require new migration without approved entity spec;
- any implementation would expose private data;
- any implementation would allow provider self-verification or self-activation of paid plan.

## 20. MVP Permission Priorities

1. Public visitor can browse approved public content.
2. Admin can access protected admin operations.
3. Super admin boundary remains separate.
4. Provider claim/list form remains controlled.
5. Provider self-service mutations wait until ownership model is approved.
6. Sales CRM starts admin-scoped first.
7. Billing is manual and audited.
8. Reviews, insurance, booking, AI content, and provider self-service are later.

## 21. Explicitly Not Implemented

- no database roles created;
- no auth changes;
- no login changes;
- no RLS policies;
- no permission helper functions;
- no middleware changes;
- no dashboards;
- no admin mutations;
- no provider mutations;
- no billing mutations;
- no sales CRM implementation;
- no CMS implementation;
- no AI implementation;
- no analytics implementation;
- no reviews implementation.

## 22. Validation Expectations

For this PR:

- `git status --short`
- `git diff --check`
- `pnpm lint` if repository conventions require or if README/docs linting is included

Do not fake validation. If validation cannot run, report why.

## 23. Completion Report Requirements

The final Codex report must include:

- Files created/changed;
- Confirmation this is documentation-only;
- Confirmation no source code changed;
- Confirmation no routes changed;
- Confirmation no migrations/RLS/API/server actions changed;
- Confirmation no dashboard/business logic was implemented;
- Summary of role catalog;
- Summary of permission matrix;
- Summary of public/private boundary;
- Summary of audit/RLS implications;
- Validation results;
- Any blockers or unresolved conflicts.
