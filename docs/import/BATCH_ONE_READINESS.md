# DrKhaleej Batch One Readiness

## Purpose

This document defines the readiness gate for the first reviewed provider batch after the controlled soft launch.

No import row should become indexable only because it exists. A provider must be reviewed, source-backed, location-backed, contact-backed, and reversible before it can enter the public index path.

## Batch one scope

Batch one should stay small and defensible:

- doctors: 15 to 30 reviewed profiles
- pharmacies: 20 to 30 reviewed profiles
- hospitals: 10 to 20 reviewed profiles

The total batch should target 50 to 80 high-confidence public profiles unless the reviewed source set is smaller. A smaller clean batch is better than a larger weak batch.

## Required fields per provider

Each provider row must have:

- stable entity type
- canonical slug
- English name
- Arabic name if available
- provider family
- country code `om`
- governorate or wilayat signal
- area signal if known
- public contact, website, map, or direction signal
- source name or source URL
- reviewed timestamp
- reviewer note or review marker
- confidence marker
- import candidate id
- intended canonical path

## Source requirements

A provider is batch-ready only when at least one reviewed public source exists.

Preferred source pattern:

- official provider site, or
- public map/listing source plus reviewed contact/location match

A provider must not be promoted if source and location disagree and the conflict is unresolved.

## Canonical requirements

Canonical path must be exact and family-specific:

- doctor: `/en/om/doctor/{slug}` and `/ar/om/doctor/{slug}`
- pharmacy: `/en/om/pharmacies/{slug}` and `/ar/om/pharmacies/{slug}`
- hospital: `/en/om/hospitals/{slug}` and `/ar/om/hospitals/{slug}`

Slug collisions must be resolved before queue promotion.

## Public UI requirements

Public profile UI must show:

- provider name
- location summary
- last checked or reviewed timestamp
- source summary
- contact/map actions when available
- user-facing confirmation note

Public profile UI must not show:

- raw canonical path
- raw internal score
- unsupported ranking claim
- unsupported availability claim
- unsupported review or rating claim

## Sitemap requirements

A provider can enter sitemap output only when:

- candidate status is approved
- queue status allows index
- sitemap policy is included
- canonical path is exact
- source evidence exists
- local Oman geo signal exists
- contact/map signal exists
- family cap is not exceeded
- smoke validation passes

## Rollback requirements

Every batch must be reversible.

Rollback must support:

- removing affected entries from sitemap output
- changing queue rows away from index-eligible state
- keeping candidate rows for review
- recording the rollback reason
- re-running sitemap and smoke checks

## Batch one dry-run report

Before public promotion, produce a dry-run report with:

- total candidates
- accepted candidates
- rejected candidates
- duplicate count
- slug collision count
- missing source count
- missing location count
- missing contact/map count
- unresolved conflict count
- expected sitemap URL count

## Go criteria

Batch one may be promoted only when:

- dry-run report is clean
- duplicate and slug collision count is zero
- every promoted row has source and reviewed timestamp
- every promoted row has location signal
- every promoted row has contact/map signal
- profile routes pass smoke validation
- sitemap output contains only expected provider URLs
- rollback steps are documented

## Stop criteria

Stop batch promotion if:

- any provider source is unclear
- any provider location is disputed
- any provider slug collision remains
- any provider lacks contact/map signal
- any provider profile exposes raw internal QA fields
- sitemap includes an unexpected route family
- profile smoke validation fails

## Next PR boundary

This document does not import data, change queue rows, change sitemap behavior, or promote any URL.

The next implementation PR should add or update the batch-one dry-run manifest and report without publishing the batch.
