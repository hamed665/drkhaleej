# Phase 2.1 — Supabase Database Foundation (Extensions + Core Enums Only)

This file defines the approved Phase 2.1 migration scope.

## Approved files for Phase 2.1
- `supabase/migrations/0001_extensions.sql`
- `supabase/migrations/0002_enums.sql`

No other SQL migration files are allowed in this phase.

## Allowed in Phase 2.1
- Required PostgreSQL extensions only:
  - `pgcrypto`
  - `pg_trgm`
  - `unaccent`
- Core foundational enum types only:
  - `app_locale`
  - `country_code`
  - `verification_status`
  - `provider_status`
  - `claim_status`
  - `plan_interval`
  - `consent_type`
  - `notification_channel`
  - `sponsored_slot_type`
  - `audit_actor_type`
  - `audit_action_type`

## Explicitly not allowed in Phase 2.1
- No tables yet
- No seed rows yet
- No RLS yet
- No PostGIS yet
- No `CREATE POLICY`
- No `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- No `INSERT` statements
- No `DROP` statements

## Strict exclusions
- no geo tables
- no center/provider tables
- no doctor tables
- no legal/consent tables
- no behavior events tables
- no sponsored slots tables
- no audit log tables
- no indexes beyond extension setup
- no frontend/backend app features
- no admin UI, provider dashboard, payments, appointment engine, or AI chat
- no Persian/Hindi routes
- no country expansion beyond Oman

## Commands
- `pnpm db:validate:migrations`
- `pnpm db:validate:seeds`
- `pnpm test:db:rls`
- `pnpm test:db:seed`

Phase 2.1 does not require Supabase login, linking to a remote project, or a live Supabase instance.
