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
    -- Muscat Governorate
    ('om'::country_code, 'muscat-governorate', 'muscat', 'Muscat', 'مسقط', true, 10),
    ('om'::country_code, 'muscat-governorate', 'muttrah', 'Muttrah', 'مطرح', false, 20),
    ('om'::country_code, 'muscat-governorate', 'bawshar', 'Bawshar', 'بوشر', false, 30),
    ('om'::country_code, 'muscat-governorate', 'al-seeb', 'Al Seeb', 'السيب', false, 40),
    ('om'::country_code, 'muscat-governorate', 'al-amerat', 'Al Amerat', 'العامرات', false, 50),
    ('om'::country_code, 'muscat-governorate', 'quriyat', 'Quriyat', 'قريات', false, 60),

    -- Dhofar Governorate
    ('om'::country_code, 'dhofar', 'salalah', 'Salalah', 'صلالة', true, 10),
    ('om'::country_code, 'dhofar', 'taqah', 'Taqah', 'طاقة', false, 20),
    ('om'::country_code, 'dhofar', 'mirbat', 'Mirbat', 'مرباط', false, 30),
    ('om'::country_code, 'dhofar', 'thumrait', 'Thumrait', 'ثمريت', false, 40),
    ('om'::country_code, 'dhofar', 'sadah', 'Sadah', 'سدح', false, 50),
    ('om'::country_code, 'dhofar', 'rakhyut', 'Rakhyut', 'رخيوت', false, 60),
    ('om'::country_code, 'dhofar', 'dhalkut', 'Dhalkut', 'ضلكوت', false, 70),
    ('om'::country_code, 'dhofar', 'muqshin', 'Muqshin', 'مقشن', false, 80),
    ('om'::country_code, 'dhofar', 'al-mazyunah', 'Al Mazyunah', 'المزيونة', false, 90),
    ('om'::country_code, 'dhofar', 'shalim-and-the-hallaniyat-islands', 'Shalim and the Hallaniyat Islands', 'شليم وجزر الحلانيات', false, 100),

    -- Musandam Governorate
    ('om'::country_code, 'musandam', 'khasab', 'Khasab', 'خصب', true, 10),
    ('om'::country_code, 'musandam', 'bukha', 'Bukha', 'بخاء', false, 20),
    ('om'::country_code, 'musandam', 'diba', 'Diba', 'دبا', false, 30),
    ('om'::country_code, 'musandam', 'madha', 'Madha', 'مدحاء', false, 40),

    -- Al Buraimi Governorate
    ('om'::country_code, 'al-buraimi', 'al-buraimi', 'Al Buraimi', 'البريمي', true, 10),
    ('om'::country_code, 'al-buraimi', 'mahdah', 'Mahdah', 'محضة', false, 20),
    ('om'::country_code, 'al-buraimi', 'as-sunaynah', 'As Sunaynah', 'السنينة', false, 30),

    -- Ad Dakhiliyah Governorate
    ('om'::country_code, 'ad-dakhiliyah', 'nizwa', 'Nizwa', 'نزوى', true, 10),
    ('om'::country_code, 'ad-dakhiliyah', 'bahla', 'Bahla', 'بهلاء', false, 20),
    ('om'::country_code, 'ad-dakhiliyah', 'samail', 'Samail', 'سمائل', false, 30),
    ('om'::country_code, 'ad-dakhiliyah', 'izki', 'Izki', 'إزكي', false, 40),
    ('om'::country_code, 'ad-dakhiliyah', 'bidbid', 'Bidbid', 'بدبد', false, 50),
    ('om'::country_code, 'ad-dakhiliyah', 'adam', 'Adam', 'أدم', false, 60),
    ('om'::country_code, 'ad-dakhiliyah', 'al-hamra', 'Al Hamra', 'الحمراء', false, 70),
    ('om'::country_code, 'ad-dakhiliyah', 'manah', 'Manah', 'منح', false, 80),
    ('om'::country_code, 'ad-dakhiliyah', 'jabal-akhdar', 'Jabal Akhdar', 'الجبل الأخضر', false, 90),

    -- Ad Dhahirah Governorate
    ('om'::country_code, 'al-dhahirah', 'ibri', 'Ibri', 'عبري', true, 10),
    ('om'::country_code, 'al-dhahirah', 'yanqul', 'Yanqul', 'ينقل', false, 20),
    ('om'::country_code, 'al-dhahirah', 'dhank', 'Dhank', 'ضنك', false, 30),

    -- Al Batinah North Governorate
    ('om'::country_code, 'al-batinah-north', 'sohar', 'Sohar', 'صحار', true, 10),
    ('om'::country_code, 'al-batinah-north', 'shinas', 'Shinas', 'شناص', false, 20),
    ('om'::country_code, 'al-batinah-north', 'liwa', 'Liwa', 'لوى', false, 30),
    ('om'::country_code, 'al-batinah-north', 'saham', 'Saham', 'صحم', false, 40),
    ('om'::country_code, 'al-batinah-north', 'al-khaburah', 'Al Khaburah', 'الخابورة', false, 50),
    ('om'::country_code, 'al-batinah-north', 'al-suwaiq', 'Al Suwaiq', 'السويق', false, 60),

    -- Al Batinah South Governorate
    ('om'::country_code, 'al-batinah-south', 'rustaq', 'Rustaq', 'الرستاق', true, 10),
    ('om'::country_code, 'al-batinah-south', 'al-awabi', 'Al Awabi', 'العوابي', false, 20),
    ('om'::country_code, 'al-batinah-south', 'nakhal', 'Nakhal', 'نخل', false, 30),
    ('om'::country_code, 'al-batinah-south', 'wadi-al-maawil', 'Wadi Al Maawil', 'وادي المعاول', false, 40),
    ('om'::country_code, 'al-batinah-south', 'barka', 'Barka', 'بركاء', false, 50),
    ('om'::country_code, 'al-batinah-south', 'al-musannah', 'Al Musannah', 'المصنعة', false, 60),

    -- Ash Sharqiyah North Governorate
    ('om'::country_code, 'ash-sharqiyah-north', 'ibra', 'Ibra', 'إبراء', true, 10),
    ('om'::country_code, 'ash-sharqiyah-north', 'al-mudhaibi', 'Al Mudhaibi', 'المضيبي', false, 20),
    ('om'::country_code, 'ash-sharqiyah-north', 'bidiyah', 'Bidiyah', 'بدية', false, 30),
    ('om'::country_code, 'ash-sharqiyah-north', 'al-qabil', 'Al Qabil', 'القابل', false, 40),
    ('om'::country_code, 'ash-sharqiyah-north', 'wadi-bani-khalid', 'Wadi Bani Khalid', 'وادي بني خالد', false, 50),
    ('om'::country_code, 'ash-sharqiyah-north', 'dima-wa-tayeen', 'Dima Wa Tayeen', 'دماء والطائيين', false, 60),
    ('om'::country_code, 'ash-sharqiyah-north', 'sinaw', 'Sinaw', 'سناو', false, 70),

    -- Ash Sharqiyah South Governorate
    ('om'::country_code, 'ash-sharqiyah-south', 'sur', 'Sur', 'صور', true, 10),
    ('om'::country_code, 'ash-sharqiyah-south', 'al-kamil-wal-wafi', 'Al Kamil Wal Wafi', 'الكامل والوافي', false, 20),
    ('om'::country_code, 'ash-sharqiyah-south', 'jalan-bani-bu-ali', 'Jalan Bani Bu Ali', 'جعلان بني بو علي', false, 30),
    ('om'::country_code, 'ash-sharqiyah-south', 'jalan-bani-bu-hassan', 'Jalan Bani Bu Hassan', 'جعلان بني بو حسن', false, 40),
    ('om'::country_code, 'ash-sharqiyah-south', 'masirah', 'Masirah', 'مصيرة', false, 50),

    -- Al Wusta Governorate
    ('om'::country_code, 'al-wusta', 'haima', 'Haima', 'هيماء', true, 10),
    ('om'::country_code, 'al-wusta', 'duqm', 'Duqm', 'الدقم', false, 20),
    ('om'::country_code, 'al-wusta', 'mahout', 'Mahout', 'محوت', false, 30),
    ('om'::country_code, 'al-wusta', 'al-jazer', 'Al Jazer', 'الجازر', false, 40)
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
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-D1A'),
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
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-D1A')
from city_rows seed
where not exists (
  select 1
  from public.geo_cities existing
  where existing.country_id = seed.country_id
    and existing.slug = seed.slug
);
