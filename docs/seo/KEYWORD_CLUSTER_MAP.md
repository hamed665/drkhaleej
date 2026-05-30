# Keyword Cluster Map

## 1. Status and Authority

This document is documentation/data-only. It does not authorize implementation, product features, routes, migrations, API handlers, UI changes, business logic, schema output, sitemap changes, robots changes, `llms.txt`, analytics events, crawlers, background jobs, AI chat, CMS records, public SEO pages, provider pages, branded hospital pages, article routes, or programmatic pages.

The SEO-B keyword JSON is planning data only. It is not seed data, not database data, not route authorization, not page generation approval, not sitemap approval, not CMS publishing approval, and not medical content approval.

V10.4 master-spec files and stricter guardrails win on conflict. Future implementation requires a separate `PHASED_BUILD_ONLY` task with four-axis mapping, allowed files, forbidden scope, validation, and human approval. Keyword entries do not authorize route/page/article/CMS/schema/sitemap generation. Medical content requires human approval before publication.

Approved launch languages are English and Arabic only. Approved launch country is Oman only. Persian/Hindi public SEO routes remain forbidden unless explicitly approved. Unsupported locales/countries must not create public SEO targets.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-and-data planning only
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-B

## 3. Cluster Taxonomy Overview

| Cluster | Planning meaning |
| --- | --- |
| `specialty_discovery` | Specialty-level discovery research only. |
| `service_discovery` | Service, lab, device, drug, wellness, or topic research only. |
| `area_discovery` | Area/locality planning only. |
| `specialty_area` | Specialty plus area planning only. |
| `provider_discovery` | Future provider-discovery research only; no provider page approval. |
| `center_discovery` | Future center/clinic discovery research only; no branded hospital/clinic page approval. |
| `cost_pricing` | Cost/pricing interest; requires human review and source/freshness rules before publication. |
| `comparison` | Comparison/ranking interest; requires review to avoid unsupported recommendations. |
| `branded` | Brand-like query handling; legal/ethical review required before public targeting. |
| `competitor` | Competitor-like query handling; research only unless separately approved. |
| `insurance` | Insurance-network planning; requires approved source and freshness rules. |
| `appointment` | Appointment-intent planning; does not approve booking features. |
| `urgent_emergency` | Urgent/emergency planning; blocked until review. |
| `condition_symptom` | Symptom/condition planning; human medical review required. |
| `ai_answer_candidate` | Future answer-engine candidate planning only. |
| `unsupported_locale_research` | Unsupported-language research notes only; no public SEO target. |
| `unsupported_country_research` | Unsupported-country research notes only; no public SEO target. |

## 4. Cluster-to-Intent Mapping

| Cluster | Typical intents |
| --- | --- |
| `specialty_discovery` | `discovery`, `commercial_provider` |
| `service_discovery` | `service_information`, `commercial_provider` |
| `area_discovery` | `discovery`, `local_provider` |
| `specialty_area` | `local_provider`, `commercial_provider` |
| `provider_discovery` | `local_provider`, `commercial_provider` |
| `center_discovery` | `local_provider`, `commercial_provider` |
| `cost_pricing` | `cost` |
| `comparison` | `comparison` |
| `branded` | `branded` |
| `competitor` | `comparison`, `branded` |
| `insurance` | `insurance`, `commercial_provider` |
| `appointment` | `appointment`, `commercial_provider` |
| `urgent_emergency` | `emergency_or_urgent` |
| `condition_symptom` | `symptom_or_condition` |
| `ai_answer_candidate` | `service_information`, `discovery` |
| `unsupported_locale_research` | Any intent as research only. |
| `unsupported_country_research` | Any intent as research only. |

Supported intents are `discovery`, `local_provider`, `cost`, `comparison`, `branded`, `service_information`, `symptom_or_condition`, `insurance`, `appointment`, `emergency_or_urgent`, and `commercial_provider`.

## 5. Cluster-to-Entity-Type Mapping

| Cluster | Conservative entity type guidance |
| --- | --- |
| `specialty_discovery` | `specialty` or `planning_topic` |
| `service_discovery` | `service`, `lab_or_imaging_service`, `medical_device_research`, or `pharmacy_product_research` |
| `area_discovery` | `local_information` |
| `specialty_area` | `specialty_area` |
| `provider_discovery` | `provider_research` only; no invented providers. |
| `center_discovery` | `center_category` only; no invented clinics/hospitals. |
| `cost_pricing` | `medical_topic` |
| `comparison` | `planning_topic` |
| `branded` | `brand_research` |
| `competitor` | `competitor_research` |
| `insurance` | `insurance_network` |
| `appointment` | `appointment_intent` |
| `urgent_emergency` | `urgent_medical_topic` |
| `condition_symptom` | `medical_topic` |
| `ai_answer_candidate` | `planning_topic` |
| `unsupported_locale_research` | `unsupported_locale_research` |
| `unsupported_country_research` | `unsupported_country_research` |

