with specialty_seed (
  slug,
  parent_slug,
  name_en,
  name_ar,
  specialty_level,
  clinical_domain,
  age_focus,
  is_primary_care,
  is_surgical,
  is_dental,
  sort_order
) as (
  values
    ('general-practitioner', null, 'General Practitioner', 'طبيب عام', 'generalist', 'primary-care', 'all', true, false, false, 10),
    ('family-medicine', null, 'Family Medicine', 'طب الأسرة', 'specialty', 'primary-care', 'all', true, false, false, 20),
    ('internal-medicine', null, 'Internal Medicine', 'الطب الباطني', 'specialty', 'medicine', 'adult', false, false, false, 30),
    ('pediatrics', null, 'Pediatrics', 'طب الأطفال', 'specialty', 'pediatrics', 'pediatric', false, false, false, 40),
    ('obstetrics-gynecology', null, 'Obstetrics and Gynecology', 'أمراض النساء والولادة', 'specialty', 'women-health', 'maternal', false, false, false, 50),
    ('dermatology', null, 'Dermatology', 'الأمراض الجلدية', 'specialty', 'skin', 'all', false, false, false, 60),
    ('cardiology', null, 'Cardiology', 'أمراض القلب', 'specialty', 'medicine', 'adult', false, false, false, 70),
    ('ent', null, 'ENT / Otolaryngology', 'الأنف والأذن والحنجرة', 'specialty', 'ent', 'all', false, true, false, 80),
    ('ophthalmology', null, 'Ophthalmology', 'طب العيون', 'specialty', 'eye-care', 'all', false, true, false, 90),
    ('orthopedics', null, 'Orthopedics', 'جراحة العظام', 'specialty', 'orthopedics', 'all', false, true, false, 100),
    ('general-surgery', null, 'General Surgery', 'الجراحة العامة', 'specialty', 'surgery', 'all', false, true, false, 110),
    ('dentistry', null, 'Dentistry', 'طب الأسنان', 'specialty', 'dental', 'all', false, false, true, 120),
    ('psychiatry', null, 'Psychiatry', 'الطب النفسي', 'specialty', 'mental-health', 'all', false, false, false, 130),
    ('psychology', null, 'Psychology', 'علم النفس', 'role', 'mental-health', 'all', false, false, false, 140),
    ('physiotherapy', null, 'Physiotherapy', 'العلاج الطبيعي', 'role', 'rehabilitation', 'all', false, false, false, 150),
    ('radiology', null, 'Radiology', 'الأشعة', 'specialty', 'diagnostics', 'all', false, false, false, 160),
    ('emergency-medicine', null, 'Emergency Medicine', 'طب الطوارئ', 'specialty', 'emergency', 'all', false, false, false, 170),
    ('neurology', null, 'Neurology', 'طب الأعصاب', 'specialty', 'medicine', 'adult', false, false, false, 180),
    ('neurosurgery', null, 'Neurosurgery', 'جراحة المخ والأعصاب', 'specialty', 'surgery', 'adult', false, true, false, 190),
    ('gastroenterology', null, 'Gastroenterology', 'أمراض الجهاز الهضمي', 'specialty', 'medicine', 'adult', false, false, false, 200),
    ('urology', null, 'Urology', 'المسالك البولية', 'specialty', 'urology', 'all', false, true, false, 210),
    ('nephrology', null, 'Nephrology', 'أمراض الكلى', 'specialty', 'medicine', 'adult', false, false, false, 220),
    ('endocrinology', null, 'Endocrinology', 'الغدد الصماء', 'specialty', 'medicine', 'adult', false, false, false, 230),
    ('pulmonology', null, 'Pulmonology', 'أمراض الرئة', 'specialty', 'medicine', 'adult', false, false, false, 240),
    ('oncology', null, 'Oncology', 'الأورام', 'specialty', 'medicine', 'adult', false, false, false, 250),
    ('laboratory-medicine', null, 'Laboratory Medicine', 'طب المختبرات', 'specialty', 'diagnostics', 'all', false, false, false, 260),
    ('neonatology', 'pediatrics', 'Neonatology', 'طب حديثي الولادة', 'subspecialty', 'pediatrics', 'pediatric', false, false, false, 410),
    ('pediatric-cardiology', 'pediatrics', 'Pediatric Cardiology', 'قلب الأطفال', 'subspecialty', 'pediatrics', 'pediatric', false, false, false, 420),
    ('interventional-cardiology', 'cardiology', 'Interventional Cardiology', 'قسطرة القلب', 'subspecialty', 'medicine', 'adult', false, false, false, 430),
    ('reproductive-medicine', 'obstetrics-gynecology', 'Reproductive Medicine and Infertility', 'العقم وطب الإنجاب', 'subspecialty', 'women-health', 'maternal', false, false, false, 440),
    ('orthodontics', 'dentistry', 'Orthodontics', 'تقويم الأسنان', 'subspecialty', 'dental', 'all', false, false, true, 450),
    ('oral-maxillofacial-surgery', 'dentistry', 'Oral and Maxillofacial Surgery', 'جراحة الفم والوجه والفكين', 'subspecialty', 'dental', 'all', false, true, true, 460)
), updated_specialties as (
  update public.specialties target
  set
    taxonomy_group_id = null,
    parent_specialty_id = null,
    name_en = seed.name_en,
    name_ar = seed.name_ar,
    description_en = null,
    description_ar = null,
    specialty_level = seed.specialty_level,
    clinical_domain = seed.clinical_domain,
    age_focus = seed.age_focus,
    is_doctor_specialty = true,
    is_medical = true,
    requires_medical_disclaimer = true,
    is_primary_care = seed.is_primary_care,
    is_surgical = seed.is_surgical,
    is_dental = seed.is_dental,
    public_directory_enabled = false,
    public_profile_enabled = false,
    source_system = 'internal-reviewed',
    source_version = '2026-06-18',
    is_active = true,
    sort_order = seed.sort_order,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SPECIALTY-SEED-A-INTERNAL', 'source_system', 'internal-reviewed', 'source_version', '2026-06-18', 'review_status', 'internal'),
    updated_at = now()
  from specialty_seed seed
  where target.slug = seed.slug
  returning target.slug
)
insert into public.specialties (
  taxonomy_group_id,
  parent_specialty_id,
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  specialty_level,
  clinical_domain,
  age_focus,
  is_doctor_specialty,
  is_medical,
  requires_medical_disclaimer,
  is_primary_care,
  is_surgical,
  is_dental,
  public_directory_enabled,
  public_profile_enabled,
  source_system,
  source_version,
  is_active,
  sort_order,
  metadata
)
select
  null,
  null,
  seed.slug,
  seed.name_en,
  seed.name_ar,
  null,
  null,
  seed.specialty_level,
  seed.clinical_domain,
  seed.age_focus,
  true,
  true,
  true,
  seed.is_primary_care,
  seed.is_surgical,
  seed.is_dental,
  false,
  false,
  'internal-reviewed',
  '2026-06-18',
  true,
  seed.sort_order,
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SPECIALTY-SEED-A-INTERNAL', 'source_system', 'internal-reviewed', 'source_version', '2026-06-18', 'review_status', 'internal')
from specialty_seed seed
where not exists (
  select 1 from public.specialties existing where existing.slug = seed.slug
);

