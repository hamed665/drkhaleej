# DrMuscat / Parent Domain SEO-First Roadmap 2026

Status: Approved strategic roadmap for execution planning  
Date: 2026-06-26  
Scope: Oman-first healthcare discovery platform with GCC-ready parent-domain architecture  
Primary execution rule: SEO, speed, clean indexing, and reusable templates must launch before full provider/doctor/marketer dashboards.

---

## 1. Strategic Direction

The project will now follow an SEO-first launch strategy.

The immediate goal is not to complete every dashboard before launch. The immediate goal is to make the public platform crawlable, fast, useful, bilingual, internally linked, and ready to start earning Google and LLM visibility signals as early as possible.

The platform must support:

- English and Arabic public pages.
- Oman launch first.
- Future GCC expansion through a parent domain.
- Provider monetization through plans, offers, ads, visibility, and reporting.
- Free discovery for users.
- Strict no-duplicate-content and no-thin-page indexing rules.

---

## 2. Parent Domain Decision

A new parent domain will be selected before the main SEO launch.

Temporary placeholder:

```text
{PARENT_DOMAIN}
```

Recommended Oman route structure:

```text
https://{PARENT_DOMAIN}/en/om
https://{PARENT_DOMAIN}/ar/om
```

Future country route structure:

```text
https://{PARENT_DOMAIN}/en/ae
https://{PARENT_DOMAIN}/ar/ae

https://{PARENT_DOMAIN}/en/qa
https://{PARENT_DOMAIN}/ar/qa

https://{PARENT_DOMAIN}/en/sa
https://{PARENT_DOMAIN}/ar/sa

https://{PARENT_DOMAIN}/en/bh
https://{PARENT_DOMAIN}/ar/bh

https://{PARENT_DOMAIN}/en/kw
https://{PARENT_DOMAIN}/ar/kw
```

### DrMuscat Domain Rule

If the DrMuscat domain is kept, it must not duplicate Oman content.

Allowed options:

1. Redirect DrMuscat to the new parent-domain Oman section.
2. Keep DrMuscat only as an old/local campaign brand.
3. Avoid using DrMuscat publicly if the new parent brand is chosen before launch.

Strict SEO rule:

```text
Never serve the same Oman pages on both DrMuscat and the parent domain.
```

If redirects are needed:

```text
dr-muscat-domain.example/en/om/doctors
301 -> https://{PARENT_DOMAIN}/en/om/doctors
```

---

## 3. Bilingual and International SEO Rules

All public pages must support English and Arabic.

Oman routes:

```text
/en/om/...
/ar/om/...
```

Recommended hreflang values:

```text
en-OM
ar-OM
x-default
```

Every indexable English page must have a matching Arabic alternate when possible. Every Arabic page must have a matching English alternate when possible.

Canonical and hreflang generation must come from a central domain-aware metadata builder.

---

## 4. Product Principles

1. Users browse for free.
2. Providers pay for visibility, enhanced profiles, offers, ads, reporting, and growth tools.
3. Oman comes first.
4. GCC architecture must be ready from day one.
5. SEO pages must never be generated only because a keyword exists.
6. Every indexable page must pass a quality gate.
7. No thin pages in sitemap.
8. No duplicate canonical URLs.
9. No fake medical claims.
10. No hidden or misleading ads.
11. Every commercial placement must be labeled clearly.
12. Speed and Core Web Vitals are product requirements.
13. Public data must show source, last checked, correction/report option, and claim option where relevant.
14. Admin and provider panels are important, but they must not block the initial SEO launch.

---

## 5. First 4-5 Month Goal

The target is to build enough search visibility to support provider sales.

Primary goal:

```text
Reach meaningful organic traffic and provider-facing proof of demand.
```

Stretch target:

```text
5,000-7,000 daily visits within 4-5 months.
```

This is not guaranteed. Execution must focus on:

- High-quality indexed pages.
- Strong internal linking.
- Fast page performance.
- Real provider/profile data.
- Local Oman coverage.
- Commercial categories with buyer intent.
- Search Console monitoring.
- Iterative keyword-driven expansion.

---

## 6. Launch Priority Order

Development must follow this order:

