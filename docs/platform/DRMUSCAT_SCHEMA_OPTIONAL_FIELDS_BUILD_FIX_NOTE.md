# Schema Optional Fields Build Fix Note

This note records the Vercel build fix for `src/server/admin/import-schema-generator.ts`.

## Problem

With `exactOptionalPropertyTypes`, optional properties such as `openingHours`, `sameAs`, `breadcrumb`, and `faq` must be omitted when absent. They should not be returned as explicit `undefined` values inside the object literal assigned to `ImportGeneratedSchema`.

## Fix

`generateEntitySchema()` now creates the required schema object first, then conditionally attaches optional fields only when values exist.

This keeps the schema generator compatible with strict TypeScript builds.
