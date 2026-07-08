# Imported Hospital Release Blockers

Status: canonical blocker contract for imported hospital public release.
Scope: documentation and validation only.
Build mode: fail-closed, projection-first, route-last.

## Purpose

Imported hospitals must remain held from public detail, public discovery, sitemap promotion, and index promotion until the SEO/Geo roadmap gates are implemented and verified.

This document turns the post-incident lesson into a durable release blocker so imported hospital data cannot quietly re-enter public surfaces before the supporting engine exists. Apparently software needs a locked door after touching the stove once.

## Current held surfaces

The following imported hospital surfaces are held:

```text
imported hospital detail
imported hospital discovery
imported hospital sitemap
imported hospital index promotion
imported hospital JSON-LD expansion
```

## Release gate checklist

Imported hospital release is blocked until every item below is true:

```text
dry-run report is go
source evidence is reviewed
unified provider projection is used
canonical route resolver is used
publicRouteEnabled is true
internal link coverage exists
minimumInternalLinks passed
hreflang projection is ready
sitemap eligibility gate passes
page payload projection is used
shared provider card view model is used
performance/client boundary guard passes
hospital detail route remains build-safe
no raw import payload reaches public UI
```

## Required guard sequence

The release order is:

```text
1. hospital blockers locked
2. canonical resolver
3. replace familyPath
4. entity family registry
5. geo registry contract
6. search intent contract
7. internal link contract
8. internal link fixture builder
9. internal link projection
10. hreflang projection
11. sitemap requires internal links
12. profile payload contract
13. geo payload contract
14. service/specialty geo payload contract
15. shared provider card view model
16. performance/client boundary guard
17. manual and non-hospital integrations
18. sitemap projection fixture
19. first indexable batch
20. imported hospital controlled release
```

## Explicit non-release signals

The following must not be treated as approval to release imported hospitals:

```text
route file exists
sitemap helper mentions hospital
hospital slug has a canonical-like path
import candidate is approved
metadata has sitemap_included
metadata has robots_policy index
Vercel preview is ready
UI card can render a hospital
```

These are necessary ingredients, not release approval.

## Public detail blocker

Imported hospital public detail remains blocked unless:

```text
getPublicImportHospitalProfile is called only behind release gates
hospital route uses the canonical resolver
hospital profile payload is projection-backed
hospital page uses shared provider card view model
source evidence and last_checked_at are visible or available in payload
structured data does not claim invisible relationships
```

## Public discovery blocker

Imported hospitals must not enter public discovery unless:

```text
publicDiscoveryEligible = true
publicDetailEligible = true
publicSitemapEligible policy is evaluated separately
canonical path is resolver-backed
internal link coverage exists
source evidence is reviewed
manual duplicate precedence is preserved
```

Manual providers must continue to win over imported duplicates.

## Sitemap blocker

Imported hospitals must not enter sitemap unless:

```text
publicDiscoveryEligible = true
publicSitemapEligible = true
canonical path exists
hreflang ready
minimumInternalLinks passed
not hospital-held
contentScore passed
source evidence reviewed
```

The old condition `publicDiscoveryEligible && publicSitemapEligible` is not enough for imported hospital sitemap promotion.

## Hreflang blocker

Imported hospital hreflang is blocked unless:

```text
canonical is non-null
the paired locale is public-safe
route family is enabled
page is not noindex
sitemap hreflang is suppressed for noindex pages
```

## Internal link blocker

Imported hospitals cannot be public link targets until:

```text
target canonical exists
target publicRouteEnabled = true
target publicSafe = true
review_status is approved or deterministic_approved
link budget is enforced
duplicate target suppression is active
anchor dedupe is active
```

## Performance blocker

Imported hospital profile release is blocked if any of the following are true:

```text
'use client' on public layout
'use client' on public profile
'use client' on provider card grid
client-side graph logic
client-side heavy search
URL building inside components
relation logic inside components
large map above the fold
```

## Forbidden shortcuts

Do not release imported hospitals by:

```text
opening a route first
expanding sitemap first
patching cards directly
hardcoding provider URLs
adding JSON-LD before visible approved relations
bypassing canonical resolver
bypassing internal link projection
bypassing page payload projection
```

## Validation expectations

A validator must preserve the blocker phrases above and confirm the existing hospital guard chain is still present:

```text
import:hospital-profile-guard:validate
import:hospital-profile-route:validate
import:hospital-sitemap:validate
seo:seo-geo-roadmap-2026:validate
```

## Current status

Current status: blocked.

Next implementation step: canonical resolver.

Imported hospital controlled release must remain after the first indexable batch, not before it.
