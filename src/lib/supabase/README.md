# Supabase Client Foundation (Phase 4.3A)

This directory contains the **Phase 4.3A** typed Supabase client foundation only.

## Scope in this phase

- Uses `@supabase/supabase-js` with TypeScript.
- Uses **anon key only** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Uses `NEXT_PUBLIC_SUPABASE_URL` with runtime validation.
- Provides minimal client factories for future usage.

## Explicit exclusions in this phase

- No service role key usage.
- No authenticated session helpers.
- No cookie-based auth handling.
- No data query helpers.
- No live data fetching.
- No page integration.

## Types status

- Generated DB types are deferred to a dedicated `db:types` phase.
- Current `Database` type is a placeholder to keep client generics typed safely.

## RLS note

Public read access must remain enforced by Supabase RLS policies as future read queries are introduced.
