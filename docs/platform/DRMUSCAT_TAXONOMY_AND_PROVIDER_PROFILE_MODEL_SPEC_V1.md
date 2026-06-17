# DrMuscat Taxonomy and Provider Profile Model Spec V1

## 1. Purpose

This document is a documentation-only planning spec for the DrMuscat taxonomy, provider profile, doctor profile, specialty, service, insurance, license, media, review, and bilingual labeling model.

It does not implement database changes, UI, RLS, routes, public publishing, provider dashboards, AI, billing, reviews, media upload, or payment behavior.

## 2. Why this spec exists

DrMuscat must not become a thin directory with a few center names. The product needs a structured health, medical, beauty, wellness, fitness, nutrition, diagnostics, pharmacy, and possibly veterinary discovery model for Oman.

The model must support:

- high-trust public profiles
- admin review workflows
- provider onboarding
- doctors and specialties
- services and treatments
- insurance acceptance
- licenses and verification
- opening hours and schedules
- WhatsApp and contact CTAs
- media and video
- reviews and reputation
- offers and sponsored placements later
- English and Arabic labels for all public-facing data
- SEO-safe public pages

## 3. Core modeling rule

Do not solve everything with one `center_type` enum.

The existing `center_type` enum is useful as a broad system grouping, but DrMuscat needs a richer taxonomy layer for verticals, categories, specialties, services, and public labels.

Recommended future model:

- broad center type: stable system grouping
- vertical: medical, dental, beauty, diagnostics, pharmacy, wellness, fitness, nutrition, veterinary, healthy food, home care, rehabilitation, mental health, optical/eye care, other health-related
- category: public browsing group
- specialty: doctor/provider specialty
- service: treatment, consultation, package, test, or procedure
- tags: softer filters only, never canonical taxonomy

## 4. Scope boundaries

This spec is planning only.

Not allowed in MODEL-A/TAX-A:

- no migrations
- no enum changes
- no RLS changes
- no generated type changes
- no seed rows
- no public UI changes
- no admin UI changes
- no provider dashboard
- no payment or invoice work
- no offer or ad activation
- no AI workflow

Future implementation must be split into separate phase-approved PRs.

## 5. Public verticals

The future public taxonomy should support these vertical families, with English and Arabic labels.

| Vertical key | English label | Arabic label | Notes |
| --- | --- | --- | --- |
| medical | Medical | طبي | Clinics, hospitals, doctors, medical services. |
| dental | Dental | طب الأسنان | Dental clinics, orthodontics, implants, whitening. |
| aesthetic | Aesthetic & Beauty | التجميل والعناية | Dermatology, laser, aesthetics, salons only if approved for health/beauty scope. |
| diagnostics | Diagnostics | التشخيص | Labs, imaging, radiology, diagnostic centers. |
| pharmacy | Pharmacy | صيدلية | Pharmacies and medication-related discovery. |
| wellness | Wellness | العافية | Spa, wellness clinics, preventive health. |
| fitness | Fitness | اللياقة | Gyms, fitness centers, sports health. |
| nutrition | Nutrition | التغذية | Dietitians, nutrition centers, healthy meal planning. |
| healthy_food | Healthy Food | الطعام الصحي | Healthy restaurants/cafes only if product scope approves this vertical. |
| veterinary | Veterinary / Pet Health | الطب البيطري ورعاية الحيوانات | Pet clinics and veterinary services; must not be mixed with human medical schema. |
| home_care | Home Care | الرعاية المنزلية | Home nursing, home physiotherapy, home lab sample collection. |
| rehabilitation | Rehabilitation | التأهيل | Rehab, physiotherapy, post-surgery recovery, sports rehab. |
| mental_health | Mental Health | الصحة النفسية | Psychology, psychiatry, counseling. |
| optical_eye_care | Optical & Eye Care | البصريات ورعاية العيون | Optical stores, eye clinics, ophthalmology where appropriate. |
| other_health | Other Health Services | خدمات صحية أخرى | Controlled fallback, not a dumping ground. |

## 6. Broad center type policy

Existing `center_type` values should remain broad system values unless a future migration explicitly expands them.

Current broad types:

- clinic
- hospital
- dental_clinic
- beauty_clinic
- laboratory
- imaging_center
- pharmacy
- wellness_center
- physiotherapy_center
- other

Future decisions must determine whether to add new enum values or keep the enum stable and represent richer categories in taxonomy tables.

Recommended default: keep broad enum stable and add taxonomy tables for richer categories, because enum-only modeling becomes rigid and messy.

## 7. Center profile required data

A launch-grade center profile should support the following groups.

### 7.1 Identity

- name_en
- name_ar
- legal_name
- slug
- broad center type
- primary vertical
- secondary verticals
- public category
- internal status
- verification status
- default locale
- default country

### 7.2 Public copy

- short_description_en
- short_description_ar
- description_en
- description_ar
- FAQ entries in English and Arabic later
- editorial review status for public copy later

### 7.3 Contact and CTA