1. Domain and brand config.
2. Technical SEO foundation.
3. Sitemap and canonical cleanup.
4. Ad slot layout system.
5. WhatsApp/global contact CTA.
6. Large import pipeline.
7. Hospital/pharmacy/doctor profile guards.
8. Reusable profile and directory templates.
9. Local area pages.
10. Internal linking engine.
11. FAQ placement system.
12. Article template and article CMS minimal.
13. Media/image optimization pipeline.
14. Search improvements.
15. First controlled index batch.
16. AdSense/direct banner readiness.
17. Offers engine.
18. Plan pricing editor.
19. Provider signup V2.
20. Marketer attribution.
21. Provider/doctor dashboards.
22. Full commercial dashboards.
23. GCC country expansion.

---

## 7. Phase 1 — Immediate Pre-Launch Foundation

Goal: prepare the new parent domain for clean indexing.

### Required Work

#### 7.1 Brand and Domain Config

Create a central config for:

```text
siteName
parentBrandName
primaryDomain
defaultCountry
supportedCountries
supportedLocales
countryBrandMap
```

The domain must be changeable in one place.

#### 7.2 Canonical Builder

Every public page must generate canonical URLs from the same source.

Example:

```text
https://{PARENT_DOMAIN}/en/om/pharmacies/al-khuwair
https://{PARENT_DOMAIN}/ar/om/pharmacies/al-khuwair
```

#### 7.3 Hreflang Upgrade

For Oman pages:

```text
en-OM
ar-OM
x-default
```

#### 7.4 Sitemap From SEO Registry

The sitemap must not list every route blindly.

Only pages passing indexability rules should appear.

#### 7.5 Robots Hardening

Admin, staging, import preview, private routes, and internal tools must never be indexed.

#### 7.6 llms.txt Update

The `llms.txt` file must describe:

1. What the platform is.
2. Supported countries.
3. Public routes.
4. Safety policy.
5. Provider advertising model.
6. No diagnosis/no medical advice rule.
7. Important public pages.
8. How AI systems should understand the platform.

#### 7.7 Global WhatsApp CTA

All page templates must support a safe global WhatsApp/support CTA.

This CTA must be configurable and localized.

---

## 8. Phase 2 — Universal Ad and Commercial Slot System

Goal: design ad placement locations now so future AdSense, direct banners, sponsored cards, and special offers can be added without redesigning pages.

### Required Component

Create:

```tsx
<CommercialSlot />
```

Required props:

```text
slotKey
pageFamily
entityType
entityId
locale
country
sensitivityLevel
```

### Slot Keys

Homepage:

```text
home_after_search
home_after_categories
home_before_offers
```

Directory pages:

```text
directory_after_hero
directory_after_filters
directory_inside_results
directory_after_results
```

Profile pages:

```text
profile_after_contact
profile_after_services
profile_sidebar_desktop
```

Area pages:

```text
area_after_summary
area_inside_category_blocks
area_footer_banner
```

Article pages:

```text
article_after_intro
article_mid
article_after_related
```

Offers pages:

```text
offers_top
offers_inside_grid
offers_footer
```

### Commercial Slot Rules

1. Every sponsored placement must be labeled.
2. Organic cards and sponsored cards must look clearly different.
3. Sensitive medical result pages must not show unsafe ad placements.
4. Ad slots must reserve height to avoid layout shift.
5. If no ad exists, the slot may show a house ad or collapse safely.
6. AdSense must be optional, not hardcoded.
7. Direct local banners must be supported.

---

## 9. Phase 3 — Data Import and Public Profile Launch

Goal: use available Oman data to build authority quickly.

Available data:

1. Hospitals, roughly 100+ records.
2. Pharmacies, roughly 1300 records.
3. General practitioner doctors.
4. Future categories: charity centers, optometry, clinics, labs, beauty, dental, IVF, wellness.

### Required Work

#### 9.1 Large Import Mode

The current 500-row limit is not enough.

Required:

```text
parent batch
child batches
chunked import
progress status
duplicate detection
validation summary
retry support
```

#### 9.2 Hospital Profile Guard

Public hospital pages must only be indexable if approved and safe.

#### 9.3 Pharmacy Profile Guard

Public pharmacy pages must only be indexable if approved and safe.

#### 9.4 Doctor/GP Profile Mapping

General doctors must map into the doctor profile system cleanly.

#### 9.5 Unified Profile Template

Create one reusable template for:

```text
doctor
center
hospital
pharmacy
lab
optometry
charity center
```

### Profile Page Required Blocks

1. Name.
2. Type.
3. Location.
4. Contact actions.
5. WhatsApp/call/directions.
6. Website if available.
7. Services/departments.
8. Source.
9. Last checked.
10. Claim this profile.
11. Report wrong info.
12. Related providers.
13. Related area.
14. Related articles.
15. FAQ.
16. Commercial slot.
17. Safety disclaimer.

