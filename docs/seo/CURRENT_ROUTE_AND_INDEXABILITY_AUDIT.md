# Current Route and Indexability Audit

Status: documentation-only audit.  
Build mode: `PHASED_BUILD_ONLY`.  
Four-axis mapping: Execution Phase `Phase 3 — Public SEO Platform audit`; Lock Scope `Phase 4 — Public SEO Pages / documentation only`; Product Module `Phase 9 — SEO/CMS and Programmatic Pages`; Subphase ID `SEO-AUDIT-CURRENT-ROUTE-INDEXABILITY-P1`.

## Non-implementation confirmation

This file records the current repository state before future SEO entity graph, taxonomy, import, QA, linking, sitemap, schema, and monitoring prompts. It does not implement product behavior.

- No migrations were added or edited.
- No Supabase schema, RLS policy, seed, or generated type was changed.
- No public or admin route was added.
- No public rendering, sitemap, robots, `llms.txt`, metadata, or schema behavior was changed.
- No data import, taxonomy config, QA gate integration, internal linking engine, schema mapping, Excel import, or local page implementation was added.

## 1. Route inventory

### Public localized route families

| Route family | Current state | Public DB reads | Metadata | JSON-LD | Sitemap | Future indexability recommendation | Key files |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/:locale/:country` | Real localized homepage shell for supported `en/ar` + `om`; unsupported params call `notFound()`. | No public catalog query helper read observed. | Yes, localized metadata. | No route-specific schema observed. | Yes. | Indexable after content/data QA; keep canonicalized. | `src/app/[locale]/[country]/page.tsx`, `src/lib/seo/metadata.ts` |
| `/:locale/:country/doctors` | Real public listing page. | `listPublicDoctors({ country })`. | Yes. | FAQ schema only. | Yes. | Indexable only when provider quality/thresholds are met. | `src/app/[locale]/[country]/doctors/page.tsx`, `src/lib/catalog/public-queries.ts` |
| `/:locale/:country/doctor/:doctorSlug` | Real public detail route; `notFound()` when slug/country unsupported or no row. | `getPublicDoctorBySlug`. | Yes, doctor-specific title/description with fallback. | No Physician schema output observed on route. | No dynamic profile URLs. | Keep indexable only after license, QA, relation, and sitemap controls. | `src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx`, `src/lib/catalog/public-queries.ts` |
| `/:locale/:country/centers` | Real public listing page. | `listPublicCenters({ country })`. | Yes. | FAQ schema only. | Yes. | Indexable only when entity quality/thresholds are met. | `src/app/[locale]/[country]/centers/page.tsx` |
| `/:locale/:country/center/:centerSlug` | Real public detail route; `notFound()` when slug/country unsupported or no row. | `getPublicCenterBySlug`. | Yes, center-specific title/description with fallback. | No LocalBusiness/MedicalClinic/etc. schema output observed on route. | No dynamic profile URLs. | Keep indexable only after license, QA, relation, and sitemap controls. | `src/app/[locale]/[country]/center/[centerSlug]/page.tsx`, `src/lib/catalog/public-queries.ts` |
| `/:locale/:country/pharmacies` | Real discovery/listing surface filtered by center type. | `listPublicCenters({ centerType: 'pharmacy' })`. | Yes. | FAQ schema only. | Yes. | Indexable when sufficient verified pharmacy supply exists. | `src/app/[locale]/[country]/pharmacies/page.tsx` |
| `/:locale/:country/hospitals` | Real discovery/listing surface filtered by center type. | `listPublicCenters({ centerType: 'hospital' })`. | Yes. | FAQ schema only. | Yes. | Indexable with stricter YMYL/license controls. | `src/app/[locale]/[country]/hospitals/page.tsx` |
| `/:locale/:country/labs` | Real discovery/listing surface filtered by center type. | `listPublicCenters({ centerType: 'laboratory' })`. | Yes. | FAQ schema only. | Yes. | Indexable after lab-specific schema/license/content QA. | `src/app/[locale]/[country]/labs/page.tsx` |
| `/:locale/:country/services` | Real public services list. | `listPublicServices()`. | Yes. | No route-specific schema observed. | Yes. | Indexable only with service taxonomy and canonical slug rules. | `src/app/[locale]/[country]/services/page.tsx` |
| `/:locale/:country/search` | Real search page shell. | Search helper may be invoked by page/components when a query exists. | Yes. | No. | Yes. | Prefer `noindex` in future; search result pages should not be broad index targets. | `src/app/[locale]/[country]/search/page.tsx`, `src/lib/catalog/public-queries.ts` |
| `/:locale/:country/articles` | Static article shell; not connected to public CMS. | No. | Yes. | No. | No. | Hold/noindex until CMS publish workflow exists. | `src/app/[locale]/[country]/articles/page.tsx` |
| `/:locale/:country/articles/:slug` | Static article detail shell for a limited in-code slug set; unknown slug `notFound()`. | No public CMS read. | Yes. | No. | No. | Index only after CMS status, medical review, schema, sitemap, and content QA. | `src/app/[locale]/[country]/articles/[slug]/page.tsx` |
| `/:locale/:country/offers` | Static discovery shell; official offers data model/public rendering not implemented. | No. | Yes. | FAQ schema only. | Yes. | Hold/noindex until offers model and labeling rules exist. | `src/app/[locale]/[country]/offers/page.tsx` |
| `/:locale/:country/dental` | Static vertical discovery shell. | No current dental-specific DB read. | Yes. | FAQ schema only. | Yes. | Indexable only after taxonomy/entity supply confirms dental page substance. | `src/app/[locale]/[country]/dental/page.tsx` |
| `/:locale/:country/beauty` | Static health-adjacent discovery shell. | No. | Yes. | FAQ schema only. | Yes. | High topical/YMYL risk; index only with clear medical-vs-nonmedical boundaries. | `src/app/[locale]/[country]/beauty/page.tsx` |
| `/:locale/:country/pet-clinics` | Static veterinary discovery shell. | No. | Yes. | FAQ schema only. | Yes. | Index after veterinary taxonomy/entity model exists; separate from human-health topical graph. | `src/app/[locale]/[country]/pet-clinics/page.tsx` |
| `/:locale/:country/pet-shops` | Static pet-shop discovery shell. | No. | Yes. | FAQ schema only. | Yes. | Likely noindex/segmented until business boundary is approved. | `src/app/[locale]/[country]/pet-shops/page.tsx` |
| `/:locale/:country/for-providers` | Real public provider lead/pricing page. | Reads public pricing plan initializer/component data, not public catalog entity pages. | Yes. | No. | Yes. | Indexable as acquisition page, not a healthcare entity page. | `src/app/[locale]/[country]/for-providers/page.tsx` |
| `/:locale/:country/about` | Real static localized page although not requested in the minimum list. | No. | Yes. | No. | No. | Indexable after sitemap decision. | `src/app/[locale]/[country]/about/page.tsx` |

### Scaffold or planned SEO route families present

| Route family | Current state | DB reads | Metadata/schema | Sitemap | Future recommendation | Key files |
| --- | --- | --- | --- | --- | --- | --- |
| `/:locale/:country/centers/:specialtySlug` | Fail-closed scaffold; calls `notFound()`. | No. | No meaningful output because route does not render. | No. | Implement only after specialty relationship policy and QA gate. | `src/app/[locale]/[country]/centers/[specialtySlug]/page.tsx` |
| `/:locale/:country/centers/:specialtySlug/:areaSlug` | Fail-closed scaffold; calls `notFound()`. | No. | No. | No. | Implement after specialty+area counts, canonical uniqueness, and content thresholds. | `src/app/[locale]/[country]/centers/[specialtySlug]/[areaSlug]/page.tsx` |
| `/:locale/:country/areas/:areaSlug` | Fail-closed scaffold; calls `notFound()`. | No. | No. | No. | Implement after Oman geo model, area uniqueness, and local content QA. | `src/app/[locale]/[country]/areas/[areaSlug]/page.tsx` |
| `/:locale/:country/services/:serviceSlug` | Fail-closed scaffold with landing gate status check; still ends in `notFound()`. | No public landing DB read. | No rendered metadata/schema. | No. | Implement after service taxonomy/canonical route mapping. | `src/app/[locale]/[country]/services/[serviceSlug]/page.tsx`, `src/lib/seo/landing-page-indexability.ts` |
| `/:locale/:country/services/:serviceSlug/:areaSlug` | Fail-closed scaffold with landing gate status check; still ends in `notFound()`. | No public landing DB read. | No rendered metadata/schema. | No. | Implement after service+area uniqueness, thresholds, and content model. | `src/app/[locale]/[country]/services/[serviceSlug]/[areaSlug]/page.tsx` |

### Admin route families

Admin routes are root-level, non-localized, protected by the admin layout/auth baseline, and should be blocked/noindex in future crawler policy. They are not in the sitemap.

| Route family | Current state | Operational vs shell | Key files |
| --- | --- | --- | --- |
| `/admin` | Protected control center dashboard. | Real navigation/status overview; many modules are status shells. | `src/app/admin/page.tsx`, `src/lib/admin/control-center.ts` |
| `/admin/login` | Minimal Supabase magic-link login. | Operational baseline. | `src/app/admin/login/page.tsx`, `src/app/admin/login/actions.ts`, `src/app/auth/callback/route.ts` |
| Provider onboarding leads | List/detail, limited status/priority mutation, event history. | Operational baseline. | `src/app/admin/provider-onboarding-leads/page.tsx`, `src/app/admin/provider-onboarding-leads/[leadId]/page.tsx` |
| Draft centers | List/detail and creation from lead foundation. | Foundation, not full publish workflow. | `src/app/admin/draft-centers/page.tsx`, `src/app/admin/draft-centers/[centerId]/page.tsx` |
| Commercial assignment pages | Homepage Ads/Special Offer Placement assignment shell. | Foundation/shell only; no public commercial rendering. | `src/app/admin/commercial-addons/page.tsx` |
| Media library | Metadata/review/archive list/detail. | Foundation; upload/picker/assignment flow disabled/missing. | `src/app/admin/media/page.tsx`, `src/app/admin/media/[mediaId]/page.tsx` |
| CMS core | Content entries, revisions, preview routes. | Admin storage foundation; public CMS rollout limited. | `src/app/admin/content/**`, `supabase/migrations/0060_admin_cms_core_revision_foundation.sql` |
| FAQ CMS | FAQ list/new/detail/preview routes. | Pilot foundation. | `src/app/admin/content/faqs/**` |
| Audit log | Admin audit event viewing foundation. | Foundation. | `src/app/admin/audit-log/page.tsx`, `supabase/migrations/0058_admin_audit_events.sql` |
| Settings/roles overview | Settings overview. | Shell/foundation for roles/permissions visibility. | `src/app/admin/settings/page.tsx`, `src/lib/admin/roles.ts` |

## 2. Current public data query audit

All public catalog helpers use `createSupabaseServerClient()` and therefore should rely on Supabase RLS plus explicit public filters where present. Current helper filters are lightweight and often omit `status = active`, `is_active = true`, and `deleted_at IS NULL` in application code, so the public/private boundary depends heavily on RLS policies.

| Helper | Tables read | Public fields exposed | Filters/pagination | Error behavior | SEO/private-boundary risk |
| --- | --- | --- | --- | --- | --- |
| `listPublicDoctors` | `doctors`. | id, slug, names, title/gender, country. | `limit` clamped 1-50; optional `default_country`; no specialty/area/service filter. | Returns empty fallback with `query_error`. | If RLS/policies are incomplete, inactive/deleted/thin doctors could list; no offset/cursor for large directories. |
| `getPublicDoctorBySlug` | `doctors`, `specialties`, `doctor_services`, `doctor_practice_locations`, `centers`, geo tables, `provider_license_records`, `entity_media`, `media_assets`. | Names, title/gender, bio, experience, primary specialty, services, practice centers/locations, approved contact actions, approved public license, approved public media. | slug + optional country; child limits clamped; no active filters in helper. | Query error returns fallback null; page turns missing data into `notFound()`. | Profile may be orphaned from sitemap and listing if relation data is incomplete; null on query errors can create temporary 404s. |
| `listPublicCenters` | `centers`. | id, slug, bilingual names/descriptions, center type, default country. | `limit` clamped; optional country and `centerType`; no area/service/specialty filter. | Empty fallback on error. | Heavy reliance on RLS for `status/is_active/deleted_at`; subtype pages can be thin. |
| `getPublicCenterBySlug` | `centers`, `center_locations`, geo tables, `center_services`, `services`, `doctor_practice_locations`, `doctors`, `provider_license_records`, `entity_media`, `media_assets`. | Bilingual names/descriptions, verification status, services, doctors, locations, approved contacts, approved license, logo/cover/gallery. | slug + optional country; child limits clamped. | Query error returns null; page `notFound()`. | Profile may 404 on transient child query error; schema absent despite rich visible content. |
| `listPublicServices` | `services`. | id, slug, bilingual names/descriptions, category. | `limit` clamped; optional category; no active/deleted filter in helper. | Empty fallback on error. | Service slug is unique only per taxonomy group, so future `/services/:slug` risks ambiguity. |
| `listPublicGeoAreas` | `geo_areas`. | id, slug, bilingual names, city/country ids. | `limit` clamped; optional countryId/cityId. | Empty fallback on error. | Area slug is unique per city, not country-wide; local pages can cannibalize/soft-404 if implemented too early. |
| `searchPublicCatalog` | `centers`, `doctors`, `services`, `geo_areas`. | Same summary fields as list helpers. | Sanitizes query; min length 2; `ilike` on name/slug; clamped limit; no country filter in options observed. | Empty typed search result on error or too-short query. | Search result pages are not good index targets; no advanced ranking, no typo/alias support, no noindex metadata currently observed. |
| Public media helpers | `entity_media`, `media_assets`. | public URL, mime, dimensions, alt/caption, usage kind, primary/featured/sort. | Helper accepts only image jpeg/png/webp/avif and approved usage kinds; query filters should ensure public visibility/review. | Invalid media silently omitted; parent helper errors if query fails. | Missing responsive variants and assignment workflow; fallback alt text is generic. |
| Public contact helpers | Center/location/doctor location contact fields from catalog queries. | `tel:` and `wa.me` links only when public visibility flags and `contact_review_status = approved` pass. | Normalizes Oman WhatsApp digits. | Invalid/unapproved values omitted. | Boundary is good for contact fields, but no report-correction loop exists. |
| Public license helper | `provider_license_records`. | License number, authority, country. | Requires matching entity, `deleted_at IS NULL`, `public_license_visible = true`, `license_review_status = approved`, safe text. | Omitted on error or invalid data. | Center and doctor licenses are separated; no department/service license layer or `last_checked/source` public trust fields. |

## 3. Sitemap, robots, and `llms.txt` audit

- `src/app/sitemap.ts` is static-code driven. It includes localized roots, discovery routes (`doctors`, `dental`, `centers`, `labs`, `pharmacies`, `hospitals`, `offers`, `beauty`, `pet-clinics`, `pet-shops`, `services`, `search`), and `/for-providers`.
- Dynamic doctor URLs, center URLs, article details, specialty pages, service pages, service+area pages, area pages, and local pages are not included.
- `lastModified` uses `new Date()` at request/build time, not entity `updated_at`; this is unsuitable for 10k+ pages because every URL can appear freshly modified.
- The current sitemap is not ready for large dynamic inventory; it needs paging/sitemap index strategy, DB-backed public-safe projections, per-entity timestamps, and indexability thresholds.
- `src/app/robots.ts` allows `/` for all user agents and points to the sitemap. It does not explicitly disallow `/admin`, `/auth`, internal preview routes, search URLs, or private/admin surfaces.
- `public/llms.txt` is stale. It lists only early public routes and says provider data/listings/profiles are not yet public, while doctor and center profile routes now exist.
- Future Prompt 28 should update crawler policy for `OAI-SearchBot`, `ChatGPT-User`, and `GPTBot` explicitly, but this audit does not change those files.

## 4. Metadata, canonical, and hreflang audit

- `metadataBase` is `siteConfig.baseUrl`, derived from `NEXT_PUBLIC_APP_URL`, development localhost fallback, or production `https://drmuscat.com`.
- `buildLocalizedMetadata()` generates canonical URLs from the route pathname + locale + country.
- Language alternates include English and Arabic equivalents for the same pathname.
- `x-default` points to `languageAlternates.en`, currently the English country root (`/en/om`), not necessarily the equivalent page. This is acceptable for a root-only default but suboptimal for detail and discovery pages.
- Doctor metadata uses the doctor display name for title and a bio/specialty/practice-location style description fallback.
- Center metadata uses the center display name and description fallback.
- Discovery pages have in-code localized title/description copy.
- Missing risks: no per-entity hreflang validation against actual localized completeness, no noindex control for search/thin scaffolds that render, no canonical conflict resolver for future area/service ambiguous slugs, and no metadata sourced from public-safe projection/QA status.

## 5. Structured data audit

- Existing JSON-LD helpers support `Organization`, `WebSite`, `BreadcrumbList`, `FAQPage`, `Physician`, `MedicalClinic`, `MedicalOrganization`, `Pharmacy`, `DiagnosticLab`, and `MedicalTest` types.
- In current route usage, FAQ JSON-LD is emitted on several discovery/vertical pages from static visible FAQ copy.
- Doctor detail routes do not currently emit Physician JSON-LD.
- Center/hospital/pharmacy/lab routes do not currently emit LocalBusiness/Hospital/MedicalClinic/Pharmacy/DiagnosticLab JSON-LD mapping.
- BreadcrumbList helpers exist but route-level breadcrumb JSON-LD/visible breadcrumbs are not broadly implemented.
- No implemented mapping was found for `Dentist`, `BeautySalon`, `HealthClub`, `VeterinaryCare`, or `PetStore`.
- Future schema mapping must be based on visible page content, public-safe license/contact/media fields, taxonomy/entity category mapping, and QA/indexability decisions.

## 6. Internal linking audit

- Doctor listing cards currently render doctor summaries but do not link to doctor profile routes; they still show a “Profile coming soon” label.
- Center listing cards currently render center summaries but do not link to center profile routes; they still show a “Profile coming soon” label.
- Doctor detail pages link to practice center profiles where center slugs exist.
- Center detail pages show associated doctor summaries, but those doctor summaries do not currently link to doctor profile routes.
- Current services on detail pages are displayed as service summaries; service page route linking is not yet safe because service slug ambiguity remains unresolved.
- Location names are displayed but should not link to area/city pages until geo uniqueness and local page QA are implemented.
- Discovery pages link mostly to current route families and provider CTA surfaces; they do not have a graph-driven related entity engine.
- Breadcrumb UI/JSON-LD is missing or not broad enough for future route depth.
- Related blocks are manual/limited rather than generated from an entity relation graph.
- Orphan risk is high for dynamic doctor and center profiles because sitemap omits them, listing cards do not link to profile routes, and center detail doctor summaries do not link to doctor profiles.

## 7. Existing taxonomy and geo audit

- Core taxonomy tables exist: `taxonomy_groups`, `service_categories`, `services`, and `specialties`.
- Newer taxonomy foundation exists for `healthcare_verticals`, `center_categories`, and `center_category_assignments`, with public directory/profile flags and RLS for approved public taxonomy rows.
- Specialty hierarchy add-on fields exist: parent specialty, specialty level, clinical domain, age focus, flags for doctor specialty/primary care/surgical/dental, public directory/profile flags, and `specialty_aliases`.
- Existing `center_type` enum covers clinic, hospital, dental clinic, beauty clinic, laboratory, imaging center, pharmacy, wellness center, physiotherapy center, and other.
- Dental, hospital, pharmacy, lab, beauty, imaging, wellness, and physiotherapy are represented at enum/foundation level. Pet clinic and pet shop are not represented in `center_type` and need separate vertical/category decisions.
- IVF/fertility, mental health, counseling, optical, audiology, elderly care, vaccination/travel clinic, ambulance/emergency transport, home sample collection, speech therapy, occupational therapy, weight management, and telemedicine are not confirmed as complete public taxonomy seeds in the audited code. They require Prompt 2-4 taxonomy/geo planning and seed validation.
- Geo tables exist for countries, regions, cities, and areas with active/deleted fields and city-scoped area slugs.
- Current Oman geo coverage cannot be treated as complete for all governorates/wilayats/areas from schema alone; no complete approved Oman geo seed audit was found in this prompt.
- Geo aliases were not observed as implemented runtime tables; area slug ambiguity is documented in existing landing-page contracts.

## 8. License, claim, verification, and trust audit

- `provider_license_records` exists with separate center/doctor targeting, review status, public visibility, and public RLS gates.
- `centers` and `doctors` have `verification_status` fields.
- `center_claims` and `center_memberships` exist as foundations, but public ownership/claim workflow remains out of scope.
- Public license display is safe and conservative: only approved, visible, syntactically safe license numbers are exposed.
- Doctor license and entity license records are separated by `entity_type` plus mutually exclusive `center_id`/`doctor_id`.
- Department-level licensing and service-level license requirements are missing.
- Report incorrect info/correction request workflow was not observed as a public feature.
- Explicit public `source`, `source_version`, and `last_checked` trust fields for provider/entity facts are missing outside limited taxonomy source fields.

## 9. Media and image audit

- `media_assets` and `entity_media` support public media foundations; admin media fields add alt/caption EN/AR, usage kind, review status, visibility status, archive flag, and updater profile.
- Public media rendering supports center logo, cover, gallery images, and doctor profile images through `getPublicCenterMedia()` and `getPublicDoctorMedia()`.
- Public media helpers enforce approved public image mime types and sanitize alt/caption text; unsafe promotional caption patterns are suppressed.
- Public images expose width and height when stored, but there is no responsive image variant pipeline, CDN transformation model, or explicit size standard in current runtime.
- Upload/picker/assignment flow remains missing/disabled in admin foundation.
- Future standards are needed for card thumbnails, profile images, cover images, galleries, aspect ratios, minimum dimensions, alt text review, and performance budgets.
- Performance risk: large original public URLs may render without derivative sizes or responsive variants.

## 10. Admin/CMS audit

- Admin Control Center is real as a protected navigation/status surface, with explicit module statuses.
- Permissions/roles registry foundations exist, but broad fine-grained workflows remain limited.
- Audit log foundation exists via `admin_audit_events` and `/admin/audit-log`.
- Media library metadata foundation exists, but upload, picker, and public assignment workflows are not complete.
- CMS core entries/revisions exist with admin routes and revision/preview screens; public article CMS rendering is not live.
- FAQ CMS pilot/admin routes exist; public FAQ read rollout is limited to existing static/discovery behavior and foundations.
- Provider onboarding leads are operational for capture, list/detail, status/priority mutation, and history events.
- Draft center creation from onboarding lead exists, but draft center workflow does not equal full entity publishing.
- Center subscriptions/add-ons foundation exists; public paid placement rendering and billing are not active.
- Missing before bulk import and entity publishing: import staging tables, mapping UI, normalization, duplicate detection, import review queues, QA gates, publish projection, doctor admin, entity admin, taxonomy admin, source/last-checked fields, and safe activation workflow.

## 11. Risk register

| Risk | Severity | Recommended next prompt | Notes |
| --- | --- | --- | --- |
| Orphan profile pages | High | Prompt 20-23 | Dynamic profiles render, but the sitemap omits them, listing cards do not link to profile routes, and center detail doctor summaries do not link to doctor profiles. |
| Static/non-dynamic sitemap | High | Prompt 23 | Current sitemap omits profiles/local pages and uses current date for all URLs. |
| Premature indexing of thin local pages | High | Prompt 10-11, 25-27 | Scaffold routes correctly fail closed; future pages need thresholds. |
| Duplicate doctor/entity records | High | Prompt 15 | No duplicate detection/import review foundation for bulk data. |
| Route cannibalization between centers/specialties/services/local pages | High | Prompt 2-4, 21-27 | Specialty/service/area slug ambiguity is unresolved. |
| Mixed medical and non-medical beauty topical dilution | Medium-High | Prompt 2, 24, 28 | Beauty pages need clear taxonomy/schema/noindex policy. |
| Missing license verification | High | Prompt 8 | License table exists, but broader verification and last-checked workflow is incomplete. |
| YMYL mental health risk | High | Prompt 2-3, 10, 24 | Mental health/counseling require stricter content/review/schema controls. |
| Schema mismatch risk | High | Prompt 24 | Schema helper types exist, but route-level entity schema is mostly absent. |
| No public/private projection boundary | High | Prompt 17 | Current helpers query base tables and rely on RLS; publish projection is needed. |
| Excel import directly into public tables risk | Critical | Prompt 12-16 | Bulk import must stage, normalize, dedupe, and review before publish. |
| Incomplete geo coverage | High | Prompt 4 | Oman governorate/wilayat/area completeness is not proven. |
| Missing internal linking graph | High | Prompt 20-22 | Current linking is manual/limited and cannot scale. |
| Missing source/last_checked fields | High | Prompt 8, 12, 17 | Trust and freshness cannot be reliably displayed or audited. |

## 12. Recommended prompt sequence confirmation

Prompt 2  → Master Taxonomy Registry  
Prompt 3  → Taxonomy Seed + Validation  
Prompt 4  → Oman Geo Model  
Prompt 5  → Doctor/Specialty/Subspecialty Model  
Prompt 6  → Entity/Department Model  
Prompt 7  → Service Taxonomy  
Prompt 8  → License Model  
Prompt 9  → Languages/Hours/Insurance  
Prompt 10 → QA Gate  
Prompt 11 → Index Threshold Config  
Prompt 12 → Bulk Import Staging  
Prompt 13 → Excel Mapping  
Prompt 14 → Normalization  
Prompt 15 → Duplicate Detection  
Prompt 16 → Admin Import Review  
Prompt 17 → Public-safe Publish  
Prompt 18 → Doctor Profile V2  
Prompt 19 → Entity Profile V2  
Prompt 20 → Entity Relation Graph  
Prompt 21 → Internal Linking Engine  
Prompt 22 → Breadcrumb + Related Blocks  
Prompt 23 → Dynamic Sitemap  
Prompt 24 → Schema Mapping  
Prompt 25 → Local Pages  
Prompt 26 → Specialty + Area Pages  
Prompt 27 → Core Service Pages  
Prompt 28 → Robots + llms.txt  
Prompt 29 → SEO Monitoring Dashboard  
Prompt 30 → SEO QA Report Automation

## 13. Validation plan for this audit

No documentation validation script was added because no clear existing docs validation pattern was found for this repository. Safe existing checks to run for this documentation-only change:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm routes:check`
- `pnpm seo:check`
