with country_seed (
  code,
  slug,
  name_en,
  name_ar,
  phone_country_code,
  currency_code,
  sort_order
) as (
  values
    ('om'::country_code, 'oman', 'Oman', 'عُمان', '968', 'OMR', 10),
    ('ae'::country_code, 'united-arab-emirates', 'United Arab Emirates', 'الإمارات العربية المتحدة', '971', 'AED', 20),
    ('qa'::country_code, 'qatar', 'Qatar', 'قطر', '974', 'QAR', 30),
    ('bh'::country_code, 'bahrain', 'Bahrain', 'البحرين', '973', 'BHD', 40),
    ('kw'::country_code, 'kuwait', 'Kuwait', 'الكويت', '965', 'KWD', 50),
    ('sa'::country_code, 'saudi-arabia', 'Saudi Arabia', 'المملكة العربية السعودية', '966', 'SAR', 60),
    ('iq'::country_code, 'iraq', 'Iraq', 'العراق', '964', 'IQD', 70),
    ('sy'::country_code, 'syria', 'Syria', 'سوريا', '963', 'SYP', 80),
    ('jo'::country_code, 'jordan', 'Jordan', 'الأردن', '962', 'JOD', 90),
    ('lb'::country_code, 'lebanon', 'Lebanon', 'لبنان', '961', 'LBP', 100),
    ('ps'::country_code, 'palestine', 'Palestine', 'فلسطين', '970', null, 110),
    ('eg'::country_code, 'egypt', 'Egypt', 'مصر', '20', 'EGP', 120),
    ('ye'::country_code, 'yemen', 'Yemen', 'اليمن', '967', 'YER', 130),
    ('ma'::country_code, 'morocco', 'Morocco', 'المغرب', '212', 'MAD', 140),
    ('dz'::country_code, 'algeria', 'Algeria', 'الجزائر', '213', 'DZD', 150),
    ('tn'::country_code, 'tunisia', 'Tunisia', 'تونس', '216', 'TND', 160),
    ('ly'::country_code, 'libya', 'Libya', 'ليبيا', '218', 'LYD', 170),
    ('sd'::country_code, 'sudan', 'Sudan', 'السودان', '249', 'SDG', 180),
    ('mr'::country_code, 'mauritania', 'Mauritania', 'موريتانيا', '222', 'MRU', 190),
    ('ir'::country_code, 'iran', 'Iran', 'إيران', '98', 'IRR', 200)
), updated_countries as (
  update public.geo_countries target
  set
    slug = seed.slug,
    name_en = seed.name_en,
    name_ar = seed.name_ar,
    phone_country_code = seed.phone_country_code,
    currency_code = seed.currency_code,
    is_active = true,
    sort_order = seed.sort_order,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-B'),
    updated_at = now()
  from country_seed seed
  where target.code = seed.code
  returning target.id, target.slug
)
insert into public.geo_countries (
  code,
  slug,
  name_en,
  name_ar,
  phone_country_code,
  currency_code,
  is_active,
  sort_order,
  metadata
)
select
  seed.code,
  seed.slug,
  seed.name_en,
  seed.name_ar,
  seed.phone_country_code,
  seed.currency_code,
  true,
  seed.sort_order,
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-B')
from country_seed seed
where not exists (
  select 1 from public.geo_countries existing where existing.code = seed.code
);

