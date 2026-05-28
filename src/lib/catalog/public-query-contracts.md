# Phase 4.3D — Public Catalog Live SELECT Query Layer

## Scope

This phase upgrades the Phase 4.3B contract-only layer into a live, server-safe, **SELECT-only** query layer for public catalog read use cases.

Implemented files:

- `src/lib/catalog/public-types.ts`
- `src/lib/catalog/public-queries.ts`
- this document

## What is implemented in Phase 4.3D

- Live SELECT query implementations for confirmed public catalog tables.
- Generated Supabase `Database` types are used for table/enum typing.
- Query execution uses `createSupabaseServerClient()` (anon key path).
- Conservative column selection (summary-only, non-sensitive fields).
- Safe query limits with default `20` and max `50`.
- Search input normalization/sanitization is applied before search execution.
- Search query length is capped to a safe maximum before SQL filter construction.
- Typed result wrappers with explicit `ok / data / emptyReason / error` behavior.
- Generic public error responses (no raw Supabase errors exposed).

## Confirmed public catalog tables used

- `public.centers`
- `public.doctors`
- `public.services`
- `public.geo_areas`

## Public RLS posture

Public read access continues to rely on Supabase RLS policies in:

- `0032_rls_public_catalog_read_policies.sql`

RLS remains the enforcement layer for public SELECT eligibility.

## Implemented query functions

- `listPublicDiscoveryCategories()`
  - static route-level discovery categories: doctors, centers, pharmacies, labs, services.
- `listPublicCenters(options?)`
  - live SELECT from `public.centers` with optional safe filters (`default_country`, `center_type`).
- `listPublicDoctors(options?)`
  - live SELECT from `public.doctors` with optional safe filter (`default_country`).
- `listPublicServices(options?)`
  - live SELECT from `public.services` with optional safe filter (`category_id`).
- `listPublicGeoAreas(options?)`
  - live SELECT from `public.geo_areas` with optional safe filters (`country_id`, `city_id`).
- `searchPublicCatalog(query, options?)`
  - grouped SELECT searches across centers/doctors/services/areas.
  - query is normalized/sanitized before applying `ilike` filters.
  - query length is capped before `ilike` filter construction.
  - returns `search_query_too_short` when normalized query length is `< 2`.

## Explicit exclusions retained

- No UI/page integration yet.
- No API routes or server actions.
- No auth/session logic.
- No schema/migration/seed changes.
- No write operations (`INSERT/UPDATE/DELETE/UPSERT`).
- No RPC usage in this phase.
- No service role usage.
- No fake data.
- No ratings/reviews/review counts.
- No availability/open-now/live status fields.
- No insurance, pricing, sponsored/premium ranking logic.
- No verification/MOH/license claims.
- No phone or WhatsApp exposure.

## Pharmacies and labs note

`pharmacies` and `labs` remain route-level discovery categories in this phase.
No direct schema-backed subtype listing is introduced unless future approved phases define and validate that shape safely.
