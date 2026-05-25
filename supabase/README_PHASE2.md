# Phase 2.2B — Supabase Geo Hierarchy Foundation

This file defines the approved Phase 2.2B migration scope.

## Approved files for Phase 2.2B
- `supabase/migrations/0001_extensions.sql`
- `supabase/migrations/0002_enums.sql`
- `supabase/migrations/0003_profiles_auth.sql`
- `supabase/migrations/0004_geo.sql`

No other SQL migration files are allowed in this phase.

## Allowed in Phase 2.2B
- Geo hierarchy foundation only.
- Canonical geo hierarchy tables only:
  - `public.geo_countries`
  - `public.geo_regions`
  - `public.geo_cities`
  - `public.geo_areas`
- Essential geo hierarchy foreign keys and indexes only.
- Idempotent `updated_at` triggers for geo tables using existing `public.set_updated_at()`.

## Explicitly not allowed in Phase 2.2B
- No seed rows yet.
- No PostGIS yet.
- No geometry/geography columns.
- No provider/center/doctor tables yet.
- No services/taxonomy tables.
- No legal/consent tables.
- No behavior events tables.
- No sponsored slots tables.
- No audit log tables.
- No RLS yet.
- No `CREATE POLICY`.
- No `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- No `INSERT` statements.
- No `DROP` statements.

## Strict exclusions
- no center/provider tables
- no doctor tables
- no services/taxonomy tables
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

## Commands
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm routes:check`
- `pnpm env:check`
- `pnpm db:validate:migrations`
- `pnpm db:validate:seeds`
- `pnpm test:db:rls`
- `pnpm test:db:seed`

Phase 2.2B does not require Supabase login, linking to a remote project, or a live Supabase instance.
