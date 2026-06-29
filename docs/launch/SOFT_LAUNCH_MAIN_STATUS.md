# DrKhaleej Soft Launch Main Status

## Purpose

This document records the current main-branch state for the controlled DrKhaleej soft launch.

It is a status note only. It does not change routes, metadata, sitemap behavior, provider data, import queues, or public indexability.

## Current state

Main now has the core soft-launch guardrails required before production smoke testing:

- launch source-of-truth docs
- public surface policy
- soft launch checklist and rollback plan
- soft launch deploy marker
- production check result template
- post soft-launch monitoring checklist
- observability readiness plan
- public action-name contract
- batch-one readiness plan
- batch-one review sheet
- source policy page contract
- source policy noindex page shell
- app shell semantic cleanup
- primary navigation allowlist
- footer navigation allowlist
- noindex preview structured-data guard
- provider schema disabled guard
- soft launch check workflow
- main status doc check workflow
- source policy contract check workflow
- batch-one review sheet check workflow
- imported provider public UI cleanup for doctor, pharmacy, and hospital profile routes

## Crawler and index policy

The intended soft-launch crawler policy remains:

- sitemap is an allowlist
- launch-core routes may be sitemap eligible when the registry says they are ready
- search and preview routes stay out of sitemap
- source-policy exists as a noindex page shell and stays sitemap-excluded
- location pages stay noindex and sitemap-excluded
- preview routes must not emit JSON-LD
- provider profile routes must not emit provider schema before a dedicated promotion PR
- preview routes should not be blocked in robots when page-level noindex must be readable

## Launch-core public routes

The launch-core static route families remain:

- country root
- doctors
- centers
- labs
- pharmacies
- hospitals
- services
- for-providers

## Preview and utility route families

The following route families remain excluded from sitemap and broad index promotion:

- search
- dental
- beauty
- offers
- pet clinics
- pet shops
- articles
- source policy
- location pages
- location/category composite pages

## Provider profile policy

Imported doctor, pharmacy, and hospital profile routes may render only through existing guards and queue checks.

Public profile body must not expose raw implementation-only fields such as visible canonical path rows or raw internal scoring values.

Canonical correctness remains required, but it should be verified through metadata, sitemap diff, and route inspection rather than printed as a normal public profile row.

Provider schema remains disabled until a dedicated provider schema promotion PR approves the exact schema contract.

## Observability status

Soft-launch monitoring is documented but runtime instrumentation is not yet implemented in this status note.

Before expanding indexable URLs, confirm:

- Search Console property exists
- sitemap has been submitted
- 404s are monitored
- route family checks are recorded
- Core Web Vitals baseline is recorded
- provider action tracking is planned or implemented separately

## Batch-one status

Batch-one readiness planning and the first review sheet template are documented.

No batch-one import has been promoted by this status note.

The next data step should be filling the review sheet against a frozen dry-run set only. Public promotion should remain blocked until the review sheet, profile smoke checks, sitemap diff, and rollback owner all agree.

## Source policy status

The source-policy page shell exists, but it remains noindex and sitemap-excluded.

The page explains source, correction, sponsored visibility, and confirmation boundaries. It must not be treated as an index-ready policy page until a future PR explicitly promotes it through route registry, sitemap, metadata, llms.txt, and smoke review.

## Current merge hygiene

At the time this note was created:

- no open pull requests were intentionally left as part of the soft-launch path
- all merged soft-launch PRs were intended to keep runtime behavior controlled
- latest checked main status had a successful Vercel status

## Next recommended PRs

Recommended next PR order:

1. Fill batch-one review sheet against a frozen dry-run set.
2. Runtime-safe observability instrumentation contract.
3. Production smoke result note after actual deployment.
4. First provider batch dry-run report.
5. Source policy page promotion decision if production smoke passes.
6. Structured data disabled-first provider contract expansion.

## Stop expansion if

Stop any further index expansion if:

- sitemap contains preview or utility route families
- source-policy appears in sitemap before explicit promotion
- preview route emits JSON-LD
- provider route emits provider schema before explicit promotion
- location route becomes sitemap eligible without explicit promotion
- provider profile renders without guard pass
- provider profile body exposes implementation-only fields
- route registry and llms.txt disagree
- CI or focused launch workflow fails
