# Phase 4.3B — Public Catalog Query Contracts

## Scope

This phase provides a minimal TypeScript **contract-only** query layer for future public discovery pages.

Included:

- `src/lib/catalog/public-types.ts`
- `src/lib/catalog/public-queries.ts`
- this document

Excluded:

- live SELECT query execution
- UI integration
- route/page wiring
- API routes
- auth/session logic
- schema/migration changes
- seed data
- generated database types

## Confirmed schema inspected

The contract design is based only on confirmed migrations and policy files:

- `public.centers` (`0006_centers.sql`)
- `public.doctors` (`0010_doctors.sql`)
- `public.services` and `public.service_categories` (`0005_taxonomy.sql`)
- `public.geo_areas`, `public.geo_countries`, `public.geo_cities` (`0004_geo.sql`)
- `public.center_locations` (`0007_center_locations.sql`)
- `public.center_services` (`0008_center_services.sql`)
- `public.doctor_services` (`0012_doctor_services.sql`)

## Public RLS confirmation

Public SELECT RLS policies are confirmed in:

- `0032_rls_public_catalog_read_policies.sql`

## Implemented query functions

- `listPublicDiscoveryCategories()`
  - returns static route-level concepts: doctors, centers, pharmacies, labs, services
- `listPublicCenters()`
  - contract placeholder, returns empty with `query_not_implemented`
- `listPublicDoctors()`
  - contract placeholder, returns empty with `query_not_implemented`
- `listPublicServices()`
  - contract placeholder, returns empty with `query_not_implemented`
- `listPublicGeoAreas()`
  - contract placeholder, returns empty with `query_not_implemented`
- `searchPublicCatalog()`
  - grouped contract placeholder, returns empty with `query_not_implemented`

## Why live SELECT is deferred

Generated Supabase DB types are not available yet (current `Database` is a placeholder), so table-safe typed querying cannot be implemented without risky type bypass patterns.

To preserve TypeScript safety in this phase:

- no `table as never`
- no arbitrary table/column string query helper
- no weakening of global DB types

Live SELECT implementations are deferred to the approved generated DB types phase.

## Deferred items

Deferred to future phases:

- generated Supabase DB types (`db:types`)
- strict typed live SELECT query implementations for confirmed public tables
- richer server-side search ranking/filtering strategy
- UI-layer integration in public pages

## Safety constraints enforced

- no fake data rows
- no reviews/ratings/availability/insurance/pricing/verification claims
- no service role usage
- no write operations
- no sensitive/private table access outside confirmed public catalog scope
