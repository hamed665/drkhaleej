# DrMuscat Master Roadmap v1

Status: living roadmap.
Last updated: 2026-06-24.
Build mode: phased, staging-first, SEO-first.

## 1. Product goal

DrMuscat is an Oman-first healthcare discovery platform. The platform should help users find doctors, hospitals, pharmacies, clinics, laboratories, services, local areas, and care-navigation information.

The product goal is not just a public website. The goal is a controlled data, SEO, operations, trust, and monetization system.

## 2. Current merged foundation

The import pipeline currently includes:

- PR #329: Import Staging Foundation.
- PR #330: Spreadsheet Upload and Parser into Staging.
- PR #331: Import Row Normalization.

Current data path:

```text
Spreadsheet upload
→ parser
→ import_files
→ import_raw_rows
→ import_validation_issues
→ normalized_payload
→ quality flags
```

## 3. Non-negotiable product rules

- Raw imported data must never go directly public.
- Pages must not enter the sitemap until they are approved and index eligible.
- Public publishing must happen in reviewed batches, not uncontrolled mass output.
- Admin staging data, raw payloads, and internal notes must never appear on public pages.
- Scheduling, consultation, and transaction features remain deferred until the operating model is ready.
- Reviews, ratings, offers, and sponsored placements must be real, moderated, and clearly disclosed.
- Sensitive tool result pages should remain noindex.

## 4. Data lifecycle

```text
source file or source record
→ raw import staging
→ validation issues
→ normalized staging payload
→ duplicate candidates
→ admin review
→ public-safe projection
→ public noindex page
→ index eligibility gate
→ sitemap included page
```

## 5. Page status lifecycle

```text
draft
staged
normalized
duplicate_pending
review_pending
approved_for_projection
public_noindex
index_candidate
index_eligible
sitemap_included
archived
```

## 6. Index eligibility rules

A page can become `index_eligible` only when it has:

- admin approval
- duplicate status resolved
- quality score at or above threshold
- valid source or source name
- valid last checked date
- public-safe contact or directions
- canonical URL
- allowed robots policy
- schema eligibility check
- internal links
- enough visible content to avoid thin-page risk

## 7. Quality score model

Suggested score out of 100:

| Signal | Points |
|---|---:|
| Name / identity | 15 |
| Entity type | 10 |
| Location / area / wilayat | 15 |
| Phone, WhatsApp, or directions | 15 |
| Source | 10 |
| Last checked date | 5 |
| Services, specialty, or departments | 15 |
| Description | 5 |
| Approved media | 5 |
| Internal links | 5 |

Recommended states:

```text
0-39: blocked
40-59: needs_review
60-79: public_noindex candidate
80-100: index_eligible candidate
```

## 8. Immediate roadmap

### PR #332 — Duplicate Detection over Normalized Rows

Goal: create duplicate candidates from normalized staging rows.

Signals:

- normalized English and Arabic names
- external ID
- phone and WhatsApp numbers
- website URL
- Google Maps URL
- coordinates
- source URL
- license or registration fields when available
- area / wilayat / governorate

Output:

```text
import_duplicate_candidates
match_score
match_reason
resolution_status = pending
```

Must not merge, publish, delete, or approve records automatically.

### PR #333 — Admin Duplicate Resolution

Goal: allow admins to resolve duplicate candidates.

Statuses:

```text
same_entity
different_entity
needs_manual_review
ignored
```

Suggested UI:

```text
/admin/imports/[batchId]/duplicates
```

### PR #334 — Import Review Queue

Goal: allow admins to review normalized rows.

Statuses:

```text
needs_review
approved_for_projection
rejected
hold
needs_more_data
```

Each review row should show:

- raw payload summary
- normalized payload summary
- validation issues
- duplicate status
- source
- last checked date
- quality score
- admin note

### PR #335 — Public-safe Projection Foundation

Goal: move approved rows into a public-safe projection layer.

Projection must exclude raw payload, admin notes, private metadata, internal review fields, and blocked fields.

### PR #336 — Batch Publish as Public Noindex

Goal: generate visible public pages that remain noindex and excluded from sitemap until QA passes.

### PR #337 — Index Promotion Gate

Goal: promote only high-quality, resolved, approved pages to index candidates.

### PR #338 — Dynamic Sitemap for Approved Pages

Goal: include only `index_eligible` pages in sitemap.

Never include admin routes, staged rows, draft pages, noindex pages, duplicate-unresolved pages, low-quality pages, or sensitive result pages.

## 9. Public profile roadmap

### PR #339 — Doctor Profile V2

Doctor pages should include:

- names in English and Arabic when available
- specialty and subspecialty
- practice locations
- linked facility
- languages
- phone, WhatsApp, and directions when public-safe
- source and last checked date
- short description
- services
- related doctors, specialties, and areas
- correction or claim link
- schema only when eligible

### PR #340 — Facility Profile V2

Facility pages should support hospitals, clinics, medical centers, laboratories, and pharmacies.

