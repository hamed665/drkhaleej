# Phase 2.2A — Supabase Profiles/Auth Foundation (Profiles Table Only)

This file defines the approved Phase 2.2A migration scope.

## Approved files for Phase 2.2A
- `supabase/migrations/0001_extensions.sql`
- `supabase/migrations/0002_enums.sql`
- `supabase/migrations/0003_profiles_auth.sql`

No other SQL migration files are allowed in this phase.

## Allowed in Phase 2.2A
- Profiles/auth foundation only.
- `public.profiles` table with foundational identity/profile fields.
- Optional reusable `public.set_updated_at()` trigger function only when used for `public.profiles.updated_at`.
- Essential indexes only for `auth_user_id`, `email`, `phone`, and optional `deleted_at`.

## Explicitly not allowed in Phase 2.2A
- No roles/permissions yet.
- No provider ownership yet.
- No RLS yet.
- No `CREATE POLICY`.
- No `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- No seed rows yet.
- No `INSERT` statements.
- No `DROP` statements.
- No PostGIS.

## Strict exclusions
- no geo tables
- no center/provider tables
- no doctor tables
- no legal/consent tables
- no behavior events tables
- no sponsored slots tables
- no audit log tables
- no frontend/backend app features
- no admin UI, provider dashboard, payments, appointment engine, or AI chat
- no Persian/Hindi routes
- no country expansion beyond Oman

## Commands
- `pnpm db:validate:migrations`
- `pnpm db:validate:seeds`
- `pnpm test:db:rls`
- `pnpm test:db:seed`

Phase 2.2A does not require Supabase login, linking to a remote project, or a live Supabase instance.