- primary phone
- secondary phone
- WhatsApp phone
- public phone visibility flags
- public WhatsApp visibility flag
- email
- website URL
- Instagram URL
- TikTok URL if approved
- Google Maps URL
- default booking CTA mode
- default WhatsApp message in English
- default WhatsApp message in Arabic

### 7.4 Location

Location should not be stuffed into the center row forever. It needs structured location records.

Required future location data:

- branch/location name en/ar
- country
- governorate
- city
- area
- address_en
- address_ar
- building/landmark en/ar
- latitude/longitude if approved
- map URL
- primary location flag
- branch-level phone/WhatsApp
- branch-level opening hours

### 7.5 Services

A center can offer many services.

Each service link should support:

- service_id
- display_name_en
- display_name_ar
- description_en
- description_ar
- price visibility later
- appointment required flag
- requires medical disclaimer flag
- public visibility
- review status

### 7.6 Insurance

Insurance must be a catalog, not hardcoded text.

Future insurance model:

- insurance_provider
- insurance_plan
- center accepted insurance
- doctor accepted insurance if different
- cash accepted flag
- direct billing flag
- reimbursement support flag
- English and Arabic names
- logo later
- verified status

### 7.7 Licenses and compliance

License data must be structured and reviewable.

Future license fields:

- license number
- license authority
- license type
- country
- issue date if available
- expiry date if available
- public visibility
- review status
- reviewed by admin
- reviewed at
- private document reference later

Do not invent Omani regulatory authority names from memory. Regulatory terminology must be verified before public use.

### 7.8 Hours

Center hours should support:

- normal weekly schedule
- special hours
- holiday exceptions
- Ramadan hours if needed
- branch-level hours
- timezone, default Asia/Muscat
- open now computation later

## 8. Doctor profile required data

Doctor profiles need their own structured model.

### 8.1 Identity

- full_name_en
- full_name_ar
- display_name_en
- display_name_ar
- title en/ar
- gender if needed for filters
- profile photo
- slug
- default country
- verification status

### 8.2 Professional data

- primary specialty
- secondary specialties
- services performed
- years of experience
- education entries
- university/institution
- country of education
- degree/certificate
- fellowship/board/certification
- professional memberships
- license number
- license authority
- license review status

### 8.3 Languages

Doctor spoken languages should be structured.

Examples:

- Arabic
- English
- Persian/Farsi if provider data supports it
- Hindi
- Urdu
- Malayalam
- Tagalog
- French
- other

Each language should have:

- language code/key
- English label
- Arabic label
- optional proficiency if later needed

### 8.4 Doctor schedules

Doctor availability is separate from center hours.

Future schedule needs:

- doctor_id
- center_id
- center_location_id
- day of week
- start time
- end time
- appointment mode
- walk-in flag
- online booking flag later
- exceptions

### 8.5 Doctor-center relationship

A doctor may work in multiple centers. A center may have many doctors.

The relationship should support:

- doctor_id
- center_id
- location_id
- primary specialty at that center
- role/title at that center
- schedule
- public visibility
- sort order

## 9. Specialty taxonomy

Specialties must be structured and bilingual.

Examples for future specialty catalog:

- General Medicine / الطب العام
- Cardiology / أمراض القلب
- Neurology / طب الأعصاب
- Dermatology / الأمراض الجلدية
- Pediatrics / طب الأطفال
- Obstetrics & Gynecology / النساء والولادة
- ENT / الأنف والأذن والحنجرة
- Ophthalmology / طب العيون
- Psychiatry / الطب النفسي
- Psychology / علم النفس
- Dentistry / طب الأسنان
- Orthodontics / تقويم الأسنان
- Oral Surgery / جراحة الفم
- Physiotherapy / العلاج الطبيعي
- Nutrition / التغذية
- Radiology / الأشعة
- Laboratory Medicine / طب المختبرات
- Veterinary Medicine / الطب البيطري, only if veterinary vertical approved

Each specialty should support:

- slug
- name_en
- name_ar
- description_en
- description_ar
- parent specialty
- vertical
- public visibility
- SEO metadata later

## 10. Service taxonomy

Services are what users search for and what centers/doctors offer.

Examples:

- dermatology consultation
- dental cleaning
- teeth whitening
- orthodontic consultation
- laser hair removal
- physiotherapy session
- blood test
- PCR test if relevant
- MRI
- ultrasound
- nutrition consultation
- weight management
- mental health counseling
- pet vaccination, only if veterinary approved
- healthy meal plan, only if healthy food/nutrition approved

Each service should support:

- slug
- name_en
- name_ar
- description_en
- description_ar
- category
- specialty link if relevant
- vertical
- requires medical disclaimer
- public visibility
- SEO metadata later

## 11. Media and video model

Media must be modeled separately.

Required media uses:

- center logo
- center cover image
- center gallery
- doctor profile photo
- offer image
- article image
- video thumbnail
- license document, private only
- facility video
- procedure/service explainer video later

