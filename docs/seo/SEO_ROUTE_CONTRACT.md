# SEO Route Contract

## 1. Status and Authority

This document is documentation-only for SEO-C and later route-contract alignment tasks. `UI-K-ROUTE-CONTRACT-A` updates the contract to allow exact future frontend-only public UI routes for articles, sign-in, register, list-your-center, and for-providers. This document still does not authorize migrations, API handlers, backend auth, payment logic, business logic, Supabase generated types, RLS changes, seed rows, database imports, CMS records, provider dashboards, branded hospital pages, unsafe programmatic pages, schema output, sitemap changes, robots changes, `llms.txt` changes, analytics events, crawlers, background jobs, AI chat, or payment/business workflows.

The URL strategy in this document does not authorize route creation. Canonical pattern documentation does not authorize sitemap, schema, robots, or `llms.txt` changes.

If this document conflicts with V10.4 master-spec files, `AGENTS.md`, `README.md`, `docs/project-state/*`, current repository state, route checks, SEO-A, SEO-B, or stricter guardrails, the V10.4 master-spec, current repo state, route checks, and stricter guardrails win.

Future implementation requires a separate `PHASED_BUILD_ONLY` task with four-axis mapping, allowed files, forbidden scope, validation, and human approval. Keyword `target_url_pattern` and `route_status` values are planning data only and do not authorize route/page generation. Medical and branded-search URL usage requires future human approval where applicable.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only planning for SEO-C
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-C

## 3. Route Classification Schema

Future route tables should use this classification schema when evaluating current, future, blocked, or non-SEO surfaces.

| Field | Meaning |
| --- | --- |
| `route_family` | Pattern or file being classified. |
| `status` | Contract status such as `current_approved`, `admin_private`, `api_non_seo`, `future_approval_required`, `blocked`, `unsupported_locale`, or `unsupported_country`. |
| `exists_now` | Whether the route/file exists in the current repository state. |
| `public_or_private` | `public`, `admin_private`, `api_non_seo`, `crawler_facing_file`, or `blocked`. |
| `indexability_status` | `indexable_candidate`, `noindex_required`, `blocked`, `unsupported_locale`, `unsupported_country`, or `future_approval_required`. |
| `sitemap_eligible` | Whether the route can be sitemap eligible under current rules. |
| `hreflang_allowed` | Whether approved `en`/`ar` hreflang counterparts may be referenced. |
| `canonical_family` | The canonical family to use, or `not_applicable`. |
| `implementation_authorization` | Whether the current document authorizes implementation; for SEO-C this is always `none`. |
| `human_review_required` | Whether human review is required before publication-oriented use. |
| `notes` | Route-specific constraints, conflicts, or stop conditions. |

## 4. Current Public Route Contract Table

These route families are current approved public route families for the current repository state. `UI-K-ROUTE-CONTRACT-A` also records exact future frontend-only public UI route allowances; it does not create pages or authorize backend implementation.

