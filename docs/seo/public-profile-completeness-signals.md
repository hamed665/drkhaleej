# Public profile completeness signals

Public profile completeness is an internal quality model for public doctor and center profiles. It is not a public badge, not a ranking claim, and not an approval claim.

The goal is simple: give index safety, admin tooling, and launch QA a shared way to see whether a profile has enough useful facts before it is allowed to become indexable. Apparently this needs to be written down because otherwise every project eventually invents five different score systems and then acts confused.

## Runtime helper

The helper lives at:

- `src/lib/catalog/public-profile-completeness.ts`

It exposes:

- `buildPublicProfileCompletenessSignals(profile, context)`
- `PublicProfileCompletenessSignals`
- `PublicProfileCompletenessMissingSignal`

## Signal shape

The output includes:

- `kind`
- `hasName`
- `hasSlug`
- `hasCountry`
- `hasEntityType`
- `hasSummary`
- `hasLocationSignal`
- `hasServiceSignal`
- `hasPracticeRelations`
- `hasSpecialtySignal`
- `hasApprovedDescription`
- `hasRelationSignal`
- `hasSafetyCopy`
- `hasUnsafeClaimFree`
- `score`
- `maxScore`
- `percentage`
- `missing`

## Missing signals

The helper reports missing core readiness signals as stable reason-like keys:

- `name`
- `slug`
- `country`
- `entity_type`
- `summary`
- `relation_signal`
- `safety_copy`
- `unsafe_claim_free`

These are meant for admin and launch QA displays later.

## Internal-only rule

Completeness must not be displayed as a public quality badge. It does not mean the provider is approved, ranked, reviewed, recommended, available, or better than another provider.

It is only an internal signal for profile readiness and future index eligibility decisions.

## Follow-up

The next useful step is to consume this model in admin review screens and later fold it into profile index eligibility explanations without creating a public ranking surface.
