# DIR-A — Public Directory Route Contract Inventory and Next-Phase Plan

## 1. Purpose

This document is a documentation-only route contract inventory for the next public directory phase. It records the current approved public directory route baseline, forbidden route patterns, and a safe next-phase plan before any public directory route is added or changed.

This document does **not** authorize implementation by itself. Any future directory route work must receive a separate phase approval with the four-axis mapping model:

- Execution Phase
- Lock Scope
- Product Module
- Subphase ID

DIR-A remains in `PHASED_BUILD_ONLY` mode and makes no route, component, query, type, sitemap, robots, seed, migration, RLS, admin, provider dashboard, billing, payment, AI, or review implementation changes.

## 2. Current approved public routes

Current public localized routing is limited to `/:locale/:country`, supported locales `en` and `ar`, and supported country `om`. Public discovery surfaces currently include doctors, centers, pharmacies, labs, services, and search. Admin routes are root-level `/admin` routes and are not localized.

| Route pattern | Exists? | Current status | Current data source | Appears approved by `scripts/routes-check.mjs`? | Next implementation phase stance |
| --- | --- | --- | --- | --- | --- |
| `/[locale]/[country]/doctors` | Exists | Data-backed public listing page. Renders an empty state or error state when the public query has no rows or fails. | `listPublicDoctors` from `src/lib/catalog/public-queries.ts` using the `doctors` table. | Yes. Included in the approved discovery skeleton route existence check. | Remain unchanged unless a separately approved public directory enhancement explicitly includes doctors. |
| `/[locale]/[country]/centers` | Exists | Data-backed public listing page. Renders an empty state or error state when the public query has no rows or fails. | `listPublicCenters` from `src/lib/catalog/public-queries.ts` using the `centers` table. | Yes. Included in the approved discovery skeleton route existence check. | Remain unchanged unless a separately approved public directory enhancement explicitly includes centers. |
| `/[locale]/[country]/services` | Exists | Data-backed public listing page. Renders an empty state or error state when the public query has no rows or fails. | `listPublicServices` from `src/lib/catalog/public-queries.ts` using the `services` table. | Yes. Included in the approved discovery skeleton route existence check. | Remain unchanged unless a separately approved public directory enhancement explicitly includes services. |
| `/[locale]/[country]/labs` | Exists | Placeholder/scaffold public discovery page with SEO-safe localized metadata and static preparation copy. It does not query listings yet. | Static page copy only. No current public catalog query call. | Yes. Included in the approved discovery skeleton route existence check. | Candidate for DIR-B conversion to query-backed listings with `listPublicCenters({ centerType: 'laboratory' })`, if separately approved. |
| `/[locale]/[country]/pharmacies` | Exists | Placeholder/scaffold public discovery page with SEO-safe localized metadata and static preparation copy. It does not query listings yet. | Static page copy only. No current public catalog query call. | Yes. Included in the approved discovery skeleton route existence check. | Candidate for DIR-B conversion to query-backed listings with `listPublicCenters({ centerType: 'pharmacy' })`, if separately approved. |
| `/[locale]/[country]/search` | Exists | Public discovery/search route. Exact runtime status should be treated as current implementation-owned and unchanged by DIR-A. | `searchPublicCatalog` appears in public catalog utilities; exact page wiring requires confirmation in a future implementation task before editing. | Yes. Included in the approved discovery skeleton route existence check. | Remain unchanged in the next implementation phase unless search is explicitly included. |
| `/[locale]/[country]/for-providers` | Exists | Structured public For Providers onboarding page introduced by the merged provider onboarding work. | Page-local/provider onboarding UI and approved public provider onboarding lead capture foundations. | Yes. The route-check script has an approved provider route existence check. | Remain unchanged; no admin mutation/status workflow is approved by DIR-A. |
| `/[locale]/[country]/doctor/[doctorSlug]` | Exists | Data-backed public doctor detail route. Uses singular `doctor` as the canonical detail route family. | `getPublicDoctorDetail` from public catalog query utilities and related public media/contact/license foundations. | Yes. Route-check requires the singular doctor detail route to exist and requires the plural `/doctors/[doctorSlug]` route not to exist. | Remain unchanged. Do not add duplicate plural doctor detail routes. |
| `/[locale]/[country]/center/[centerSlug]` | Exists | Data-backed public center detail route. | `getPublicCenterDetail` from public catalog query utilities and related public media/contact/license foundations. | Requires confirmation. Current route-check explicitly requires several public routes and scaffold routes; this route exists in the repo, while the route-check snippet reviewed by DIR-A does not show a dedicated `center/[centerSlug]` existence assertion. | Remain unchanged. |
| `/[locale]/[country]/centers/[specialtySlug]` | Exists | SEO scaffold route; current route-contract checks identify it as an approved SEO-D2A specialty route scaffold. | Scaffold/gate behavior; no full public landing implementation should be inferred from this route's existence. | Yes. Route-check requires this scaffold route to exist and checks scaffold constraints. | Remain unchanged unless a separately approved SEO/public directory phase updates the route contract. |
| `/[locale]/[country]/centers/[specialtySlug]/[areaSlug]` | Exists | SEO scaffold route; current route-contract checks identify it as an approved SEO-D2A specialty-area route scaffold. | Scaffold/gate behavior; no full public landing implementation should be inferred from this route's existence. | Yes. Route-check requires this scaffold route to exist and checks scaffold constraints. | Remain unchanged unless a separately approved SEO/public directory phase updates the route contract. |
| `/[locale]/[country]/areas/[areaSlug]` | Exists | SEO scaffold route; current route-contract checks identify it as an approved SEO-D2B area route scaffold. | Scaffold/gate behavior; no full public landing implementation should be inferred from this route's existence. | Yes. Route-check requires this scaffold route to exist. | Remain unchanged unless a separately approved SEO/public directory phase updates the route contract. |
| `/[locale]/[country]/services/[serviceSlug]` | Exists | SEO scaffold/gated route. Current route-contract checks identify it as an approved SEO-D2C1 service route scaffold and later selected service landing checks restrict implementation tokens and runtime behavior. | Public landing page gate skeleton helper only where approved by route-check; full implementation remains phase-gated. | Yes. Route-check requires this scaffold route to exist and constrains selected integration behavior. | Remain unchanged unless a separately approved SEO/public directory phase updates the route contract. |
| `/[locale]/[country]/services/[serviceSlug]/[areaSlug]` | Exists | SEO scaffold/gated route. Current route-contract checks identify it as an approved SEO-D2C2 service-area route scaffold and later selected service-area checks restrict implementation tokens and runtime behavior. | Public landing page gate skeleton helper only where approved by route-check; full implementation remains phase-gated. | Yes. Route-check requires this scaffold route to exist and constrains selected integration behavior. | Remain unchanged unless a separately approved SEO/public directory phase updates the route contract. |

