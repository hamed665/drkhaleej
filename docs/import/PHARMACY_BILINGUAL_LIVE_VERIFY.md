# Pharmacy Bilingual Live Verify

## Decision

P12 `PHARMACY-BILINGUAL-LIVE-VERIFY` is complete as a route-only release.
It activates the reviewed Pharmacy detail surface at the exact localized paths:

```text
/en/om/pharmacies/:slug
/ar/om/pharmacies/:slug
```

The route can render only from the P11 protected authority and its exact
`published_noindex` Queue record. It is always `noindex,follow`, remains
excluded from imported discovery and Sitemap output, and emits no JSON-LD.

The next implementation is:

```text
PHARMACY-PUBLIC-ROLLBACK
```

## Canonical phase mapping

| Axis | Value |
| --- | --- |
| Execution Phase | Phase 9 |
| Lock Scope | Phase 10 |
| Product Module | Phase 18 |
| Subphase ID | `PHARMACY-BILINGUAL-LIVE-VERIFY` |

P12 adds no migration. The database authority remains migration
`0087_import_pharmacy_public_noindex_authority.sql`.

## Fail-closed route contract

The canonical route resolver enables only the Pharmacy family added by this
gate. Hospital and every later family remain disabled. Slugs must be lowercase
ASCII kebab-case and the only supported locale/country pairs are `en|ar` and
`om`.

The server guard requires all of the following:

- an exact Pharmacy Queue row with
  `published_noindex/noindex/excluded`;
- protected metadata schema
  `drkhaleej.import.pharmacyPublicNoindex.v1`;
- `robots_policy=noindex`, `sitemap_included=false`, and
  `index_promoted=false`;
- the exact EN/AR paths bound by P11;
- the exact published P11 authorization, Queue id, and approved candidate;
- reviewed identity, local geo, source freshness, and public contact or
  direction evidence.

Any mismatch returns `not_found`. Candidate-relation suggestions and inferred
nearby links remain closed. The page includes only one safe localized Pharmacy
directory link.

## SEO and release boundaries

`buildLocalizedMetadata` creates the canonical and reciprocal EN/AR hreflang
URLs. `buildProfileNoindexMetadata` then unconditionally applies
`noindex,follow`.

P12 does not couple route release to later promotions:

- imported discovery requires the independent future Pharmacy Index marker;
- imported Sitemap output requires the independent future Pharmacy Sitemap
  marker;
- no JSON-LD is emitted;
- rollback is not installed by P12;
- Production is not connected, migrated, or mutated.

## Exact-SHA proof

The required GitHub workflow checks out the PR head SHA and requires it to
match every P11/P12 proof input. It then:

1. runs migration, RLS, alignment, P11, and P12 static/unit contracts;
2. applies and verifies only ledger-missing migrations on the isolated Preview
   database;
3. reruns the P11 isolated authority proof at the exact SHA;
4. derives a bounded P12 evidence record from that green database proof and
   the route/SEO/discovery/Sitemap contract gates;
5. uploads both exact-SHA artifacts without raw identifiers or secrets.

Typecheck, lint, build, required GitHub Actions, and Vercel remain merge gates.
The evidence record does not claim an HTTP fixture survives cleanup: the P11
fixture is deterministically removed after readback.

## Machine-readable record

```json pharmacy-bilingual-live-verify
{
  "schemaVersion": "drkhaleej.pharmacyBilingualLiveVerify.v1",
  "status": "complete",
  "migration": "0087_import_pharmacy_public_noindex_authority.sql",
  "phaseMapping": {
    "executionPhase": 9,
    "lockScope": 10,
    "productModule": 18,
    "subphaseId": "PHARMACY-BILINGUAL-LIVE-VERIFY"
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
  "p11AuthorityRequired": true,
  "canonicalAndHreflangVerified": true,
  "candidateRelationLinksEnabled": false,
  "jsonLdEnabled": false,
  "rollbackInstalled": false,
  "indexPromoted": false,
  "sitemapPromoted": false,
  "productionConnected": false,
  "next": "PHARMACY-PUBLIC-ROLLBACK"
}
```
