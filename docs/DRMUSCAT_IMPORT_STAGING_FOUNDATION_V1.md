# DrMuscat Import Staging Foundation V1

Status: implementation foundation.
Build mode: `PHASED_BUILD_ONLY`.
Scope ID: `ADM-IMPORT-A`.

## Purpose

This phase adds a protected import staging foundation for DrMuscat provider inventory files, including doctor profile, pharmacy, hospital, clinic, laboratory, and medical-center data.

The goal is to make bulk provider data import auditable before any public profile, sitemap entry, schema output, or index promotion exists.

## Implemented in this phase

- Database tables for import batches, files, raw rows, validation issues, entity candidates, duplicate candidates, mapping results, and publish queue entries.
- RLS enabled on every import staging table.
- No public policies and no public read access.
- Admin permission keys for import read/upload/validation/review phases.
- Read-only admin routes:
  - `/admin/imports`
  - `/admin/imports/[batchId]`
- Server-only admin read helpers for batch list and batch detail inspection.
- Admin navigation and Control Center entry for Imports.
- Migration and static RLS validators updated for `0061_import_staging_foundation.sql`.

## Supported template keys

- `doctor_profile_v3`
- `pharmacy_v1`
- `hospital_v1`
- `generic_provider_v1`

## Supported entity types

- `doctor`
- `hospital`
- `pharmacy`
- `clinic`
- `laboratory`
- `medical_center`

## Explicit non-goals

This phase does not implement:

- Excel parsing.
- File upload UI.
- Row mutation UI.
- Duplicate resolution actions.
- Public-safe projection.
- Public profile creation.
- Public page rendering.
- Sitemap promotion.
- Index promotion.
- Media upload.
- Payment or billing logic.
- Online appointment or booking logic.
- Automated content generation.

## Intended next phase

The next phase should add Excel upload and parser support for the approved templates while writing rows only into the staging tables created here.
