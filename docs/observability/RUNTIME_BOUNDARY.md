# DrKhaleej Runtime Boundary

## Purpose

This document defines the runtime boundary for future soft-launch observation work.

It is a planning and safety contract only. It does not add scripts, send events, change routes, change sitemap output, change metadata, change provider data, or change index behavior.

## Current state

Current runtime state:

- public action names are typed
- route-family and entity-family values are allowlisted
- action payload input can be validated in code
- no runtime recorder is active from this document
- no external destination is configured by this document

## Allowed first runtime step

The first implementation step may add a no-op recorder that:

- accepts only the typed public action payload contract
- validates input before creating a record
- returns a local result object
- avoids user identifiers
- avoids browser storage
- avoids cookies
- avoids outbound delivery
- avoids vendor-specific logic
- avoids route or sitemap changes

## Blocked first runtime step

The first implementation step must not:

- add third-party scripts
- add global browser objects
- send action data outside the app
- store action data locally
- add provider rankings or quality signals
- add review, rating, insurance, booking, or availability claims
- change public page copy
- change crawler-facing files
- change public index policy

## Allowed payload shape

The public action payload may contain only:

- action name from the approved list
- locale when known
- country when known
- route family when known
- entity family when known

The payload must not contain:

- names of people
- phone numbers
- email addresses
- free-text search content
- full URLs with query strings
- location coordinates
- medical details
- appointment details
- payment details

## Decision rule

A runtime implementation PR can proceed only when:

- the public action contract is used directly
- invalid payload input is rejected or safely ignored
- no external destination is introduced
- no persistence is introduced
- no public SEO behavior changes
- CI and focused soft-launch checks pass

## Future promotion path

Only after the no-op recorder is merged and verified should a future PR define delivery behavior.

That future PR must separately document:

- destination
- consent or privacy assumptions
- retention boundary
- payload fields
- failure behavior
- environment variables
- rollback path

## Stop rule

Stop runtime promotion if the implementation collects sensitive fields, sends data externally, stores user-level data, changes public route behavior, or creates unsupported public claims.