## 3. Current forbidden or unapproved route patterns

The following route patterns must not be added without a route-contract update and a separate approved implementation phase:

| Route pattern | Current DIR-A status | Basis |
| --- | --- | --- |
| `/[locale]/[country]/clinics` | Forbidden/unapproved. | `scripts/routes-check.mjs` checks that branded hospital and clinic route directories do not exist. |
| `/[locale]/[country]/clinic` | Forbidden/unapproved. | `scripts/routes-check.mjs` checks that branded hospital and clinic route directories do not exist. |
| `/[locale]/[country]/hospitals` | Forbidden/unapproved. | `scripts/routes-check.mjs` checks that branded hospital and clinic route directories do not exist. |
| `/[locale]/[country]/hospital` | Forbidden/unapproved. | `scripts/routes-check.mjs` checks that branded hospital and clinic route directories do not exist. |
| `/[locale]/admin`, `/[locale]/[country]/admin`, `/en/admin`, `/ar/admin`, `/en/om/admin`, `/ar/om/admin` | Forbidden/unapproved. | Admin routes are root-level `/admin`, and `scripts/routes-check.mjs` checks localized admin routes do not exist. |
| `/fa/*` and `/hi/*` public SEO routes | Forbidden/unapproved. | Current docs and route-check forbid Persian/Hindi public SEO routes unless explicitly approved. |
| Deprecated shortcuts such as `/en/dentist/al-khuwair` and `/ar/dentist/al-khuwair` | Forbidden/unapproved. | Current route and SEO guardrails forbid deprecated dentist shortcut routes. |
| `/[locale]/[country]/doctors/[doctorSlug]` | Forbidden duplicate detail route while singular `/doctor/[doctorSlug]` remains canonical. | `scripts/routes-check.mjs` requires the plural doctor detail entity route not to exist. |
| `/[locale]/centers`, `/[locale]/services`, `/[locale]/areas`, `/[locale]/doctors` | Forbidden/unapproved. | Current route and SEO guardrails require the country segment and route-check validates absence of several non-country route families. |
| `/[locale]/[country]/articles` | Forbidden/unapproved in the current route contract. | `scripts/routes-check.mjs` checks article routes do not exist. |

If a future task proposes any route that conflicts with `scripts/routes-check.mjs`, that task must not edit route-check opportunistically. It must first produce or receive an explicit route-contract update approval.

## 4. Proposed MVP directory route strategy

The safest MVP directory strategy is to expand only from current approved route families and current canonical data structures, without adding new route patterns in DIR-A.

