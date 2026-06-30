# Public import profile index eligibility

Imported public profiles need reviewed data and useful discovery signals before their metadata can stay indexable.

## Helper

The shared helper lives at:

- `src/lib/catalog/public-import-profile-index-eligibility.ts`

It exposes:

- `isPublicImportProfileIndexEligible(profile)`
- `PublicImportProfileIndexEligibilityResult`
- `PublicImportProfileIndexEligibilityReason`

## Required signals

The helper requires:

- name
- canonical path
- location signal
- source signal
- last checked date
- listed language
- taxonomy signal
- contact or map signal

## Metadata rule

Imported profile metadata may stay indexable only when the helper returns `eligible: true`. Otherwise routes must return or render `noindex,follow` robots metadata.

## Route coverage

- imported doctor metadata
- imported pharmacy metadata
- imported hospital head metadata

## Boundary

This does not bypass the import queue, import review, canonical path checks, or sitemap family caps.
