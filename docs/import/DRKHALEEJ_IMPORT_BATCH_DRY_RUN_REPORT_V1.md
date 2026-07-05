# DrKhaleej Import Batch Dry-Run Report V1

## Purpose

This document defines the machine-readable report shape for the first guarded import batch rehearsal.

The report is a dry-run artifact only. It records whether a frozen doctor, pharmacy, and hospital import sample is ready for a controlled public sitemap rehearsal. It does not approve rows, publish rows, change database state, open new routes, or create dashboard/commercial workflows. The machine gets a report; the public internet does not get a buffet.

## Source of truth

| Surface | Source |
| --- | --- |
| Type contract | `src/server/admin/import-batch-dry-run-report.ts` |
| First batch bridge | `src/server/admin/import-first-batch-dry-run-bridge.ts` |
| Rehearsal checklist | `docs/import/DRKHALEEJ_IMPORT_BATCH_REHEARSAL_V1.md` |
| Hospital doctor relation transform contract | `docs/import/hospital-doctor-relations-transform-contract.md` |
| Readiness audit | `src/server/admin/import-publish-readiness-audit.ts` |
| Sitemap family caps | `src/server/public/import-sitemap.ts` |
| Profile smoke validator | `scripts/import/check-public-import-profile-smoke.mjs` |

## Schema identity

The report must use this exact schema version:

`drkhaleej.import.batchDryRun.v1`

## First rehearsal caps

| Family | Dry-run cap |
| --- | --- |
| doctor | 50 |
| pharmacy | 25 |
| hospital | 10 |

These are rehearsal caps, not long-term import sitemap caps.

## Required decision checks

A report can return `go` only when all required checks pass:

- `ci_green`
- `seo_check_green`
- `readiness_audit_zero_blockers`
- `sitemap_diff_frozen`
- `representative_profile_smoke_passed`
- `blocked_route_classes_absent`

If any required check fails, the report decision must be `no_go`.

## Required top-level shape

```json
{
  "schemaVersion": "drkhaleej.import.batchDryRun.v1",
  "rehearsalId": "2026-06-27-first-import-rehearsal",
  "generatedAt": "2026-06-27T23:30:00Z",
  "commitSha": "example-sha-or-null",
  "decision": "no_go",
  "caps": {
    "doctor": 50,
    "pharmacy": 25,
    "hospital": 10
  },
  "checks": [
    { "key": "ci_green", "passed": false, "notes": null },
    { "key": "seo_check_green", "passed": false, "notes": null },
    { "key": "readiness_audit_zero_blockers", "passed": false, "notes": null },
    { "key": "sitemap_diff_frozen", "passed": false, "notes": null },
    { "key": "representative_profile_smoke_passed", "passed": false, "notes": null },
    { "key": "blocked_route_classes_absent", "passed": false, "notes": null }
  ],
  "sitemap": {
    "beforeUrlCount": 0,
    "afterUrlCount": 0,
    "importedDeltaCount": 0,
    "unexpectedUrlCount": 0,
    "unexpectedUrls": []
  },
  "byFamily": {
    "doctor": {
      "selectedCount": 0,
      "eligibleCount": 0,
      "blockedCount": 0,
      "sitemapUrlCount": 0,
      "sampledUrlCount": 0,
      "blockers": [],
      "samples": []
    },
    "pharmacy": {
      "selectedCount": 0,
      "eligibleCount": 0,
      "blockedCount": 0,
      "sitemapUrlCount": 0,
      "sampledUrlCount": 0,
      "blockers": [],
      "samples": []
    },
    "hospital": {
      "selectedCount": 0,
      "eligibleCount": 0,
      "blockedCount": 0,
      "sitemapUrlCount": 0,
      "sampledUrlCount": 0,
      "blockers": [],
      "samples": []
    }
  },
  "hospitalRelations": {
    "totalRows": 0,
    "candidateHospitalCount": 0,
    "publicVisibleCount": 0,
    "blockedFromPublicCount": 0,
    "privateReviewCount": 0,
    "hospitalSuggestionCount": 0,
    "unsafePublicCount": 0,
    "unsafePublicBlockers": [],
    "blockedFromPublicReasons": []
  },
  "localSuggestions": {
    "totalRows": 0,
    "publicVisibleCount": 0,
    "blockedFromPublicCount": 0,
    "privateReviewCount": 0,
    "sourceEntitySuggestionCount": 0,
    "locationClusterCount": 0,
    "unsafePublicCount": 0,
    "unsafePublicBlockers": [],
    "blockedFromPublicReasons": []
  },
  "notes": []
}
```

