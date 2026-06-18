with city_seed (
  country_code_value,
  region_slug,
  slug,
  name_en,
  name_ar,
  is_capital,
  sort_order
) as (
  values
    -- United Arab Emirates city/locality catalog
    ('ae'::country_code, 'abu-dhabi-emirate', 'abu-dhabi', 'Abu Dhabi', 'أبوظبي', true, 10),
    ('ae'::country_code, 'abu-dhabi-emirate', 'al-ain', 'Al Ain', 'العين', false, 20),
    ('ae'::country_code, 'abu-dhabi-emirate', 'madinat-zayed', 'Madinat Zayed', 'مدينة زايد', false, 30),
    ('ae'::country_code, 'abu-dhabi-emirate', 'ruwais', 'Ruwais', 'الرويس', false, 40),
    ('ae'::country_code, 'abu-dhabi-emirate', 'ghayathi', 'Ghayathi', 'غياثي', false, 50),
    ('ae'::country_code, 'abu-dhabi-emirate', 'liwa', 'Liwa', 'ليوا', false, 60),
    ('ae'::country_code, 'abu-dhabi-emirate', 'al-sila', 'Al Sila', 'السلع', false, 70),
    ('ae'::country_code, 'abu-dhabi-emirate', 'dalma', 'Dalma', 'دلما', false, 80),
    ('ae'::country_code, 'dubai-emirate', 'dubai', 'Dubai', 'دبي', true, 10),
    ('ae'::country_code, 'dubai-emirate', 'hatta', 'Hatta', 'حتا', false, 20),
    ('ae'::country_code, 'sharjah-emirate', 'sharjah', 'Sharjah', 'الشارقة', true, 10),
    ('ae'::country_code, 'sharjah-emirate', 'khor-fakkan', 'Khor Fakkan', 'خورفكان', false, 20),
    ('ae'::country_code, 'sharjah-emirate', 'kalba', 'Kalba', 'كلباء', false, 30),
    ('ae'::country_code, 'sharjah-emirate', 'dibba-al-hisn', 'Dibba Al Hisn', 'دبا الحصن', false, 40),
    ('ae'::country_code, 'sharjah-emirate', 'al-dhaid', 'Al Dhaid', 'الذيد', false, 50),
    ('ae'::country_code, 'sharjah-emirate', 'mleiha', 'Mleiha', 'مليحة', false, 60),
    ('ae'::country_code, 'ajman-emirate', 'ajman', 'Ajman', 'عجمان', true, 10),
    ('ae'::country_code, 'ajman-emirate', 'masfout', 'Masfout', 'مصفوت', false, 20),
    ('ae'::country_code, 'ajman-emirate', 'manama-ajman', 'Manama', 'المنامة', false, 30),
    ('ae'::country_code, 'umm-al-quwain-emirate', 'umm-al-quwain', 'Umm Al Quwain', 'أم القيوين', true, 10),
    ('ae'::country_code, 'umm-al-quwain-emirate', 'falaj-al-mualla', 'Falaj Al Mualla', 'فلج المعلا', false, 20),
    ('ae'::country_code, 'ras-al-khaimah-emirate', 'ras-al-khaimah', 'Ras Al Khaimah', 'رأس الخيمة', true, 10),
    ('ae'::country_code, 'ras-al-khaimah-emirate', 'al-jazirah-al-hamra', 'Al Jazirah Al Hamra', 'الجزيرة الحمراء', false, 20),
    ('ae'::country_code, 'ras-al-khaimah-emirate', 'khatt', 'Khatt', 'خت', false, 30),
    ('ae'::country_code, 'fujairah-emirate', 'fujairah', 'Fujairah', 'الفجيرة', true, 10),
    ('ae'::country_code, 'fujairah-emirate', 'dibba-al-fujairah', 'Dibba Al Fujairah', 'دبا الفجيرة', false, 20),
    ('ae'::country_code, 'fujairah-emirate', 'masafi', 'Masafi', 'مسافي', false, 30),
    ('ae'::country_code, 'fujairah-emirate', 'mirbah', 'Mirbah', 'مربح', false, 40),

    -- Qatar city/locality catalog
    ('qa'::country_code, 'ad-dawhah', 'doha', 'Doha', 'الدوحة', true, 10),
    ('qa'::country_code, 'al-rayyan', 'al-rayyan', 'Al Rayyan', 'الريان', false, 10),
    ('qa'::country_code, 'al-rayyan', 'al-gharrafa', 'Al Gharrafa', 'الغرافة', false, 20),
    ('qa'::country_code, 'al-rayyan', 'al-wajbah', 'Al Wajbah', 'الوجبة', false, 30),
    ('qa'::country_code, 'al-wakrah', 'al-wakrah', 'Al Wakrah', 'الوكرة', false, 10),
    ('qa'::country_code, 'al-wakrah', 'al-wukair', 'Al Wukair', 'الوكير', false, 20),
    ('qa'::country_code, 'al-wakrah', 'mesaieed', 'Mesaieed', 'مسيعيد', false, 30),
    ('qa'::country_code, 'al-khor-and-al-thakhira', 'al-khor', 'Al Khor', 'الخور', false, 10),
    ('qa'::country_code, 'al-khor-and-al-thakhira', 'al-thakhira', 'Al Thakhira', 'الذخيرة', false, 20),
    ('qa'::country_code, 'al-shamal', 'madinat-ash-shamal', 'Madinat ash Shamal', 'مدينة الشمال', false, 10),
    ('qa'::country_code, 'al-shamal', 'al-ruwais', 'Al Ruwais', 'الرويس', false, 20),
    ('qa'::country_code, 'al-shamal', 'fuwayrit', 'Fuwayrit', 'فويرط', false, 30),
    ('qa'::country_code, 'umm-salal', 'umm-salal-ali', 'Umm Salal Ali', 'أم صلال علي', false, 10),
    ('qa'::country_code, 'umm-salal', 'umm-salal-mohammed', 'Umm Salal Mohammed', 'أم صلال محمد', false, 20),
    ('qa'::country_code, 'al-daayen', 'al-daayen', 'Al Daayen', 'الضعاين', false, 10),
    ('qa'::country_code, 'al-daayen', 'lusail', 'Lusail', 'لوسيل', false, 20),
    ('qa'::country_code, 'al-shahaniya', 'al-shahaniya', 'Al Shahaniya', 'الشحانية', false, 10),
    ('qa'::country_code, 'al-shahaniya', 'dukhan', 'Dukhan', 'دخان', false, 20),

    -- Bahrain city/locality catalog
    ('bh'::country_code, 'capital-governorate', 'manama', 'Manama', 'المنامة', true, 10),
    ('bh'::country_code, 'capital-governorate', 'juffair', 'Juffair', 'الجفير', false, 20),
    ('bh'::country_code, 'capital-governorate', 'seef', 'Seef', 'السيف', false, 30),
    ('bh'::country_code, 'muharraq-governorate', 'muharraq', 'Muharraq', 'المحرق', false, 10),
    ('bh'::country_code, 'muharraq-governorate', 'hidd', 'Hidd', 'الحد', false, 20),
    ('bh'::country_code, 'muharraq-governorate', 'busaiteen', 'Busaiteen', 'البسيتين', false, 30),
    ('bh'::country_code, 'northern-governorate', 'hamad-town', 'Hamad Town', 'مدينة حمد', false, 10),
    ('bh'::country_code, 'northern-governorate', 'budaiya', 'Budaiya', 'البديع', false, 20),
    ('bh'::country_code, 'northern-governorate', 'aali', 'Aali', 'عالي', false, 30),
    ('bh'::country_code, 'northern-governorate', 'saar', 'Saar', 'سار', false, 40),
    ('bh'::country_code, 'northern-governorate', 'jidhafs', 'Jidhafs', 'جدحفص', false, 50),
    ('bh'::country_code, 'southern-governorate', 'riffa', 'Riffa', 'الرفاع', false, 10),
    ('bh'::country_code, 'southern-governorate', 'isa-town', 'Isa Town', 'مدينة عيسى', false, 20),
    ('bh'::country_code, 'southern-governorate', 'awali', 'Awali', 'عوالي', false, 30),
    ('bh'::country_code, 'southern-governorate', 'zallaq', 'Zallaq', 'الزلاق', false, 40),
    ('bh'::country_code, 'southern-governorate', 'askar', 'Askar', 'عسكر', false, 50),
    ('bh'::country_code, 'southern-governorate', 'jaww', 'Jaww', 'جو', false, 60),

    -- Kuwait city/locality catalog
    ('kw'::country_code, 'capital-governorate', 'kuwait-city', 'Kuwait City', 'مدينة الكويت', true, 10),
    ('kw'::country_code, 'capital-governorate', 'sharq', 'Sharq', 'شرق', false, 20),
    ('kw'::country_code, 'capital-governorate', 'dasma', 'Dasma', 'الدسمة', false, 30),
    ('kw'::country_code, 'capital-governorate', 'bneid-al-qar', 'Bneid Al Qar', 'بنيد القار', false, 40),
    ('kw'::country_code, 'capital-governorate', 'rawda', 'Rawda', 'الروضة', false, 50),
    ('kw'::country_code, 'capital-governorate', 'shuwaikh', 'Shuwaikh', 'الشويخ', false, 60),
    ('kw'::country_code, 'hawalli-governorate', 'hawalli', 'Hawalli', 'حولي', false, 10),
    ('kw'::country_code, 'hawalli-governorate', 'salmiya', 'Salmiya', 'السالمية', false, 20),
    ('kw'::country_code, 'hawalli-governorate', 'jabriya', 'Jabriya', 'الجابرية', false, 30),
    ('kw'::country_code, 'hawalli-governorate', 'bayan', 'Bayan', 'بيان', false, 40),
    ('kw'::country_code, 'hawalli-governorate', 'mishref', 'Mishref', 'مشرف', false, 50),
    ('kw'::country_code, 'hawalli-governorate', 'rumithiya', 'Rumithiya', 'الرميثية', false, 60),
    ('kw'::country_code, 'farwaniya-governorate', 'farwaniya', 'Farwaniya', 'الفروانية', false, 10),
    ('kw'::country_code, 'farwaniya-governorate', 'khaitan', 'Khaitan', 'خيطان', false, 20),
    ('kw'::country_code, 'farwaniya-governorate', 'jleeb-al-shuyoukh', 'Jleeb Al Shuyoukh', 'جليب الشيوخ', false, 30),
    ('kw'::country_code, 'farwaniya-governorate', 'ardiya', 'Ardiya', 'العارضية', false, 40),
    ('kw'::country_code, 'farwaniya-governorate', 'abdullah-al-mubarak', 'Abdullah Al Mubarak', 'عبدالله المبارك', false, 50),
    ('kw'::country_code, 'mubarak-al-kabeer-governorate', 'mubarak-al-kabeer', 'Mubarak Al Kabeer', 'مبارك الكبير', false, 10),
    ('kw'::country_code, 'mubarak-al-kabeer-governorate', 'sabah-al-salem', 'Sabah Al Salem', 'صباح السالم', false, 20),
    ('kw'::country_code, 'mubarak-al-kabeer-governorate', 'al-qurain', 'Al Qurain', 'القرين', false, 30),
    ('kw'::country_code, 'mubarak-al-kabeer-governorate', 'al-adan', 'Al Adan', 'العدان', false, 40),
    ('kw'::country_code, 'mubarak-al-kabeer-governorate', 'al-masayel', 'Al Masayel', 'المسايل', false, 50),
    ('kw'::country_code, 'ahmadi-governorate', 'ahmadi', 'Ahmadi', 'الأحمدي', false, 10),
    ('kw'::country_code, 'ahmadi-governorate', 'fahaheel', 'Fahaheel', 'الفحيحيل', false, 20),
    ('kw'::country_code, 'ahmadi-governorate', 'mangaf', 'Mangaf', 'المنقف', false, 30),
    ('kw'::country_code, 'ahmadi-governorate', 'mahboula', 'Mahboula', 'المهبولة', false, 40),
    ('kw'::country_code, 'ahmadi-governorate', 'abu-halifa', 'Abu Halifa', 'أبو حليفة', false, 50),
    ('kw'::country_code, 'ahmadi-governorate', 'al-wafra', 'Al Wafra', 'الوفرة', false, 60),
    ('kw'::country_code, 'jahra-governorate', 'jahra', 'Jahra', 'الجهراء', false, 10),
    ('kw'::country_code, 'jahra-governorate', 'sulaibiya', 'Sulaibiya', 'الصليبية', false, 20),
    ('kw'::country_code, 'jahra-governorate', 'abdali', 'Abdali', 'العبدلي', false, 30),
    ('kw'::country_code, 'jahra-governorate', 'al-qasr', 'Al Qasr', 'القصر', false, 40)
), city_rows as (
  select
    countries.id as country_id,
    regions.id as region_id,
    seed.slug,
    seed.name_en,
    seed.name_ar,
    seed.is_capital,
    seed.sort_order
  from city_seed seed
  join public.geo_countries countries
    on countries.code = seed.country_code_value
   and countries.deleted_at is null
  join public.geo_regions regions
    on regions.country_id = countries.id
   and regions.slug = seed.region_slug
   and regions.deleted_at is null
), updated_cities as (
  update public.geo_cities target
  set
    region_id = seed.region_id,
    name_en = seed.name_en,
    name_ar = seed.name_ar,
    is_capital = seed.is_capital,
    is_active = true,
    sort_order = seed.sort_order,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-D1B'),
    updated_at = now()
  from city_rows seed
  where target.country_id = seed.country_id
    and target.slug = seed.slug
  returning target.id, target.slug
)
insert into public.geo_cities (
  country_id,
  region_id,
  slug,
  name_en,
  name_ar,
  is_capital,
  is_active,
  sort_order,
  metadata
)
select
  seed.country_id,
  seed.region_id,
  seed.slug,
  seed.name_en,
  seed.name_ar,
  seed.is_capital,
  true,
  seed.sort_order,
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-D1B')
from city_rows seed
where not exists (
  select 1
  from public.geo_cities existing
  where existing.country_id = seed.country_id
    and existing.slug = seed.slug
);
