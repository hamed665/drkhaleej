# Phase 4.3B — Public Catalog Query Contracts

## Scope

This phase adds a minimal TypeScript query-contract layer for future public healthcare discovery pages.

Included:

- `src/lib/catalog/public-types.ts`
- `src/lib/catalog/public-queries.ts`
- this document

Excluded:

- UI integration
- route/page wiring
- API routes
- auth/session logic
- schema/migration changes
- seed data
- generated database types

## Confirmed schema inspected

The contract implementation is based only on confirmed migrations and policy files:

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

This phase relies on anon-key + RLS enforcement and does not bypass it.

## Implemented query functions

- `listPublicDiscoveryCategories()`
  - returns route-level concepts: doctors, centers, pharmacies, labs, services
- `listPublicCenters()`
  - minimal public fields from `public.centers`
- `listPublicDoctors()`
  - minimal public fields from `public.doctors`
- `listPublicServices()`
  - minimal public fields from `public.services`
- `listPublicGeoAreas()`
  - minimal public fields from `public.geo_areas`
- `searchPublicCatalog(query)`
  - grouped, empty-safe search contract across confirmed entities

## Deferred items

Deferred to future phases:

- generated Supabase DB types (`db:types`)
- richer server-side search ranking/filtering strategy
- joins across services/categories/locations with pagination and sort contracts
- UI-layer integration in public pages

## Safety constraints enforced

- no fake data rows
- no reviews/ratings/availability/insurance/pricing/verification claims
- no service role usage
- no write operations (SELECT-only query contract behavior)
- no sensitive/private table access outside confirmed public catalog scope