---

## 10. Phase 4 — Directory, Area, and Local SEO Pages

Goal: build local SEO pages city by city and area by area.

### Directory Template

Used for:

```text
doctors
hospitals
pharmacies
labs
centers
dental
beauty
pet clinics
pet shops
optometry
```

Required blocks:

1. Hero.
2. Search/filter.
3. Trust note.
4. Intro text.
5. Entity cards.
6. Commercial slot after filters.
7. Sponsored card inside results.
8. Related services.
9. Related areas.
10. Related articles.
11. FAQ.
12. WhatsApp CTA.

### Area Page Template

Example:

```text
/en/om/areas/al-khuwair
/ar/om/areas/al-khuwair
```

Required blocks:

1. Area overview.
2. Number of providers in the area.
3. Pharmacies in the area.
4. Doctors in the area.
5. Hospitals/clinics/labs nearby.
6. Top services in the area.
7. Nearby areas.
8. Related specialty-area pages.
9. FAQ.
10. Commercial slot.
11. Safety disclaimer.

### Specialty and Service Pages

Examples:

```text
/en/om/dentist/muscat
/en/om/dental-clinics/al-khuwair
/en/om/services/dental-implants/muscat
/en/om/services/laser-hair-removal/qurum
```

These pages must only be indexable when enough real provider coverage exists.

---

## 11. Phase 5 — SEO Quality Gate

Goal: prevent low-quality pages from entering Google index.

### Indexable Profile Requirements

A profile can be indexable only if it has:

1. Public name.
2. Entity type.
3. Country/city/area.
4. Contact or directions.
5. Source.
6. Last checked.
7. Public-safe content.
8. Canonical URL.
9. No duplicate slug.
10. Internal links.
11. Visible disclaimer.

### Indexable Directory Page Requirements

A directory/local page can be indexable only if it has:

1. Real matching providers.
2. Unique intro.
3. Entity cards.
4. Related internal links.
5. FAQ or useful content.
6. Canonical.
7. Hreflang.
8. Sitemap eligibility.
9. No duplicate canonical.

### Sitemap Rule

Only pages passing the quality gate may appear in sitemap.

---

## 12. Phase 6 — FAQ CMS Placement

Goal: make FAQ editable from admin and reusable across every page family.

Required work:

1. FAQ placement schema.
2. Admin assignment UI.
3. Page family targeting.
4. Entity targeting.
5. Locale/country targeting.
6. Display order.
7. Approved-only public rendering.
8. FAQ JSON-LD only when FAQ is visible on page.

Page families:

```text
homepage
directory
profile
area
specialty
service
article
offer
for_providers
```

---

## 13. Phase 7 — Article System

Goal: create article pages for SEO and user trust.

### Required Article Template

1. Breadcrumb.
2. Article title.
3. Summary.
4. Category.
5. Author/editor/reviewer.
6. Last updated.
7. Reading time.
8. Safety note.
9. Table of contents.
10. Main content.
11. Related providers.
12. Related area pages.
13. Related services.
14. FAQ block.
15. Article ad slots.
16. WhatsApp CTA.
17. Correction/report option.

### First Article Categories

1. Dental guides.
2. Pharmacy guides.
3. Lab test preparation.
4. Hospital/clinic selection.
5. Dermatology/aesthetic safety checklists.
6. IVF/fertility consultation checklist.
7. General Oman healthcare guides.

### Article Rule

Medical or health-sensitive articles must not make diagnosis or treatment claims.

---

## 14. Phase 8 — Speed and Media Optimization

Goal: protect SEO and user experience through image and performance standards.

Required work:

1. Private media upload.
2. MIME validation.
3. Max file size.
4. Image resize.
5. WebP/AVIF conversion.
6. Thumbnail/card/profile/OG derivatives.
7. Alt text EN/AR.
8. Admin approval.
9. Replace raw images with optimized image rendering.
10. Core Web Vitals dashboard.

Performance targets:

1. LCP under 2.5 seconds.
2. INP under 200 ms.
3. CLS under 0.1.
4. Reserved ad slot heights.
5. Lazy loading below the fold.
6. Critical images optimized.

---

## 15. Phase 9 — First Controlled SEO Launch

Goal: start Google indexing with a clean first batch.

### First Batch Target

Publish 80-150 indexable pages.

Recommended mix:

1. Homepage EN/AR.
2. Doctors directory EN/AR.
3. Hospitals directory EN/AR.
4. Pharmacies directory EN/AR.
5. Labs directory EN/AR.
6. 20 hospital profiles.
7. 60 pharmacy profiles.
8. 30 doctor/GP profiles.
9. 5 area pages.
10. 10 money pages.
11. 5 articles.

### First Money Pages

1. Dentist in Muscat.
2. Dental clinics in Muscat.
3. Orthodontist in Muscat.
4. Dermatologist in Muscat.
5. Laser hair removal Muscat.
6. Dental implants Muscat.
7. Teeth whitening Muscat.
8. IVF clinic Muscat.
9. Labs in Muscat.
10. Home blood test Muscat.

---

## 16. Phase 10 — Search and Analytics

Goal: improve discovery and collect commercial proof.

Required work:

1. Real search results.
2. Typo tolerance.
3. Arabic normalization.
4. Area filters.
5. Service filters.
6. Search logs.
7. Zero-result logs.
8. Profile view tracking.
9. WhatsApp click tracking.
10. Call click tracking.
11. Directions click tracking.
12. Ad impression tracking.
13. Offer click tracking.

Commercial proof metrics:

1. Profile views.
2. WhatsApp clicks.
3. Call clicks.
4. Direction clicks.
5. Category page impressions.
6. Area page impressions.
7. Search queries.
8. Offer clicks.
9. Sponsored card clicks.

---

## 17. Phase 11 — Plans and Provider Signup

Goal: prepare monetization without blocking SEO launch.

### Four Plans

1. Free Listing.
2. Verified Starter.
3. Growth Partner.
4. Premium Partner / Ads Pro.

### Billing Terms

1. 3 months.
2. 6 months.
3. 12 months.

### Admin Pricing Requirements

Admin must be able to set:

1. Price for each plan and billing term.
2. Discount label.
3. Active/inactive status.
4. Featured/recommended badge.
5. Public visibility.

### Feature Limits

Admin must control:

1. Max branches.
2. Max doctors/staff.
3. Max services.
4. Max photos.
5. Gallery access.
6. Offer count.
7. Sponsored eligibility.
8. Analytics level.
9. Priority review.
10. Review reply access.
11. Article mention eligibility.
12. Ad placement eligibility.

### Provider Signup V2

Signup must capture:

1. Provider name.
2. Contact person.
3. Phone.
4. WhatsApp.
5. Email.
6. Provider type.
7. City.
8. Area.
9. Selected plan.
10. Billing term.
11. Preferred language.
12. Referral/marketer code.
13. UTM source/campaign.
14. Consent.

---

## 18. Phase 12 — Marketer and Sales Foundation

Goal: allow marketers to bring providers into the platform and track commission.

Required work:

1. Marketer role.
2. Marketer referral code.
3. Marketer dashboard.
4. Lead creation.
5. Lead status pipeline.
6. Provider attribution.
7. Commission rule.
8. Commission pending/approved/paid status.
9. Sales notes.
10. Sales activity log.

Marketer restrictions:

1. A marketer must not approve their own commission.
2. A marketer must not access unrelated leads.
3. A marketer must not change platform pricing.
4. A marketer must not publish providers directly.
5. A marketer must not approve medical or public content.

---

## 19. Phase 13 — Ads and Offers

Goal: support both AdSense and direct local advertising.

### Ads

Required:

1. Ad slot registry.
2. Direct banner campaigns.
3. AdSense adapter.
4. Sponsored label rules.
5. Page-family targeting.
6. Entity targeting.
7. Start/end dates.
8. Impression tracking.
9. Click tracking.
10. Sensitive page exclusions.

### Offers

Required:

1. Offer title EN/AR.
2. Description EN/AR.
3. Provider relation.
4. Price/terms.
5. Validity dates.
6. Image/video.
7. Review workflow.
8. Public offer page.
9. Offer cards.
10. Offer analytics.

---

## 20. Phase 14 — Provider and Doctor Dashboards

Goal: build provider tools after SEO launch begins.

### Provider Dashboard Lite

1. Current plan.
2. Profile completeness.
3. Edit request.
4. Services.
5. Photos.
6. Contact details.
7. Basic analytics.
8. Billing status.
9. Support.

### Doctor Dashboard Lite

1. Public profile view.
2. Bio edit request.
3. Specialty/services.
4. Practice locations.
5. Media request.
6. Basic analytics.

Full dashboards come after the site has organic traction.

---

