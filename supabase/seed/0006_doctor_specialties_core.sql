with group_seed as (
  select
    'doctor-specialties'::text as slug,
    'Doctor Specialties'::text as name_en,
    'تخصصات الأطباء'::text as name_ar,
    'Medical specialties and subspecialties used for doctor profiles and discovery.'::text as description_en,
    'تخصصات وفروع طبية مستخدمة لملفات الأطباء والاكتشاف.'::text as description_ar
), updated_group as (
  update public.taxonomy_groups target
  set
    name_en = seed.name_en,
    name_ar = seed.name_ar,
    description_en = seed.description_en,
    description_ar = seed.description_ar,
    is_medical = true,
    is_active = true,
    sort_order = 10,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SPECIALTY-A'),
    updated_at = now()
  from group_seed seed
  where target.slug = seed.slug
  returning target.id, target.slug
)
insert into public.taxonomy_groups (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  is_medical,
  is_active,
  sort_order,
  metadata
)
select
  seed.slug,
  seed.name_en,
  seed.name_ar,
  seed.description_en,
  seed.description_ar,
  true,
  true,
  10,
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SPECIALTY-A')
from group_seed seed
where not exists (
  select 1 from public.taxonomy_groups existing where existing.slug = seed.slug
);

with specialty_seed (
  parent_slug,
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  requires_medical_disclaimer,
  sort_order
) as (
  values
    (null, 'general-practitioner', 'General Practitioner', 'طبيب عام', 'Primary general medical care and first-contact physician services.', 'رعاية طبية عامة وخدمات الطبيب العام كنقطة اتصال أولى.', true, 10),
    (null, 'family-medicine', 'Family Medicine', 'طب الأسرة', 'Family medicine and continuing primary care for all ages.', 'طب الأسرة والرعاية الأولية المستمرة لجميع الأعمار.', true, 20),
    (null, 'internal-medicine', 'Internal Medicine', 'الطب الباطني', 'Adult internal medicine and complex medical care.', 'الطب الباطني للبالغين والرعاية الطبية المعقدة.', true, 30),
    ('internal-medicine', 'cardiology', 'Cardiology', 'أمراض القلب', 'Heart and cardiovascular medicine.', 'طب القلب والأوعية الدموية.', true, 40),
    ('cardiology', 'interventional-cardiology', 'Interventional Cardiology', 'قسطرة وتداخلات القلب', 'Catheter-based and interventional cardiology services.', 'خدمات قسطرة وتداخلات القلب.', true, 50),
    ('internal-medicine', 'gastroenterology', 'Gastroenterology', 'أمراض الجهاز الهضمي', 'Digestive system and liver-related medical care.', 'رعاية أمراض الجهاز الهضمي والكبد.', true, 60),
    ('internal-medicine', 'endocrinology', 'Endocrinology', 'الغدد الصماء', 'Hormonal, thyroid, diabetes, and endocrine care.', 'رعاية الغدد الصماء والسكري والغدة الدرقية.', true, 70),
    ('internal-medicine', 'nephrology', 'Nephrology', 'أمراض الكلى', 'Kidney diseases and renal care.', 'رعاية أمراض الكلى.', true, 80),
    ('internal-medicine', 'pulmonology', 'Pulmonology', 'أمراض الصدر والرئة', 'Respiratory and lung medicine.', 'طب الجهاز التنفسي والرئة.', true, 90),
    ('internal-medicine', 'hematology', 'Hematology', 'أمراض الدم', 'Blood disorders and hematology care.', 'رعاية اضطرابات وأمراض الدم.', true, 100),
    ('internal-medicine', 'oncology', 'Oncology', 'الأورام', 'Cancer medicine and oncology care.', 'طب الأورام ورعاية السرطان.', true, 110),
    ('internal-medicine', 'rheumatology', 'Rheumatology', 'الروماتيزم', 'Joint, autoimmune, and rheumatic disease care.', 'رعاية أمراض المفاصل والمناعة والروماتيزم.', true, 120),
    ('internal-medicine', 'infectious-diseases', 'Infectious Diseases', 'الأمراض المعدية', 'Infectious disease diagnosis and management.', 'تشخيص وإدارة الأمراض المعدية.', true, 130),

    (null, 'pediatrics', 'Pediatrics', 'طب الأطفال', 'Medical care for infants, children, and adolescents.', 'الرعاية الطبية للرضع والأطفال والمراهقين.', true, 140),
    ('pediatrics', 'neonatology', 'Neonatology', 'طب حديثي الولادة', 'Specialized medical care for newborns and premature infants.', 'رعاية طبية متخصصة لحديثي الولادة والخدج.', true, 150),
    ('pediatrics', 'pediatric-cardiology', 'Pediatric Cardiology', 'أمراض قلب الأطفال', 'Heart care for children and adolescents.', 'رعاية أمراض القلب لدى الأطفال والمراهقين.', true, 160),
    ('pediatrics', 'pediatric-neurology', 'Pediatric Neurology', 'أعصاب الأطفال', 'Neurological care for children.', 'رعاية الأمراض العصبية لدى الأطفال.', true, 170),

    (null, 'dermatology', 'Dermatology', 'الأمراض الجلدية', 'Skin, hair, nail, and dermatologic medical care.', 'رعاية الجلد والشعر والأظافر والأمراض الجلدية.', true, 180),
    (null, 'obstetrics-and-gynecology', 'Obstetrics and Gynecology', 'النساء والولادة', 'Women’s health, pregnancy, and gynecologic care.', 'صحة المرأة والحمل ورعاية أمراض النساء.', true, 190),
    ('obstetrics-and-gynecology', 'maternal-fetal-medicine', 'Maternal-Fetal Medicine', 'طب الأم والجنين', 'High-risk pregnancy and maternal-fetal care.', 'رعاية الحمل عالي الخطورة وطب الأم والجنين.', true, 200),
    ('obstetrics-and-gynecology', 'reproductive-endocrinology-and-infertility', 'Reproductive Endocrinology and Infertility', 'الغدد التناسلية والعقم', 'Fertility, reproductive endocrinology, and infertility care.', 'رعاية الخصوبة والغدد التناسلية والعقم.', true, 210),
    (null, 'ent', 'ENT', 'أنف وأذن وحنجرة', 'Ear, nose, throat, head, and neck medical care.', 'رعاية الأذن والأنف والحنجرة والرأس والرقبة.', true, 220),
    (null, 'ophthalmology', 'Ophthalmology', 'طب العيون', 'Eye disease and ophthalmic medical care.', 'رعاية أمراض العيون وطب العيون.', true, 230),
    (null, 'orthopedics', 'Orthopedics', 'جراحة العظام', 'Bone, joint, spine, and musculoskeletal care.', 'رعاية العظام والمفاصل والعمود الفقري والجهاز العضلي الهيكلي.', true, 240),
    (null, 'neurology', 'Neurology', 'الأعصاب', 'Brain, nerve, and neurological disease care.', 'رعاية الدماغ والأعصاب والأمراض العصبية.', true, 250),
    (null, 'psychiatry', 'Psychiatry', 'الطب النفسي', 'Medical diagnosis and treatment of mental health conditions.', 'التشخيص والعلاج الطبي لحالات الصحة النفسية.', true, 260),
    (null, 'psychology', 'Psychology', 'علم النفس', 'Psychology and counseling services.', 'خدمات علم النفس والاستشارات.', false, 270),
    (null, 'dentistry', 'Dentistry', 'طب الأسنان', 'Dental and oral health care.', 'رعاية طب الأسنان وصحة الفم.', true, 280),
    ('dentistry', 'oral-and-maxillofacial-surgery', 'Oral and Maxillofacial Surgery', 'جراحة الفم والوجه والفكين', 'Surgical care for the mouth, jaw, face, and related structures.', 'رعاية جراحية للفم والفك والوجه وما يرتبط بها.', true, 290),
    (null, 'general-surgery', 'General Surgery', 'الجراحة العامة', 'General surgical diagnosis and treatment.', 'التشخيص والعلاج الجراحي العام.', true, 300),
    (null, 'urology', 'Urology', 'المسالك البولية', 'Urinary tract and male reproductive system care.', 'رعاية المسالك البولية والجهاز التناسلي الذكري.', true, 310),
    (null, 'radiology', 'Radiology', 'الأشعة', 'Medical imaging interpretation and radiology care.', 'قراءة التصوير الطبي ورعاية الأشعة.', true, 320),
    (null, 'pathology', 'Pathology', 'علم الأمراض', 'Laboratory and disease diagnosis through pathology.', 'تشخيص الأمراض والفحوصات عبر علم الأمراض.', true, 330),
    (null, 'anesthesiology', 'Anesthesiology', 'التخدير', 'Anesthesia, perioperative, and pain-related medical care.', 'التخدير والرعاية حول العمليات وبعض رعاية الألم.', true, 340),
    (null, 'emergency-medicine', 'Emergency Medicine', 'طب الطوارئ', 'Emergency and acute care medicine.', 'طب الطوارئ والرعاية الحادة.', true, 350),
    (null, 'physical-medicine-and-rehabilitation', 'Physical Medicine and Rehabilitation', 'الطب الطبيعي وإعادة التأهيل', 'Rehabilitation medicine and functional recovery care.', 'طب التأهيل والتعافي الوظيفي.', true, 360),
    (null, 'physiotherapy', 'Physiotherapy', 'العلاج الطبيعي', 'Physiotherapy and movement rehabilitation services.', 'العلاج الطبيعي وإعادة التأهيل الحركي.', false, 370),
    (null, 'dietetics-and-nutrition', 'Dietetics and Nutrition', 'التغذية العلاجية', 'Diet, nutrition, and therapeutic nutrition services.', 'خدمات التغذية والحمية والتغذية العلاجية.', false, 380)
), doctor_group as (
  select id from public.taxonomy_groups where slug = 'doctor-specialties' and deleted_at is null
), seed_rows as (
  select
    doctor_group.id as taxonomy_group_id,
    specialty_seed.parent_slug,
    specialty_seed.slug,
    specialty_seed.name_en,
    specialty_seed.name_ar,
    specialty_seed.description_en,
    specialty_seed.description_ar,
    specialty_seed.requires_medical_disclaimer,
    specialty_seed.sort_order
  from specialty_seed
  cross join doctor_group
), updated_specialties as (
  update public.specialties target
  set
    taxonomy_group_id = seed.taxonomy_group_id,
    name_en = seed.name_en,
    name_ar = seed.name_ar,
    description_en = seed.description_en,
    description_ar = seed.description_ar,
    is_medical = true,
    requires_medical_disclaimer = seed.requires_medical_disclaimer,
    is_active = true,
    sort_order = seed.sort_order,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SPECIALTY-A', 'parent_slug', seed.parent_slug),
    updated_at = now()
  from seed_rows seed
  where target.slug = seed.slug
  returning target.slug
)
insert into public.specialties (
  taxonomy_group_id,
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  is_medical,
  requires_medical_disclaimer,
  is_active,
  sort_order,
  metadata
)
select
  seed.taxonomy_group_id,
  seed.slug,
  seed.name_en,
  seed.name_ar,
  seed.description_en,
  seed.description_ar,
  true,
  seed.requires_medical_disclaimer,
  true,
  seed.sort_order,
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SPECIALTY-A', 'parent_slug', seed.parent_slug)
from seed_rows seed
where not exists (
  select 1 from public.specialties existing where existing.slug = seed.slug
);

