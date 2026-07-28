# Pharmacy public/noindex authority

Status: `P11 PHARMACY-PUBLIC-NOINDEX-AUTHORITY`

This gate adds only the protected authority that can bind one reviewed Pharmacy
candidate to a bilingual `published_noindex` Queue record. It does not release a
public route and it does not install rollback behavior.

## Authorized scope

- Migration `0087_import_pharmacy_public_noindex_authority.sql`.
- One actor, one canonical Pharmacy, one existing approved Pharmacy candidate,
  one request hash and one expected entity version per authorization.
- Immutable pre-public Queue snapshot and hash.
- Atomic publish with bounded replay.
- Queue state `published_noindex`, `index_policy=noindex`,
  `sitemap_policy=excluded`, `robots_policy=noindex`,
  `public_route_enabled=false`.
- RLS-enabled authority and event tables with no public policies.
- Security-invoker RPCs with pinned `search_path=pg_catalog,public`, executable
  only by `service_role`.
- Exact-SHA proof on the fixed isolated Preview database.

## Closed boundaries

- The Pharmacy public guard remains index-only, so `published_noindex` is not
  readable through the public profile route in P11.
- The canonical route resolver still returns `route_disabled` for Pharmacy.
- Bilingual live route verification is P12.
- Rollback authority and exact recovery are P13.
- JSON-LD, Index promotion and Sitemap promotion remain disabled.
- Hospital, Doctor, later provider families, Agent, Content and Bulk behavior
  remain unchanged.
- Production is never connected, migrated or mutated.

The hosted proof creates a deterministic isolated fixture, verifies one issued
authorization plus bounded replay, verifies one atomic Queue mutation plus
bounded replay, checks zero index/Sitemap leakage and an unchanged canonical
Pharmacy, then directly deletes only its own fixture rows. That direct cleanup
is proof-only and is not a product rollback path.

```json pharmacy-public-noindex-authority
{
  "schemaVersion": "drkhaleej.pharmacyPublicNoindexAuthority.v1",
  "status": "complete",
  "migration": "0087_import_pharmacy_public_noindex_authority.sql",
  "phaseMapping": {
    "executionPhase": 9,
    "lockScope": 10,
    "productModule": 18,
    "subphaseId": "PHARMACY-PUBLIC-NOINDEX-AUTHORITY"
  },
  "publicationPolicy": {
    "publishStatus": "published_noindex",
    "indexPolicy": "noindex",
    "sitemapPolicy": "excluded",
    "robotsPolicy": "noindex",
    "publicRouteEnabled": false
  },
  "bilingualPathsBound": true,
  "bilingualLiveRoutesVerified": false,
  "rollbackInstalled": false,
  "jsonLdEnabled": false,
  "indexPromoted": false,
  "sitemapPromoted": false,
  "productionConnected": false,
  "next": "PHARMACY-BILINGUAL-LIVE-VERIFY"
}
```