Required blocks:

- identity
- type
- address and area
- contact and directions
- opening hours when available
- services or departments
- linked doctors when available
- verified insurance/payment notes when available
- source and last checked date
- approved media only
- related providers and areas

### PR #341 — Pharmacy Profile V1

Pharmacy-specific blocks:

- 24-hour flag if verified
- delivery flag if verified
- opening hours
- insurance/payment information when verified
- nearby clinics and hospitals
- nearby areas
- source and last checked date

### PR #342 — Hospital Profile V1

Hospital-specific blocks:

- emergency information when verified
- ICU and special units when available
- departments
- doctors
- insurance
- accreditation
- phone and directions
- accessibility and parking when available
- source and last checked date

### PR #343 — Laboratory Profile V1

Laboratory-specific blocks:

- test categories
- home sample collection if verified
- opening hours
- insurance/payment information
- directions
- nearby clinics
- source and last checked date

### PR #344 — Profile Completeness Engine

Compute missing fields and readiness for identity, contact, location, source, services, languages, media, description, internal links, and schema readiness.

## 10. Media roadmap

### PR #345 — Private Media Upload

Admin can upload media to private storage. Public visibility remains blocked until review.

Statuses:

```text
private
needs_review
approved_public_candidate
rejected
archived
```

### PR #346 — Image Optimization Pipeline

Generate optimized variants:

- original
- WebP
- AVIF
- thumbnail
- card image
- hero image
- gallery image

Required metadata:

- alt text in English and Arabic
- caption in English and Arabic
- rights status
- source
- review status

### PR #347 — Entity Media Assignment

Assign approved media to doctors, hospitals, pharmacies, clinics, laboratories, articles, and area pages.

## 11. Local SEO roadmap

### PR #348 — Area Data Pack

Each area should include English/Arabic names, wilayat, governorate, nearby areas, landmarks, access notes, available providers, popular specialties, source coverage, and last checked date.

### PR #349 — Area Page Template

Example routes:

```text
/en/om/areas/al-khoud
/ar/om/areas/al-khoud
```

Blocks: overview, providers, popular specialties, nearby pharmacies, nearby hospitals, nearby labs, FAQ, internal links, source and last checked date.

### PR #350 — Specialty Page Template

Example route:

```text
/en/om/centers/cardiology
```

Blocks: specialty overview, related services, doctors, centers, areas, FAQ, schema gate.

### PR #351 — Specialty plus Area Pages

Example route:

```text
/en/om/centers/cardiology/al-khoud
```

Index only when enough provider data and local content exist.

### PR #352 — Service Pages

Examples: blood test, ultrasound, dental cleaning, pediatric consultation, dermatology, MRI, vaccination.

Blocks: explanation, providers, availability, preparation notes, related providers, related specialties, FAQ.

### PR #353 — Service plus Area Pages

Example route:

```text
/en/om/services/blood-test/al-khoud
```

Only index when enough local data exists.

### PR #354 — Internal Linking Engine

Required link relationships:

```text
doctor → specialty
doctor → facility
doctor → area
facility → doctors
facility → services
area → specialties
service → providers
article → related providers
```

## 12. Search roadmap

### PR #355 — Real Search Backend

Support doctor name, facility name, specialty, service, area, language, and vertical filters.

### PR #356 — Search UX

Add search bar, filters, result cards, profile links, no-result suggestions, area suggestions, and specialty suggestions.

### PR #357 — Search Analytics

Track query, locale, country, filters, result count, clicked result, and zero-result searches.

## 13. Content roadmap

### PR #358 — Care Guide Content Model

Fields: title, summary, body sections, disclaimer, review status, source, last reviewed date, related providers, related services, related areas, FAQ, schema eligibility.

### PR #359 — Core Care Guides

Initial guide topics:

- finding a pediatrician in Muscat
- choosing a pharmacy nearby
- choosing an emergency care provider in Oman
- preparing for a blood test
- choosing a dental clinic
- women’s health clinic guide
- dermatology clinic guide
- vaccination guide

### PR #360 — Article Internal Linking

Articles should link to relevant providers, services, specialties, and areas.

## 14. Tools roadmap

### PR #361 — Assessment Engine

Allowed low-risk tools:

- health navigation
- specialist finder
- clinic selection guide
- laboratory preparation checklist
- pharmacy need checker
- wellbeing-lite tools
- career and talent tests

### PR #362 — Assessment Result Pages

Rules:

```text
noindex
not in sitemap
no ads on sensitive results
clear disclaimer
related guides
related provider search
```

### PR #363 — Talent and Career Tools

Tools: learning style, work style, creative/analytical/executive/social profile, career direction, team role.

## 15. Trust roadmap

### PR #364 — Real Reviews Foundation

Review fields: entity, rating, comment, moderation status, source/consent, report flag, created date.

### PR #365 — Correction System

Users can report wrong phone numbers, wrong locations, moved providers, closed providers, or wrong hours. Corrections go to admin review.

