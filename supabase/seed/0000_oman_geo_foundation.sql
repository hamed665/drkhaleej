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
    ('ir'::country_code, 'zanjan-province', 'Zanjan Province', 'زنجان', 310),

    -- Iraq governorates
    ('iq'::country_code, 'baghdad-governorate', 'Baghdad Governorate', 'محافظة بغداد', 10),
    ('iq'::country_code, 'basra-governorate', 'Basra Governorate', 'محافظة البصرة', 20),
    ('iq'::country_code, 'nineveh-governorate', 'Nineveh Governorate', 'محافظة نينوى', 30),
    ('iq'::country_code, 'erbil-governorate', 'Erbil Governorate', 'محافظة أربيل', 40),
    ('iq'::country_code, 'sulaymaniyah-governorate', 'Sulaymaniyah Governorate', 'محافظة السليمانية', 50),
    ('iq'::country_code, 'duhok-governorate', 'Duhok Governorate', 'محافظة دهوك', 60),
    ('iq'::country_code, 'halabja-governorate', 'Halabja Governorate', 'محافظة حلبجة', 70),
    ('iq'::country_code, 'kirkuk-governorate', 'Kirkuk Governorate', 'محافظة كركوك', 80),
    ('iq'::country_code, 'saladin-governorate', 'Saladin Governorate', 'محافظة صلاح الدين', 90),
    ('iq'::country_code, 'diyala-governorate', 'Diyala Governorate', 'محافظة ديالى', 100),
    ('iq'::country_code, 'wasit-governorate', 'Wasit Governorate', 'محافظة واسط', 110),
    ('iq'::country_code, 'maysan-governorate', 'Maysan Governorate', 'محافظة ميسان', 120),
    ('iq'::country_code, 'dhi-qar-governorate', 'Dhi Qar Governorate', 'محافظة ذي قار', 130),
    ('iq'::country_code, 'muthanna-governorate', 'Muthanna Governorate', 'محافظة المثنى', 140),
    ('iq'::country_code, 'qadisiyyah-governorate', 'Al-Qadisiyyah Governorate', 'محافظة القادسية', 150),
    ('iq'::country_code, 'babil-governorate', 'Babil Governorate', 'محافظة بابل', 160),
    ('iq'::country_code, 'karbala-governorate', 'Karbala Governorate', 'محافظة كربلاء', 170),
    ('iq'::country_code, 'najaf-governorate', 'Najaf Governorate', 'محافظة النجف', 180),
    ('iq'::country_code, 'anbar-governorate', 'Al Anbar Governorate', 'محافظة الأنبار', 190),

    -- Syria governorates
    ('sy'::country_code, 'aleppo-governorate', 'Aleppo Governorate', 'محافظة حلب', 10),
    ('sy'::country_code, 'damascus-governorate', 'Damascus Governorate', 'محافظة دمشق', 20),
    ('sy'::country_code, 'rif-dimashq-governorate', 'Rif Dimashq Governorate', 'محافظة ريف دمشق', 30),
    ('sy'::country_code, 'homs-governorate', 'Homs Governorate', 'محافظة حمص', 40),
    ('sy'::country_code, 'hama-governorate', 'Hama Governorate', 'محافظة حماة', 50),
    ('sy'::country_code, 'latakia-governorate', 'Latakia Governorate', 'محافظة اللاذقية', 60),
    ('sy'::country_code, 'tartus-governorate', 'Tartus Governorate', 'محافظة طرطوس', 70),
    ('sy'::country_code, 'idlib-governorate', 'Idlib Governorate', 'محافظة إدلب', 80),
    ('sy'::country_code, 'deir-ez-zor-governorate', 'Deir ez-Zor Governorate', 'محافظة دير الزور', 90),
    ('sy'::country_code, 'raqqa-governorate', 'Raqqa Governorate', 'محافظة الرقة', 100),
    ('sy'::country_code, 'al-hasakah-governorate', 'Al-Hasakah Governorate', 'محافظة الحسكة', 110),
    ('sy'::country_code, 'daraa-governorate', 'Daraa Governorate', 'محافظة درعا', 120),
    ('sy'::country_code, 'as-suwayda-governorate', 'As-Suwayda Governorate', 'محافظة السويداء', 130),
    ('sy'::country_code, 'quneitra-governorate', 'Quneitra Governorate', 'محافظة القنيطرة', 140),

    -- Jordan governorates
    ('jo'::country_code, 'amman-governorate', 'Amman Governorate', 'محافظة العاصمة', 10),
    ('jo'::country_code, 'irbid-governorate', 'Irbid Governorate', 'محافظة إربد', 20),
    ('jo'::country_code, 'zarqa-governorate', 'Zarqa Governorate', 'محافظة الزرقاء', 30),
    ('jo'::country_code, 'balqa-governorate', 'Balqa Governorate', 'محافظة البلقاء', 40),
    ('jo'::country_code, 'mafraq-governorate', 'Mafraq Governorate', 'محافظة المفرق', 50),
    ('jo'::country_code, 'jerash-governorate', 'Jerash Governorate', 'محافظة جرش', 60),
    ('jo'::country_code, 'ajloun-governorate', 'Ajloun Governorate', 'محافظة عجلون', 70),
    ('jo'::country_code, 'madaba-governorate', 'Madaba Governorate', 'محافظة مادبا', 80),
    ('jo'::country_code, 'karak-governorate', 'Karak Governorate', 'محافظة الكرك', 90),
    ('jo'::country_code, 'tafilah-governorate', 'Tafilah Governorate', 'محافظة الطفيلة', 100),
    ('jo'::country_code, 'maan-governorate', 'Ma'an Governorate', 'محافظة معان', 110),
    ('jo'::country_code, 'aqaba-governorate', 'Aqaba Governorate', 'محافظة العقبة', 120),

    -- Lebanon governorates
    ('lb'::country_code, 'beirut-governorate', 'Beirut Governorate', 'محافظة بيروت', 10),
    ('lb'::country_code, 'mount-lebanon-governorate', 'Mount Lebanon Governorate', 'محافظة جبل لبنان', 20),
    ('lb'::country_code, 'north-governorate', 'North Governorate', 'محافظة الشمال', 30),
    ('lb'::country_code, 'akkar-governorate', 'Akkar Governorate', 'محافظة عكار', 40),
    ('lb'::country_code, 'baalbek-hermel-governorate', 'Baalbek-Hermel Governorate', 'محافظة بعلبك الهرمل', 50),
    ('lb'::country_code, 'beqaa-governorate', 'Beqaa Governorate', 'محافظة البقاع', 60),
    ('lb'::country_code, 'south-governorate', 'South Governorate', 'محافظة الجنوب', 70),
    ('lb'::country_code, 'nabatieh-governorate', 'Nabatieh Governorate', 'محافظة النبطية', 80),
    ('lb'::country_code, 'keserwan-jbeil-governorate', 'Keserwan-Jbeil Governorate', 'محافظة كسروان جبيل', 90),

    -- Palestine governorates
    ('ps'::country_code, 'bethlehem-governorate', 'Bethlehem Governorate', 'محافظة بيت لحم', 10),
    ('ps'::country_code, 'hebron-governorate', 'Hebron Governorate', 'محافظة الخليل', 20),
    ('ps'::country_code, 'jenin-governorate', 'Jenin Governorate', 'محافظة جنين', 30),
    ('ps'::country_code, 'jericho-governorate', 'Jericho Governorate', 'محافظة أريحا', 40),
    ('ps'::country_code, 'nablus-governorate', 'Nablus Governorate', 'محافظة نابلس', 50),
    ('ps'::country_code, 'qalqilya-governorate', 'Qalqilya Governorate', 'محافظة قلقيلية', 60),
    ('ps'::country_code, 'quds-governorate', 'Quds Governorate', 'محافظة القدس', 70),
    ('ps'::country_code, 'ramallah-and-al-bireh-governorate', 'Ramallah and Al-Bireh Governorate', 'محافظة رام الله والبيرة', 80),
    ('ps'::country_code, 'salfit-governorate', 'Salfit Governorate', 'محافظة سلفيت', 90),
    ('ps'::country_code, 'tubas-governorate', 'Tubas Governorate', 'محافظة طوباس', 100),
    ('ps'::country_code, 'tulkarm-governorate', 'Tulkarm Governorate', 'محافظة طولكرم', 110),
    ('ps'::country_code, 'deir-al-balah-governorate', 'Deir al-Balah Governorate', 'محافظة دير البلح', 120),
    ('ps'::country_code, 'gaza-governorate', 'Gaza Governorate', 'محافظة غزة', 130),
    ('ps'::country_code, 'khan-yunis-governorate', 'Khan Yunis Governorate', 'محافظة خان يونس', 140),
    ('ps'::country_code, 'north-gaza-governorate', 'North Gaza Governorate', 'محافظة شمال غزة', 150),
    ('ps'::country_code, 'rafah-governorate', 'Rafah Governorate', 'محافظة رفح', 160),

    -- Egypt governorates
    ('eg'::country_code, 'cairo-governorate', 'Cairo Governorate', 'محافظة القاهرة', 10),
    ('eg'::country_code, 'giza-governorate', 'Giza Governorate', 'محافظة الجيزة', 20),
    ('eg'::country_code, 'alexandria-governorate', 'Alexandria Governorate', 'محافظة الإسكندرية', 30),
    ('eg'::country_code, 'dakahlia-governorate', 'Dakahlia Governorate', 'محافظة الدقهلية', 40),
    ('eg'::country_code, 'red-sea-governorate', 'Red Sea Governorate', 'محافظة البحر الأحمر', 50),
    ('eg'::country_code, 'beheira-governorate', 'Beheira Governorate', 'محافظة البحيرة', 60),
    ('eg'::country_code, 'fayoum-governorate', 'Fayoum Governorate', 'محافظة الفيوم', 70),
    ('eg'::country_code, 'gharbia-governorate', 'Gharbia Governorate', 'محافظة الغربية', 80),
    ('eg'::country_code, 'ismailia-governorate', 'Ismailia Governorate', 'محافظة الإسماعيلية', 90),
    ('eg'::country_code, 'monufia-governorate', 'Monufia Governorate', 'محافظة المنوفية', 100),
    ('eg'::country_code, 'minya-governorate', 'Minya Governorate', 'محافظة المنيا', 110),
    ('eg'::country_code, 'qalyubia-governorate', 'Qalyubia Governorate', 'محافظة القليوبية', 120),
    ('eg'::country_code, 'new-valley-governorate', 'New Valley Governorate', 'محافظة الوادي الجديد', 130),
    ('eg'::country_code, 'suez-governorate', 'Suez Governorate', 'محافظة السويس', 140),
    ('eg'::country_code, 'aswan-governorate', 'Aswan Governorate', 'محافظة أسوان', 150),
    ('eg'::country_code, 'asyut-governorate', 'Asyut Governorate', 'محافظة أسيوط', 160),
    ('eg'::country_code, 'beni-suef-governorate', 'Beni Suef Governorate', 'محافظة بني سويف', 170),
    ('eg'::country_code, 'port-said-governorate', 'Port Said Governorate', 'محافظة بورسعيد', 180),
    ('eg'::country_code, 'damietta-governorate', 'Damietta Governorate', 'محافظة دمياط', 190),
    ('eg'::country_code, 'sharqia-governorate', 'Sharqia Governorate', 'محافظة الشرقية', 200),
    ('eg'::country_code, 'south-sinai-governorate', 'South Sinai Governorate', 'محافظة جنوب سيناء', 210),
    ('eg'::country_code, 'kafr-el-sheikh-governorate', 'Kafr El Sheikh Governorate', 'محافظة كفر الشيخ', 220),
    ('eg'::country_code, 'matrouh-governorate', 'Matrouh Governorate', 'محافظة مطروح', 230),
    ('eg'::country_code, 'luxor-governorate', 'Luxor Governorate', 'محافظة الأقصر', 240),
    ('eg'::country_code, 'qena-governorate', 'Qena Governorate', 'محافظة قنا', 250),
    ('eg'::country_code, 'north-sinai-governorate', 'North Sinai Governorate', 'محافظة شمال سيناء', 260),
    ('eg'::country_code, 'sohag-governorate', 'Sohag Governorate', 'محافظة سوهاج', 270),

    -- Yemen governorates
    ('ye'::country_code, 'abyan-governorate', 'Abyan Governorate', 'محافظة أبين', 10),
    ('ye'::country_code, 'aden-governorate', 'Aden Governorate', 'محافظة عدن', 20),
    ('ye'::country_code, 'al-bayda-governorate', 'Al Bayda Governorate', 'محافظة البيضاء', 30),
    ('ye'::country_code, 'al-hudaydah-governorate', 'Al Hudaydah Governorate', 'محافظة الحديدة', 40),
    ('ye'::country_code, 'al-jawf-governorate', 'Al Jawf Governorate', 'محافظة الجوف', 50),
    ('ye'::country_code, 'al-mahrah-governorate', 'Al Mahrah Governorate', 'محافظة المهرة', 60),
    ('ye'::country_code, 'al-mahwit-governorate', 'Al Mahwit Governorate', 'محافظة المحويت', 70),
    ('ye'::country_code, 'amanat-al-asimah', 'Amanat Al Asimah', 'أمانة العاصمة', 80),
    ('ye'::country_code, 'amran-governorate', 'Amran Governorate', 'محافظة عمران', 90),
    ('ye'::country_code, 'ad-dali-governorate', 'Ad Dali Governorate', 'محافظة الضالع', 100),
    ('ye'::country_code, 'dhamar-governorate', 'Dhamar Governorate', 'محافظة ذمار', 110),
    ('ye'::country_code, 'hadhramaut-governorate', 'Hadhramaut Governorate', 'محافظة حضرموت', 120),
    ('ye'::country_code, 'hajjah-governorate', 'Hajjah Governorate', 'محافظة حجة', 130),
    ('ye'::country_code, 'ibb-governorate', 'Ibb Governorate', 'محافظة إب', 140),
    ('ye'::country_code, 'lahij-governorate', 'Lahij Governorate', 'محافظة لحج', 150),
    ('ye'::country_code, 'marib-governorate', 'Marib Governorate', 'محافظة مأرب', 160),
    ('ye'::country_code, 'raymah-governorate', 'Raymah Governorate', 'محافظة ريمة', 170),
    ('ye'::country_code, 'saada-governorate', 'Saada Governorate', 'محافظة صعدة', 180),
    ('ye'::country_code, 'sanaa-governorate', 'Sanaa Governorate', 'محافظة صنعاء', 190),
    ('ye'::country_code, 'shabwah-governorate', 'Shabwah Governorate', 'محافظة شبوة', 200),
    ('ye'::country_code, 'socotra-archipelago-governorate', 'Socotra Archipelago Governorate', 'محافظة أرخبيل سقطرى', 210),
    ('ye'::country_code, 'taiz-governorate', 'Taiz Governorate', 'محافظة تعز', 220)
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
    metadata = jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-C2'),
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
  jsonb_build_object('seed_key', seed.slug, 'seed_phase', 'GEO-FULL-C2')
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
