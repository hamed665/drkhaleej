# DrMuscat TAX-SPECIALTY-MODEL-A — Doctor Specialty Taxonomy Model V1

## Status

Implementation phase for the specialty taxonomy model.

This phase adds the data model needed to support doctor specialties, subspecialties, and searchable aliases.
It does not seed a complete specialty catalog yet.

## Why this exists

The existing `specialties` table can store flat specialty rows, but a complete physician directory needs more structure:

```text
medical branch / domain → specialty → subspecialty → aliases and search terms
```

Examples:

- General Practitioner
- Family Medicine
- Pediatrics
- Neonatology under Pediatrics
- Pediatric Cardiology under Pediatrics / Cardiology context
- Cardiology under Internal Medicine domain
- Interventional Cardiology under Cardiology
- Obstetrics and Gynecology
- Reproductive Medicine / Infertility under Obstetrics and Gynecology

A hand-written flat list is not acceptable for DrMuscat because it creates search ambiguity and makes subspecialty routing unreliable.

## Scope

This phase adds:

- specialty hierarchy support
- specialty level tagging
- clinical domain tagging
- age focus tagging
- primary care / surgical / dental flags
- public visibility flags
- source metadata fields
- specialty aliases for common search and local naming variants
- public read RLS for active aliases attached to public active specialties

## Non-goals

This phase must not add:

- full specialty seed rows
- doctor profile data
- center data
- provider claims
- reviews or ratings
- insurance data
- license authority data
- media data
- offers, ads, billing, or AI data
- public specialty landing pages

## Canonical specialty versus alias

A canonical specialty is the official taxonomy row.

Example canonical row:

```text
slug: pediatrics
name_en: Pediatrics
name_ar: طب الأطفال
specialty_level: specialty
age_focus: pediatric
```

Aliases are search and local-language variants.

Example aliases:

```text
pediatrician
doctor for children
children doctor
دكتور أطفال
طبيب أطفال
دکتر اطفال
پزشک کودکان
```

Aliases must not become separate specialties unless they are clinically distinct.

## Required hierarchy rules

The taxonomy must support at least:

```text
generalist
specialty
subspecialty
fellowship
role
```

Use examples:

- `general-practitioner` → `generalist`
- `family-medicine` → `specialty`
- `pediatrics` → `specialty`
- `neonatology` → `subspecialty`, parent `pediatrics`
- `pediatric-cardiology` → `subspecialty`, parent should be reviewed by clinical taxonomy rules
- `cardiology` → `specialty`
- `interventional-cardiology` → `subspecialty`, parent `cardiology`

## Required seed strategy

Do not seed a complete specialty catalog manually without source metadata.

Preferred source strategy:

1. Oman-facing practical taxonomy for public UX
2. Cross-check against recognized specialty frameworks such as OMSB / local clinical usage, ABMS/ACGME, GMC, and regional Arab Board usage where applicable
3. Maintain local search aliases separately from canonical rows

The source strategy must be explicit per row or per generated seed batch.

## Required row metadata for future seeds

Every future specialty seed row should include metadata similar to:

```json
{
  "seed_key": "pediatrics",
  "seed_phase": "TAX-SPECIALTY-SEED-A",
  "source_system": "internal-reviewed|omsb|abms|acgme|gmc|arab-board",
  "source_version": "<date-or-release>",
  "review_status": "reviewed|imported|manual-correction"
}
```

## Launch and SEO guardrail

Adding specialties to the database must not automatically create public landing pages.

Public SEO specialty pages should remain controlled by separate SEO gates and market gates.

The first public market remains Oman only.

## Future implementation phases

### TAX-SPECIALTY-SEED-A

Seed core Oman-facing medical specialties and common aliases.

Must include at minimum:

- General Practitioner
- Family Medicine
- Internal Medicine
- Pediatrics
- Obstetrics and Gynecology
- Dermatology
- Cardiology
- ENT / Otolaryngology
- Ophthalmology
- Orthopedics
- General Surgery
- Dentistry / Dental specialties as clinically appropriate
- Psychiatry
- Psychology where applicable to provider type rules
- Physiotherapy / Rehabilitation where applicable to practitioner type rules

### TAX-SPECIALTY-SEED-B

Seed subspecialties and fellowships with parent mappings.

### TAX-SPECIALTY-SEED-C

Seed aliases in English, Arabic, and optional Persian search variants.

### TAX-SPECIALTY-ROUTE-A

Only after seed validation and market gate review, add public specialty browsing routes for Oman.

## Stop conditions

Do not merge future specialty seeds if any of these are true:

- canonical specialties and aliases are mixed together
- subspecialties have no parent where one is clinically expected
- source metadata is missing
- visibility flags default to public for unreviewed specialties
- search aliases create duplicate canonical rows
- non-Oman SEO routes become public accidentally
- doctor/center/review/insurance/license/media data appears in specialty seed files

## Immediate product impact

After this model, the platform can correctly represent:

```text
Doctor category: Pediatrics
Common search: دکتر اطفال / Pediatrician
Canonical specialty: pediatrics
Subspecialty: neonatology
```

without corrupting center categories or service categories.