## Hospital relation dry-run summary

`hospitalRelations` reports the doctor-hospital relation rows produced from `Doctor_Hospital_Relations` and the hospital doctor relations transform contract.

The relation summary separates three different states that must not be confused, because apparently confusion needed another place to live:

- `publicVisibleCount`: relations that are allowed to become public doctor suggestions on hospital profile pages.
- `blockedFromPublicCount`: relations that are safely omitted from public suggestions and may stay private/admin-review only.
- `unsafePublicCount`: relations that were marked or prepared for public display but fail the relation gates. Any non-zero value forces `decision: "no_go"`.

Allowed `unsafePublicBlockers[].reason` and `blockedFromPublicReasons[].reason` values are:

- `branch_not_verified`
- `source_missing`
- `last_checked_missing`
- `confidence_unsupported`
- `doctor_name_missing`
- `hospital_mismatch`
- `ambiguous_review_required`

A blocked relation does not automatically fail the whole hospital import rehearsal. An unsafe public relation does.

## Location-aware cross-family suggestion dry-run summary

`localSuggestions` reports same-area cross-family suggestion rows prepared for public profile pages.

This is intentionally generic so a hospital page in Al Khuwair can later suggest nearby hospitals, pharmacies, doctors, radiology, dentistry, and beauty providers, and a pharmacy page can suggest nearby doctors, hospitals, radiology, dentistry, and beauty providers without one-off logic. That is what software is supposed to do, despite our industry's tireless campaign against dignity.

A local suggestion is public-safe only when:

- source and target families are supported: `doctor`, `pharmacy`, `hospital`, `radiology`, `dentistry`, `beauty`;
- source and target keys both exist in the dry-run candidate key map;
- source and target area and governorate match;
- target display name is present;
- source/evidence URL is present;
- last checked date is present;
- confidence is `high` or `medium`;
- the row is not marked for review, ambiguous, disputed, duplicate, or branch-review-only;
- the row is not a self-link from an entity page back to itself.

The local summary separates these states:

- `publicVisibleCount`: suggestions allowed to become public local recommendation links on source entity pages.
- `sourceEntitySuggestionCount`: number of source entity pages with at least one public-safe local suggestion.
- `locationClusterCount`: number of same-area/governorate clusters that have public-safe local suggestions.
- `blockedFromPublicCount`: suggestions that are safely omitted from public UI and may stay private/admin-review only.
- `privateReviewCount`: suggestions that pass the data gates but are not yet marked public.
- `unsafePublicCount`: suggestions that were marked or prepared for public display but fail the local suggestion gates. Any non-zero value forces `decision: "no_go"`.

Allowed local suggestion `unsafePublicBlockers[].reason` and `blockedFromPublicReasons[].reason` values are:

- `source_candidate_missing`
- `target_candidate_missing`
- `target_name_missing`
- `location_mismatch`
- `source_missing`
- `last_checked_missing`
- `confidence_unsupported`
- `same_entity_self_link`
- `unsupported_family`
- `ambiguous_review_required`

A blocked local suggestion does not automatically fail the import rehearsal. An unsafe public local suggestion does.

## Blocker reasons

Allowed family-level blocker reasons are:

- `canonical_unsafe`
- `source_missing`
- `contact_or_map_missing`
- `geo_missing`
- `candidate_missing`
- `candidate_not_approved`
- `candidate_type_mismatch`
- `queue_not_index_eligible`
- `sitemap_not_included`
- `robots_not_index`
- `sitemap_cap_exceeded`
- `unexpected_route_class`
- `representative_smoke_failed`

## Sample URL result shape

Each sampled public profile URL must record the family, locale, canonical path, rendered name signal, evidence signals, canonical signal, locale alternate signal, and pass/fail status.

A sample is passing only when it has location evidence, source evidence, contact or map evidence, canonical output, and the expected route-family behavior.

## Report decision rule

The report decision is `go` only when:

- all required checks pass;
- every selected row is eligible;
- family-level blocker count is zero;
- unexpected sitemap URL count is zero;
- sitemap counts stay within the first rehearsal caps;
- representative profile samples pass;
- `hospitalRelations.unsafePublicCount` is zero;
- `hospitalRelations.unsafePublicBlockers` is empty;
- `localSuggestions.unsafePublicCount` is zero;
- `localSuggestions.unsafePublicBlockers` is empty.

Otherwise the decision is `no_go`.
