# TAX-SPECIALTY-A — Doctor Specialty Taxonomy Plan

## Goal

Create a structured doctor specialty taxonomy for DrMuscat so doctors can be searched, filtered, and presented by medical specialty and subspecialty without mixing those concepts with center categories.

## Key rule

Center categories and doctor specialties are different taxonomies.

- `center_categories`: Clinic, Hospital, Medical Center, Dental Clinic, Imaging Center, Pharmacy
- `specialties`: General Practitioner, Pediatrics, Cardiology, Dermatology, Orthopedics, etc.

Do not place doctor specialties inside `center_categories`.

## Required model change

The existing `public.specialties` table supports a flat list only. It must support hierarchy before subspecialties are added.

Add:

```sql
parent_specialty_id uuid null references public.specialties(id)
```

This enables:

```text
Specialty → Subspecialty
```

Examples:

```text
Pediatrics
  Pediatric Cardiology
  Pediatric Neurology
  Neonatology

Internal Medicine
  Cardiology
  Gastroenterology
  Endocrinology
  Nephrology
```

## Phase A seed scope

Add a safe core set of doctor specialties for Oman launch.

Must include:

- General Practitioner
- Family Medicine
- Pediatrics
- Internal Medicine
- Cardiology
- Dermatology
- Obstetrics and Gynecology
- ENT
- Ophthalmology
- Orthopedics
- Neurology
- Psychiatry
- Dentistry
- Oral and Maxillofacial Surgery
- Radiology
- Pathology
- Anesthesiology
- General Surgery
- Urology
- Nephrology
- Gastroenterology
- Endocrinology
- Pulmonology
- Oncology
- Hematology
- Rheumatology
- Infectious Diseases
- Emergency Medicine
- Physical Medicine and Rehabilitation
- Physiotherapy
- Dietetics and Nutrition
- Psychology

Must include initial subspecialties:

- Pediatric Cardiology
- Pediatric Neurology
- Neonatology
- Interventional Cardiology
- Reproductive Endocrinology and Infertility
- Maternal-Fetal Medicine

## Non-goals

Do not add:

- fake medical license information
- ratings or reviews
- insurance data
- appointment booking claims
- provider dashboards
- public SEO pages for specialty-location combinations
- full specialty landing page activation

## SEO rule

Specialty data can exist in the database before public pages are indexable.

Public specialty pages must remain fail-closed until a separate SEO gate approves:

- enough real providers
- unique visible intro content
- local relevance
- medical review status
- canonical uniqueness

## Validation requirements

CI must fail if:

- `general-practitioner` is missing
- `pediatrics` is missing
- `family-medicine` is missing
- a subspecialty is inserted without a valid parent
- a doctor specialty is inserted into `center_categories`
- specialty seed touches centers, doctors, reviews, ratings, insurance, media, ads, billing, or AI
- public route or sitemap is expanded by this phase

## Rollout guidance

After this phase merges, Supabase should not be updated until the migration and seed are reviewed with the rest of the Oman launch data plan.
