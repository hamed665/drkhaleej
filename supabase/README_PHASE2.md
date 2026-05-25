# Phase 2.0 — Supabase Database Foundation Protocol (Scaffold Only)

This file defines the approved Phase 2.0 scaffolding rules.

## Scope
- Create Supabase folder structure only.
- Add protocol validation scripts only.
- Add npm script wiring only.

Not allowed in Phase 2.0:
- real SQL migrations
- enums
- table creation
- RLS policies
- seed data rows

## Required folders
- `supabase/migrations/`
- `supabase/seed/`
- `supabase/tests/rls/`
- `supabase/tests/seed/`
- `supabase/types/`

## Migration naming convention (for upcoming Phase 2.1+)
1. `0001_extensions.sql`
2. `0002_enums.sql`
3. `0003_profiles_auth.sql`
4. `0004_geo.sql`
5. `0005_taxonomy.sql`
6. `0006_centers.sql`
7. `0007_doctors.sql`
8. `0008_doctor_practice_locations.sql`
9. `0009_services_media.sql`
10. `0010_claims_ownership.sql`
11. `0011_plans_settings_flags.sql`
12. `0012_legal_consent.sql`
13. `0013_behavior_events.sql`
14. `0014_sponsored_slots.sql`
15. `0015_audit_admin_ops.sql`
16. `0016_indexes_constraints.sql`
17. `0017_rls.sql`

## Canonical naming rules
- Use `geo_areas` as canonical geo area table. Do not use legacy writable `areas`.
- Use `doctor_practice_locations` as canonical doctor-location table. Do not use `doctor_centers` as writable canonical.
- Use `platform_settings` as canonical settings table. Do not use generic `settings` as canonical.
- Use `provider_plans` as canonical provider plan table. Do not use generic `plans` as canonical.

## Extension decision (for first real migration)
Required:
- `pgcrypto`
- `pg_trgm`
- `unaccent`

Deferred unless explicitly needed:
- `postgis`

## Commands
- `pnpm db:check-cli`
- `pnpm db:validate:migrations`
- `pnpm db:validate:seeds`
- `pnpm db:types`
- `pnpm db:reset`
- `pnpm test:db:rls`
- `pnpm test:db:seed`

## Supabase CLI behavior
- `db:check-cli` must fail with a clear actionable message if Supabase CLI is unavailable.
- Phase 2.0 does not require Supabase login, a running Supabase instance, or a linked remote project.
