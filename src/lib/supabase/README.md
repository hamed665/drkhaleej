# Supabase Client Foundation

This directory contains the typed Supabase client foundation for DrMuscat.

## Public anon client

- Public catalog reads should continue to use the anon-key client by default.
- The anon client uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Public read access must remain enforced by Supabase RLS policies.

## Server-only service-role client

- `service-role.ts` provides a server-only service-role client for trusted backend write paths.
- The service-role client uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` must never use a `NEXT_PUBLIC_` prefix.
- The service-role key must never be exposed to browsers or logged.
- The service-role client must never be imported into client components.
- The service-role client bypasses RLS, so callers must enforce authorization, public visibility, and context validation manually before reading or writing data.

## Callback request note

A controlled callback insert route is planned for a later phase. That route must validate request input and public catalog context before using the service-role client to insert callback requests.

## Explicit exclusions in this foundation

- No callback request route.
- No callback request insert helper.
- No public callback UI.
- No authenticated session helpers.
- No cookie-based auth handling.
- No queries or writes inside the service-role client factory.
