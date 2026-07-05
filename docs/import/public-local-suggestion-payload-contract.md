# Public Local Suggestion Payload Contract

## Purpose

This document defines the import payload contract for public local suggestions.

The same contract should be used by:

- import transformers;
- Excel/template mappers;
- first-batch dry-run reports;
- public imported profile guards;
- future profile families such as radiology, dentistry, and beauty.

The contract is intentionally fail-closed. A local suggestion should not become public unless the row is explicitly public, supported, geographically local, backed by source evidence, and connected to known source and target candidates.

## Canonical payload shape

Local suggestions should live under `relations.localSuggestions`.

```ts
relations: {
  localSuggestions: [
    {
      targetFamily: "doctor" | "pharmacy" | "hospital" | "radiology" | "dentistry" | "beauty";
      targetKey: string;
      targetName: string;
      targetArea: string;
      targetGovernorate: string;
      publicVisible: true;
      confidence: "high" | "medium";
      relationStatus?: "active" | "approved";
      requiresReview?: false;
      source: {
        sourceName?: string;
        sourceUrl?: string;
        lastCheckedAt: string;
      };
    }
  ];
}
```

## Accepted row aliases

The dry-run adapter and runtime guard may accept these aliases for compatibility with import payloads and flat Excel-derived rows:

| Canonical field | Accepted aliases |
| --- | --- |
| `relations.localSuggestions` | `relations.local_suggestions`, `relations.nearby`, root `localSuggestions`, root `local_suggestions`, root `nearby` |
| `targetFamily` | `target_family`, `entityType`, `entity_type`, `family` |
| `targetKey` | `target_key`, `candidateKey`, `candidate_key`, `slug` |
| `targetName` | `target_name`, `displayName`, `display_name`, `name`, `nameEn` |
| `targetArea` | `target_area`, `area` |
| `targetGovernorate` | `target_governorate`, `governorate` |
| `publicVisible` | `public_visible` |
| `relationStatus` | `relationshipStatus`, `status`, `relation_status` |
| `requiresReview` | `requires_review` |
| `source.sourceName` | flat `sourceName`, `source_name` |
| `source.sourceUrl` | flat `sourceUrl`, `source_url`, `url` |
| `source.lastCheckedAt` | flat `lastCheckedAt`, `last_checked_at`, `lastVerifiedDate`, `last_verified_date` |

## Family values

Supported canonical target families are:

- `doctor`
- `pharmacy`
- `hospital`
- `radiology`
- `dentistry`
- `beauty`

Accepted aliases may normalize to those values. Current aliases include plural forms plus `physician`, `imaging`, `diagnostic_imaging`, `dental`, `dentist`, `beauty_center`, and `beauty_salon`.

Unsupported or missing target family values must fail closed and be reported as `unsupported_family` in dry-run output.

## Public visibility

Only rows with `publicVisible: true` or `public_visible: true` are eligible for public output.

Rows with `publicVisible: false`, `public_visible: false`, or missing visibility must not be public. If every other public-safety condition passes, they should be counted as private review rows rather than unsafe public rows.

## Source evidence

A public local suggestion must have source evidence:

- `sourceName` or `sourceUrl`; and
- `lastCheckedAt`.

`sourceName` without `lastCheckedAt` is not enough.

`sourceUrl` without `lastCheckedAt` is not enough.

A row without both `sourceName` and `sourceUrl` must fail closed as `source_missing`.

A row without `lastCheckedAt` must fail closed as `last_checked_missing`.

## Relation status

Public-safe relation status values are:

- missing / null;
- `active`;
- `approved`.

Any other value must fail closed as `ambiguous_review_required`, including:

- `pending`
- `draft`
- `disputed`
- `needs_review`
- `rejected`
- `unknown`

Rows with `requiresReview: true` or `requires_review: true` must also fail closed as `ambiguous_review_required`.

## Confidence

Public-safe confidence values are:

- `high`
- `medium`

Any other confidence value must fail closed as `confidence_unsupported`.

## Location matching

The source and target must share the same area and governorate after trim/lowercase normalization.

The row must fail closed as `location_mismatch` when:

- source area is missing;
- source governorate is missing;
- target area is missing;
- target governorate is missing;
- source and target area differ;
- source and target governorate differ.

No neighborhood alias map is part of this contract yet.

## Candidate key map

Dry-run public-safety checks must confirm that both source and target entities exist in the candidate key map.

A row must fail closed as `source_candidate_missing` when the source family/key pair is not present.

A row must fail closed as `target_candidate_missing` when the target family/key pair is not present.

Future families such as `radiology`, `dentistry`, and `beauty` must stay no-go until their candidate key maps are populated.

## Self-link protection

A local suggestion must not point an entity page back to itself.

A row must fail closed as `same_entity_self_link` when:

- source family equals target family; and
- source key equals target key.

The same key across different families is allowed if all other public-safety checks pass.

The same family with a different target key is allowed if all other public-safety checks pass.

## Dry-run blocker reasons

Public local suggestion dry-run output may use these blocker reasons:

- `unsupported_family`
- `source_candidate_missing`
- `target_candidate_missing`
- `target_name_missing`
- `location_mismatch`
- `source_missing`
- `last_checked_missing`
- `confidence_unsupported`
- `same_entity_self_link`
- `ambiguous_review_required`

## Out of scope

This contract does not add or imply:

- new public routes;
- sitemap expansion;
- rating or review claims;
- booking claims;
- insurance claims;
- schema markup claims;
- provider dashboard links;
- neighborhood alias matching.
