# DrKhaleej Oman Geo Seed Validation

## Purpose

This phase turns the Oman Geo Authority contract into a concrete, reviewable seed fixture before any migration or public geo behavior exists.

The fixture covers:

- Oman country authority record;
- 11 governorates;
- 63 wilayats;
- 16 required Muscat areas;
- English and Arabic canonical names;
- area aliases;
- Muscat wilayat parent relationships;
- explicit nearby-area references;
- source-evidence markers;
- draft/manual-review status.

## Safety boundary

- No database writes.
- No migrations.
- No public routes.
- No sitemap changes.
- No publish mutation.
- No runtime nearby calculation.

`seedReady` means the fixture is structurally ready for review. It does not mean database-write ready or public-geo ready.

Manual review remains required before a future migration or seed insert can be proposed. Approximate boundary status is explicit and must not be presented as verified geometry.