with region_seed (
  country_code_value,
  slug,
  name_en,
  name_ar,
  sort_order
) as (
  values
    -- Oman governorates
    ('om'::country_code, 'ad-dakhiliyah', 'Ad Dakhiliyah', 'الداخلية', 10),
    ('om'::country_code, 'al-batinah-north', 'Al Batinah North', 'شمال الباطنة', 20),
    ('om'::country_code, 'al-batinah-south', 'Al Batinah South', 'جنوب الباطنة', 30),
    ('om'::country_code, 'al-buraimi', 'Al Buraimi', 'البريمي', 40),
    ('om'::country_code, 'al-dhahirah', 'Al Dhahirah', 'الظاهرة', 50),
    ('om'::country_code, 'al-wusta', 'Al Wusta', 'الوسطى', 60),
    ('om'::country_code, 'ash-sharqiyah-north', 'Ash Sharqiyah North', 'شمال الشرقية', 70),
    ('om'::country_code, 'ash-sharqiyah-south', 'Ash Sharqiyah South', 'جنوب الشرقية', 80),
    ('om'::country_code, 'dhofar', 'Dhofar', 'ظفار', 90),
    ('om'::country_code, 'muscat-governorate', 'Muscat Governorate', 'محافظة مسقط', 100),
    ('om'::country_code, 'musandam', 'Musandam', 'مسندم', 110),

    -- United Arab Emirates emirates
    ('ae'::country_code, 'abu-dhabi-emirate', 'Abu Dhabi Emirate', 'إمارة أبوظبي', 10),
    ('ae'::country_code, 'dubai-emirate', 'Dubai Emirate', 'إمارة دبي', 20),
    ('ae'::country_code, 'sharjah-emirate', 'Sharjah Emirate', 'إمارة الشارقة', 30),
    ('ae'::country_code, 'ajman-emirate', 'Ajman Emirate', 'إمارة عجمان', 40),
    ('ae'::country_code, 'umm-al-quwain-emirate', 'Umm Al Quwain Emirate', 'إمارة أم القيوين', 50),
    ('ae'::country_code, 'ras-al-khaimah-emirate', 'Ras Al Khaimah Emirate', 'إمارة رأس الخيمة', 60),
    ('ae'::country_code, 'fujairah-emirate', 'Fujairah Emirate', 'إمارة الفجيرة', 70),

    -- Qatar municipalities
    ('qa'::country_code, 'ad-dawhah', 'Ad Dawhah', 'الدوحة', 10),
    ('qa'::country_code, 'al-rayyan', 'Al Rayyan', 'الريان', 20),
    ('qa'::country_code, 'al-wakrah', 'Al Wakrah', 'الوكرة', 30),
    ('qa'::country_code, 'al-khor-and-al-thakhira', 'Al Khor and Al Thakhira', 'الخور والذخيرة', 40),
    ('qa'::country_code, 'al-shamal', 'Al Shamal', 'الشمال', 50),
    ('qa'::country_code, 'umm-salal', 'Umm Salal', 'أم صلال', 60),
    ('qa'::country_code, 'al-daayen', 'Al Daayen', 'الضعاين', 70),
    ('qa'::country_code, 'al-shahaniya', 'Al Shahaniya', 'الشحانية', 80),

    -- Bahrain governorates
    ('bh'::country_code, 'capital-governorate', 'Capital Governorate', 'محافظة العاصمة', 10),
    ('bh'::country_code, 'muharraq-governorate', 'Muharraq Governorate', 'محافظة المحرق', 20),
    ('bh'::country_code, 'northern-governorate', 'Northern Governorate', 'المحافظة الشمالية', 30),
    ('bh'::country_code, 'southern-governorate', 'Southern Governorate', 'المحافظة الجنوبية', 40),

    -- Kuwait governorates
    ('kw'::country_code, 'capital-governorate', 'Capital Governorate', 'محافظة العاصمة', 10),
    ('kw'::country_code, 'hawalli-governorate', 'Hawalli Governorate', 'محافظة حولي', 20),
    ('kw'::country_code, 'farwaniya-governorate', 'Farwaniya Governorate', 'محافظة الفروانية', 30),
    ('kw'::country_code, 'mubarak-al-kabeer-governorate', 'Mubarak Al-Kabeer Governorate', 'محافظة مبارك الكبير', 40),
    ('kw'::country_code, 'ahmadi-governorate', 'Ahmadi Governorate', 'محافظة الأحمدي', 50),
    ('kw'::country_code, 'jahra-governorate', 'Jahra Governorate', 'محافظة الجهراء', 60),

    -- Saudi Arabia provinces
    ('sa'::country_code, 'riyadh-province', 'Riyadh Province', 'منطقة الرياض', 10),
    ('sa'::country_code, 'makkah-province', 'Makkah Province', 'منطقة مكة المكرمة', 20),
    ('sa'::country_code, 'madinah-province', 'Madinah Province', 'منطقة المدينة المنورة', 30),
    ('sa'::country_code, 'eastern-province', 'Eastern Province', 'المنطقة الشرقية', 40),
    ('sa'::country_code, 'asir-province', 'Asir Province', 'منطقة عسير', 50),
    ('sa'::country_code, 'tabuk-province', 'Tabuk Province', 'منطقة تبوك', 60),
    ('sa'::country_code, 'qassim-province', 'Qassim Province', 'منطقة القصيم', 70),
    ('sa'::country_code, 'hail-province', 'Hail Province', 'منطقة حائل', 80),
    ('sa'::country_code, 'northern-borders-province', 'Northern Borders Province', 'منطقة الحدود الشمالية', 90),
    ('sa'::country_code, 'jazan-province', 'Jazan Province', 'منطقة جازان', 100),
    ('sa'::country_code, 'najran-province', 'Najran Province', 'منطقة نجران', 110),
    ('sa'::country_code, 'al-bahah-province', 'Al Bahah Province', 'منطقة الباحة', 120),
    ('sa'::country_code, 'al-jouf-province', 'Al Jouf Province', 'منطقة الجوف', 130),

    -- Iran provinces
    ('ir'::country_code, 'alborz-province', 'Alborz Province', 'ألبرز', 10),
    ('ir'::country_code, 'ardabil-province', 'Ardabil Province', 'أردبيل', 20),
    ('ir'::country_code, 'bushehr-province', 'Bushehr Province', 'بوشهر', 30),
    ('ir'::country_code, 'chaharmahal-and-bakhtiari-province', 'Chaharmahal and Bakhtiari Province', 'جهارمحال وبختياري', 40),
    ('ir'::country_code, 'east-azerbaijan-province', 'East Azerbaijan Province', 'أذربيجان الشرقية', 50),
    ('ir'::country_code, 'isfahan-province', 'Isfahan Province', 'أصفهان', 60),
    ('ir'::country_code, 'fars-province', 'Fars Province', 'فارس', 70),
    ('ir'::country_code, 'gilan-province', 'Gilan Province', 'جيلان', 80),
    ('ir'::country_code, 'golestan-province', 'Golestan Province', 'غلستان', 90),
    ('ir'::country_code, 'hamadan-province', 'Hamadan Province', 'همدان', 100),
    ('ir'::country_code, 'hormozgan-province', 'Hormozgan Province', 'هرمزغان', 110),
    ('ir'::country_code, 'ilam-province', 'Ilam Province', 'إيلام', 120),
    ('ir'::country_code, 'kerman-province', 'Kerman Province', 'كرمان', 130),
    ('ir'::country_code, 'kermanshah-province', 'Kermanshah Province', 'كرمانشاه', 140),
    ('ir'::country_code, 'khuzestan-province', 'Khuzestan Province', 'خوزستان', 150),
    ('ir'::country_code, 'kohgiluyeh-and-boyer-ahmad-province', 'Kohgiluyeh and Boyer-Ahmad Province', 'كهكيلويه وبوير أحمد', 160),
    ('ir'::country_code, 'kurdistan-province', 'Kurdistan Province', 'كردستان', 170),
    ('ir'::country_code, 'lorestan-province', 'Lorestan Province', 'لرستان', 180),
    ('ir'::country_code, 'markazi-province', 'Markazi Province', 'مركزي', 190),
    ('ir'::country_code, 'mazandaran-province', 'Mazandaran Province', 'مازندران', 200),
    ('ir'::country_code, 'north-khorasan-province', 'North Khorasan Province', 'خراسان الشمالية', 210),
    ('ir'::country_code, 'qazvin-province', 'Qazvin Province', 'قزوين', 220),
    ('ir'::country_code, 'qom-province', 'Qom Province', 'قم', 230),
    ('ir'::country_code, 'razavi-khorasan-province', 'Razavi Khorasan Province', 'خراسان الرضوية', 240),
    ('ir'::country_code, 'semnan-province', 'Semnan Province', 'سمنان', 250),
    ('ir'::country_code, 'sistan-and-baluchestan-province', 'Sistan and Baluchestan Province', 'سيستان وبلوشستان', 260),
    ('ir'::country_code, 'south-khorasan-province', 'South Khorasan Province', 'خراسان الجنوبية', 270),
    ('ir'::country_code, 'tehran-province', 'Tehran Province', 'طهران', 280),
    ('ir'::country_code, 'west-azerbaijan-province', 'West Azerbaijan Province', 'أذربيجان الغربية', 290),
    ('ir'::country_code, 'yazd-province', 'Yazd Province', 'يزد', 300),
    ('ir'::country_code, 'zanjan-province', 'Zanjan Province', 'زنجان', 310)
), region_rows as (
  select
    countries.id as country_id,
    seed.slug,
    seed.name_en,
    seed.name_ar,
    seed.sort_order
  from region_seed seed
  join public.geo_countries countries
    on countries.code = seed.country_code_value
   and countries.deleted_at is null
), updated_regions as (
  update public.geo_regions target
  set
    name_en = seed.name_en,
    name_ar = seed.name_ar,
    is_active = true,
    sort_order = seed.sort_order,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-C1'),
    updated_at = now()
  from region_rows seed
  where target.country_id = seed.country_id
    and target.slug = seed.slug
  returning target.id, target.slug
)
insert into public.geo_regions (
  country_id,
  slug,
  name_en,
  name_ar,
  is_active,
  sort_order,
  metadata
)
select
  seed.country_id,
  seed.slug,
  seed.name_en,
  seed.name_ar,
  true,
  seed.sort_order,
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-C1')
from region_rows seed
where not exists (
  select 1
  from public.geo_regions existing
  where existing.country_id = seed.country_id
    and existing.slug = seed.slug
);

