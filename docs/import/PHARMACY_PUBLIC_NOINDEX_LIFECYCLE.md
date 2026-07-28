# Pharmacy Public / Noindex Lifecycle

## Decision

`PHARMACY-PUBLIC-NOINDEX-LIFECYCLE` is complete as an isolated Preview
implementation and proof package.

It opens only a reviewed Pharmacy detail page under both canonical localized
URLs. Every released page remains `noindex`, is excluded from imported
discovery and Sitemap output, and can be returned to its exact logical
pre-public Queue state by a separate rollback operation.

The next implementation is:

```text
PHARMACY-INDEX-PROMOTION
```

Sitemap promotion, Production execution, Agent, Content, Hospital, Doctor,
later families and Bulk remain closed.

## Canonical phase mapping

| Axis | Value |
| --- | --- |
| Execution Phase | Phase 9 |
| Lock Scope | Phase 10 |
| Product Module | Phase 18 |
| Subphase ID | `PHARMACY-PUBLIC-NOINDEX-LIFECYCLE` |

The implementation baseline is `main` after PR #961 at merge commit
`95d58b97924e630b551ba93967088e8e1a4dd58f`. The earlier private-runtime
alignment record remains PR #958 at
`baba0cc91508ef8fad16e43650cf425099c8908a`.

## Authority and transaction

Migration `0087_import_pharmacy_public_noindex_lifecycle.sql` adds one
service-role-only authority for this promotion concept:

```text
issued → published → rolled_back
```

Authorization is bound to the actor, Pharmacy center, approved import
candidate, idempotency key, request hash, expected entity version, immutable
candidate-payload hash, exact EN/AR paths, expiry and exact Queue snapshot.

Publication locks and verifies the authority, center, candidate and Queue in
one transaction. It can write only:

```text
publish_status = published_noindex
index_policy = noindex
sitemap_policy = excluded
robots_policy = noindex
sitemap_included = false
index_promoted = false
```

It does not activate or otherwise mutate the canonical `centers` row.

Rollback uses the server-selected actor/entity authority. It verifies the
currently published Queue identity and policy, then either restores every
logical field from the protected snapshot or removes the Queue row when no
row existed before publication. Concurrent publication and rollback each
produce one mutation and one bounded replay.

## Public route

The canonical route authority releases Pharmacy only at:

```text
/en/om/pharmacies/:slug
/ar/om/pharmacies/:slug
```

The public guard requires all of the following:

- one `published` Pharmacy public/noindex authority;
- the exact authority-bound Queue and approved candidate;
- `published_noindex/noindex/excluded`;
- both canonical paths in protected Queue metadata;
- `robots_policy=noindex`;
- `sitemap_included=false`;
- `index_promoted=false`;
- reviewed identity, local geo, source freshness and public contact/direction
  evidence.

The page always applies `noindex,follow`, even when its content would
otherwise satisfy the generic index-quality gate. `buildLocalizedMetadata`
provides the exact canonical URL and reciprocal EN/AR hreflang set. The page
renders family-correct `Pharmacy` JSON-LD using only visible reviewed fields.
It includes one safe directory link and renders no candidate-relation,
rating, review, booking, insurance or claim links.

Route release does not imply another release:

- the imported discovery adapter requires the future independent Pharmacy
  index-promotion marker;
- the imported Sitemap reader requires the future independent Pharmacy
  sitemap-promotion marker;
- the noindex lifecycle writes neither marker.

## Proof

The exact-SHA hosted Preview proof:

1. rejects any Production identity and requires the isolated Supabase Session
   pooler;
2. verifies migration 0087 and all three service-role-only RPC identities;
3. creates an isolated approved Pharmacy/candidate/Queue fixture;
4. captures the exact existing Queue snapshot;
5. proves idempotent authorization replay;
6. runs two concurrent publication calls and requires one publish plus one
   replay;
7. reads back both localized paths, noindex and Sitemap exclusion metadata,
   the unchanged private center and zero index/Sitemap leakage;
8. runs two concurrent rollback calls and requires one exact recovery plus
   one replay;
9. compares every restored logical Queue field with the original snapshot;
10. verifies the three-event audit history and deterministic zero-row cleanup.

Vercel build, unit tests, static route/guard contracts, migration/RLS checks,
the full import audit, SEO checks, typecheck, lint and build remain required.

## Machine-readable lifecycle record

```json pharmacy-public-noindex-lifecycle
{
  "schemaVersion": "drkhaleej.pharmacyPublicNoindexLifecycle.v1",
  "status": "complete",
  "repositoryBaseline": "95d58b97924e630b551ba93967088e8e1a4dd58f",
  "privateRuntimeBaseline": "baba0cc91508ef8fad16e43650cf425099c8908a",
  "migration": "0087_import_pharmacy_public_noindex_lifecycle.sql",
  "phaseMapping": {
    "executionPhase": 9,
    "lockScope": 10,
    "productModule": 18,
    "subphaseId": "PHARMACY-PUBLIC-NOINDEX-LIFECYCLE"
  },
  "routeFamiliesEnabled": ["center", "doctor", "pharmacy"],
  "pharmacyRoutes": [
    "/en/om/pharmacies/:slug",
    "/ar/om/pharmacies/:slug"
  ],
  "publicationPolicy": {
    "publishStatus": "published_noindex",
    "indexPolicy": "noindex",
    "sitemapPolicy": "excluded",
    "robotsPolicy": "noindex"
  },
  "independentRollback": true,
  "exactLogicalRecovery": true,
  "concurrencyBounded": true,
  "productionConnected": false,
  "next": "PHARMACY-INDEX-PROMOTION",
  "closed": [
    "pharmacy-sitemap-promotion",
    "production-execution",
    "agent-execution",
    "content-automation",
    "hospital",
    "doctor",
    "later-families",
    "bulk"
  ]
}
```
