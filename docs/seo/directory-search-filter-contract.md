# Directory search and filter contract

Directory pages may support user-side discovery filters, but they must not become indexable search-result pages.

## Route policy

- Base directory routes stay indexable when already approved in the SEO registry.
- Query and filter URL variants are user state only.
- Directory query variants must not enter the sitemap.
- Canonical metadata remains the base directory path.
- Search/filter variants must not create new public URL families.

## Runtime policy

Directory filtering must use public eligible data only.

Allowed in the current rollout:

- `q` text search on `/doctors`
- `q` text search on `/centers`
- SSR execution using `searchPublicCatalog`
- doctor results narrowed to `PublicDoctorSummary[]`
- center results narrowed to `PublicCenterSummary[]`
- existing `PublicDirectoryListingContent` and `PublicListingGrid`

Not allowed yet:

- specialty page links before specialty gates exist
- area page links before GEO gates exist
- fake counts
- rating, review, insurance, booking, open-now, or verified badge claims
- client-only filtering that changes the URL without changing the server-rendered results

## UI policy

Directory search/filter UI must remain mobile-first and visually aligned with the home page:

- use the existing 2026 home/public surface treatment
- single-column first, responsive grid after enough width
- touch-friendly cards
- no admin table layout
- no dense filter wall on phones

## Rollout sequence

1. Doctors `q` SSR integration.
2. Centers `q` SSR integration.
3. Labs/pharmacies/hospitals `q` with center-type narrowing.
4. Specialty and area filters only after their gates and canonical rules exist.