with oman_country as (
  select id from public.geo_countries where code = 'om'::country_code and deleted_at is null
), muscat_region as (
  select region.id
  from public.geo_regions region
  join oman_country country on country.id = region.country_id
  where region.slug = 'muscat-governorate'
    and region.deleted_at is null
), city_seed (
  slug,
  name_en,
  name_ar,
  is_capital,
  sort_order
) as (
  values
    ('muscat', 'Muscat', 'مسقط', true, 10)
), city_rows as (
  select country.id as country_id, region.id as region_id, seed.*
  from city_seed seed
  cross join oman_country country
  cross join muscat_region region
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
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-SEED-A'),
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
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-SEED-A')
from city_rows seed
where not exists (
  select 1
  from public.geo_cities existing
  where existing.country_id = seed.country_id
    and existing.slug = seed.slug
);

with oman_country as (
  select id from public.geo_countries where code = 'om'::country_code and deleted_at is null
), muscat_region as (
  select region.id
  from public.geo_regions region
  join oman_country country on country.id = region.country_id
  where region.slug = 'muscat-governorate'
    and region.deleted_at is null
), muscat_city as (
  select city.id
  from public.geo_cities city
  join oman_country country on country.id = city.country_id
  where city.slug = 'muscat'
    and city.deleted_at is null
), area_seed (
  slug,
  name_en,
  name_ar,
  sort_order
) as (
  values
    ('al-khuwair', 'Al Khuwair', 'الخوير', 10),
    ('al-azaiba', 'Al Azaiba', 'العذيبة', 20),
    ('al-ghubra', 'Al Ghubra', 'الغبرة', 30),
    ('bousher', 'Bousher', 'بوشر', 40),
    ('qurum', 'Qurum', 'القرم', 50),
    ('al-mawaleh', 'Al Mawaleh', 'الموالح', 60),
    ('muttrah', 'Muttrah', 'مطرح', 70),
    ('ruwi', 'Ruwi', 'روي', 80)
), area_rows as (
  select
    country.id as country_id,
    region.id as region_id,
    city.id as city_id,
    seed.*
  from area_seed seed
  cross join oman_country country
  cross join muscat_region region
  cross join muscat_city city
), updated_areas as (
  update public.geo_areas target
  set
    country_id = seed.country_id,
    region_id = seed.region_id,
    name_en = seed.name_en,
    name_ar = seed.name_ar,
    is_active = true,
    sort_order = seed.sort_order,
    deleted_at = null,
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-SEED-A'),
    updated_at = now()
  from area_rows seed
  where target.city_id = seed.city_id
    and target.slug = seed.slug
  returning target.id, target.slug
)
insert into public.geo_areas (
  country_id,
  region_id,
  city_id,
  slug,
  name_en,
  name_ar,
  is_active,
  sort_order,
  metadata
)
select
  seed.country_id,
  seed.region_id,
  seed.city_id,
  seed.slug,
  seed.name_en,
  seed.name_ar,
  true,
  seed.sort_order,
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-SEED-A')
from area_rows seed
where not exists (
  select 1
  from public.geo_areas existing
  where existing.city_id = seed.city_id
    and existing.slug = seed.slug
);
