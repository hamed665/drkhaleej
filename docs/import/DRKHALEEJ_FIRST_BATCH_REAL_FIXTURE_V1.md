# DrKhaleej First Batch Real Fixture V1

This fixture locks the next import-readiness step around a realistic dry-run shape before any new public hospital surface is opened.

## Source of truth

Fixture file:

`fixtures/import/first-batch-dry-run.fixture.json`

Validator:

`node scripts/import/check-first-batch-real-fixture.mjs`

## Intent

The fixture must include doctor, pharmacy, and hospital rows together, because the first real import batch is not just a list of providers. It also has relation and local-suggestion risk.

The fixture is intentionally `no_go` while imported hospitals are on public hold. That is not a failure. It proves the report can carry safe doctor/pharmacy candidates while still blocking hospital public release.

## Required fixture behavior

- doctors are present and can pass representative profile smoke;
- pharmacies are present and can pass representative profile smoke;
- hospitals are present but have zero public eligibility;
- hospital sitemap URL count stays zero;
- all selected hospitals are blocked while the public hold is active;
- sitemap unexpected URL count stays zero;
- hospital relations have zero unsafe public rows;
- hospital relation public visible count stays zero;
- local suggestions have zero unsafe public rows;
- every public doctor/pharmacy sample has location, source, contact/map, canonical, and locale alternate evidence.

## Promotion rule

A future PR may turn the fixture from `no_go` to `go` only after imported hospital public release moves through the unified provider projection, discovery, internal-link, and sitemap gates. Until then, the correct behavior is boring and blocked, the two best friends of production safety.