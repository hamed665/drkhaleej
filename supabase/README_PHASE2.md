# Phase 2.3B — Supabase center_type Enum Patch (Pre-Centers)

This file defines the approved **Phase 2.3B** migration scope.

## Approved files for Phase 2.3B
- `supabase/migrations/0001_extensions.sql`
- `supabase/migrations/0002_enums.sql`
- `supabase/migrations/0003_profiles_auth.sql`
- `supabase/migrations/0004_geo.sql`
- `supabase/migrations/0005_taxonomy.sql`

No other SQL migration files are allowed in this phase.

## Phase 2.3B intent
- Add **only** the canonical `center_type` enum patch in `0002_enums.sql`.
- Keep the project in **pre-centers** state.

## Explicitly not allowed in Phase 2.3B
- No `0006_centers.sql`.
- No centers table yet.
- No `center_locations` table.
- No `center_services` table.
- No provider tables.
- No doctor tables.
- No appointment tables.
- No seed rows yet.
- No RLS yet.
- No `CREATE POLICY`.
- No `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- No `INSERT` statements.
- No `DROP` statements.
- No PostGIS.
- No geometry/geography columns.
- No frontend/backend app features yet.

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

Phase 2.3B does not require Supabase login, linking to a remote project, or a live Supabase instance.
