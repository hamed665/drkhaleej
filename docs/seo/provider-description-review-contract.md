# Provider description review contract

Provider-written description copy must not become public just because it exists. It needs a review status and a clean public-readiness check first.

The approved status is a publication permission for the text body only. It is not a provider ranking, regulator approval, clinical endorsement, booking promise, live availability promise, or insurance claim. Humanity has already produced enough overconfident marketing copy. We do not need to help.

## Status model

Provider description records use these statuses:

- `draft`
- `pending_review`
- `approved`
- `rejected`

Only `approved` copy can be considered for public rendering.

## Runtime helper

The helper lives at:

- `src/lib/catalog/provider-description-review.ts`

It exposes:

- `providerDescriptionReviewStatuses`
- `ProviderDescriptionReviewStatus`
- `ProviderDescriptionReviewRecord`
- `buildProviderDescriptionPublicReadiness(record)`
- `getApprovedProviderDescriptionBody(record)`
- `hasUnsafeProviderDescriptionClaim(value)`

The public-readiness result is explainable:

```ts
{
  public: boolean;
  reasons: Array<'not_approved' | 'empty_body' | 'unsafe_claim'>;
}
```

## Public rendering rule

A provider description can render publicly only when all of these are true:

- status is `approved`
- body is non-empty after trimming
- body does not include unsafe claim wording

Draft, pending review, and rejected descriptions must not render publicly.

## Out of scope

This contract does not add admin UI. It prepares the type and runtime boundary so a future admin workflow can safely create, submit, approve, or reject provider-written copy without accidentally publishing promotional claims.
