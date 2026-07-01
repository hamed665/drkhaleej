# Profile relation limit guard

Public doctor and center profile pages must not render unlimited related entities. Relationship previews are useful for users and crawlers only while they remain curated, bounded, and deterministic.

## Runtime caps

The shared limits live in:

- `src/lib/catalog/public-profile-relation-limits.ts`

Current public profile caps:

- center locations: 6
- center services: 12
- center doctors: 12
- doctor services: 12
- doctor practice locations: 8

## Runtime rule

- Center detail pages render capped locations, services, and doctors.
- Doctor detail pages render capped services and practice locations.
- The cap helper uses stable slice ordering only.
- No random ordering is allowed.
- Hidden items are treated as later-review material, not as extra public link spam.

## Covered surfaces

- `src/components/public/public-center-detail.tsx`
- `src/components/public/public-doctor-detail-limited.tsx`
- `src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx`

This keeps profile graph previews useful instead of turning them into an enthusiastic pile of internal links. Humanity already invented footer link farms. We do not need to re-create them inside doctor cards.
