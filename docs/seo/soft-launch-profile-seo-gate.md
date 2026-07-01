# Soft launch profile SEO gate

This gate is the final aggregate checkpoint for profile SEO readiness before soft launch.

It does not create a new public feature. It only confirms that the existing profile SEO, safety, metadata, import, sitemap, and relation guards are still wired together.

## Scope

The gate must pass before soft-launching public doctor or center profile routes.

It covers:

- Summary readiness
- Native profile index eligibility
- Metadata noindex gate
- Sitemap boundary
- Completeness signals
- Evidence copy guard
- Provider copy review
- Import profile boundary
- Profile graph and relation limits
- Forbidden SEO claims

## Summary readiness

Native doctor and center profile summaries must keep using the shared summary helpers:

- `buildPublicCenterProfileSummary`
- `buildPublicDoctorProfileSummary`
- `buildPublicProfileMetaDescription`

Imported doctor, pharmacy, and hospital profiles must keep using the shared import summary helpers:

- `buildPublicImportProfileSummary`
- `buildPublicImportProfileMetaDescription`

Generated summary copy must stay fact-based. It must not invent best, top-rated, guaranteed, insurance, MOH approval, emergency, booking, or availability claims.

## Native profile index eligibility

Native doctor and center metadata may remain indexable only when `isPublicProfileIndexEligible(profile, context)` returns an eligible result from the public eligible query chain.

The gate expects explainable reasons for failures, including:

- `missing_profile`
- `missing_name`
- `missing_slug`
- `missing_country`
- `missing_entity_type`
- `missing_summary`
- `missing_relation_signal`
- `missing_safety_copy`
- `unsafe_claim`
- `deleted_or_inactive`
- `not_from_public_eligible_query`

`fromPublicEligibleQuery: true` is required for indexability.

## Metadata noindex gate

Doctor and center profile routes must continue using:

- `applyProfileMetadataIndexGate`
- `buildProfileNoindexMetadata`
- `robots: { index: false, follow: true }`

Fallback metadata must fail closed as `noindex,follow`.

## Sitemap boundary

The sitemap must stay limited to static SEO pages plus reviewed import sitemap entries.

The soft launch profile SEO gate does not enable native profile sitemap expansion.

Native doctor and center routes must not add `generateStaticParams`, profile sitemap helpers, search/query URL variants, preview paths, admin paths, provider-dashboard paths, booking paths, insurance paths, rating schema, or review schema.

Native profile sitemap promotion requires a separate contract after soft launch.

## Completeness signals

Completeness stays an internal quality model. It is not a public badge and must not be exposed as a score in public UI.

The aggregate gate expects the completeness helper to continue producing:

- `hasName`
- `hasSlug`
- `hasCountry`
- `hasEntityType`
- `hasSummary`
- `hasRelationSignal`
- `hasSafetyCopy`
- `hasUnsafeClaimFree`
- `missing`
- `score`
- `percentage`

## Evidence copy guard

Public profile copy must keep avoiding unsupported claims.

License information may render only through `PublicLicenseInfoCard` and only when `licenseInfo` exists.

A DrKhaleej verified state is not official MOH approval.

Contact actions must come from approved public contact action arrays. Safe fallback copy must remain available when contact actions are absent.

Medical safety notes must stay visible.

## Provider copy review

Provider-written copy can be public only after the review helper marks it safe.

Allowed workflow states remain:

- `draft`
- `pending_review`
- `approved`
- `rejected`

Only `approved` clean copy can be considered for public rendering. Empty approved copy and unsafe claim wording remain blocked.

## Import profile boundary

Imported doctor, pharmacy, and hospital profiles keep a separate import profile eligibility gate.

Name-only imported profiles remain `noindex,follow`.

Imported profile indexability requires reviewed import signals, including source, location, language, taxonomy signal, and contact-or-map signal.

Import sitemap entries must remain reviewed, `index_eligible`, `index`, and `included`.

## Profile graph and relation limits

Profile graph anchors must remain descriptive and must not fall back to vague anchor text such as Click here, More, Profile, or Details.

Relation previews must remain capped and deterministic:

- center locations: 6
- center services: 12
- center doctors: 12
- doctor services: 12
- doctor practice locations: 8

No random ordering is allowed.

## Forbidden SEO claims

The aggregate gate scans public profile, listing, metadata, sitemap, and summary-critical files for unsupported SEO claims, including:

- rating schema
- review schema
- `AggregateRating`
- `ratingValue`
- `reviewCount`
- Book now
- booking guarantee
- Open now
- available now
- insurance accepted
- MOH approved
- verified by MOH
- best doctors
- top-rated
- trusted by thousands
- guaranteed treatment
- emergency availability

Test fixtures may mention forbidden tokens only inside explicit safety tests. Public UI and SEO-critical runtime files must not.

## Wiring

The gate is wired through `scripts/seo/check-public-profile-index-eligibility-contract.mjs`, which is already chained from `scripts/seo/check-public-listing-card-safety.mjs` and therefore remains inside the existing `seo:check` path.

Supabase warning hardening stays separate and follows after the profile SEO gate. Security errors remain launch blockers; tracked warnings are a separate backlog, because apparently databases also enjoy leaving little traps under the carpet.
