# Phase 2.4D — Supabase Center Ownership / Claims Foundation

This file defines the approved Phase 2.4D migration scope.

## Approved files for Phase 2.4D

- `supabase/migrations/0001_extensions.sql`
- `supabase/migrations/0002_enums.sql`
- `supabase/migrations/0003_profiles_auth.sql`
- `supabase/migrations/0004_geo.sql`
- `supabase/migrations/0005_taxonomy.sql`
- `supabase/migrations/0006_centers.sql`
- `supabase/migrations/0007_center_locations.sql`
- `supabase/migrations/0008_center_services.sql`
- `supabase/migrations/0009_center_ownership_claims.sql`

No other SQL migration files are allowed in this phase.

## Phase 2.4D approved scope

- `0009_center_ownership_claims.sql` is approved.
- Center ownership / claims foundation only.
- Canonical new tables in this phase:
  - `public.center_claims`
  - `public.center_memberships`

## Already approved before Phase 2.4D

- Phase 2.1: core extensions and enums
- Phase 2.2A: profiles/auth foundation
- Phase 2.2B: geo hierarchy foundation
- Phase 2.3: taxonomy/services foundation
- Phase 2.3B: `center_type` enum patch only
- Phase 2.4A: centers core foundation
- Phase 2.4B: center locations / geo mapping foundation
- Phase 2.4C: center services mapping foundation

## Explicitly not allowed in Phase 2.4D

- No seed rows yet.
- No seed SQL files in `supabase/seed`.
- No provider tables yet.
- No doctor tables yet.
- No appointment tables yet.
- No pricing/payment tables yet.
- No insurance tables yet.
- No legal/consent tables yet.
- No audit log tables yet.
- No RLS yet.
- No frontend/backend app features yet.

## Strict exclusions

- no provider tables
- no doctor tables
- no appointment tables
- no legal/consent tables
- no behavior events tables
- no sponsored slots tables
- no audit log tables
- no RLS policies
- no seed rows
- no frontend pages
- no admin UI
- no provider dashboard
- no payment code
- no appointment engine
- no AI chat
- no Persian/Hindi routes
- no country expansion beyond Oman
- no unrelated refactor

