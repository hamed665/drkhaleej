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
    -- Riyadh Province
    ('sa'::country_code, 'riyadh-province', 'riyadh', 'Riyadh', 'الرياض', true, 10),
    ('sa'::country_code, 'riyadh-province', 'diriyah', 'Diriyah', 'الدرعية', false, 20),
    ('sa'::country_code, 'riyadh-province', 'al-kharj', 'Al Kharj', 'الخرج', false, 30),
    ('sa'::country_code, 'riyadh-province', 'ad-dilam', 'Ad Dilam', 'الدلم', false, 40),
    ('sa'::country_code, 'riyadh-province', 'al-majmaah', 'Al Majmaah', 'المجمعة', false, 50),
    ('sa'::country_code, 'riyadh-province', 'az-zulfi', 'Az Zulfi', 'الزلفي', false, 60),
    ('sa'::country_code, 'riyadh-province', 'shaqar', 'Shaqra', 'شقراء', false, 70),
    ('sa'::country_code, 'riyadh-province', 'dawadmi', 'Dawadmi', 'الدوادمي', false, 80),
    ('sa'::country_code, 'riyadh-province', 'afif', 'Afif', 'عفيف', false, 90),
    ('sa'::country_code, 'riyadh-province', 'al-quwayiyah', 'Al Quwayiyah', 'القويعية', false, 100),
    ('sa'::country_code, 'riyadh-province', 'wadi-ad-dawasir', 'Wadi ad Dawasir', 'وادي الدواسر', false, 110),
    ('sa'::country_code, 'riyadh-province', 'as-sulayyil', 'As Sulayyil', 'السليل', false, 120),
    ('sa'::country_code, 'riyadh-province', 'al-aflaj', 'Al Aflaj', 'الأفلاج', false, 130),
    ('sa'::country_code, 'riyadh-province', 'hotat-bani-tamim', 'Hotat Bani Tamim', 'حوطة بني تميم', false, 140),
    ('sa'::country_code, 'riyadh-province', 'al-hariq', 'Al Hariq', 'الحريق', false, 150),
    ('sa'::country_code, 'riyadh-province', 'rumah', 'Rumah', 'رماح', false, 160),
    ('sa'::country_code, 'riyadh-province', 'thadiq', 'Thadiq', 'ثادق', false, 170),
    ('sa'::country_code, 'riyadh-province', 'al-muzahimiyah', 'Al Muzahimiyah', 'المزاحمية', false, 180),

    -- Makkah Province
    ('sa'::country_code, 'makkah-province', 'makkah', 'Makkah', 'مكة المكرمة', true, 10),
    ('sa'::country_code, 'makkah-province', 'jeddah', 'Jeddah', 'جدة', false, 20),
    ('sa'::country_code, 'makkah-province', 'taif', 'Taif', 'الطائف', false, 30),
    ('sa'::country_code, 'makkah-province', 'rabigh', 'Rabigh', 'رابغ', false, 40),
    ('sa'::country_code, 'makkah-province', 'al-qunfudhah', 'Al Qunfudhah', 'القنفذة', false, 50),
    ('sa'::country_code, 'makkah-province', 'al-lith', 'Al Lith', 'الليث', false, 60),
    ('sa'::country_code, 'makkah-province', 'khulays', 'Khulays', 'خليص', false, 70),
    ('sa'::country_code, 'makkah-province', 'al-jumum', 'Al Jumum', 'الجموم', false, 80),
    ('sa'::country_code, 'makkah-province', 'turabah', 'Turabah', 'تربة', false, 90),
    ('sa'::country_code, 'makkah-province', 'raniyah', 'Raniyah', 'رنية', false, 100),
    ('sa'::country_code, 'makkah-province', 'al-khurmah', 'Al Khurmah', 'الخرمة', false, 110),

    -- Madinah Province
    ('sa'::country_code, 'madinah-province', 'madinah', 'Madinah', 'المدينة المنورة', true, 10),
    ('sa'::country_code, 'madinah-province', 'yanbu', 'Yanbu', 'ينبع', false, 20),
    ('sa'::country_code, 'madinah-province', 'al-ula', 'AlUla', 'العلا', false, 30),
    ('sa'::country_code, 'madinah-province', 'khaybar', 'Khaybar', 'خيبر', false, 40),
    ('sa'::country_code, 'madinah-province', 'badr', 'Badr', 'بدر', false, 50),
    ('sa'::country_code, 'madinah-province', 'mahd-adh-dhahab', 'Mahd adh Dhahab', 'مهد الذهب', false, 60),
    ('sa'::country_code, 'madinah-province', 'al-hanakiyah', 'Al Hanakiyah', 'الحناكية', false, 70),

    -- Eastern Province
    ('sa'::country_code, 'eastern-province', 'dammam', 'Dammam', 'الدمام', true, 10),
    ('sa'::country_code, 'eastern-province', 'al-khobar', 'Al Khobar', 'الخبر', false, 20),
    ('sa'::country_code, 'eastern-province', 'dhahran', 'Dhahran', 'الظهران', false, 30),
    ('sa'::country_code, 'eastern-province', 'al-ahsa', 'Al Ahsa', 'الأحساء', false, 40),
    ('sa'::country_code, 'eastern-province', 'hofuf', 'Hofuf', 'الهفوف', false, 50),
    ('sa'::country_code, 'eastern-province', 'mubarraz', 'Mubarraz', 'المبرز', false, 60),
    ('sa'::country_code, 'eastern-province', 'al-jubail', 'Al Jubail', 'الجبيل', false, 70),
    ('sa'::country_code, 'eastern-province', 'qatif', 'Qatif', 'القطيف', false, 80),
    ('sa'::country_code, 'eastern-province', 'ras-tanura', 'Ras Tanura', 'رأس تنورة', false, 90),
    ('sa'::country_code, 'eastern-province', 'hafr-al-batin', 'Hafr Al Batin', 'حفر الباطن', false, 100),
    ('sa'::country_code, 'eastern-province', 'khafji', 'Khafji', 'الخفجي', false, 110),
    ('sa'::country_code, 'eastern-province', 'abqaiq', 'Abqaiq', 'بقيق', false, 120),
    ('sa'::country_code, 'eastern-province', 'an-nairiyah', 'An Nairiyah', 'النعيرية', false, 130),

    -- Asir Province
    ('sa'::country_code, 'asir-province', 'abha', 'Abha', 'أبها', true, 10),
    ('sa'::country_code, 'asir-province', 'khamis-mushait', 'Khamis Mushait', 'خميس مشيط', false, 20),
    ('sa'::country_code, 'asir-province', 'bisha', 'Bisha', 'بيشة', false, 30),
    ('sa'::country_code, 'asir-province', 'muhayil', 'Muhayil', 'محايل', false, 40),
    ('sa'::country_code, 'asir-province', 'al-namas', 'Al Namas', 'النماص', false, 50),
    ('sa'::country_code, 'asir-province', 'tanomah', 'Tanomah', 'تنومة', false, 60),
    ('sa'::country_code, 'asir-province', 'sarat-abidah', 'Sarat Abidah', 'سراة عبيدة', false, 70),
    ('sa'::country_code, 'asir-province', 'dhahran-al-janub', 'Dhahran Al Janub', 'ظهران الجنوب', false, 80),
    ('sa'::country_code, 'asir-province', 'rijal-almaa', 'Rijal Almaa', 'رجال ألمع', false, 90),
    ('sa'::country_code, 'asir-province', 'ahad-rafidah', 'Ahad Rafidah', 'أحد رفيدة', false, 100),

    -- Tabuk Province
    ('sa'::country_code, 'tabuk-province', 'tabuk', 'Tabuk', 'تبوك', true, 10),
    ('sa'::country_code, 'tabuk-province', 'al-wajh', 'Al Wajh', 'الوجه', false, 20),
    ('sa'::country_code, 'tabuk-province', 'duba', 'Duba', 'ضباء', false, 30),
    ('sa'::country_code, 'tabuk-province', 'umluj', 'Umluj', 'أملج', false, 40),
    ('sa'::country_code, 'tabuk-province', 'tayma', 'Tayma', 'تيماء', false, 50),
    ('sa'::country_code, 'tabuk-province', 'haql', 'Haql', 'حقل', false, 60),

    -- Qassim Province
    ('sa'::country_code, 'qassim-province', 'buraydah', 'Buraydah', 'بريدة', true, 10),
    ('sa'::country_code, 'qassim-province', 'unaizah', 'Unaizah', 'عنيزة', false, 20),
    ('sa'::country_code, 'qassim-province', 'ar-rass', 'Ar Rass', 'الرس', false, 30),
    ('sa'::country_code, 'qassim-province', 'al-mithnab', 'Al Mithnab', 'المذنب', false, 40),
    ('sa'::country_code, 'qassim-province', 'al-bukayriyah', 'Al Bukayriyah', 'البكيرية', false, 50),
    ('sa'::country_code, 'qassim-province', 'al-badayea', 'Al Badayea', 'البدائع', false, 60),

    -- Hail Province
    ('sa'::country_code, 'hail-province', 'hail', 'Hail', 'حائل', true, 10),
    ('sa'::country_code, 'hail-province', 'baqaa', 'Baqaa', 'بقعاء', false, 20),
    ('sa'::country_code, 'hail-province', 'al-ghazalah', 'Al Ghazalah', 'الغزالة', false, 30),
    ('sa'::country_code, 'hail-province', 'ash-shinan', 'Ash Shinan', 'الشنان', false, 40),

    -- Northern Borders Province
    ('sa'::country_code, 'northern-borders-province', 'arar', 'Arar', 'عرعر', true, 10),
    ('sa'::country_code, 'northern-borders-province', 'rafha', 'Rafha', 'رفحاء', false, 20),
    ('sa'::country_code, 'northern-borders-province', 'turaif', 'Turaif', 'طريف', false, 30),
    ('sa'::country_code, 'northern-borders-province', 'al-uwayqilah', 'Al Uwayqilah', 'العويقيلة', false, 40),

    -- Jazan Province
    ('sa'::country_code, 'jazan-province', 'jazan', 'Jazan', 'جازان', true, 10),
    ('sa'::country_code, 'jazan-province', 'abu-arish', 'Abu Arish', 'أبو عريش', false, 20),
    ('sa'::country_code, 'jazan-province', 'sabya', 'Sabya', 'صبيا', false, 30),
    ('sa'::country_code, 'jazan-province', 'samtah', 'Samtah', 'صامطة', false, 40),
    ('sa'::country_code, 'jazan-province', 'baish', 'Baish', 'بيش', false, 50),
    ('sa'::country_code, 'jazan-province', 'farasan', 'Farasan', 'فرسان', false, 60),
    ('sa'::country_code, 'jazan-province', 'al-darb', 'Al Darb', 'الدرب', false, 70),
    ('sa'::country_code, 'jazan-province', 'al-aridhah', 'Al Aridhah', 'العارضة', false, 80),

    -- Najran Province
    ('sa'::country_code, 'najran-province', 'najran', 'Najran', 'نجران', true, 10),
    ('sa'::country_code, 'najran-province', 'sharurah', 'Sharurah', 'شرورة', false, 20),
    ('sa'::country_code, 'najran-province', 'habuna', 'Habuna', 'حبونا', false, 30),
    ('sa'::country_code, 'najran-province', 'badr-al-janub', 'Badr Al Janub', 'بدر الجنوب', false, 40),
    ('sa'::country_code, 'najran-province', 'yadamah', 'Yadamah', 'يدمة', false, 50),

    -- Al Bahah Province
    ('sa'::country_code, 'al-bahah-province', 'al-bahah', 'Al Bahah', 'الباحة', true, 10),
    ('sa'::country_code, 'al-bahah-province', 'baljurashi', 'Baljurashi', 'بلجرشي', false, 20),
    ('sa'::country_code, 'al-bahah-province', 'al-mandaq', 'Al Mandaq', 'المندق', false, 30),
    ('sa'::country_code, 'al-bahah-province', 'al-makhwah', 'Al Makhwah', 'المخواة', false, 40),
    ('sa'::country_code, 'al-bahah-province', 'qilwah', 'Qilwah', 'قلوة', false, 50),
    ('sa'::country_code, 'al-bahah-province', 'al-aqiq', 'Al Aqiq', 'العقيق', false, 60),

    -- Al Jouf Province
    ('sa'::country_code, 'al-jouf-province', 'sakaka', 'Sakaka', 'سكاكا', true, 10),
    ('sa'::country_code, 'al-jouf-province', 'qurayyat', 'Qurayyat', 'القريات', false, 20),
    ('sa'::country_code, 'al-jouf-province', 'dumat-al-jandal', 'Dumat Al Jandal', 'دومة الجندل', false, 30),
    ('sa'::country_code, 'al-jouf-province', 'tabarjal', 'Tabarjal', 'طبرجل', false, 40)
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
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-D2A'),
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
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-D2A')
from city_rows seed
where not exists (
  select 1
  from public.geo_cities existing
  where existing.country_id = seed.country_id
    and existing.slug = seed.slug
);
