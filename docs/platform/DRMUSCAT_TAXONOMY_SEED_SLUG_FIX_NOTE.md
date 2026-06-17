# DrMuscat TAX-SEED-C Taxonomy Slug Fix Note

## Purpose

This note records a small but important correction after TAX-SEED-B preview validation.

The `healthcare_verticals.slug` constraint allows lowercase letters, numbers, and hyphens. It does not allow underscores.

The original TAX-SEED-B seed used underscore vertical slugs for several rows:

- `home_care`
- `mental_health`
- `optical_eye_care`
- `healthy_food`
- `other_health`

Those values violate the migration constraint and must not be used in seed data.

## Correct values

The approved seed values are:

- `home-care`
- `mental-health`
- `optical-eye-care`
- `healthy-food`
- `other-health`

Category slugs are unchanged.

## Scope

This correction changes only the taxonomy seed file and seed validators.

It does not add migrations, RLS, generated types, public routes, public activation, provider dashboard behavior, centers, doctors, reviews, ratings, insurance, license authority data, media, offers, ads, billing, or AI behavior.