| route_family | status | exists_now | public_or_private | indexability_status | sitemap_eligible | hreflang_allowed | canonical_family | implementation_authorization | human_review_required | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/[locale]/[country]` | `current_approved` | yes | public | `indexable_candidate` | yes, if quality-gated | yes, approved `en`/`ar` counterparts only | `/[locale]/[country]` | none | no, unless medical/compliance content is added later | Localized country root for `en`/`ar` + `om` only. |
| `/[locale]/[country]/centers` | `current_approved` | yes | public | `indexable_candidate` | yes, if quality-gated | yes, approved `en`/`ar` counterparts only | `/[locale]/[country]/centers` | none | no, unless medical/compliance content is added later | Public centers discovery/catalog route family. |
| `/[locale]/[country]/center/[centerSlug]` | `current_approved` | yes | public | `indexable_candidate` | yes, only for approved visible public center profiles | yes, approved `en`/`ar` counterparts only | `/[locale]/[country]/center/[centerSlug]` | none | may be required for medical/branded/compliance-sensitive claims | Singular center detail route family. |
| `/[locale]/[country]/doctors` | `current_approved` | yes | public | `indexable_candidate` | yes, if quality-gated | yes, approved `en`/`ar` counterparts only | `/[locale]/[country]/doctors` | none | no, unless medical/compliance content is added later | Public doctors discovery/catalog route family. |
| `/[locale]/[country]/doctor/[doctorSlug]` | `current_approved` | yes | public | `indexable_candidate` | yes, only for approved visible public doctor profiles | yes, approved `en`/`ar` counterparts only | `/[locale]/[country]/doctor/[doctorSlug]` | none | may be required for provider, credential, specialty, medical, or branded claims | Current approved singular doctor detail route pattern. |
| `/[locale]/[country]/for-providers` | `current_approved_public_provider_onboarding` | yes | public | `indexable_candidate` | yes, if quality-gated | yes, approved `en`/`ar` counterparts only | `/[locale]/[country]/for-providers` | none | yes for future pricing, billing, claims, or business/legal claims | Public provider onboarding/plans page; does not authorize dashboards, billing, payments, or mutation workflows. |
| `/[locale]/[country]/labs` | `current_approved` | yes | public | `indexable_candidate` | yes, if quality-gated | yes, approved `en`/`ar` counterparts only | `/[locale]/[country]/labs` | none | may be required for medical/testing claims | Public labs discovery/catalog route family. |
| `/[locale]/[country]/pharmacies` | `current_approved` | yes | public | `indexable_candidate` | yes, if quality-gated | yes, approved `en`/`ar` counterparts only | `/[locale]/[country]/pharmacies` | none | may be required for pharmacy, medicine, availability, or regulated claims | Public pharmacies discovery/catalog route family. |
| `/[locale]/[country]/search` | `current_approved_discovery_search_shell` | yes | public | `indexable_candidate_for_shell`; query URLs are `noindex_required` unless later approved | shell may be eligible; search-query URLs are not eligible | yes for shell only, approved `en`/`ar` counterparts only | `/[locale]/[country]/search` | none | yes if future implementation exposes medical or sensitive result content | Public search shell only; query/result URL indexation is not approved. |
| `/[locale]/[country]/services` | `current_approved` | yes | public | `indexable_candidate` | yes, if quality-gated | yes, approved `en`/`ar` counterparts only | `/[locale]/[country]/services` | none | may be required for medical service claims | Public services discovery/catalog route family. |
| `/[locale]/[country]/articles` | `approved_future_frontend_ui_route` | no | public | `indexable_candidate_after_quality_gate` | not until implemented and quality-gated | yes, approved `en`/`ar` counterparts only after implementation | `/[locale]/[country]/articles` | route-contract only | yes for medical-content safety | Approved as a future frontend article index route. Must include disclaimers and no diagnosis/treatment claims when implemented. |
| `/[locale]/[country]/articles/[slug]` | `approved_future_frontend_ui_route` | no | public | `indexable_candidate_after_quality_gate` | not until implemented and quality-gated | yes, approved `en`/`ar` counterparts only after implementation | `/[locale]/[country]/articles/[slug]` | route-contract only | yes for medical-content safety | Approved as a future frontend article detail route. Reviews/comments must be moderated; no fabricated ratings or medical claims. |
| `/[locale]/[country]/sign-in` | `approved_future_frontend_ui_route` | no | public | `noindex_or_auth_utility_recommended` | no unless later explicitly approved | no | `/[locale]/[country]/sign-in` | route-contract only | yes for auth/privacy UX | Frontend auth UI placeholder route only; backend auth changes require separate approval. |
| `/[locale]/[country]/register` | `approved_future_frontend_ui_route` | no | public | `noindex_or_auth_utility_recommended` | no unless later explicitly approved | no | `/[locale]/[country]/register` | route-contract only | yes for auth/privacy UX | Frontend registration/onboarding placeholder route only; backend auth changes require separate approval. |
| `/[locale]/[country]/list-your-center` | `approved_future_frontend_ui_route` | no | public | `indexable_candidate_after_quality_gate` | not until implemented and quality-gated | yes, approved `en`/`ar` counterparts only after implementation | `/[locale]/[country]/list-your-center` | route-contract only | yes for provider, pricing, compliance, and claim language | Frontend provider listing request UI route only; payments, claims, dashboards, and mutations require later approval. |

## 5. Admin Route Contract Table

Admin routes are root-level only, not localized, and not sitemap/public SEO eligible.

| route_family | status | exists_now | public_or_private | indexability_status | sitemap_eligible | hreflang_allowed | canonical_family | implementation_authorization | human_review_required | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/admin` | `admin_private` | yes | admin_private | `noindex_required` | no | no | not_applicable | none | yes for future admin scope expansion | Protected root-level admin baseline. Must not be localized. |
| `/admin/provider-onboarding-leads` | `admin_private_read_only` | yes | admin_private | `noindex_required` | no | no | not_applicable | none | yes for future mutation/status/contact/assignment workflows | Read-only admin provider onboarding lead list baseline. |
| `/admin/provider-onboarding-leads/[leadId]` | `admin_private_read_only` | yes | admin_private | `noindex_required` | no | no | not_applicable | none | yes for future mutation/status/contact/assignment workflows | Read-only admin provider onboarding lead detail baseline. |

## 6. API Route Contract Table

API routes are non-SEO endpoints. They are not sitemap eligible, not canonical public pages, and not hreflang surfaces.

