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
