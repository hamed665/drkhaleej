# Phase 2.4C — Supabase Center Services Mapping Foundation

This file defines the approved Phase 2.4C migration scope.

## Approved files for Phase 2.4C

- `supabase/migrations/0001_extensions.sql`
- `supabase/migrations/0002_enums.sql`
- `supabase/migrations/0003_profiles_auth.sql`
- `supabase/migrations/0004_geo.sql`
- `supabase/migrations/0005_taxonomy.sql`
- `supabase/migrations/0006_centers.sql`
- `supabase/migrations/0007_center_locations.sql`
- `supabase/migrations/0008_center_services.sql`

No other SQL migration files are allowed in this phase.

## Phase 2.4C approved scope

- `0008_center_services.sql` is approved.
- Center services mapping foundation only.
- Canonical new table in this phase:
  - `public.center_services`

## Already approved before Phase 2.4C

- Phase 2.1: core extensions and enums
- Phase 2.2A: profiles/auth foundation
- Phase 2.2B: geo hierarchy foundation
- Phase 2.3: taxonomy/services foundation
- Phase 2.3B: `center_type` enum patch only
- Phase 2.4A: centers core foundation
- Phase 2.4B: center locations / geo mapping foundation

## Explicitly not allowed in Phase 2.4C

- No seed rows yet.
- No seed SQL files in `supabase/seed`.
- No provider ownership yet.
- No doctor tables yet.
- No appointment tables yet.
- No pricing/payment tables yet.
- No insurance tables yet.
- No RLS yet.
- No PostGIS yet.
- No search ranking/indexing yet.
- No frontend/backend app features yet.

## Strict exclusions

- no provider ownership tables
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

Phase 2.4C does not require Supabase login, linking to a remote project, or a live Supabase instance.
