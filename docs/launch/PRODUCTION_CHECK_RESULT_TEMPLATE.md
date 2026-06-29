# DrKhaleej Production Check Result Template

## Purpose

Use this template after a production deploy to record the controlled soft-launch result.

This document is a record template only. It does not change route behavior, sitemap behavior, metadata, provider data, import queues, or indexability.

## Deploy metadata

| Field | Value |
| --- | --- |
| Date |  |
| Production commit |  |
| Deploy target |  |
| Reviewer |  |
| Result | `go`, `hold`, or `rollback` |
| Follow-up PR |  |

## Required checks

| Check | Result | Notes |
| --- | --- | --- |
| DrKhaleej CI |  |  |
| Soft Launch Check |  |  |
| Main Status Doc Check |  |  |
| Noindex Preview Structured Data Guard |  |  |
| Provider Schema Disabled Guard |  |  |
| Vercel production deploy |  |  |

## Public files

| File | Expected | Result | Notes |
| --- | --- | --- | --- |
| `/robots.txt` | loads and references sitemap |  |  |
| `/sitemap.xml` | loads with allowed URL families only |  |  |
| `/llms.txt` | loads and matches launch route policy |  |  |

## Launch-core route checks

| Route | Expected | Result | Notes |
| --- | --- | --- | --- |
| `/en/om` | loads |  |  |
| `/ar/om` | loads |  |  |
| `/en/om/doctors` | loads |  |  |
| `/ar/om/doctors` | loads |  |  |
| `/en/om/centers` | loads |  |  |
| `/ar/om/centers` | loads |  |  |
| `/en/om/labs` | loads |  |  |
| `/ar/om/labs` | loads |  |  |
| `/en/om/pharmacies` | loads |  |  |
| `/ar/om/pharmacies` | loads |  |  |
| `/en/om/hospitals` | loads |  |  |
| `/ar/om/hospitals` | loads |  |  |
| `/en/om/services` | loads |  |  |
| `/ar/om/services` | loads |  |  |
| `/en/om/for-providers` | loads |  |  |
| `/ar/om/for-providers` | loads |  |  |

## Preview route checks

| Route family | Expected | Result | Notes |
| --- | --- | --- | --- |
| search | noindex and sitemap-excluded |  |  |
| dental | noindex and sitemap-excluded |  |  |
| beauty | noindex and sitemap-excluded |  |  |
| offers | noindex and sitemap-excluded |  |  |
| pet clinics | noindex and sitemap-excluded |  |  |
| pet shops | noindex and sitemap-excluded |  |  |
| location pages | noindex and sitemap-excluded |  |  |

## Navigation checks

| Area | Expected | Result | Notes |
| --- | --- | --- | --- |
| Header | launch-core route families only |  |  |
| Footer | launch-core route families only |  |  |
| Mobile menu | opens, closes, and keeps launch-core route families only |  |  |
| Language switch | works on launch-core pages |  |  |

## Provider profile sample checks

| Sample URL | Family | Guarded load | Source visible | Last checked visible | Contact/map visible | No raw implementation fields | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | doctor |  |  |  |  |  |  |
|  | pharmacy |  |  |  |  |  |  |
|  | hospital |  |  |  |  |  |  |

## Action checks

| Action | Expected | Result | Notes |
| --- | --- | --- | --- |
| Search submit | safe route state |  |  |
| Provider form submit | submits or fails visibly |  |  |
| Contact form submit | submits or fails visibly |  |  |
| WhatsApp click | opens expected target |  |  |
| Call click | opens expected target |  |  |
| Map/direction click | opens expected target |  |  |

## Decision

Use `go` only when launch-core routes, public files, navigation, preview exclusions, and provider profile samples pass.

Use `hold` when a non-critical issue needs a follow-up PR before promotion.

Use `rollback` when a public route, sitemap, metadata, or guarded profile behavior violates the soft-launch policy.

Final decision:

Reviewer note:

Follow-up PR:
