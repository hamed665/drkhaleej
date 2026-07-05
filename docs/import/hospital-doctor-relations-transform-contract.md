# Hospital doctor relations transform contract

## Status

- Scope: import planning and validation contract only.
- Runtime behavior: none.
- Database behavior: none.
- Public publishing behavior: none.
- This contract documents how the Oman hospital workbook relation rows must be transformed into the imported hospital profile payload consumed by the public hospital profile guard.

## Source sheet

The source workbook sheet is `Doctor_Hospital_Relations`.

Required source columns:

| Column | Required | Purpose |
| --- | --- | --- |
| `relation_key` | yes | Stable row-level relation key. |
| `doctor_key` | yes | Stable imported doctor key. |
| `hospital_key` | yes | Stable imported hospital key. |
| `hospital_name_en` | yes | Human-readable hospital name for review/debugging. |
| `hospital_name_ar` | optional | Arabic hospital label if reviewed. |
| `doctor_name_en` | yes | Doctor display name used only after relation is public-safe. |
| `department_en` | optional | Department/specialty signal. |
| `department_ar` | optional | Arabic department label if reviewed. |
| `title_en` | optional | Doctor title at the hospital. |
| `title_ar` | optional | Arabic doctor title if reviewed. |
| `relation_type` | yes | Evidence relationship type. |
| `branch_verified` | yes | Must be true before public hospital doctor suggestion. |
| `source_url` | yes | Source evidence for relation. |
| `profile_url` | optional | Doctor/profile/directory URL if available. |
| `last_verified_date` | yes | Last source/evidence check date. |
| `confidence` | yes | Only `high` or `medium` can become public suggestion input. |
| `notes` | optional | Internal import/review note. Never public. |

## Grouping

Rows are grouped by `hospital_key` and attached to that hospital candidate payload under:

```json
{
  "relations": {
    "doctors": []
  }
}
```

The transformer must not create a standalone public doctor suggestion from a row that lacks an owning hospital candidate.

## Output object shape

Each accepted relation row may become one `candidate_payload.relations.doctors[]` object with this shape:

```json
{
  "name": "Dr Example",
  "nameAr": "د. Example",
  "slug": "example-doctor",
  "specialty": "Cardiology",
  "department": "Cardiology",
  "branchVerified": true,
  "publicVisible": true,
  "relationStatus": "active",
  "confidence": "high",
  "source": {
    "sourceName": "official_public_directory",
    "sourceUrl": "https://example.com/doctors",
    "lastCheckedAt": "2026-07-04"
  }
}
```

Allowed equivalent field names may be accepted by the runtime guard for compatibility, but the transformer should emit the camelCase form above.

## Public eligibility rules

A relation can be emitted with `publicVisible: true` only when all rules below pass:

1. `branch_verified` is true.
2. `source_url` is present.
3. `last_verified_date` is present.
4. `confidence` is `high` or `medium`.
5. `doctor_name_en` is present.
6. `hospital_key` matches the hospital candidate receiving the relation.
7. The row is not marked as disputed, ambiguous, duplicate, or branch-review-only in `relation_type` or `notes`.

Rows that fail these rules may still be carried in private/admin import review payloads later, but must not be emitted as public-visible doctor suggestions.

## Explicitly blocked public cases

The transformer must set `publicVisible: false` or omit the row from public relation payloads when:

- `branch_verified` is false;
- `confidence` is `medium_low`, `low`, empty, or unknown;
- `source_url` or `last_verified_date` is missing;
- the row is only a group-level doctor directory without exact branch confidence;
- the row indicates branch review is required;
- the doctor name is a placeholder or duplicate resolution is unresolved.

## Slug policy

If a doctor slug is available from the doctor import sheet, use it. If the transformer derives a slug, it must match:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

If no safe slug exists, the relation may still carry the doctor name, but public UI must link to safe search fallback rather than inventing a profile URL.

## Safety boundary

This contract does not authorize:

- doctor page publication;
- hospital page publication;
- schema output;
- reviews;
- ratings;
- booking;
- insurance display;
- license claims;
- provider claims;
- automatic sitemap inclusion.

The existing public hospital profile guard remains the final fail-closed runtime boundary for public doctor suggestions.
