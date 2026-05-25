# Phase 2.4B — Supabase Center Locations / Geo Mapping Foundation

This file defines the approved Phase 2.4B migration scope.

## Approved files for Phase 2.4B

- `supabase/migrations/0001_extensions.sql`
- `supabase/migrations/0002_enums.sql`
- `supabase/migrations/0003_profiles_auth.sql`
- `supabase/migrations/0004_geo.sql`
- `supabase/migrations/0005_taxonomy.sql`
- `supabase/migrations/0006_centers.sql`
- `supabase/migrations/0007_center_locations.sql`

No other SQL migration files are allowed in this phase.

## Phase 2.4B approved scope

- `0007_center_locations.sql` is approved.
- Center locations / geo mapping foundation only.
- Canonical new table in this phase:
  - `public.center_locations`

## Already approved before Phase 2.4B

- Phase 2.1: core extensions and enums
- Phase 2.2A: profiles/auth foundation
- Phase 2.2B: geo hierarchy foundation
- Phase 2.3: taxonomy/services foundation
- Phase 2.3B: `center_type` enum patch only
- Phase 2.4A: centers core foundation

## Explicitly not allowed in Phase 2.4B

- No seed rows yet.
- No seed SQL files in `supabase/seed`.
- No center services mapping yet.
- No provider ownership yet.
- No doctor tables yet.
- No RLS yet.
- No PostGIS yet.
- No geometry/geography columns.
- No search ranking/indexing yet.
- No frontend/backend app features yet.

## Strict exclusions

- no service mapping tables
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

Phase 2.4B does not require Supabase login, linking to a remote project, or a live Supabase instance.