with specialty_seed (parent_slug, slug) as (
  values
    ('internal-medicine', 'cardiology'),
    ('cardiology', 'interventional-cardiology'),
    ('internal-medicine', 'gastroenterology'),
    ('internal-medicine', 'endocrinology'),
    ('internal-medicine', 'nephrology'),
    ('internal-medicine', 'pulmonology'),
    ('internal-medicine', 'hematology'),
    ('internal-medicine', 'oncology'),
    ('internal-medicine', 'rheumatology'),
    ('internal-medicine', 'infectious-diseases'),
    ('pediatrics', 'neonatology'),
    ('pediatrics', 'pediatric-cardiology'),
    ('pediatrics', 'pediatric-neurology'),
    ('obstetrics-and-gynecology', 'maternal-fetal-medicine'),
    ('obstetrics-and-gynecology', 'reproductive-endocrinology-and-infertility'),
    ('dentistry', 'oral-and-maxillofacial-surgery')
), parent_links as (
  select
    child.id as child_id,
    parent.id as parent_id,
    seed.parent_slug,
    seed.slug
  from specialty_seed seed
  join public.specialties child on child.slug = seed.slug and child.deleted_at is null
  join public.specialties parent on parent.slug = seed.parent_slug and parent.deleted_at is null
)
update public.specialties target
set
  parent_specialty_id = links.parent_id,
  metadata = target.metadata || jsonb_build_object('parent_slug', links.parent_slug),
  updated_at = now()
from parent_links links
where target.id = links.child_id;
