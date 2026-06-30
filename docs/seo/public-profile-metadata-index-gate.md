# Public profile metadata index gate

Public doctor and center profile metadata must use the shared profile index eligibility helper before returning indexable metadata.

The route can still render a public profile for users, but robots must receive `index: false, follow: true` when the profile fails the index eligibility gate. This prevents thin or unsafe profiles from entering the index just because the page technically exists, which is the sort of nonsense search engines punish while everyone pretends to be surprised.

## Runtime rule

For public center and doctor detail metadata:

1. Build the normal localized metadata from the approved summary.
2. Evaluate `isPublicProfileIndexEligible(result.data, { kind, locale, fromPublicEligibleQuery: true })`.
3. Return `applyProfileMetadataIndexGate(metadata, indexEligibility)`.
4. If data is missing or the public eligible query fails, return noindex fallback metadata.

## Shared helper

Metadata gating uses:

- `src/lib/seo/profile-metadata-index-gate.ts`
- `applyProfileMetadataIndexGate`
- `buildProfileNoindexMetadata`

The helper preserves title and description while adding:

```ts
robots: { index: false, follow: true }
```

## Covered routes

- `src/app/[locale]/[country]/center/[centerSlug]/page.tsx`
- `src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx`

## Guarded requirements

The static guard requires:

- center metadata imports `isPublicProfileIndexEligible`
- doctor metadata imports `isPublicProfileIndexEligible`
- both routes pass `fromPublicEligibleQuery: true`
- both routes pass the active locale into the eligibility check
- both routes return `applyProfileMetadataIndexGate(metadata, indexEligibility)`
- the shared helper returns noindex/follow robots metadata for ineligible profiles

## Out of scope

Imported doctor, pharmacy, and hospital profiles still need their separate import eligibility gate. This route-level metadata gate is only for public doctor and center profiles returned by the public eligible query chain.
