# Medical Content Safety and Approval

## 1. Status and Authority

This document is documentation-only. It does not authorize implementation, product features, routes, migrations, API handlers, UI changes, business logic, schema output, sitemap changes, robots changes, `llms.txt`, analytics events, crawlers, background jobs, AI chat, CMS records, public SEO pages, provider pages, branded hospital pages, or programmatic pages.

This document does not replace V10.4 master-spec files. If this document conflicts with `AGENTS.md`, `README.md`, `docs/project-state/CURRENT_STATE.md`, `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`, `docs/master-spec/*`, `docs/addendums/*`, or any stricter guardrail, the canonical file or stricter guardrail wins.

Retired informal phase labels must not be used. No hidden AI-only content is allowed. Schema must match visible content. Medical content must be human-approved before publication.

Future implementation requires a separate `PHASED_BUILD_ONLY` task with Execution Phase, Lock Scope, Product Module, Subphase ID, allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation, and a human approval checkpoint.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only planning for SEO-A
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-A

## 3. Medical Content Safety Principles

Future medical content must be safe, accurate, visible, supportable, and human-approved before publication. DrMuscat public content may help users discover providers and understand directory information, but it must not replace professional medical advice or imply clinical decision-making.

Future medical content must:

- distinguish directory facts from medical education
- avoid diagnosis, prescription advice, and treatment instructions
- avoid guaranteed outcomes
- use disclaimers where required
- stop for human review when compliance risk is unclear
- use only visible, approved, public content for schema and AI-search summaries

## 4. Prohibited Content

Future public, SEO, GEO, AI-search, CMS, and programmatic content must not include:

- diagnosis
- prescription advice
- treatment guarantees
- invented doctors
- invented clinics
- invented prices
- invented reviews
- unsupported medical claims

It must also not imply emergency triage, individualized clinical advice, guaranteed availability, guaranteed pricing, or guaranteed treatment results unless a future approved compliance/legal scope explicitly permits a narrowly reviewed statement.

## 5. Human Approval Requirement

Medical content must be human-approved before publication. Human approval is required before publishing medical explanations, health-condition content, service guidance, treatment descriptions, safety warnings, disclaimers, or AI/LLM summaries that touch medical topics.

Approval must verify that content is visible, supportable, current enough for the use case, non-diagnostic, non-prescriptive, and consistent with Oman-first DrMuscat launch constraints.

## 6. Disclaimer Requirements

Future approved medical content must include disclaimers where required by content type, page purpose, or compliance review. Disclaimers should clarify that DrMuscat is a discovery and provider visibility platform and that users should consult qualified healthcare professionals for medical advice, diagnosis, or treatment.

Disclaimers must be visible to users and must not be hidden only in schema, metadata, AI-only content, or inaccessible page areas.

## 7. Provider / Clinic / Price / Review Truthfulness Rules

Future content must preserve truthfulness:

- Provider profiles must refer only to real, approved provider data.
- Clinic, hospital, pharmacy, lab, and center information must refer only to real, approved entities.
- Prices must not be invented, guessed, scraped without approval, or shown without approved source and freshness rules.
- Reviews and ratings must not be invented, synthesized, imported without approval, or represented in schema unless visible and compliant.
- Availability, insurance, service, language, and credential claims must be supported by approved public data.

## 8. Unsupported Claim Stop Rule

If a proposed medical claim is unclear, unsupported, compliance-sensitive, potentially diagnostic, potentially prescriptive, or difficult to verify, the correct action is to stop. The agent or future implementer must not guess, soften the claim without review, hide it in AI-only content, or place it only in schema.

The smallest safe fix should usually be removal, noindex/exclusion, human review, or a narrower factual statement supported by approved public content.

## 9. Compliance-Sensitive Blocker Report Expectations

When stopping for medical-content risk, a blocker report should include:

- phase and four-axis mapping
- exact content or claim at issue
- source of uncertainty
- why continuing is unsafe
- private-data, RLS/security, route, SEO, schema, and medical-safety impact
- smallest safe fix
- explicit human approval requested

Failed commands, missing dependencies, ambiguous requirements, route ambiguity, schema conflicts, and RLS ambiguity must also be reported rather than bypassed.

## 10. Future Publication Gate

Future publication of medical content requires a separate approved `PHASED_BUILD_ONLY` task with allowed files, forbidden scope, database impact, route impact, RLS/security impact, validation, and human approval checkpoint. The publication task must define whether content is indexable, noindex, sitemap-eligible, schema-eligible, AI-summary-eligible, or excluded.

## 11. Explicitly Out of Scope

SEO-A does not approve medical articles, condition pages, treatment pages, doctor recommendations, service recommendations, clinical guidance, AI advice, AI chat, schema output, public SEO pages, CMS records, seeded medical content, provider claims, reviews, ratings, pricing, or publication workflows.
