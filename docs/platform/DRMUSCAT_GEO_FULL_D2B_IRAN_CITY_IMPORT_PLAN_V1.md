# DrMuscat GEO-FULL-D2B — Iran City Import Plan V1

## Status

Planning/specification only.

This phase must not manually seed an incomplete Iran city list and call it complete.
Iran's city/locality catalog is large enough that a hand-written seed is likely to become stale, incomplete, or inconsistent.

## Goal

Build a source-backed Iran city/locality catalog under the existing `geo_countries`, `geo_regions`, and `geo_cities` model.

The target admin UX remains:

```text
Country → City → Area / Neighborhood
```

The database hierarchy remains:

```text
country → region / province → city → area / neighborhood
```

For Iran, `geo_regions` already represents provinces from earlier GEO-FULL-C1 work. GEO-FULL-D2B must attach cities to those existing province rows.

## Non-goals

This phase must not add:

- doctor data
- center data
- reviews or ratings
- insurance data
- license authority data
- media data
- offers, ads, billing, or AI data
- public activation
- provider dashboard UI
- public routes
- hand-written claims that the Iran city catalog is complete without source metadata

## Required source strategy

Use a source-backed import instead of a hand-authored SQL seed.

Preferred source order:

1. **GeoNames country extract for Iran**
   - Use feature classes suitable for populated places.
   - Preserve source date/version in metadata.
   - Treat license and attribution requirements as launch-blocking.
2. **OpenStreetMap-derived fallback or enrichment**
   - Only if licensing and attribution are correctly handled.
   - Do not mix OSM-derived rows with GeoNames-derived rows unless source provenance is explicit per row.
3. **Manual supplemental corrections**
   - Allowed only for small reviewed patches.
   - Every manual row must include a reason and reviewer note.

## Required row metadata

Every imported city row must include metadata with at least:

```json
{
  "seed_phase": "GEO-FULL-D2B",
  "source": "geonames|osm|manual",
  "source_version": "<date-or-release>",
  "source_id": "<external-id-if-available>",
  "review_status": "imported|reviewed|manual-correction"
}
```

Rows without source metadata must be rejected.

## Parent mapping requirement

Each city must resolve to exactly one existing Iran province row in `geo_regions`.

Required mapping logic:

1. Match by explicit source admin code if available.
2. Fallback to normalized province name mapping only if the mapping table is reviewed.
3. Reject ambiguous rows instead of guessing.

Ambiguous examples must be written to a review output rather than silently inserted.

## Slug rules

City slugs must be:

- lowercase
- ASCII
- hyphen-separated
- unique within the same country
- stable across imports
- derived from English/transliterated city name unless a collision requires suffixing

Collision handling:

```text
<city-slug>
<city-slug>-<province-slug>
<city-slug>-<source-id>
```

Use the first stable option that resolves the collision.

## Import output files

The implementation phase should produce generated SQL, not hand-authored bulk city SQL.

Recommended structure:

```text
scripts/geo/import-geonames-iran-cities.mjs
scripts/geo/fixtures/iran-cities.sample.tsv
supabase/seed/generated/iran-cities.generated.sql
supabase/seed/0006_geo_cities_d2b_iran.sql
```

The generated SQL should be copied or wrapped into the approved seed file only after validation.

## Required validation

Add validation before merge of the implementation phase:

- approved seed file name is expected by seed validators
- no center/doctor/review/rating/insurance/license/media/ads/billing/AI data
- seed must insert/update only `geo_cities`
- every row must include `seed_phase = GEO-FULL-D2B`
- every row must include source metadata
- every row must map to an Iran province already seeded in `geo_regions`
- duplicate city slugs under the same country are rejected
- rows with missing Arabic or English names are rejected or sent to review output
- source attribution file is present

## Minimum coverage for implementation PR

The implementation PR is allowed to be split:

### GEO-FULL-D2B1

- importer script
- fixture test
- source manifest
- validator update
- no production seed rows yet

### GEO-FULL-D2B2

- generated Iran city seed
- source attribution
- validator checks
- CI green

### GEO-FULL-D2B3

- manual reviewed corrections only if required

## Stop conditions

Do not merge generated Iran city data if any of these are true:

- source license is unclear
- source version/date is missing
- source attribution is missing
- province mapping is ambiguous
- duplicate slugs are unresolved
- generated SQL includes non-geo tables
- rows are inserted without source metadata
- implementation claims complete coverage without measurable source coverage

## Admin UX impact

After implementation, the location form should be able to offer:

```text
Country: Iran
City: source-backed Iran city/locality list
Area: optional until GEO-FULL-E Iran area data exists
```

`region_id` should remain hidden or internally resolved from selected city, consistent with the GEO-FULL-A hierarchy rule.

## Supabase rollout guidance

Do not run this against Supabase production until:

1. country code enum migration is applied
2. region seeds are applied
3. Iran city import implementation PR has passed CI
4. generated SQL has been reviewed for source/province coverage

Running partial data early can create broken admin dropdowns and misleading coverage.

## Next implementation step

Create **GEO-FULL-D2B1** with:

- importer script contract
- sample fixture
- source manifest format
- validator checks

Do not add the full generated Iran seed until the importer and validators are in place.
