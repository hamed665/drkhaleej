# DrKhaleej Template Import Contract V1

## Purpose

This contract maps the uploaded legacy import templates to the DrKhaleej fast-launch import staging model before any pharmacy or hospital profile route is allowed into the sitemap.

It is a launch-readiness contract, not a data import. No real provider rows are published by this document. No route, sitemap entry, structured data block, ad slot, offer, review, booking, payment, or provider dashboard capability is approved here. The point is to stop the usual spreadsheet-to-production circus before the clowns find the database.

## Source templates reviewed

| Template | Launch use | Header row rule |
| --- | --- | --- |
| `uploaded-complete-profile-import-template-v3.xlsx` | Doctor/facility/profile relationship reference template | headers on row 1 |
| `uploaded-hospital-import-template-v1.xlsx` | Hospital profile and hospital relation template | each data sheet uses title/instructions on rows 1-3, headers on row 4 |
| `uploaded-pharmacy-import-template-v1.xlsx` | Pharmacy profile and pharmacy relation template | headers on row 1 |

## Import model targets

The first clean launch batch needs only these normalized groups:

| Normalized group | Required for index promotion | Notes |
| --- | --- | --- |
| `identity` | yes | External ID, name, slug candidate, entity type. |
| `contact` | yes | Phone/WhatsApp or map/direction signal. |
| `geo` | yes | Oman country signal plus city/area and preferably coordinates. |
| `taxonomy` | yes for directory fit | Specialty, service, department, or category signal. |
| `languages` | helpful | Used for profile enrichment, not enough by itself. |
| `source` | yes | Source name or URL plus last checked date. |
| `publishQa` | yes for final gate | Manual publish/index/sitemap gate stays separate from raw row parsing. |

## Launch-critical sheets

| Template | Required launch sheets | Support-only sheets |
| --- | --- | --- |
| Complete profile | `Doctors`, `Facilities`, `Locations`, `Doctor_Practice`, `Services_Specialties`, `Licenses_Verification`, `Contacts_Directions`, `SEO_Profile_Content`, `Publish_QA` | `README`, `Lookups`, `Monitoring_Rules`, `Quality_Dashboard`, `Field_Dictionary` |
| Hospital | `Hospital_Master`, `Hospital_Locations`, `Contacts_Directions`, `Departments_Units`, `Hospital_Services`, `Doctors_Practice`, `Emergency_ICU`, `Licenses_Accreditation`, `SEO_Profile_Content`, `Publish_QA` | `Instructions`, `Lookups`, `Dashboard`, `Import_Batches`, `Monitoring_Rules`, media/review/comment/offer sheets until approved |
| Pharmacy | `Pharmacy_Master`, `Pharmacy_Locations`, `Contacts_Directions`, `Opening_Hours`, `Pharmacy_Services`, `Licenses_Verification`, `Staff_Languages`, `SEO_Profile_Content`, `Publish_QA` | `README`, `Lookups`, `Dashboard`, `Import_Batches`, `Monitoring_Rules`, media/review/comment/offer sheets until approved |

## Current normalizer coverage summary

| Area | Status | Examples |
| --- | --- | --- |
| Existing covered aliases | usable now | `doctor_external_id`, `pharmacy_external_id`, `hospital_external_id`, `facility_external_id`, `full_name_en`, `display_name_en`, `hospital_name_en`, `phone_e164`, `whatsapp_e164`, `google_maps_url`, `latitude`, `longitude`, `source_name`, `source_url`, `last_checked_at` |
| Known alias gaps | must be fixed in `SEO-IMPORT-B` | `official_name_en`, `official_name_ar`, `primary_phone_e164`, `email_public`, `generated_direction_url`, `generated_directions_url`, `source_last_checked_at`, `source_date`, `languages_spoken_csv`, `service_name_en`, `department_name_en`, `hospital_slug`, `pharmacy_slug` |
| Gate-only fields | not parsed into identity/contact directly | `publish_status`, `index_eligibility_status`, `sitemap_eligible`, `public_visible`, `review_status`, `duplicate_status` |

## Rules before profile sitemap expansion

1. Rows with `row_type=example` or `row_type=ignore` must never be imported as real public entities.
2. A row without source and last checked date may be staged, but it must not be promoted to index.
3. A row without contact or map/direction signal may be staged, but it must not be promoted to index.
4. Pharmacy and hospital profile routes stay blocked until their dedicated public route guards exist.
5. Structured data must only use visible, source-backed data.
6. Review, rating, booking, insurance, MOH approval, and offer claims remain out of scope unless a later gate explicitly allows them.

## Next PR

`SEO-IMPORT-B import-header-alias-coverage-v1` should update the normalizer alias lists and tests for the documented `needs_alias` headers. After that, `PROFILE-GATE-B` and `PROFILE-GATE-C` can build pharmacy and hospital public route guards without pretending that templates are already production data, which would be an impressive but very avoidable act of digital self-harm.