### PR #366 — Review Schema Gate

Review schema is allowed only for real, moderated, visible reviews.

## 16. Monetization roadmap

### PR #367 — Ad Slot Registry

Central ad slots: profile top, profile middle, profile bottom, search inline, area sidebar, article middle, pharmacy profile offer, hospital profile offer.

Rules: maximum three ads per page, sponsored label always visible, no ads on sensitive result pages.

### PR #368 — Direct Ads Campaigns

Campaign fields: advertiser, creative, target page/entity/area/specialty, start date, end date, status.

### PR #369 — House Ads

Internal campaigns: claim your profile, contact DrMuscat, featured guide, app coming soon.

### PR #370 — Offers Engine

Offer fields: title, description, provider, valid from/to, terms, review status, sponsored disclosure.

### PR #371 — AdSense Adapter

AdSense is fallback only and must use policy-safe placements.

### PR #372 — Commercial Analytics

Track ad impressions, ad clicks, provider page views, phone clicks, WhatsApp clicks, direction clicks, and offer clicks.

## 17. Monitoring and SEO operations roadmap

### PR #373 — Event Analytics Foundation

Track profile view, phone click, WhatsApp click, direction click, search, filter change, result click, article view, assessment started, assessment completed, ad impression, and ad click.

### PR #374 — Admin Monitoring Dashboard

Dashboard modules: import batches, failed rows, unresolved duplicates, low-quality pages, noindex pages, index-eligible pages, 404s, slow pages, top search queries, zero-result searches.

### PR #375 — SEO QA Dashboard

Show missing canonical, missing title, duplicate title, thin description, schema blocked, sitemap excluded, noindex count, and index-eligible count.

### PR #376 — GSC Integration or Manual Import

Support Search Console data by API or CSV import: clicks, impressions, CTR, position, page, query, country, device.

### PR #377 — Opportunity Engine

Suggest areas needing content, specialties with demand, zero-result queries needing content/provider data, and profiles needing enrichment.

## 18. Technical quality roadmap

### PR #378 — Performance Budget

Track LCP, CLS, image size, server response time, and route rendering mode.

### PR #379 — Accessibility Audit

Check labels, keyboard navigation, contrast, semantic headings, form errors, and filter accessibility.

### PR #380 — Security and RLS Hardening

Verify no public access to staging, no service-role import in client components, no raw payload on public pages, storage privacy, audit coverage, and admin-only mutations.

## 19. Launch roadmap

### PR #381 — Public Beta Gate

Beta criteria: search works, import dashboard works, correction queue works, analytics works, dynamic sitemap works, no raw payload public leak, no unapproved page indexed.

### PR #382 — First Controlled Index Batch

Start with 50 to 100 high-quality pages.

### PR #383 — Weekly Publishing Workflow

Workflow:

```text
select batch
quality filter
admin approval
publish noindex
QA
promote to index_eligible
include in sitemap
monitor
```

### PR #384 — 300 to 400 Pages per Cycle

After stability:

```text
every 5 to 7 days
300 to 400 reviewed pages
quality report required
```

## 20. Expansion roadmap

- PR #385: Clinics Import Template and Pipeline.
- PR #386: Laboratories Import Template and Pipeline.
- PR #387: Dental Vertical.
- PR #388: Beauty and Aesthetic Clinics.
- PR #389: Multi-country Adapter for GCC.

Future countries: UAE, Qatar, Bahrain, Saudi Arabia, Kuwait. Oman remains the first priority.

## 21. Business operations roadmap

- PR #390: Provider Claim Workflow.
- PR #391: Sales and CRM Pipeline.
- PR #392: Provider Dashboard Lite.

## 22. MVP definition

The MVP is reached when:

```text
spreadsheet upload works
rows normalize
duplicates are detected
admin can review
profiles can be generated as noindex
selected pages can become index_eligible
sitemap includes only approved pages
search works
profile pages show phone, WhatsApp, and directions
analytics tracks user actions
admin can monitor issues
```

Suggested MVP thresholds:

```text
500 staged records
200 normalized records
100 duplicate-reviewed records
50 public_noindex pages
30 index_eligible pages
0 critical SEO errors
0 public raw-data leaks
```

## 23. Immediate next sequence

```text
#332 Duplicate Detection over Normalized Rows
#333 Admin Duplicate Resolution
#334 Import Review Queue
#335 Public-safe Projection
#336 Batch Publish Noindex
#337 Index Promotion Gate
#338 Dynamic Sitemap
#339 Doctor Profile V2
#340 Facility Profile V2
#341 Pharmacy Profile V1
#342 Hospital Profile V1
#343 Laboratory Profile V1
#344 Profile Completeness Engine
```

## 24. Strategic outcome

The final system should become:

```text
a controlled import pipeline
an admin-reviewed healthcare data system
a scalable Oman local SEO engine
trusted public provider profiles
real search and discovery
monitoring and quality dashboards
direct monetization infrastructure
future GCC expansion foundation
```