| route_family | status | exists_now | public_or_private | indexability_status | sitemap_eligible | hreflang_allowed | canonical_family | implementation_authorization | human_review_required | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/api/callback-requests` | `api_non_seo` | yes | api_non_seo | `noindex_required` | no | no | not_applicable | none | yes for future data, privacy, or compliance expansion | Public callback request API exists; SEO-C does not authorize changes. |
| `/api/provider-onboarding-leads` | `api_non_seo` | yes | api_non_seo | `noindex_required` | no | no | not_applicable | none | yes for future data, privacy, spam, or compliance expansion | Public provider onboarding lead capture API exists; SEO-C does not authorize changes. |

## 7. Crawler-Facing File Inventory

These files exist. SEO-C does not authorize changes to them.

| File | Exists now | Current contract | SEO-C authorization |
| --- | --- | --- | --- |
| `src/app/sitemap.ts` | yes | Crawler-facing sitemap generator. Must include only canonical, public, indexable, supported, quality-gated pages when future changes are approved. | none |
| `src/app/robots.ts` | yes | Crawler-facing robots file. | none |
| `public/llms.txt` | yes | AI/crawler-facing file with approved public information only. | none |

## 8. Future Planning-Only Route Families

These route families do not exist now and are marked `future_approval_required`. They are not approved for implementation by SEO-C.

| route_family | status | exists_now | public_or_private | indexability_status | sitemap_eligible | hreflang_allowed | canonical_family | implementation_authorization | human_review_required | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/[locale]/[country]/centers/[specialtySlug]` | `future_approval_required` | does_not_exist_now | public_planning_only | `future_approval_required` | no | no, until approved and implemented | pending_future_contract | none | likely, depending on specialty/medical claims | Future specialty-center planning only. |
| `/[locale]/[country]/centers/[specialtySlug]/[areaSlug]` | `future_approval_required` | does_not_exist_now | public_planning_only | `future_approval_required` | no | no, until approved and implemented | pending_future_contract | none | likely, depending on specialty/area/medical claims | Future specialty + area center planning only. |
| `/[locale]/[country]/areas/[areaSlug]` | `future_approval_required` | does_not_exist_now | public_planning_only | `future_approval_required` | no | no, until approved and implemented | pending_future_contract | none unless medical/branded content is added | Future area page planning only. |
| `/[locale]/[country]/services/[serviceSlug]` | `future_approval_required` | does_not_exist_now | public_planning_only | `future_approval_required` | no | no, until approved and implemented | pending_future_contract | yes for medical service claims | Future service page planning only. |
| `/[locale]/[country]/services/[serviceSlug]/[areaSlug]` | `future_approval_required` | does_not_exist_now | public_planning_only | `future_approval_required` | no | no, until approved and implemented | pending_future_contract | yes for medical service/location claims | Future service + area planning only. |

## 9. Forbidden Route Families