with specialty_parent_seed (slug, parent_slug) as (
  values
    ('general-practitioner', null),
    ('family-medicine', null),
    ('internal-medicine', null),
    ('pediatrics', null),
    ('obstetrics-gynecology', null),
    ('dermatology', null),
    ('cardiology', null),
    ('ent', null),
    ('ophthalmology', null),
    ('orthopedics', null),
    ('general-surgery', null),
    ('dentistry', null),
    ('psychiatry', null),
    ('psychology', null),
    ('physiotherapy', null),
    ('radiology', null),
    ('emergency-medicine', null),
    ('neurology', null),
    ('neurosurgery', null),
    ('gastroenterology', null),
    ('urology', null),
    ('nephrology', null),
    ('endocrinology', null),
    ('pulmonology', null),
    ('oncology', null),
    ('laboratory-medicine', null),
    ('neonatology', 'pediatrics'),
    ('pediatric-cardiology', 'pediatrics'),
    ('interventional-cardiology', 'cardiology'),
    ('reproductive-medicine', 'obstetrics-gynecology'),
    ('orthodontics', 'dentistry'),
    ('oral-maxillofacial-surgery', 'dentistry')
), parent_links as (
  select child.id as child_id, parent.id as parent_id
  from specialty_parent_seed seed
  join public.specialties child
    on child.slug = seed.slug
   and child.deleted_at is null
  join public.specialties parent
    on parent.slug = seed.parent_slug
   and parent.deleted_at is null
  where seed.parent_slug is not null
)
update public.specialties child
set
  parent_specialty_id = link.parent_id,
  updated_at = now()
