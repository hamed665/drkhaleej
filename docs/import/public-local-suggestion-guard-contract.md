# Public Local Suggestion Guard Contract

## Purpose

`src/server/public/import-local-suggestion-guard.ts` is the shared fail-closed runtime guard for local cross-family suggestions on imported public profiles.

It exists so imported doctor, pharmacy, hospital, and future radiology, dentistry, and beauty profiles can read the same local suggestion payload shape without duplicating publication rules.

## Supported source and target families

The public guard supports these normalized families:

- `doctor`
- `pharmacy`
- `hospital`
- `radiology`
- `dentistry`
- `beauty`

Accepted aliases must normalize to one of those families. Current aliases include plural forms plus `physician`, `imaging`, `diagnostic_imaging`, `dental`, `dentist`, `beauty_center`, and `beauty_salon`.

## Accepted payload locations

The guard may read suggestion rows from:

- `candidate_payload.relations.localSuggestions[]`
- `candidate_payload.relations.local_suggestions[]`
- `candidate_payload.relations.nearby[]`
- `candidate_payload.localSuggestions[]`
- `candidate_payload.local_suggestions[]`
- `candidate_payload.nearby[]`

## Public-safe row requirements

A row is omitted unless all of these conditions pass:

- target family is supported;
- target name exists;
- source area exists;
- source governorate exists;
- target area exists;
- target governorate exists;
- source and target area match after normalization;
- source and target governorate match after normalization;
- `publicVisible` or `public_visible` is `true`;
- relation status is empty, `active`, or `approved`;
- confidence is `high` or `medium`;
- source evidence exists through `sourceName`, `sourceUrl`, or their snake_case equivalents;
- `lastCheckedAt`, `last_checked_at`, `lastVerifiedDate`, or `last_verified_date` exists;
- the row is not a self-link back to the same source profile.

## Output shape

The public output shape is intentionally small:

```ts
export type PublicImportLocalSuggestion = {
  family: PublicImportLocalSuggestionFamily;
  name: string;
  nameAr: string | null;
  slug: string | null;
  area: string;
  governorate: string;
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  confidence: "high" | "medium";
};
```

No ratings, reviews, bookings, insurance claims, provider dashboard links, schema claims, or commercial claims belong in this output.

## Current consumers

Current imported profile guards using this shared runtime boundary:

- `src/server/public/import-doctor-profile-guard.ts`
- `src/server/public/import-pharmacy-profile-guard.ts`

Hospital profiles currently implement equivalent guarded local suggestion logic directly in `src/server/public/import-hospital-profile-guard.ts`. A future refactor may move hospitals to this shared helper once the route wrapper remains stable.

## Future profile families

Future radiology, dentistry, and beauty imported profile guards should use `buildPublicImportLocalSuggestions(...)` directly rather than reimplementing local suggestion rules.

A future profile guard must pass:

- the full candidate payload;
- the source `geo` record;
- the source family;
- the current source slug;
- an explicit display limit, normally `12`.
