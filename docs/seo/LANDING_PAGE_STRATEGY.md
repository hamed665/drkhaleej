# Landing Page Strategy

## 1. Status and Authority

This document is documentation-only for SEO-D1. It does not authorize implementation, route creation, page generation, page scaffolds, sitemap inclusion, schema output, CMS publishing, keyword-driven page generation, database imports, seed rows, medical content publication, API handlers, UI changes, migrations, RLS changes, validators, analytics events, crawlers, background jobs, AI chat, provider dashboards, branded hospital pages, payment logic, monetization logic, sponsored placement, boosts, or ranking logic.

Future Service / Area / Specialty landing page route families remain `future_approval_required`. Keyword data is planning data only. Keyword `target_url_pattern` and `route_status` values do not authorize route or page generation.

If this document conflicts with V10.4 master-spec files, current repo state, route checks, SEO-A, SEO-B, SEO-C, or stricter guardrails, the stricter/canonical guardrail wins. Future implementation requires separate `PHASED_BUILD_ONLY` tasks with four-axis mapping, allowed files, forbidden scope, validation, and human approval.

Medical content requires human approval before publication. Persian and Hindi public SEO routes remain forbidden. Approved launch locales are `en` and `ar`. Approved launch country is `om`. The plural doctor detail route `/[locale]/[country]/doctors/[doctorSlug]` remains forbidden. The approved doctor detail route remains `/[locale]/[country]/doctor/[doctorSlug]`.

No hidden AI-only content is allowed. If schema output is ever approved later, schema must match visible user-facing content.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only planning for SEO-D1
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D1

## 3. Relationship to SEO-A, SEO-B, and SEO-C

SEO-D1 builds on the earlier SEO planning documents without expanding their authority.

- SEO-A established SEO/GEO/AI-search foundations as documentation-only planning.
- SEO-B normalized keyword seed data as planning data only, not as seed data, database data, route authorization, page generation approval, sitemap approval, or CMS approval.
- SEO-C defined canonical URL strategy and the SEO route contract. SEO-C marks future landing page route families as `future_approval_required`, not approved.

SEO-D1 therefore defines future strategy only. It does not convert keyword rows, target URL hints, spreadsheet metadata, route-status fields, or planning clusters into implementation approval.

## 4. Why SEO-D Starts as Documentation-Only

SEO-D starts as documentation-only because Service / Area / Specialty landing pages have high route-contract, thin-content, medical-safety, and programmatic-SEO risk.

The future route families under discussion multiply quickly across specialties, services, and areas. Without explicit quality gates, provider-count rules, canonical rules, medical review, and sitemap/noindex logic, these pages could create thin pages, duplicate canonical intent, unsafe medical claims, unsupported local claims, or pages generated from keywords rather than real visible public data.

Documentation-first sequencing keeps the current route contract intact and ensures that later implementation can be split safely into route scaffolds, quality/noindex logic, and sitemap/schema work only if each step is separately approved.

## 5. Future Landing Page Families

The following families are planning-only and remain `future_approval_required`:

| Page family | Future route family | Current SEO-D1 status |
| --- | --- | --- |
| Specialty pages | `/[locale]/[country]/centers/[specialtySlug]` | `future_approval_required` |
| Specialty + area pages | `/[locale]/[country]/centers/[specialtySlug]/[areaSlug]` | `future_approval_required` |
| Area pages | `/[locale]/[country]/areas/[areaSlug]` | `future_approval_required` |
| Service pages | `/[locale]/[country]/services/[serviceSlug]` | `future_approval_required` |
| Service + area pages | `/[locale]/[country]/services/[serviceSlug]/[areaSlug]` | `future_approval_required` |

These families must not be implemented, linked for SEO purposes, included in sitemap output, exposed in schema, published through CMS records, or generated from keyword data until a later approved task explicitly authorizes the specific scope.

## 6. Strategy for Specialty Pages

