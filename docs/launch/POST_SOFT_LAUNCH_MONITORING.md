# DrKhaleej Post Soft Launch Monitoring

## Purpose

This checklist defines the first monitoring window after the controlled DrKhaleej soft launch.

The goal is to catch crawl, routing, mobile, form, and provider-profile issues before expanding indexable routes or importing a larger provider batch.

## First 24 hours

Check these at least twice during the first 24 hours:

- production homepage loads in English and Arabic
- `/robots.txt` loads
- `/sitemap.xml` loads
- `/llms.txt` loads
- launch-core category routes load
- preview routes remain noindex-controlled and sitemap-excluded
- primary navigation contains only launch-core route families
- mobile menu works
- language switch works
- provider CTA works
- public forms submit or fail safely
- 404 count is not increasing unexpectedly

## Search Console setup

After production deployment:

1. Add the production domain property.
2. Submit `/sitemap.xml`.
3. Inspect `/en/om` and `/ar/om`.
4. Inspect one launch-core category route.
5. Inspect one preview route and confirm noindex handling if URL inspection is available.
6. Record submitted URL count.
7. Record indexed URL count once available.

## Sitemap checks

Sitemap must include only:

- launch-core static URLs
- guarded imported provider profile URLs that pass existing publication gates

Sitemap must not include:

- search route
- query/filter URLs
- preview routes
- location pages
- article shell pages
- unreviewed provider profiles
- imported lab profiles
- imported center profiles

## Robots checks

Robots must:

- reference sitemap
- block internal operational paths already defined in `src/app/robots.ts`
- not block noindex preview routes that need crawlers to read page-level noindex metadata

## LLM-facing checks

`/llms.txt` must:

- list launch-core routes under index-ready public routes
- list preview routes separately
- keep provider details framed as directory facts
- avoid unsupported ranking, authority, availability, review, or verification claims

## Core Web Vitals baseline

Record a mobile and desktop baseline for:

- home
- doctors
- pharmacies
- hospitals
- services
- for-providers

Track:

- LCP
- INP
- CLS
- total JS transferred
- obvious mobile layout shifts
- first-fold readability

## User action tracking

Confirm basic tracking or server logs for:

- provider onboarding form submit
- callback/contact form submit
- WhatsApp clicks
- call clicks
- website clicks
- map/direction clicks

No paid placement, ranking, review, or rating metrics should be exposed publicly during this phase.

## Provider profile checks

For any guarded imported profile sample:

- page loads only when guard passes
- source is visible in user-facing copy
- last checked is visible
- contact/map signal is present when available
- raw canonical path is not displayed
- raw internal score is not displayed
- no review/rating/hours/availability schema is emitted unless separately approved

## Daily expansion decision

Do not expand indexable URLs until:

- 404s are stable
- sitemap output is verified
- no preview route is accidentally included in sitemap
- provider profile UI remains clean
- source and timestamp display are acceptable
- mobile first fold is acceptable
- manual smoke list passes

## First expansion candidates

Only after the monitoring window passes:

1. first reviewed provider batch expansion
2. pharmacy profile count increase
3. hospital profile count increase
4. doctor profile count increase
5. trust and source policy pages
6. low-risk informational guides
7. structured data contract promotion

Location/category composite pages remain blocked until their own threshold and promotion gates are completed.

## Incident note template

Use this format for any issue found after soft launch:

- timestamp
- route
- issue type
- user impact
- crawl/index impact
- suspected cause
- immediate action
- rollback needed: yes/no
- follow-up PR

## Stop expansion if

Stop any index expansion if:

- sitemap includes unexpected route families
- Search Console shows unexpected canonical conflicts
- preview routes are indexed
- public profile pages expose internal QA fields
- forms fail silently
- mobile first fold is broken
- route guards fail open
- unsupported public claims appear