| route_family | status | exists_now | public_or_private | indexability_status | sitemap_eligible | hreflang_allowed | canonical_family | implementation_authorization | human_review_required | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/[locale]/centers` | `blocked` | no | blocked | `blocked` | no | no | not_applicable | none | no | Countryless localized centers route is forbidden. |
| `/[locale]/doctors` | `blocked` | no | blocked | `blocked` | no | no | not_applicable | none | no | Countryless localized doctors route is forbidden. |
| `/fa/*` | `unsupported_locale` | no | blocked | `unsupported_locale` | no | no | not_applicable | none | yes if future locale expansion is proposed | Persian public SEO routes are forbidden unless explicitly approved later. |
| `/hi/*` | `unsupported_locale` | no | blocked | `unsupported_locale` | no | no | not_applicable | none | yes if future locale expansion is proposed | Hindi public SEO routes are forbidden unless explicitly approved later. |
| `/[locale]/[country]/admin` | `blocked` | no | blocked | `blocked` | no | no | not_applicable | none | yes for any admin route-contract change | Admin routes must remain root-level only. |
| localized admin routes | `blocked` | no | blocked | `blocked` | no | no | not_applicable | none | yes for any admin route-contract change | No `/[locale]/admin`, `/[locale]/[country]/admin`, `/en/admin`, `/ar/admin`, `/en/om/admin`, or `/ar/om/admin`. |
| `/en/dentist/al-khuwair` style shortcuts | `blocked` | no | blocked | `blocked` | no | no | not_applicable | none | yes for any redirect/legacy route plan | Deprecated shortcut patterns are forbidden as public SEO routes. |
| duplicate route families competing with approved canonical patterns | `blocked` | no | blocked | `blocked` | no | no | not_applicable | none | yes | One canonical family per intent/entity combination. |
| unsupported GCC country routes unless future approved | `unsupported_country` | no | blocked | `unsupported_country` | no | no | not_applicable | none | yes | GCC expansion is future-only. |
| public SEO routes for unsupported languages/countries | `unsupported_locale` / `unsupported_country` | no | blocked | `unsupported_locale` / `unsupported_country` | no | no | not_applicable | none | yes | Only `en`, `ar`, and `om` are approved. |
| branded hospital/clinic pages unless explicitly approved later | `future_approval_required` | no | public_planning_only | `future_approval_required` | no | no | pending_future_contract | none | yes | Branded pages require future legal/ethical/compliance approval. |
| `/[locale]/[country]/doctors/[doctorSlug]` | `blocked` | no | blocked | `blocked` | no | no | not_applicable | none | yes for any route-contract change | Plural doctor detail route is forbidden unless future explicit approval changes the route contract. |

## 10. Doctor Detail Route Conflict Resolution

Current repo/current-state/routes-check contract is authoritative for this repository state.

- Approved doctor detail route family: `/[locale]/[country]/doctor/[doctorSlug]`.
- Forbidden unless future explicit route-contract approval changes it: `/[locale]/[country]/doctors/[doctorSlug]`.

Future work must not add the plural doctor detail route, link to it, include it in sitemap output, use it as a canonical URL, include it in hreflang alternates, or derive it from keyword `target_url_pattern` values unless a future approved task explicitly changes the route contract and validation rules.

## 11. Route Approval Model

Any future route implementation requires a separate approved `PHASED_BUILD_ONLY` task with:

- four-axis mapping
- route family list
- allowed files
- forbidden scope
- implementation authorization
- data source authorization
- route impact
- sitemap impact
- robots impact
- `llms.txt` impact
- canonical and hreflang rules
- noindex/index rules
- medical, branded, and compliance review requirements
- validation commands
- human approval checkpoint

No keyword, spreadsheet, SEO addendum, strategy document, planning-only route status, or `target_url_pattern` value authorizes route/page generation.

## 12. Route Validation Expectations

Future route implementation must pass validation without weakening TypeScript, lint, build, route, env, migration, seed, SEO, or RLS checks. For SEO-C documentation implementation, expected validation commands are:

```bash
git status --short
test -f docs/seo/CANONICAL_URL_PATTERN_STRATEGY.md && test -f docs/seo/SEO_ROUTE_CONTRACT.md && echo "SEO-C docs exist"
pnpm env:check
pnpm db:validate:migrations
pnpm test:db:rls
pnpm routes:check
pnpm typecheck
pnpm build
pnpm lint
```

No validation command may be faked or skipped silently. `pnpm lint` may show warnings only, but must have no errors.

## 13. Out-of-Scope Items

SEO-C does not authorize:

- route creation
- migrations
- API handlers
- UI components
- business logic
- Supabase generated type changes
- validators
- route check changes
- RLS test changes
- SEO check changes
- seed rows
- keyword database imports
- article routes
- public SEO pages
- CMS records
- schema output
- sitemap changes
- robots changes
- `llms.txt` changes
- analytics events
- crawlers
- background jobs
- AI chat
- provider pages
- branded hospital pages
- programmatic pages
- payment gateways
- provider dashboards
- admin mutation/status/update workflows
- hidden AI-only content

## 14. Stop Conditions

Stop rather than guessing if any of these occur:

- route ambiguity
- route-contract conflict
- unsupported locale/country uncertainty
- doctor detail route conflict
- sitemap eligibility ambiguity
- canonical/hreflang ambiguity
- schema ambiguity
- medical content risk
- branded-search risk
- RLS/security ambiguity
- private-data exposure concern
- missing dependency
- failed command
- unclear requirement
- need to edit files outside the approved scope

The smallest safe response is to report the blocker, identify the conflicting file/rule/route, and request explicit human approval for the narrowest safe next step.

## UI-K-ROUTE-CONTRACT-A Notes

- Article, sign-in, register, list-your-center, and for-providers route families are approved only under the exact `/(en|ar)/(om)/...` locale/country prefix.
- This route-contract update does not create pages and does not add sitemap, robots, `llms.txt`, schema, backend, auth, payment, database, Supabase, RLS, seed, CMS, analytics, or dashboard scope.
- Article implementations must include a visible medical disclaimer, avoid diagnosis/treatment claims, avoid unsupported schema, and avoid fabricated ratings/reviews/counts.
- Sign-in and register implementations are frontend UI placeholders until a separate auth backend phase is approved.
- List-your-center and for-providers implementations are frontend UI/product routes only until separate provider onboarding, claims, billing, payment, entitlement, or dashboard phases are approved.
