# Imported Hospital Public Hold Contract

Imported hospital records must remain private to import/admin readiness until the full public provider discovery contract is implemented from one shared projection.

## Current rule

During import-readiness work, imported hospitals must not be public released through any of these paths:

- detail page returning `200`;
- public hospital directory listing;
- public search result;
- public sitemap entry;
- internal related-provider link graph.

The current public hospital detail route is allowed to exist only as a fail-closed route. It must return `notFound()` for supported locale/country params and expose no indexed hospital profile content.

## Why this exists

Imported hospital profiles are higher-risk than simple directory rows because they can carry branch, department, doctor relation, service, and local-suggestion claims. A public page without verified discovery, source evidence, and internal-link coverage creates orphan-index and misinformation risk. Humanity has produced enough SEO garbage already; this repository does not need to contribute a fresh pile.

## Release prerequisites

Imported hospital public release is blocked until all of these are true in the same implementation path:

1. first-batch dry-run fixture passes with real doctor, pharmacy, hospital, relation, and local-suggestion rows;
2. public provider projection is the single source for manual and imported providers;
3. manual duplicates win over imported duplicates;
4. public detail eligibility is downstream of reviewed source, geo, contact/map, candidate, canonical, and route-family checks;
5. public discovery eligibility is downstream of public detail eligibility;
6. public sitemap eligibility is downstream of public discovery eligibility;
7. internal-link coverage is present for family, location, service/category, and safe related-provider paths;
8. hospital relation and local suggestion summaries show zero unsafe public blockers;
9. representative profile smoke checks pass for English and Arabic routes;
10. sitemap diff contains no unexpected imported hospital URLs.

Until then, doctor/pharmacy import readiness can proceed independently, but imported hospital public release stays locked.