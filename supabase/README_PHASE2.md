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

