# Master Taxonomy Registry V1

## Purpose

The Master Taxonomy Registry V1 is the code-level source of truth for future DrMuscat SEO, entity graph, bulk import, QA gate, internal linking, schema mapping, local pages, and service pages. It is intentionally deterministic TypeScript configuration under `src/config/taxonomy/`.

This registry does **not** implement public behavior. It does not add database seeds, migrations, RLS policies, public routes, admin routes, rendering, sitemap behavior, robots behavior, `llms.txt` behavior, JSON-LD runtime output, import staging, QA gates, internal links, local pages, service pages, provider dashboard behavior, payment behavior, or AI integrations.

## Scope levels

- `core`: Oman-first healthcare categories suitable for early DrMuscat healthcare discovery planning.
- `adjacent`: health-adjacent categories that may support healthcare discovery but need tighter future eligibility rules.
- `deferred`: categories intentionally represented for future segmentation but not approved as launch healthcare surfaces.
- `excluded`: categories that are out of DrMuscat core scope and must not be promoted as healthcare verticals.

Healthy food, healthy meal delivery, and restaurants are marked `excluded` because they are food-commerce and hospitality discovery categories rather than regulated provider, clinical, diagnostic, or health-service discovery categories. They may create SEO ambiguity and YMYL-quality risk if mixed into DrMuscat core healthcare taxonomies.

## Medical and non-medical beauty separation

Aesthetic medical services such as dermatology aesthetics, hair transplant, laser clinic, injectables, scar treatment, and plastic-surgery-related services remain under `aesthetic-medical` when they require medical governance, licensing, review, and disclaimers.

Non-medical beauty categories such as salons, nails, makeup, waxing, facial, spa, massage, and similar lifestyle services are marked `deferred`. They are not core healthcare surfaces and must not be treated as medical services unless a future approved phase defines a medically regulated variant.

## Veterinary, pet clinics, and pet-shop hybrids

Veterinary clinics and pet clinics are health-adjacent, not human healthcare. A `pet-clinic-shop-hybrid` is represented as one future canonical entity with `pet-clinics` as the primary vertical and `pet-shops` as a secondary vertical. Future import, profile, and QA phases should avoid splitting that hybrid into duplicate clinic and retail profiles unless a human-approved migration plan says otherwise.

Standalone pet shops remain deferred retail and are not core healthcare.

## Doctor levels, specialties, services, and entity types

Doctor levels describe practitioner seniority or professional role labels, such as consultant, specialist, dentist, psychologist, counselor, physiotherapist, dietitian, radiologist, or laboratory medicine specialist. They are not specialty taxonomy nodes by themselves.

Specialties and subspecialties describe clinical or professional domains, such as cardiology, pediatrics, dentistry, reproductive medicine, pediatric cardiology, cosmetic dermatology, speech-language therapy, or occupational therapy. They can connect future doctor profiles, departments, service pages, QA rules, and internal linking.

Services describe user-searchable procedures, consultations, tests, treatments, support services, and retail/service intents, such as dental checkup, MRI, CBC, IVF, psychology session, home nursing, hearing test, hijama, veterinary consultation, or personal training. Services must not be assumed to be live public pages until a later approved prompt implements service-page behavior.

Entity types describe provider/profile business or organization types, such as hospital, clinic, dental clinic, laboratory, pharmacy, physiotherapy center, veterinary clinic, or pet shop. Entity types are not the same as departments: a future hospital department may map to a specialty or service cluster inside a hospital entity rather than becoming a separate provider entity.

## Schema hints

Schema hints are static planning hints only. They are not runtime JSON-LD and do not authorize schema output. Prompt 24 or a later approved schema-mapping phase must define any runtime structured-data mapping, validation, and rendering behavior.

## Prompt 3 next work

Prompt 3 should convert and validate taxonomy seeds against this registry without expanding scope. It should verify registry-to-seed alignment, preserve slug determinism, and stop on conflicts instead of guessing.

## Future migration, seed, and RLS constraints

Future database work must follow the migration protocol, seed validation plan, RLS/security protocol, testing gate, human approval checkpoints, and PHASED_BUILD_ONLY mode. This registry does not authorize Supabase schema changes, RLS changes, generated type changes, public read expansion, public activation workflow, provider ownership/claim workflow, review workflow, appointment booking, payments, or provider dashboard editing.