## 6. Cluster-to-Medical-Safety Mapping

| Cluster | Default safety |
| --- | --- |
| `specialty_discovery` | `medium` for healthcare commercial terms. |
| `service_discovery` | `medium` or `high` depending on treatment, drug, or device risk. |
| `area_discovery` | `low` to `medium`. |
| `specialty_area` | `medium`. |
| `provider_discovery` | `medium`; must use real approved provider data later. |
| `center_discovery` | `medium`; must use real approved organization data later. |
| `cost_pricing` | `high`. |
| `comparison` | `high`. |
| `branded` | `medium` or higher if medical claims are present. |
| `competitor` | `medium` or `high`; legal/ethical review required. |
| `insurance` | `medium`. |
| `appointment` | `medium`; no booking feature approval. |
| `urgent_emergency` | `blocked_until_review`. |
| `condition_symptom` | `high`. |
| `ai_answer_candidate` | Depends on underlying topic; medical content requires human approval. |
| `unsupported_locale_research` | `blocked_until_review` for public route use. |
| `unsupported_country_research` | `blocked_until_review` for public route use. |

Medical safety flags are `low`, `medium`, `high`, and `blocked_until_review`.

## 7. Cluster-to-Route-Status Rules

Route statuses are `planning_only`, `approved_later_required`, `noindex_required`, `blocked`, `unsupported_locale`, and `unsupported_country`.

- Use `planning_only` for supported English/Arabic Oman keyword planning rows.
- Use `approved_later_required` only when a future approved phase explicitly allows route/page review.
- Use `noindex_required` only when a future approved phase allows noindex-only handling.
- Use `blocked` for unsafe, deprecated, conflicting, or forbidden route/page ideas.
- Use `unsupported_locale` for unsupported source languages such as Persian/Hindi if recorded under a future approved research-only scope.
- Use `unsupported_country` for non-Oman country targets if recorded under a future approved research-only scope.

No route status in SEO-B authorizes route creation, page generation, article generation, CMS records, schema output, sitemap inclusion, or programmatic SEO.

## 8. Supported Locale Handling

Supported public launch languages are English (`en`) and Arabic (`ar`). Supported launch country is Oman (`om`). Supported-language keyword rows remain planning-only and must still pass future route, content, medical, SEO, sitemap, and human approval gates before publication-oriented use.

## 9. Unsupported Locale/Country Handling

Persian/Hindi public SEO routes remain forbidden unless explicitly approved. Unsupported locale/country keywords must not create public SEO targets. If a future approved research task records unsupported-locale or unsupported-country rows, they must be marked as research-only, blocked, `unsupported_locale`, or `unsupported_country` as appropriate.

## 10. Branded and Competitor Query Handling

Branded and competitor query rows remain planning-only. They must not impersonate brands, imply affiliation, create branded hospital/provider pages, publish competitor comparisons, or generate schema/sitemap/CMS output unless a future approved legal/ethical/compliance scope permits it.

## 11. AI-search / GEO Planning Notes

AI-search/GEO planning fields do not authorize AI chat, hidden AI-only text, LLM summary blocks, `llms.txt`, schema output, crawlers, background jobs, or public pages. Future answer-ready content must be visible to users, supported by approved public facts, medically safe, and human-reviewed where required.

## 12. Examples Without Real Keyword Invention

Use placeholders when documenting examples so no new keyword demand is invented:

```json
{
  "keyword": "<source spreadsheet keyword>",
  "cluster": "<controlled cluster>",
  "intent": "<controlled intent>",
  "route_status": "planning_only",
  "target_url_pattern": "future_approval_required",
  "notes": "Planning data only; not route/page/CMS/schema/sitemap approval."
}
```

The actual keyword JSON must use only keywords read reliably from `docs/master-spec/seo_inputs/drmuscat-keywords-full.xlsx`.

## 13. Out-of-Scope Items

SEO-B does not approve routes, pages, articles, CMS records, schema output, sitemap changes, robots changes, `llms.txt`, crawlers, background jobs, AI chat, provider pages, branded hospital pages, database imports, seed rows, public SEO pages, programmatic pages, business logic, API handlers, UI changes, migrations, validators, route checks, RLS tests, SEO checks, Supabase generated types, or package changes.

## 14. Future Approval Requirements

Future implementation requires PHASED_BUILD_ONLY scope with four-axis mapping, allowed files, forbidden scope, validation, and human approval. Medical content requires human approval before publication. Keyword entries do not authorize route/page/article/CMS/schema/sitemap generation.
