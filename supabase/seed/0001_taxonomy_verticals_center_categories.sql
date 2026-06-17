with vertical_seed (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  is_medical,
  requires_medical_disclaimer,
  is_human_health,
  is_veterinary,
  is_food_related,
  public_directory_enabled,
  public_profile_enabled,
  is_active,
  sort_order
) as (
  values
    ('medical', 'Medical', 'طبي', 'Clinics, hospitals, and medical services in Oman.', 'عيادات ومستشفيات وخدمات طبية في عُمان.', true, true, true, false, false, true, true, true, 10),
    ('dental', 'Dental', 'طب الأسنان', 'Dental clinics and oral health services in Oman.', 'عيادات الأسنان وخدمات صحة الفم في عُمان.', true, true, true, false, false, true, true, true, 20),
    ('aesthetic', 'Aesthetic & Beauty', 'التجميل والعناية', 'Aesthetic, dermatology, beauty, and personal care services.', 'خدمات التجميل والجلدية والعناية الشخصية.', true, true, true, false, false, true, true, true, 30),
    ('diagnostics', 'Diagnostics', 'التشخيص', 'Medical laboratories, imaging centers, and diagnostic services.', 'المختبرات الطبية ومراكز التصوير وخدمات التشخيص.', true, true, true, false, false, true, true, true, 40),
    ('pharmacy', 'Pharmacy', 'صيدلية', 'Pharmacies and medicine-related services.', 'الصيدليات والخدمات المرتبطة بالأدوية.', true, true, true, false, false, true, true, true, 50),
    ('wellness', 'Wellness', 'العافية', 'Wellness, preventive health, and wellbeing services.', 'خدمات العافية والصحة الوقائية والرفاه.', true, false, true, false, false, true, true, true, 60),
    ('fitness', 'Fitness', 'اللياقة', 'Fitness and sports health services.', 'خدمات اللياقة والصحة الرياضية.', false, false, true, false, false, false, true, true, 70),
    ('nutrition', 'Nutrition', 'التغذية', 'Nutrition, diet, and weight management services.', 'خدمات التغذية والحمية وإدارة الوزن.', true, false, true, false, false, true, true, true, 80),
    ('home_care', 'Home Care', 'الرعاية المنزلية', 'Home healthcare and home support services.', 'خدمات الرعاية الصحية والدعم المنزلي.', true, true, true, false, false, true, true, true, 90),
    ('rehabilitation', 'Rehabilitation', 'التأهيل', 'Rehabilitation, recovery, and therapy services.', 'خدمات التأهيل والتعافي والعلاج.', true, true, true, false, false, true, true, true, 100),
    ('mental_health', 'Mental Health', 'الصحة النفسية', 'Mental health, counseling, and psychology services.', 'خدمات الصحة النفسية والاستشارات وعلم النفس.', true, true, true, false, false, true, true, true, 110),
    ('optical_eye_care', 'Optical & Eye Care', 'البصريات ورعاية العيون', 'Optical, vision, and eye care services.', 'خدمات البصريات والنظر ورعاية العيون.', true, true, true, false, false, true, true, true, 120),
    ('veterinary', 'Veterinary / Pet Health', 'الطب البيطري ورعاية الحيوانات', 'Veterinary and pet health services. Planned but not public yet.', 'خدمات الطب البيطري ورعاية الحيوانات. مخطط لها ولم يتم إطلاقها للعامة بعد.', false, false, false, true, false, false, false, false, 900),
    ('healthy_food', 'Healthy Food', 'الطعام الصحي', 'Healthy food services. Planned but not public yet.', 'خدمات الطعام الصحي. مخطط لها ولم يتم إطلاقها للعامة بعد.', false, false, true, false, true, false, false, false, 910),
    ('other_health', 'Other Health Services', 'خدمات صحية أخرى', 'Other approved health-related services.', 'خدمات صحية أخرى معتمدة.', false, false, true, false, false, false, true, true, 990)
), updated_verticals as (
  update public.healthcare_verticals target
  set
    name_en = seed.name_en,
    name_ar = seed.name_ar,
    description_en = seed.description_en,
    description_ar = seed.description_ar,
    is_medical = seed.is_medical,
    requires_medical_disclaimer = seed.requires_medical_disclaimer,
    is_human_health = seed.is_human_health,
    is_veterinary = seed.is_veterinary,
    is_food_related = seed.is_food_related,
    schema_org_hint = null,
    public_directory_enabled = seed.public_directory_enabled,
    public_profile_enabled = seed.public_profile_enabled,
    is_active = seed.is_active,
    sort_order = seed.sort_order,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SEED-B'),
    updated_at = now()
  from vertical_seed seed
  where target.slug = seed.slug
  returning target.slug
)
insert into public.healthcare_verticals (
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  is_medical,
  requires_medical_disclaimer,
  is_human_health,
  is_veterinary,
  is_food_related,
  schema_org_hint,
  public_directory_enabled,
  public_profile_enabled,
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
  seed.is_medical,
  seed.requires_medical_disclaimer,
  seed.is_human_health,
  seed.is_veterinary,
  seed.is_food_related,
  null,
  seed.public_directory_enabled,
  seed.public_profile_enabled,
  seed.is_active,
  seed.sort_order,
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SEED-B')
from vertical_seed seed
where not exists (
  select 1 from public.healthcare_verticals existing where existing.slug = seed.slug
);

with category_seed (
  vertical_slug,
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  default_center_type,
  is_medical,
  requires_medical_disclaimer,
  public_directory_enabled,
  public_profile_enabled,
  is_active,
  sort_order
) as (
  values
    ('medical', 'clinic', 'Clinic', 'عيادة', 'General clinic and outpatient healthcare services.', 'عيادة عامة وخدمات رعاية صحية خارجية.', 'clinic'::center_type, true, true, true, true, true, 10),
    ('medical', 'hospital', 'Hospital', 'مستشفى', 'Hospital and inpatient or outpatient healthcare services.', 'مستشفى وخدمات رعاية صحية داخلية أو خارجية.', 'hospital'::center_type, true, true, true, true, true, 20),
    ('medical', 'medical-center', 'Medical Center', 'مركز طبي', 'Multi-service medical center.', 'مركز طبي متعدد الخدمات.', 'clinic'::center_type, true, true, true, true, true, 30),
    ('dental', 'dental-clinic', 'Dental Clinic', 'عيادة أسنان', 'Dental and oral health services.', 'خدمات طب الأسنان وصحة الفم.', 'dental_clinic'::center_type, true, true, true, true, true, 40),
    ('aesthetic', 'aesthetic-clinic', 'Aesthetic Clinic', 'عيادة تجميل', 'Aesthetic and personal care services.', 'خدمات التجميل والعناية الشخصية.', 'beauty_clinic'::center_type, true, true, true, true, true, 50),
    ('aesthetic', 'dermatology-clinic', 'Dermatology Clinic', 'عيادة جلدية', 'Dermatology and skin care services.', 'خدمات الجلدية والعناية بالبشرة.', 'clinic'::center_type, true, true, true, true, true, 60),
    ('diagnostics', 'medical-laboratory', 'Medical Laboratory', 'مختبر طبي', 'Laboratory testing and diagnostic sample services.', 'خدمات الفحوصات المخبرية والعينات التشخيصية.', 'laboratory'::center_type, true, true, true, true, true, 70),
    ('diagnostics', 'imaging-center', 'Imaging Center', 'مركز تصوير طبي', 'Medical imaging and radiology services.', 'خدمات التصوير الطبي والأشعة.', 'imaging_center'::center_type, true, true, true, true, true, 80),
    ('pharmacy', 'pharmacy', 'Pharmacy', 'صيدلية', 'Pharmacy and medicine-related services.', 'خدمات الصيدلية والأدوية.', 'pharmacy'::center_type, true, true, true, true, true, 90),
    ('wellness', 'wellness-center', 'Wellness Center', 'مركز عافية', 'Wellness and wellbeing services.', 'خدمات العافية والرفاه.', 'wellness_center'::center_type, true, false, true, true, true, 100),
    ('wellness', 'spa-wellness', 'Spa & Wellness', 'سبا وعافية', 'Spa and wellness services.', 'خدمات السبا والعافية.', 'wellness_center'::center_type, true, false, false, true, true, 110),
    ('fitness', 'gym-fitness-center', 'Gym / Fitness Center', 'نادي رياضي / مركز لياقة', 'Fitness and sports activity services.', 'خدمات اللياقة والأنشطة الرياضية.', 'other'::center_type, false, false, false, true, true, 120),
    ('nutrition', 'nutrition-center', 'Nutrition Center', 'مركز تغذية', 'Nutrition, diet, and weight management services.', 'خدمات التغذية والحمية وإدارة الوزن.', 'wellness_center'::center_type, true, false, true, true, true, 130),
    ('nutrition', 'dietitian-clinic', 'Dietitian Clinic', 'عيادة أخصائي تغذية', 'Dietitian and nutrition consultation services.', 'خدمات الاستشارات الغذائية وأخصائي التغذية.', 'clinic'::center_type, true, false, true, true, true, 140),
    ('home_care', 'home-healthcare', 'Home Healthcare', 'رعاية صحية منزلية', 'Home healthcare and support services.', 'خدمات الرعاية الصحية والدعم المنزلي.', 'other'::center_type, true, true, true, true, true, 150),
    ('rehabilitation', 'physiotherapy-center', 'Physiotherapy Center', 'مركز علاج طبيعي', 'Physiotherapy and movement therapy services.', 'خدمات العلاج الطبيعي والعلاج الحركي.', 'physiotherapy_center'::center_type, true, true, true, true, true, 160),
    ('rehabilitation', 'rehabilitation-center', 'Rehabilitation Center', 'مركز تأهيل', 'Rehabilitation and recovery services.', 'خدمات التأهيل والتعافي.', 'physiotherapy_center'::center_type, true, true, true, true, true, 170),
    ('mental_health', 'psychology-clinic', 'Psychology Clinic', 'عيادة نفسية', 'Psychology and counseling services.', 'خدمات علم النفس والاستشارات.', 'clinic'::center_type, true, true, true, true, true, 180),
    ('mental_health', 'psychiatry-clinic', 'Psychiatry Clinic', 'عيادة طب نفسي', 'Psychiatry and mental health medical services.', 'خدمات الطب النفسي والصحة النفسية.', 'clinic'::center_type, true, true, true, true, true, 190),
    ('optical_eye_care', 'eye-clinic', 'Eye Clinic', 'عيادة عيون', 'Eye care and ophthalmology services.', 'خدمات رعاية العيون وطب العيون.', 'clinic'::center_type, true, true, true, true, true, 200),
    ('optical_eye_care', 'optical-store', 'Optical Store', 'محل بصريات', 'Optical and vision product services.', 'خدمات البصريات ومنتجات النظر.', 'other'::center_type, false, false, true, true, true, 210),
    ('veterinary', 'pet-clinic', 'Pet Clinic', 'عيادة حيوانات أليفة', 'Pet care services. Planned but disabled.', 'خدمات رعاية الحيوانات الأليفة. مخطط لها وغير مفعلة.', 'other'::center_type, false, false, false, false, false, 900),
    ('veterinary', 'veterinary-clinic', 'Veterinary Clinic', 'عيادة بيطرية', 'Veterinary services. Planned but disabled.', 'خدمات الطب البيطري. مخطط لها وغير مفعلة.', 'other'::center_type, false, false, false, false, false, 910),
    ('healthy_food', 'healthy-restaurant', 'Healthy Restaurant', 'مطعم صحي', 'Healthy food services. Planned but disabled.', 'خدمات الطعام الصحي. مخطط لها وغير مفعلة.', 'other'::center_type, false, false, false, false, false, 920),
    ('healthy_food', 'healthy-cafe', 'Healthy Cafe', 'مقهى صحي', 'Healthy cafe services. Planned but disabled.', 'خدمات المقاهي الصحية. مخطط لها وغير مفعلة.', 'other'::center_type, false, false, false, false, false, 930),
    ('other_health', 'other-health-service', 'Other Health Service', 'خدمة صحية أخرى', 'Other approved health-related services.', 'خدمات صحية أخرى معتمدة.', 'other'::center_type, false, false, false, true, true, 990)
), category_rows as (
  select
    verticals.id as vertical_id,
    seed.vertical_slug,
    seed.slug,
    seed.name_en,
    seed.name_ar,
    seed.description_en,
    seed.description_ar,
    seed.default_center_type,
    seed.is_medical,
    seed.requires_medical_disclaimer,
    seed.public_directory_enabled,
    seed.public_profile_enabled,
    seed.is_active,
    seed.sort_order
  from category_seed seed
  join public.healthcare_verticals verticals
    on verticals.slug = seed.vertical_slug
), updated_categories as (
  update public.center_categories target
  set
    vertical_id = seed.vertical_id,
    parent_category_id = null,
    name_en = seed.name_en,
    name_ar = seed.name_ar,
    description_en = seed.description_en,
    description_ar = seed.description_ar,
    default_center_type = seed.default_center_type,
    is_medical = seed.is_medical,
    requires_medical_disclaimer = seed.requires_medical_disclaimer,
    schema_org_hint = null,
    public_directory_enabled = seed.public_directory_enabled,
    public_profile_enabled = seed.public_profile_enabled,
    is_active = seed.is_active,
    sort_order = seed.sort_order,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SEED-B', 'vertical_slug', seed.vertical_slug),
    updated_at = now()
  from category_rows seed
  where target.slug = seed.slug
    and target.vertical_id = seed.vertical_id
  returning target.slug
)
insert into public.center_categories (
  vertical_id,
  parent_category_id,
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  default_center_type,
  is_medical,
  requires_medical_disclaimer,
  schema_org_hint,
  public_directory_enabled,
  public_profile_enabled,
  is_active,
  sort_order,
  metadata
)
select
  seed.vertical_id,
  null,
  seed.slug,
  seed.name_en,
  seed.name_ar,
  seed.description_en,
  seed.description_ar,
  seed.default_center_type,
  seed.is_medical,
  seed.requires_medical_disclaimer,
  null,
  seed.public_directory_enabled,
  seed.public_profile_enabled,
  seed.is_active,
  seed.sort_order,
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'TAX-SEED-B', 'vertical_slug', seed.vertical_slug)
from category_rows seed
where not exists (
  select 1
  from public.center_categories existing
  where existing.vertical_id = seed.vertical_id
    and existing.slug = seed.slug
);
