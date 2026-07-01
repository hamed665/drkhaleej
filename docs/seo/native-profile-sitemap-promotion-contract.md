# Native profile sitemap promotion contract

This contract defines the future promotion gate for native doctor and center profile sitemap inclusion.

It does not enable native profile sitemap expansion.

## Scope

Native doctor and center profiles may be considered for sitemap inclusion only after a separate promotion workflow exists.

The current sitemap boundary remains closed for native doctor and center profile expansion.

## Required promotion signals

A native profile promotion decision must require:

- public profile index eligibility is eligible
- profile completeness is accepted by the launch rule
- reviewed promotion evidence exists
- the profile is not an imported preview
- the canonical path is a safe native doctor or center path
- family caps allow inclusion
- deterministic ordering exists

## Explicit non-goals

This contract does not approve:

- native profile bulk expansion
- query or filter URLs
- preview URLs
- admin URLs
- provider dashboard URLs
- booking URLs
- insurance URLs
- rating schema
- review schema
- imported profile promotion through the native profile path
- random ordering

## Helper

The helper lives at:

- `src/lib/seo/native-profile-sitemap-promotion.ts`

It returns an explainable decision with `eligible` and `reasons`.

Reasons include:

- `not_index_eligible`
- `completeness_not_accepted`
- `missing_reviewed_promotion_evidence`
- `imported_preview`
- `unsafe_canonical_path`
- `family_cap_exceeded`
- `missing_deterministic_order_key`

## Current sitemap rule

src/app/sitemap.ts must not import or call this helper yet.

The sitemap continues to use only static SEO page definitions plus reviewed import sitemap entries.

A later PR may wire this helper into a promotion source, but that PR must update the sitemap boundary guard deliberately and must not add massive expansion.