Each public media item should support:

- entity type
- entity id
- usage kind
- asset id
- alt_text_en
- alt_text_ar
- caption_en
- caption_ar
- sort order
- is primary
- is featured
- review status
- public visibility

Video may start as a URL/reference model before upload support.

## 12. WhatsApp CTA policy

WhatsApp links should be generated safely, not typed manually in public UI.

Future WhatsApp helper should:

- normalize phone numbers
- generate `wa.me` links
- support default message en/ar
- avoid showing numbers where visibility is false
- support click tracking later
- support center-level and location-level WhatsApp
- support doctor-level WhatsApp only if explicitly approved

Default English message example:

`I found your center on DrMuscat and would like to ask about booking an appointment.`

Default Arabic message example:

`وجدت المركز عبر DrMuscat وأرغب بالاستفسار عن حجز موعد.`

## 13. Reviews and comments

Reviews must be controlled.

Future review flow:

- user submits review
- spam/rate limiting
- review stays pending
- admin approves/rejects/hides
- only approved reviews are public
- aggregate ratings use approved reviews only
- provider reply later, also moderated
- no fake reviews
- no fake aggregate rating
- schema.org Review/AggregateRating only when real approved data exists

Review fields should include:

- center_id and/or doctor_id
- rating
- title
- body
- reviewer display name
- locale
- status
- moderation reason
- submitted_at
- approved_at
- rejected_at
- suspicious flag

## 14. Insurance model

Insurance should support Oman and later GCC growth.

Future entities:

- insurance_providers
- insurance_plans
- center_insurance_acceptance
- doctor_insurance_acceptance if needed

Each insurance provider should support:

- name_en
- name_ar
- slug
- country
- website URL
- logo later
- active flag

Acceptance relation should support:

- accepted flag
- direct billing flag
- reimbursement support flag
- notes_en
- notes_ar
- verification status

## 15. Bilingual labeling rules

Every public-facing taxonomy item must have English and Arabic labels.

Required bilingual fields for public labels:

- name_en
- name_ar
- description_en
- description_ar where relevant
- SEO title en/ar later
- SEO description en/ar later
- CTA labels en/ar
- status display labels en/ar

Admin may use English-first labels during early phases, but public pages must not rely on generated labels like replacing underscores.

## 16. Public/private visibility rules

Each future public surface must distinguish:

- stored data
- admin-visible data
- provider-visible data
- public-visible data
- verified public data

Public pages must show only approved public data.

Sensitive or private fields must not leak into public pages:

- private license documents
- internal notes
- admin comments
- rejected reviews
- private phone/email fields where public visibility is false
- provider onboarding lead metadata

## 17. Schema.org policy

Structured data must match the actual entity.

Examples:

- medical clinic may use MedicalClinic only when appropriate
- dentist/dental clinic may use Dentist or LocalBusiness/MedicalBusiness as appropriate
- pharmacy may use Pharmacy
- article pages may use Article or MedicalWebPage only when content supports it
- healthy restaurant must not be marked as MedicalClinic
- veterinary must not be mixed with human medical schema

Do not fake structured data.

## 18. Recommended implementation order

After CENTER-D1, do not jump directly to public activation.

Recommended next order:

1. TAX-A / MODEL-A planning, this document.
2. TAX-B schema plan for taxonomy tables, still documentation-only if needed.
3. TAX-C migration for verticals/categories/specialties/services/labels, only after approval.
4. CENTER-E public center profile completion plan.
5. MED-A media schema reconciliation.
6. INS-A insurance model plan.
7. LIC-A license terminology validation and license model hardening.
8. REV-A review model reconciliation.
9. Only then consider public activation/publish flow.

## 19. Minimum center profile before public activation

A center should not be public until minimum quality requirements are met.

Recommended minimum:

- English name
- Arabic name or approved fallback policy
- slug
- broad center type
- primary vertical/category
- at least one contact method approved for public display
- at least one valid location or approved map/address placeholder policy
- short description in English
- short description in Arabic or approved fallback policy
- verification status reviewed
- public visibility flags reviewed
- no unresolved compliance blocker

Public activation should be a later phase after these rules are implemented.

## 20. Stop conditions for future agents

Future agents must stop if asked to:

- add public center activation before profile minimum requirements exist
- add a new category by hardcoding only UI labels
- add public medical claims without review rules
- add reviews without moderation
- add fake rating data
- add WhatsApp links without visibility and normalization rules
- add insurance names as free text only
- add license authority names without verification
- mix veterinary or healthy food with human medical schema
- create Persian/Hindi public SEO routes without approval

## 21. Acceptance criteria for this spec

This spec is complete when it documents:

- vertical families
- center profile data needs
- doctor profile data needs
- specialty and service taxonomy needs
- insurance needs
- license needs
- hours/schedule needs
- media/video needs
- review needs
- bilingual labeling rules
- WhatsApp CTA rules
- public/private visibility rules
- future implementation order

This spec does not make any product behavior live.
