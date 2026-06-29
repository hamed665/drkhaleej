# Provider Publication Contract

This document defines the future provider publication workflow contract.

## Purpose

Provider publication is the first workflow that may make a reviewed provider publicly active.

Everything before this workflow remains admin readiness only. Draft creation, draft edit, location review, quality review, taxonomy review, contact visibility review, verification review, claim, billing, and sponsorship must remain separate workflows.

## Required publication checks

A center may be published only when all required checks pass:

- the center exists and is not deleted
- the center is still in a reviewed pre-public workflow state
- the center status is not already active
- verification has been reviewed and is not rejected or suspended
- at least one internally active location exists
- taxonomy assignment passes the approved taxonomy requirements
- quality blockers equal zero
- public copy does not include unsupported medical, rating, verified, booking, open-now, insurance, best, sponsor, or claim language

Contact visibility is optional for publication. A center may be published without public contact actions when contact review is not approved yet.

## Allowed side effects

Only the provider publication workflow may:

- set center status to active
- set public active flags required by the approved publication gate
- revalidate the admin draft center detail page
- revalidate the approved public center detail route
- revalidate sitemap only after the publication gate passes

## Forbidden side effects

The publication workflow must not change contact visibility review flags, verification status, claim status, billing, sponsorship, commercial add-ons, media review state, taxonomy assignments, or location candidate review state.

The workflow must not publish doctors, pharmacies, hospitals, articles, offers, or other entity types unless a separate entity publication contract approves them.

## Audit

Every successful publication action must write an admin audit event.

The audit event must record:

- the center id
- the previous status
- the new status
- the readiness evidence summary
- the published route path
- whether sitemap revalidation was requested

## Rollback and deactivate

Rollback, unpublish, and deactivate must be separate workflows.

A later rollback workflow must define:

- who may deactivate a published provider
- which public routes are revalidated
- whether sitemap is revalidated
- what audit evidence is required
- whether contact visibility flags stay prepared or are revoked

## Readiness checker

Before a publish action exists, the next implementation step must be a read-only publication readiness checker.

The readiness checker may return:

- `canPublish`
- blockers
- warnings
- evidence summary

It must not mutate database state and must not revalidate public routes or sitemap.