## Required validation commands

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm db:validate:seeds`
- `pnpm test:db:rls`
- `pnpm test:db:seed`

Phase 2.4D does not require Supabase login, linking to a remote project, or a live Supabase instance.

## Phase 2.5A — Doctors Core Foundation

Approved in this phase:
- `supabase/migrations/0010_doctors.sql`
- Doctors core foundation only (`public.doctors` + doctor enums)

Explicitly not included yet:
- no seed rows yet
- no doctor practice locations yet
- no doctor services mapping yet
- no doctor schedules yet
- no appointment tables yet
- no pricing/payment tables yet
- no insurance tables yet
- no reviews/ratings yet
- no RLS yet
- no frontend/backend app features yet

Strict exclusions:
- no doctor location mapping tables
- no doctor service mapping tables
- no doctor schedule tables
- no appointment tables
- no pricing/payment tables
- no insurance tables
- no reviews/ratings tables
- no legal/consent tables
- no behavior events tables
- no sponsored slots tables
- no audit log tables
- no RLS policies
- no seed rows
- no frontend pages
- no admin UI
- no provider dashboard
- no payment code
- no appointment engine
- no AI chat
- no Persian/Hindi routes
- no country expansion beyond Oman
- no unrelated refactor



## Phase 2.5B — Doctor Practice Locations Foundation

Approved in this phase:
- `supabase/migrations/0011_doctor_practice_locations.sql`
- Doctor practice locations foundation only (`public.doctor_practice_locations`)

Explicitly not included yet:
- no seed rows yet
- no doctor services mapping yet
- no doctor schedules yet
- no appointment tables yet
- no pricing/payment tables yet
- no insurance tables yet
- no reviews/ratings yet
- no RLS yet
- no frontend/backend app features yet

Strict exclusions:
- no doctor service mapping tables
- no doctor schedule tables
- no appointment tables
- no pricing/payment tables
- no insurance tables
- no reviews/ratings tables
- no legal/consent tables
- no behavior events tables
- no sponsored slots tables
- no audit log tables
- no RLS policies
- no seed rows
- no frontend pages
- no admin UI
- no provider dashboard
- no payment code
- no appointment engine
- no AI chat
- no Persian/Hindi routes
- no country expansion beyond Oman
- no unrelated refactor

## Phase 2.5C — Doctor Services Mapping Foundation

Approved in this phase:
- `supabase/migrations/0012_doctor_services.sql`
- Doctor services mapping foundation only (`public.doctor_services`)

Explicitly not included yet:
- no seed rows yet
- no doctor schedules yet
- no appointment tables yet
- no pricing/payment tables yet
- no insurance tables yet
- no reviews/ratings yet
- no RLS yet
- no frontend/backend app features yet

Strict exclusions:
- no doctor schedule tables
- no appointment tables
- no pricing/payment tables
- no insurance tables
- no reviews/ratings tables
- no legal/consent tables
- no behavior events tables
- no sponsored slots tables
- no audit log tables
- no RLS policies
- no seed rows
- no frontend pages
- no admin UI
- no provider dashboard
- no payment code
- no appointment engine
- no AI chat
- no Persian/Hindi routes
- no country expansion beyond Oman
- no unrelated refactor

## Phase 2.5D — Doctor Schedules Foundation

Approved in this phase:
- `supabase/migrations/0013_doctor_schedules.sql`
- Doctor schedules foundation only (`public.doctor_schedules` + `doctor_schedule_day` enum)

Explicitly not included yet:
- no seed rows yet
- no appointment tables yet
- no appointment slots yet
- no bookings yet
- no pricing/payment tables yet
- no insurance tables yet
- no reviews/ratings yet
- no RLS yet
- no frontend/backend app features yet

Strict exclusions:
- no appointment tables
- no appointment slots
- no booking tables
- no pricing/payment tables
- no insurance tables
- no reviews/ratings tables
- no legal/consent tables
- no behavior events tables
- no sponsored slots tables
- no audit log tables
- no RLS policies
- no seed rows
- no frontend pages
- no admin UI
- no provider dashboard
- no payment code
- no appointment engine
- no AI chat
- no Persian/Hindi routes
- no country expansion beyond Oman
- no unrelated refactor

## Phase 2.5E — Doctor Schedule Exceptions / Overrides Foundation

Approved in this phase:
- `supabase/migrations/0014_doctor_schedule_exceptions.sql`
- Doctor schedule exceptions / overrides foundation only (`public.doctor_schedule_exceptions` + `doctor_schedule_exception_type` enum)

Explicitly not included yet:
- no seed rows yet
- no appointment tables yet
- no appointment slots yet
- no bookings yet
- no pricing/payment tables yet
- no insurance tables yet
- no reviews/ratings yet
- no RLS yet
- no frontend/backend app features yet

Strict exclusions:
- no appointment tables
- no appointment slots
- no booking tables
- no patient tables
- no pricing/payment tables
- no insurance tables
- no reviews/ratings tables
- no legal/consent tables
- no behavior events tables
- no sponsored slots tables
- no audit log tables
- no RLS policies
- no seed rows
- no frontend pages
- no admin UI
- no provider dashboard
- no payment code
- no appointment engine
- no AI chat
- no Persian/Hindi routes
- no country expansion beyond Oman
- no unrelated refactor

## Phase 2.6A — Appointment Slots Foundation

Approved in this phase:
- `supabase/migrations/0015_appointment_slots.sql`
- Appointment slots foundation only (`public.appointment_slots` + `appointment_slot_status` enum)

Explicitly not included yet:
- no seed rows yet
- no appointments table yet
- no bookings yet
- no patients yet
- no payments/pricing yet
- no insurance tables yet
- no reviews/ratings yet
- no notifications/reminders yet
- no RLS yet
- no frontend/backend app features yet

Strict exclusions:
- no appointment booking tables
- no booking tables
- no patient tables
- no payment tables
- no pricing tables
- no insurance tables
- no reviews/ratings tables
- no notifications/reminders tables
- no legal/consent tables
- no behavior events tables
- no sponsored slots tables
- no audit log tables
- no RLS policies
- no seed rows
- no frontend pages
- no admin UI
- no provider dashboard
- no payment code
- no appointment engine
- no AI chat
- no Persian/Hindi routes
- no country expansion beyond Oman
- no unrelated refactor

## Phase 2.6B — Appointment Booking Core Foundation

Approved in this phase:
- `supabase/migrations/0016_patient_contacts.sql`
- `supabase/migrations/0017_appointments.sql`
- Appointment booking core foundation only.
- Lightweight patient contact foundation only.

Explicitly not included yet:
- no seed rows yet
- no payments/pricing yet
- no insurance tables yet
- no reviews/ratings yet
- no notifications/reminders yet
- no medical records/diagnoses/prescriptions/lab results yet
- no RLS yet
- no frontend/backend app features yet

## Phase 2.6C — Appointment Operations Foundation

Approved in this phase:
- `supabase/migrations/0018_appointment_status_history.sql` approved
- `supabase/migrations/0019_appointment_cancellations.sql` approved
- appointment operations foundation only
- status history and cancellations only

Explicitly not included yet:
- no seed rows yet
- no payments/pricing yet
- no insurance tables yet
- no reviews/ratings yet
- no notifications/reminders yet
- no medical records/diagnoses/prescriptions/lab results yet
- no legal/consent tables yet
- no audit log tables yet
- no RLS yet
- no frontend/backend app features yet

## Phase 2.7A — Reviews and Trust Foundation

Approved in this phase:
- `supabase/migrations/0020_reviews.sql`
- `supabase/migrations/0021_review_reports.sql`
- reviews and trust foundation only

Explicitly not included yet:
- no seed rows yet
- no moderation dashboard yet
- no AI moderation yet
- no public aggregate ratings yet
- no payments/pricing yet
- no insurance tables yet
- no notifications/reminders yet
- no medical records/diagnoses/prescriptions/lab results yet
- no legal/consent tables yet
- no audit log tables yet
- no RLS yet
- no frontend/backend app features yet

## Phase 2.7B — Center Type Expansion + Media Assets Foundation

Approved in this phase:
- `supabase/migrations/0022_center_type_expansion.sql` approved
- `supabase/migrations/0023_media_assets.sql` approved
- `supabase/migrations/0024_entity_media.sql` approved
- center type expansion and media assets foundation only

Explicitly not included yet:
- no seed rows yet
- no upload API yet
- no Supabase Storage bucket creation yet
- no image processing jobs yet
- no moderation dashboard yet
- no AI moderation yet
- no payments/pricing yet
- no insurance tables yet
- no notifications/reminders yet
- no medical records/diagnoses/prescriptions/lab results yet
- no legal/consent tables yet
- no audit log tables yet
- no RLS yet
- no frontend/backend app features yet


## Phase 2.8A — Monetization Foundation (Schema Only)

Approved in this phase:
- `supabase/migrations/0025_subscription_plans.sql`
- `supabase/migrations/0026_center_subscriptions.sql`
- `supabase/migrations/0027_sponsored_campaigns.sql`
- Monetization foundation only (subscription and sponsored campaign schema only).

Explicitly not included yet:
- no seed rows yet
- no payments yet
- no invoices yet
- no checkout/payment gateway yet
- no impression/click tracking yet
- no behavior events yet
- no notifications/reminders yet
- no insurance tables yet
- no medical records/diagnoses/prescriptions/lab results yet
- no legal/consent tables yet
- no audit log tables yet
- no RLS yet
- no frontend/backend app features yet

## Phase 2.9A — Legal / Consent / Audit Foundation

Approved in this phase:
- `supabase/migrations/0028_legal_documents.sql`
- `supabase/migrations/0029_consent_logs.sql`
- `supabase/migrations/0030_audit_logs.sql`
- legal, consent, and audit foundation only

Explicitly not included yet:
- no seed rows yet
- no legal editor UI yet
- no cookie banner UI yet
- no automatic audit triggers yet
- no RLS yet
- no frontend/backend app features yet
- no payments/invoices/checkout yet
- no notifications/reminders yet
- no insurance tables yet
- no medical records/diagnoses/prescriptions/lab results yet
- no behavior events yet

## Phase 2.9B — Migration Validator Hardening Only

Approved in this phase:
- `scripts/db/validate-migrations.mjs` hardening/refactor only
- migration validator structure hardening only
- no schema changes
- no new migrations

Explicitly not included in this phase:
- no seed rows
- no RLS yet
- no frontend/backend app features
- no payment/invoice/checkout
- no notifications/reminders
- no medical records
- no behavior events


## Phase 3.0A — RLS Auth Helpers and Public Catalog Read Policies

Approved in this phase:
- `supabase/migrations/0031_rls_auth_helpers.sql` approved
- `supabase/migrations/0032_rls_public_catalog_read_policies.sql` approved
- RLS auth helpers and public catalog read policies only

Explicitly not included yet:
- no private table RLS yet
- no appointment RLS yet
- no patient data RLS yet
- no provider write policies yet
- no admin write policies yet
- no seed rows
- no frontend/backend app features
- no payments/invoices/checkout
- no notifications/reminders
- no medical records
- no behavior events

## Phase 3.1A — Profiles RLS Foundation

Approved in this phase:
- `supabase/migrations/0033_profiles_rls.sql`
- Profiles RLS foundation only.
- Authenticated users can `SELECT` only their own non-deleted profile.
- Platform admins can `SELECT` all non-deleted profiles.

Explicitly not included yet:
- no anon profile access
- no profile `INSERT`/`UPDATE`/`DELETE` policies yet
- no auth triggers
- no profile creation flow
- no frontend/backend app features
- no seed rows
- no private appointment/patient/provider/admin RLS beyond profiles yet

## Phase 3.1B — Center Access Helpers + Center Membership/Claims SELECT-Only RLS

Approved in this phase:
- `supabase/migrations/0034_center_access_helpers.sql`
- `supabase/migrations/0035_center_claims_memberships_rls.sql`

Phase 3.1B scope:
- center access helper functions only
- `public.center_memberships` and `public.center_claims` SELECT-only RLS
- authenticated users can SELECT own memberships/claims
- platform admins can SELECT all non-deleted memberships/claims
- active center managers can SELECT memberships/claims for their centers
- no anon access
- no INSERT/UPDATE/DELETE policies yet
- no claim submission flow
- no membership invitation flow
- no admin approval workflow
- no frontend/backend app features
- no seed rows
- no private appointment/patient RLS yet


## Phase 3.2A — Patient Identity Link Foundation

Approved in this phase:
- `supabase/migrations/0036_patient_contacts_profile_link.sql`
- patient identity linkage foundation only
- `public.patient_contacts.profile_id` nullable foreign key to `public.profiles(id)`

Explicitly not included yet:
- no backfill
- no auto-linking by phone/email
- no patient RLS yet
- no appointment RLS yet
- no frontend/backend app features
- no profile creation flow
- no seed rows

## Phase 3.2B — Patient/Appointments Private Read RLS (SELECT-only)

Approved in this phase:
- `supabase/migrations/0037_patient_appointment_access_helpers.sql`
- `supabase/migrations/0038_patient_contacts_appointments_rls.sql`

Phase scope:
- patient/appointment private SELECT RLS only
- authenticated patients can SELECT their own linked `patient_contacts` and `appointments`
- platform admins can SELECT all non-deleted `patient_contacts` and `appointments`
- center members with private-data access can SELECT appointments and linked contacts for their centers
- `appointment_status_history` and `appointment_cancellations` are SELECT-only through `public.can_view_appointment(...)`
- no anon access
- no INSERT/UPDATE/DELETE policies yet
- no appointment creation/cancellation/confirmation/reschedule flow
- no frontend/backend app features
- no seed rows

## Phase 3.3A — Reviews / Reports / Media Private Read RLS

Approved in this phase:
- `supabase/migrations/0039_review_media_access_helpers.sql`
- `supabase/migrations/0040_reviews_reports_media_private_rls.sql`

Scope in this phase:
- reviews/reports/media private SELECT RLS only
- authenticated users can SELECT own/non-public reviews only through appointment/contact ownership or center private access
- platform admins can SELECT all non-deleted review/report/media rows
- center members with private-data access can SELECT related review/media/report context
- public approved reviews/media remain governed by existing public policies
- no anon access in new private policies
- no INSERT/UPDATE/DELETE policies yet
- no review submission/moderation flow
- no media upload/storage/image processing flow
- no frontend/backend app features
- no seed rows

## Phase 3.4A — Monetization/Sponsored Private Read + Public Active Placement RLS (SELECT-only)

Approved in this phase:
- `supabase/migrations/0041_monetization_access_helpers.sql`
- `supabase/migrations/0042_monetization_sponsored_rls.sql`

Phase 3.4A approved scope:
- Monetization/sponsored access helpers for private read visibility only.
- SELECT-only RLS policies for:
  - `public.subscription_plans`
  - `public.center_subscriptions`
  - `public.sponsored_campaigns`
  - `public.sponsored_placements`
- Active `subscription_plans` can be public-read (`anon`, `authenticated`) when non-deleted.
- `center_subscriptions` are private to platform admins and center managers.
- `sponsored_campaigns` are private to platform admins, creators, and center managers.
- Active `sponsored_placements` can be public-read only when both placement and linked campaign are active and non-deleted within time windows.

Explicitly not included yet:
- no INSERT/UPDATE/DELETE policies yet
- no payments/invoices/checkout/transactions
- no behavior events or ad click/impression tracking
- no frontend/backend app features
- no seed rows

## Phase 3.5A — Legal/Consent/Audit Read Access + SELECT RLS

Approved in this phase:
- `supabase/migrations/0043_legal_consent_audit_access_helpers.sql`
- `supabase/migrations/0044_legal_consent_audit_rls.sql`

Scope in this phase:
- legal/consent/audit SELECT RLS only
- active legal documents can be public-read when non-deleted and time-valid
- consent logs are private to platform admins and linked profile/patient contact owners
- audit logs direct table read is platform-admin-only
- no anonymous_id direct consent lookup yet
- no INSERT/UPDATE/DELETE policies yet
- no legal publishing flow
- no consent capture flow
- no audit triggers or audit writing functions
- no frontend/backend app features
- no seed rows

## Phase 3.6A — Static DB Test Harness Hardening

Approved in this phase:
- `scripts/db/test-rls-static.mjs`
- `scripts/db/test-seed-static.mjs`
- `package.json` script updates for `test:db:rls` and `test:db:seed`

Phase 3.6A scope:
- static DB test harness hardening only
- no migrations
- no schema changes
- no seed rows
- no frontend/backend app features
- `test:db:rls` is no longer a Phase 2 placeholder
- `test:db:seed` is no longer a Phase 2 placeholder
- static tests do not replace future live Supabase RLS integration tests
- live DB RLS tests should be added later in a dedicated phase
