# Import Public Release Preflight Contract

This contract defines the minimum checks required before any imported provider family can gain a new public release path.

A public release path means any change that can make imported data visible through one of these surfaces:

- public detail route;
- directory or search result;
- sitemap entry;
- canonical metadata path;
- internal related-provider link;
- public listing card action.

## Required before public release

Every PR that opens or expands imported public visibility must prove all of the following:

1. the relevant import family is represented in the first-batch dry-run fixture or a newer documented fixture;
2. the dry-run report decision is `go` for that family, or the PR keeps that family explicitly blocked;
3. sitemap unexpected URL count is zero;
4. public sitemap eligibility is downstream of public discovery eligibility;
5. public discovery eligibility is downstream of public detail eligibility;
6. detail eligibility requires reviewed source, location, contact or map, candidate approval, canonical path, and route-family match;
7. unsafe public relation and local-suggestion counts are zero;
8. English and Arabic representative samples pass smoke checks;
9. manual duplicate records win over imported duplicate records;
10. the import-readiness contract workflow covers the changed route, fixture, script, or sitemap files.

## Hospital-specific hold

Imported hospitals remain blocked until the hospital public hold contract is retired by a dedicated PR. That PR must reference the fixture that turns hospital release from blocked to eligible and must use the unified public provider projection.

## No shortcut rule

A route, sitemap, or discovery PR must not create a family-specific parallel catalog to bypass the unified provider projection. The project already tried that pattern. It was not charming the first time.