Specialty pages may later help users discover centers and providers associated with a specialty in Oman. A future specialty page should:

- use a real approved specialty entity;
- show a visible specialty summary that avoids treatment advice unless medically reviewed;
- list only visible public providers/centers allowed by public RLS and current public catalog rules;
- link only to approved canonical center and doctor detail routes;
- avoid invented rankings, reviews, prices, availability, guarantees, or verification claims;
- remain noindex or blocked when provider count, unique content, entity clarity, or human review gates fail.

The specialty page canonical family, if later approved, should be `/[locale]/[country]/centers/[specialtySlug]`. It must not compete with doctor listing, center listing, service listing, deprecated shortcut, or plural doctor detail patterns.

## 7. Strategy for Specialty + Area Pages

Specialty + area pages may later support local-provider queries such as a specialty in a specific Muscat/Oman area. A future specialty + area page should:

- use a real specialty and a real approved area entity;
- require visible public providers/centers in the exact specialty-area combination;
- include local relevance based on public catalog data, not generic filler;
- avoid deprecated shortcut routes such as `/en/dentist/al-khuwair`;
- use one canonical family only: `/[locale]/[country]/centers/[specialtySlug]/[areaSlug]` if later approved;
- default to noindex or blocked when the exact combination is thin or ambiguous.

These pages are high-risk for programmatic thin content and must not be generated across all keyword combinations.

## 8. Strategy for Area Pages

Area pages may later explain healthcare discovery in an Oman area. A future area page should:

- use a real approved Oman area entity;
- provide visible local context supported by public data;
- summarize available public categories only when provider/category density supports the page;
- link to approved doctors, centers, services, and future approved landing pages only when quality gates pass;
- avoid invented population facts, facility counts, rankings, ratings, or availability claims;
- remain noindex when the area has insufficient visible public catalog density or lacks unique localized content.

The area page route family, if later approved, should be `/[locale]/[country]/areas/[areaSlug]`.

## 9. Strategy for Service Pages

Service pages are more medically sensitive than pure specialty or area pages. A future service page should:

- use a real approved public service entity;
- describe the service only with human-reviewed copy when medical claims, procedure explanations, risks, preparation, recovery, eligibility, pricing, or safety context appears;
- list only visible public providers/centers offering the service when public data supports that relationship;
- avoid diagnosis, prescription advice, treatment instructions, guaranteed outcomes, invented prices, invented reviews, and unsupported claims;
- remain noindex or blocked when human review, provider count, or unique content gates fail.

The service page route family, if later approved, should be `/[locale]/[country]/services/[serviceSlug]`.

## 10. Strategy for Service + Area Pages

Service + area pages have the highest thin-page risk because combinations multiply quickly. A future service + area page should:

- use a real approved service and real approved area;
- require visible public providers/centers in the exact service-area combination;
- include a unique local intro and visible local context;
- require human review where service copy includes medical claims;
- avoid generating pages solely because keyword rows exist;
- default to noindex or blocked when provider count, local relevance, or medical review is insufficient.

The service + area route family, if later approved, should be `/[locale]/[country]/services/[serviceSlug]/[areaSlug]`.

## 11. Internal Linking Strategy

Future internal linking must preserve the current route contract and canonical URL strategy.

Internal links may point only to approved canonical public routes. Future SEO-D links must not point to blocked routes, unsupported locale/country routes, deprecated shortcut patterns, localized admin routes, API routes, provider-private routes, or plural doctor detail routes.

No SEO-purpose links should point to noindex landing pages unless a future user-navigation scope explicitly approves those links for non-SEO navigation. If noindex pages are linked for user navigation later, they must be excluded from sitemap and must not be treated as crawl/index targets.

Candidate future linking paths, if separately approved, include:

- approved centers listing to approved specialty pages;
- approved specialty pages to approved specialty + area pages that pass quality gates;
- approved services listing to approved service pages;
- approved service pages to approved service + area pages that pass quality gates;
- approved area pages to approved center, doctor, service, and landing-page families that pass quality gates.

