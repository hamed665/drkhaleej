# DrKhaleej Source Policy Page Contract

## Purpose

This contract defines the rules for future public trust, source, and editorial policy pages.

It is documentation only. It does not add public routes, sitemap entries, metadata, database rows, import behavior, or index promotion.

## Allowed page goals

Future public policy pages may explain:

- what DrKhaleej is
- what DrKhaleej is not
- how public directory information is collected
- how source review works
- how providers can request corrections
- how users should confirm details
- how sponsored visibility is separated from directory facts

## Required public wording boundaries

Future policy pages must state that DrKhaleej is:

- a public discovery directory
- not a healthcare provider
- not a regulator
- not an insurer
- not a booking guarantee
- not an emergency service
- not a diagnosis or treatment tool

## Source policy

Provider and facility details should be based on reviewed public sources or reviewed provider-submitted information.

A source policy page may describe source categories, but it must not claim that every listing is officially verified unless that exact verification process exists and is documented.

## Correction policy

Future public pages should give a clear way to request corrections.

Correction copy should ask users or providers to share:

- provider or facility name
- affected URL
- field needing correction
- supporting source or explanation
- contact details for follow-up

## Sponsored visibility policy

Future public pages may describe sponsored visibility only if the copy stays clear that sponsored placement does not change the directory facts displayed on a provider profile.

Sponsored copy must not imply ranking, endorsement, official recommendation, clinical quality, or outcome superiority.

## Structured data policy

Future policy pages must not add provider schema, review schema, rating schema, opening-hours schema, or medical claim schema unless a dedicated schema promotion PR approves it.

## Sitemap policy

Future policy pages must not enter sitemap output by accident.

A policy page can become index-ready only through an explicit route registry and sitemap decision.

## LLM-facing policy

If future policy pages are referenced in `public/llms.txt`, the LLM-facing text must preserve the same boundaries:

- directory facts only
- no provider ranking claims
- no official verification claims without source-backed process
- no diagnosis, treatment, emergency, insurance, or booking claims

## Promotion requirements

A future public policy route PR must include:

1. route file
2. metadata decision
3. sitemap decision
4. robots/noindex decision
5. `llms.txt` decision
6. visible user-facing disclaimer
7. no unsupported claims
8. rollback note
9. validator or focused check update

## Stop rule

Stop a future policy-page promotion if the page makes unsupported authority, ranking, verification, availability, insurance, booking, emergency, diagnosis, treatment, or outcome claims.
