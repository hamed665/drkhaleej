# Search mode contract

DrKhaleej search is a user utility route, not an indexable landing-page source.

## Route policy

- `/en/om/search` and `/ar/om/search` render for users.
- The route must remain `noindex, follow`.
- Search URLs and filtered query URLs must not enter the sitemap.
- Query parameters such as `q`, `providerType`, `specialty`, `city`, `area`, `contentType`, filters, sort, and pagination are user-state only.
- Canonical metadata must point to the base search route, not to every query variant.

## Runtime policy

Search results may only use public eligible data.

Allowed sources:

- `searchPublicCatalog`
- public eligible doctors
- public eligible centers
- public eligible services
- public eligible areas

Blocked:

- private provider records
- inactive providers
- deleted providers
- unreviewed contact data
- fake result counts
- ratings, reviews, insurance, open-now, booking, or verified badge claims without evidence

## UI policy

Search should use the same 2026 public visual language as the home page:

- mobile-first layout
- touch-friendly cards and filters
- emerald and cyan DrKhaleej surface treatment
- readable typography on small screens
- no dense admin-style tables

## Promotion boundary

Indexable SEO landing pages must be created through GEO, service, and specialty gates, not by indexing search result URLs.