from parent_links link
where child.id = link.child_id;

with alias_seed (specialty_slug, locale, alias, normalized_alias, sort_order) as (
  values
    ('general-practitioner', 'en', 'General Practitioner', 'general practitioner', 10),
    ('general-practitioner', 'en', 'GP', 'gp', 20),
    ('general-practitioner', 'en', 'General Doctor', 'general doctor', 30),
    ('general-practitioner', 'ar', 'طبيب عام', 'طبيب عام', 40),
    ('general-practitioner', 'ar', 'دكتور عام', 'دكتور عام', 50),
    ('family-medicine', 'en', 'Family Medicine', 'family medicine', 60),
    ('family-medicine', 'en', 'Family Doctor', 'family doctor', 70),
    ('family-medicine', 'ar', 'طب الأسرة', 'طب الأسرة', 80),
    ('family-medicine', 'ar', 'طبيب أسرة', 'طبيب أسرة', 90),
    ('internal-medicine', 'en', 'Internal Medicine', 'internal medicine', 100),
    ('internal-medicine', 'en', 'Internist', 'internist', 110),
    ('internal-medicine', 'ar', 'الطب الباطني', 'الطب الباطني', 120),
    ('internal-medicine', 'ar', 'طبيب باطني', 'طبيب باطني', 130),
    ('pediatrics', 'en', 'Pediatrics', 'pediatrics', 140),
    ('pediatrics', 'en', 'Pediatrician', 'pediatrician', 150),
    ('pediatrics', 'en', 'Children Doctor', 'children doctor', 160),
    ('pediatrics', 'ar', 'طب الأطفال', 'طب الأطفال', 170),
    ('pediatrics', 'ar', 'طبيب أطفال', 'طبيب أطفال', 180),
    ('pediatrics', 'ar', 'دكتور أطفال', 'دكتور أطفال', 190),
    ('obstetrics-gynecology', 'en', 'Obstetrics and Gynecology', 'obstetrics and gynecology', 200),
    ('obstetrics-gynecology', 'en', 'OBGYN', 'obgyn', 210),
    ('obstetrics-gynecology', 'ar', 'أمراض النساء والولادة', 'أمراض النساء والولادة', 220),
    ('dermatology', 'en', 'Dermatology', 'dermatology', 230),
    ('dermatology', 'en', 'Skin Doctor', 'skin doctor', 240),
    ('dermatology', 'ar', 'الأمراض الجلدية', 'الأمراض الجلدية', 250),
    ('dermatology', 'ar', 'طبيب جلدية', 'طبيب جلدية', 260),
    ('cardiology', 'en', 'Cardiology', 'cardiology', 270),
    ('cardiology', 'en', 'Heart Doctor', 'heart doctor', 280),
    ('cardiology', 'ar', 'أمراض القلب', 'أمراض القلب', 290),
    ('cardiology', 'ar', 'طبيب قلب', 'طبيب قلب', 300),
    ('ent', 'en', 'ENT', 'ent', 310),
    ('ent', 'en', 'Otolaryngology', 'otolaryngology', 320),
    ('ent', 'ar', 'الأنف والأذن والحنجرة', 'الأنف والأذن والحنجرة', 330),
    ('ent', 'ar', 'طبيب أنف وأذن وحنجرة', 'طبيب أنف وأذن وحنجرة', 340),
    ('ophthalmology', 'en', 'Ophthalmology', 'ophthalmology', 350),
    ('ophthalmology', 'en', 'Eye Doctor', 'eye doctor', 360),
    ('ophthalmology', 'ar', 'طب العيون', 'طب العيون', 370),
    ('orthopedics', 'en', 'Orthopedics', 'orthopedics', 380),
    ('orthopedics', 'ar', 'جراحة العظام', 'جراحة العظام', 390),
    ('dentistry', 'en', 'Dentistry', 'dentistry', 400),
    ('dentistry', 'en', 'Dentist', 'dentist', 410),
    ('dentistry', 'ar', 'طب الأسنان', 'طب الأسنان', 420),
    ('psychiatry', 'en', 'Psychiatry', 'psychiatry', 430),
    ('psychiatry', 'en', 'Psychiatrist', 'psychiatrist', 440),
    ('psychiatry', 'ar', 'الطب النفسي', 'الطب النفسي', 450),
    ('radiology', 'en', 'Radiology', 'radiology', 460),
    ('radiology', 'ar', 'الأشعة', 'الأشعة', 470),
    ('emergency-medicine', 'en', 'Emergency Medicine', 'emergency medicine', 480),
    ('emergency-medicine', 'ar', 'طب الطوارئ', 'طب الطوارئ', 490),
    ('neurology', 'en', 'Neurology', 'neurology', 500),
    ('neurology', 'en', 'Neurologist', 'neurologist', 510),
    ('neurology', 'ar', 'طب الأعصاب', 'طب الأعصاب', 520),
    ('gastroenterology', 'en', 'Gastroenterology', 'gastroenterology', 530),
    ('gastroenterology', 'ar', 'أمراض الجهاز الهضمي', 'أمراض الجهاز الهضمي', 540),
    ('neonatology', 'en', 'Neonatology', 'neonatology', 550),
    ('neonatology', 'ar', 'طب حديثي الولادة', 'طب حديثي الولادة', 560),
    ('pediatric-cardiology', 'en', 'Pediatric Cardiology', 'pediatric cardiology', 570),
    ('pediatric-cardiology', 'ar', 'قلب الأطفال', 'قلب الأطفال', 580),
    ('interventional-cardiology', 'en', 'Interventional Cardiology', 'interventional cardiology', 590),
    ('interventional-cardiology', 'ar', 'قسطرة القلب', 'قسطرة القلب', 600),
    ('reproductive-medicine', 'en', 'Reproductive Medicine', 'reproductive medicine', 610),
    ('reproductive-medicine', 'en', 'Infertility Doctor', 'infertility doctor', 620),
    ('reproductive-medicine', 'ar', 'العقم وطب الإنجاب', 'العقم وطب الإنجاب', 630)
), alias_rows as (
  select specialty.id as specialty_id, seed.locale, seed.alias, seed.normalized_alias, seed.sort_order
  from alias_seed seed
  join public.specialties specialty
    on specialty.slug = seed.specialty_slug
   and specialty.deleted_at is null
), updated_aliases as (
  update public.specialty_aliases target
  set
    alias = seed.alias,
    source_system = 'internal-reviewed',
    source_version = '2026-06-18',
    is_active = true,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.normalized_alias, 'seed_phase', 'TAX-SPECIALTY-SEED-A-INTERNAL', 'source_system', 'internal-reviewed', 'source_version', '2026-06-18', 'review_status', 'internal'),
    updated_at = now()
  from alias_rows seed
  where target.specialty_id = seed.specialty_id
    and target.locale = seed.locale
    and target.normalized_alias = seed.normalized_alias
  returning target.id
)
insert into public.specialty_aliases (
  specialty_id,
  locale,
  alias,
  normalized_alias,
  source_system,
  source_version,
  is_active,
  metadata
)
select
  seed.specialty_id,
  seed.locale,
  seed.alias,
  seed.normalized_alias,
  'internal-reviewed',
  '2026-06-18',
  true,
  jsonb_build_object('seed_key', seed.normalized_alias, 'seed_phase', 'TAX-SPECIALTY-SEED-A-INTERNAL', 'source_system', 'internal-reviewed', 'source_version', '2026-06-18', 'review_status', 'internal')
from alias_rows seed
where not exists (
  select 1
  from public.specialty_aliases existing
  where existing.specialty_id = seed.specialty_id
    and existing.locale = seed.locale
    and existing.normalized_alias = seed.normalized_alias
);