## 21. Phase 15 — Oman Commercial Execution

Goal: make the platform sellable in Oman.

Required work:

1. Provider media kit.
2. Advertise with us page.
3. For providers page connected to real plans.
4. Sales dashboard.
5. Click reports.
6. Monthly provider reports.
7. Offer reports.
8. Sponsored placement reports.
9. Renewal tracking.
10. Manual billing and receipt review.

---

## 22. Phase 16 — GCC Expansion Readiness

Goal: prepare the platform for future countries after Oman traction.

Required work:

1. Country config registry.
2. Country-specific routes.
3. Country-specific currency.
4. Country-specific phone format.
5. Country-specific timezone.
6. Geo hierarchy per country.
7. Country-specific sitemap.
8. Country-specific hreflang.
9. Country-specific SEO registry.
10. Country-specific plan pricing.
11. Country-specific provider onboarding.
12. Country-specific legal/commercial settings.

Future countries:

```text
UAE
Qatar
Saudi Arabia
Bahrain
Kuwait
```

---

## 23. PR Roadmap Summary

### Minimum SEO Launch

Target: get the site live and indexed cleanly.

Estimated PRs:

```text
22 PRs
```

Includes:

1. Brand/domain config.
2. Canonical builder.
3. Hreflang.
4. Sitemap registry.
5. Robots hardening.
6. llms.txt.
7. Universal ad slot.
8. WhatsApp CTA.
9. Large import mode.
10. Hospital guard.
11. Pharmacy guard.
12. GP import mapping.
13. Unified profile template.
14. Directory template.
15. Area template.
16. Internal linking.
17. First index batch.
18. SEO QA.
19. Search result basics.
20. Profile source/report/claim UI.
21. Performance baseline.
22. GSC setup checklist.

### Strong SEO Launch

Estimated PRs:

```text
35 PRs
```

Adds:

1. FAQ placement.
2. Article template.
3. Article CMS minimal.
4. Article ad slots.
5. Direct banner support.
6. AdSense adapter.
7. Offer engine V1.
8. Media upload.
9. Image derivatives.
10. Search analytics.
11. Click tracking.
12. SEO dashboard.
13. More local pages.

### Oman Commercial Ready

Estimated PRs:

```text
60-70 PRs
```

Adds:

1. Plan pricing editor.
2. Feature limits.
3. Provider signup V2.
4. Marketer attribution.
5. Sales dashboard.
6. Commission foundation.
7. Provider dashboard lite.
8. Doctor dashboard lite.
9. Billing manual.
10. Offers reporting.
11. Ads reporting.
12. Provider monthly reports.

### GCC Ready

Estimated PRs from current state:

```text
130-150 PRs
```

Includes:

1. Oman commercial-ready system.
2. Multi-country architecture.
3. Country SEO.
4. Country data imports.
5. Country pricing.
6. Country onboarding.
7. Country sales.
8. Country sitemap and hreflang.
9. Country launch QA.

---

## 24. First 15 PRs to Execute

1. `brand-domain-config-v1`
2. `canonical-hreflang-parent-domain-v1`
3. `seo-page-registry-v1`
4. `sitemap-readiness-gate-v1`
5. `robots-and-private-route-hardening-v1`
6. `llms-txt-parent-brand-update-v1`
7. `universal-commercial-slot-v1`
8. `global-whatsapp-cta-v1`
9. `large-import-chunking-v1`
10. `hospital-profile-guard-hardening-v1`
11. `pharmacy-profile-guard-v1`
12. `gp-doctor-import-mapping-v1`
13. `unified-public-profile-template-v1`
14. `directory-page-template-v1`
15. `area-page-template-v1`

These 15 PRs are the first execution layer because they allow the platform to start public SEO safely before the full dashboard system is complete.

---

## 25. Non-Goals for Initial SEO Launch

Do not block launch on:

1. Full provider dashboard.
2. Full doctor dashboard.
3. Full marketer dashboard.
4. Online payment automation.
5. Advanced offer marketplace.
6. Full review system.
7. Full appointment/booking system.
8. GCC countries beyond configuration readiness.

These should follow after SEO launch begins and organic signals are measurable.

---

## 26. Final Execution Rule

Do not delay SEO launch for full dashboards.

Correct order:

```text
SEO + speed + clean index
then content + ads + offers
then plans + sales
then provider/doctor dashboards
then GCC expansion
```

This keeps the project moving toward traffic, proof, and revenue instead of waiting for a perfect backend system that nobody visits.