- Keep canonical slugs in English even under Arabic locale. For example, use an English slug such as `/ar/om/pet-clinics` only if that route is approved later; do not introduce Arabic slug route families without a dedicated route-contract decision.
- Use the existing `centers` table and `center_type` enum where possible.
- Labs should be powered by `centers` where `center_type = 'laboratory'`.
- Pharmacies should be powered by `centers` where `center_type = 'pharmacy'`.
- Clinics should eventually be powered by `centers` where `center_type = 'clinic'`, but only after route-contract approval because `/clinic` and `/clinics` directories are currently forbidden/unapproved.
- Dental clinics should eventually be powered by `centers` where `center_type = 'dental_clinic'`, but only after route-contract approval.
- Hospitals should eventually be powered by `centers` where `center_type = 'hospital'`, but only after route-contract approval because `/hospital` and `/hospitals` directories are currently forbidden/unapproved.
- Beauty/wellness needs a mapping decision because multiple `center_type` values may apply, including `beauty_clinic`, `wellness_center`, `spa`, `physiotherapy_center`, `gym`, `fitness_center`, `nutrition_center`, and related wellness-adjacent values.
- Pet clinics should not be implemented yet unless a schema/category decision is approved. The current `center_type` enum reviewed by DIR-A does not include `pet_clinic` or `veterinary_clinic`, so pet clinic routing would require taxonomy/schema/category alignment before implementation.

## 5. Recommended next implementation sequence

After this DIR-A documentation-only inventory, the recommended sequence is:

1. **DIR-B — labs/pharmacies query-backed implementation**
   - Convert `/[locale]/[country]/labs` and `/[locale]/[country]/pharmacies` from placeholders to query-backed pages using `listPublicCenters` with `centerType: 'laboratory'` and `centerType: 'pharmacy'`.
   - Do not add new route families.
   - Do not add seed rows.
   - Preserve public visibility/review-gated behavior and honest empty states.
2. **DIR-C — reusable public directory page template, if needed**
   - Create or standardize a reusable public directory page template only if the DIR-B implementation shows duplication that should be safely centralized.
   - Keep the template within the approved public directory/UI scope of that future phase.
3. **DIR-D — route-check contract proposal for future categories**
   - Propose a route-check contract update for clinics, dental clinics, hospitals, and beauty/wellness only if those categories are approved.
   - Include exact route names, canonical URL strategy, sitemap behavior, and SEO quality gates.
4. **DIR-E — approved category pages only after route-check contract update**
   - Implement approved category pages only after DIR-D or equivalent route-contract approval lands.
   - Use `centers.center_type` mappings where already supported.
5. **ADM-A — admin provider onboarding lead status/priority mutation plan**
   - Plan admin lead status/priority mutations separately from public directory work.
   - Do not implement admin mutation/status workflow from a directory route task.
6. **DATA-A — candidate/provider conversion model plan**
   - Define candidate/provider conversion before any real seed rows, imports, or provider conversion workflows.
7. **SEED-A — real seed rows only after explicit seed phase approval**
   - Add real seed rows only after an explicit seed phase approval and validation plan.
   - Fake listings, fake counts, fake ratings, fake reviews, and fake provider data remain forbidden.

## 6. Risks and blockers

- Adding `/clinics`, `/clinic`, `/hospitals`, or `/hospital` directly will likely fail current route contract checks because `scripts/routes-check.mjs` requires those branded hospital and clinic route directories not to exist.
- Pet clinics require a schema/category decision before implementation because current `center_type` values reviewed by DIR-A do not include `pet_clinic` or `veterinary_clinic`.
- Fake listings, fake counts, fake ratings, fake reviews, and fake provider data remain forbidden.
- Public visibility must remain review-gated and must not expose private CRM, payment, license evidence, receipt, claim evidence, admin notes, unpublished provider data, or private review data.
- No provider dashboard, signup, payment, billing, AI chat, review implementation, provider mutation workflow, or admin lead mutation/status workflow should be implemented from this directory route task.
- If any future route/status cannot be determined safely, document it as `requires confirmation` instead of guessing.
- If route-check conflicts with a proposed route, do not edit route-check in the implementation task unless a prior route-contract update explicitly authorizes that exact change.

## 7. Validation

DIR-A is documentation-only. Required validation commands for this task:

| Command | Required for DIR-A | Result |
| --- | --- | --- |
| `pnpm routes:check` | Yes | Passed. |
| `pnpm typecheck` | Yes | Passed. |
| `pnpm lint` | Yes | Passed with 13 warnings and 0 errors. Existing warnings are outside the DIR-A documentation-only change. |

Validation results must be reported honestly. If any command is skipped or fails, the phase report must say so and must not claim success.

## Phase completion report

- **Task ID:** DIR-A
- **Execution Phase:** Phase 0 documentation alignment / Phase 3 public directory planning only; no implementation authorization.
- **Lock Scope:** Documentation-only under `docs/project-state/**`.
- **Product Module:** Public directory route contract planning.
- **Subphase ID:** DIR-A
- **Files created:** `docs/project-state/DIR-A_PUBLIC_DIRECTORY_ROUTE_CONTRACT.md`
- **Files intentionally not modified:** app routes, components, public queries, public types, route-check script, sitemap, robots, `llms.txt`, package files, migrations, Supabase types, RLS policies, seed files, admin files, provider dashboard files, billing/payment/AI/review implementation files.
- **Next recommended task:** DIR-B labs/pharmacies query-backed implementation.