## 12. Keyword-to-Page Planning Model

`data/seo/drmuscat-keyword-seed.json` may be used only as planning data. No keyword row authorizes page generation, route creation, sitemap inclusion, schema output, CMS publishing, seed rows, database import, or medical content publication.

Planning cluster mapping:

| Keyword cluster | Candidate future page family | Planning-only notes |
| --- | --- | --- |
| `specialty_area` | `/[locale]/[country]/centers/[specialtySlug]/[areaSlug]` | Requires exact entity mapping, provider count, local relevance, and route approval. |
| `service_discovery` | `/[locale]/[country]/services/[serviceSlug]` | Requires approved service entity and human-reviewed service copy where medical claims appear. |
| `area_discovery` | `/[locale]/[country]/areas/[areaSlug]` | Requires approved area entity and enough public catalog density. |
| `specialty_discovery` | `/[locale]/[country]/centers/[specialtySlug]` | Requires approved specialty entity and visible providers/centers. |
| `condition_symptom`, `cost_pricing`, `comparison`, `insurance`, `branded`, `competitor` | Not SEO-D landing pages by default | Requires separate future review and may be blocked/noindex due to medical, legal, or compliance risk. |

Keyword `target_url_pattern` and `route_status` values remain non-authorizing planning metadata.

## 13. AI-Search / GEO Content Structure

Future approved landing pages should be answer-ready through visible user-facing structure only:

- Visible summary: concise summary near the top of the page based on visible approved public content.
- Entity facts: clear identification of the specialty, service, area, center, doctor, and platform entity relationships.
- Local context: Oman/Muscat/area relevance grounded in real public catalog data.
- Updated/reviewed date rules: distinguish last updated, data verified, and medically reviewed dates where applicable; dates must not be faked.
- No hidden AI-only content: any AI/LLM summary or answer-ready block must be visible to users and omitted when content is thin, unsupported, unapproved, or compliance-sensitive.

AI-search readiness is discoverability planning only. It does not authorize AI diagnosis, AI chat, automated medical advice, crawlers, analytics tables, or hidden bot-specific content.

## 14. Medical and Branded Search Safety

Medical service, symptom, condition, emergency, cost, comparison, insurance, and commercial healthcare content requires human approval before publication. Future landing pages must not publish diagnosis, prescription advice, treatment instructions, guaranteed outcomes, invented prices, invented reviews, fake availability, or unsupported medical claims.

Branded hospital/clinic pages, competitor-like pages, and brand-sensitive landing pages remain outside SEO-D1 and require separate legal, ethical, compliance, route, and human approval before any implementation.

## 15. Explicitly Out of Scope

SEO-D1 does not approve or implement:

- routes, page files, layouts, loading/error/not-found files, or public SEO pages;
- sitemap, robots, `llms.txt`, schema, metadata, or hreflang changes;
- CMS records, seed rows, keyword imports, or database changes;
- API handlers, server actions, validators, RLS changes, route checks, or generated Supabase type changes;
- UI components, business logic, provider dashboards, admin mutations, analytics, crawlers, background jobs, or AI chat;
- article routes, branded hospital pages, Persian/Hindi public routes, GCC expansion, payment, monetization, sponsored placement, boosts, or ranking logic.

## 16. Future Approval Requirements

Any future implementation requires a separate `PHASED_BUILD_ONLY` task with:

- four-axis mapping;
- exact allowed files and forbidden files;
- route impact and route-check impact;
- data source authorization;
- RLS/security impact;
- indexability/noindex behavior;
- sitemap, robots, `llms.txt`, and schema impact;
- medical and branded-search review requirements;
- validation commands;
- human approval checkpoints;
- stop conditions for ambiguity, route conflict, schema conflict, failed commands, private-data exposure, or medical-safety risk.
