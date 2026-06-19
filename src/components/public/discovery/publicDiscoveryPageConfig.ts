import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

export type PublicDiscoveryCategoryType = 'doctors' | 'dental' | 'labs' | 'centers' | 'pharmacies' | 'beauty' | 'pet-clinics' | 'pet-shops' | 'hospitals' | 'offers' | 'services';

export type PublicDiscoverySuggestion = {
  id: string;
  label: string;
  helper: string;
  keywords: readonly string[];
  chip?: string;
  city?: string;
  area?: string;
};

export type PublicDiscoveryVisualSlide = {
  src: string;
  alt: string;
  caption: string;
};

export type PublicDiscoveryPageConfig = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
  categoryType: PublicDiscoveryCategoryType;
  path: string;
  searchId: string;
  resultsId: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  providerCta: string;
  showWhatsApp?: boolean;
  whatsAppCta?: string;
  whatsAppMessage?: string;
  whatsAppUnavailable?: string;
  search: {
    badge: string;
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    button: string;
    legend: string;
    moreFilters: string;
    moreLegend: string;
    countryLabel: string;
    cityLabel: string;
    areaLabel: string;
    suggestionLabel: string;
    useSuggestion: string;
    contentType: string;
    trustAria: string;
    trust: readonly string[];
    mainChips: readonly string[];
    moreChips: readonly string[];
    countryOptions: readonly string[];
    cityOptions: readonly string[];
    areaOptions: readonly string[];
    defaultCountry: string;
    defaultCity: string;
    defaultArea: string;
    suggestions: readonly PublicDiscoverySuggestion[];
  };
  results: {
    title: string;
    emptyText: string;
  };
  visual: {
    label: string;
    previous: string;
    next: string;
    slideLabel: string;
    slides: readonly PublicDiscoveryVisualSlide[];
  };
};

const labsSlides = {
  en: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'Clinical laboratory discovery visual with healthcare equipment', caption: 'Lab discovery across tests, services and areas' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'Premium healthcare platform visual for lab search', caption: 'Search lab services and sample collection options in Oman' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'Mobile-ready lab discovery visual', caption: 'Public discovery only, not medical advice' }
  ],
  ar: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'صورة اكتشاف المختبرات مع معدات رعاية صحية', caption: 'اكتشاف المختبرات حسب الفحوصات والخدمات والمناطق' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'واجهة رعاية صحية مميزة لبحث المختبرات', caption: 'ابحث عن خدمات المختبر وخيارات سحب العينات في عُمان' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'صورة اكتشاف مختبرات مناسبة للجوال', caption: 'اكتشاف عام فقط وليس نصيحة طبية' }
  ]
} as const;

export function buildLabsDiscoveryConfig(locale: SupportedLocale, country: SupportedCountry, dir: 'ltr' | 'rtl'): PublicDiscoveryPageConfig {
  const isAr = locale === 'ar';

  return {
    locale,
    country,
    dir,
    categoryType: 'labs',
    path: '/labs',
    searchId: 'lab-search',
    resultsId: 'lab-results',
    badge: isAr ? 'المختبرات في عُمان' : 'Labs in Oman',
    title: isAr ? 'ابحث عن مختبرات في عُمان.' : 'Find labs in Oman.',
    subtitle: isAr
      ? 'تصفح المختبرات الطبية وخدمات الفحوصات وخيارات سحب العينات في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
      : 'Browse medical labs, test services and sample collection options across Oman. Public discovery only, not medical advice.',
    primaryCta: isAr ? 'ابحث عن المختبرات' : 'Search labs',
    providerCta: isAr ? 'أدرج مختبرك' : 'List your lab',
    whatsAppCta: isAr ? 'واتساب' : 'WhatsApp',
    whatsAppMessage: isAr ? 'مرحباً DrMuscat، أحتاج مساعدة في اكتشاف المختبرات في عُمان.' : 'Hello DrMuscat, I need help with lab discovery in Oman.',
    whatsAppUnavailable: isAr ? 'تفعيل واتساب قيد الإعداد' : 'WhatsApp activation pending',
    search: {
      badge: isAr ? 'بحث المختبرات' : 'Lab search',
      title: isAr ? 'ابحث عن الفحوصات أو خدمات المختبر أو المناطق' : 'Find lab tests, services or areas',
      description: isAr ? 'ابدأ باسم فحص أو خدمة مختبر أو مقدم خدمة أو منطقة في مسقط.' : 'Start with a test name, lab service, provider name or Muscat area.',
      inputLabel: isAr ? 'ما الفحص أو خدمة المختبر التي تحتاجها؟' : 'What test or lab service do you need?',
      placeholder: isAr ? 'ابحث عن فحص دم أو PCR أو فيتامينات أو مختبر أو منطقة…' : 'Search blood test, PCR, vitamin test, lab or area…',
      button: isAr ? 'بحث' : 'Search',
      legend: isAr ? 'خدمات المختبر' : 'Lab services',
      moreFilters: isAr ? 'المزيد من الفلاتر' : 'More filters',
      moreLegend: isAr ? 'خدمات مختبر إضافية' : 'More lab services',
      countryLabel: isAr ? 'الدولة' : 'Country',
      cityLabel: isAr ? 'المدينة' : 'City',
      areaLabel: isAr ? 'المنطقة' : 'Area',
      suggestionLabel: isAr ? 'اقتراحات بحث المختبرات' : 'Lab search suggestions',
      useSuggestion: isAr ? 'استخدم الاقتراح' : 'Use suggestion',
      contentType: isAr ? 'المختبرات' : 'Labs',
      trustAria: isAr ? 'إرشادات بحث المختبرات' : 'Lab search guidance',
      trust: isAr ? ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة طبية'] : ['Public discovery only', 'Confirm details with provider', 'Not medical advice'],
      mainChips: isAr ? ['فحص الدم', 'فحص PCR', 'فحص الفيتامينات', 'فحص الهرمونات', 'سحب عينة من المنزل'] : ['Blood test', 'PCR test', 'Vitamin test', 'Hormone test', 'Home sample collection'],
      moreChips: isAr ? ['فحص الحساسية', 'فحص السكري', 'فحص الغدة الدرقية', 'فحص الحمل', 'فحص شامل'] : ['Allergy test', 'Diabetes test', 'Thyroid test', 'Pregnancy test', 'Full body checkup'],
      countryOptions: isAr ? ['عُمان'] : ['Oman'],
      cityOptions: isAr ? ['مسقط', 'السيب', 'بوشر', 'مطرح'] : ['Muscat', 'Seeb', 'Bawshar', 'Muttrah'],
      areaOptions: isAr ? ['الخوير', 'القرم', 'العذيبة', 'الغبرة', 'روي'] : ['Al Khuwair', 'Qurum', 'Azaiba', 'Al Ghubra', 'Ruwi'],
      defaultCountry: isAr ? 'عُمان' : 'Oman',
      defaultCity: isAr ? 'مسقط' : 'Muscat',
      defaultArea: isAr ? 'الخوير' : 'Al Khuwair',
      suggestions: (isAr ? [
        { id: 'blood-test', label: 'فحص الدم', helper: 'خدمة مختبر', chip: 'فحص الدم', keywords: ['دم', 'فحص الدم', 'تحاليل دم'] },
        { id: 'pcr-test', label: 'فحص PCR', helper: 'خدمة مختبر', chip: 'فحص PCR', keywords: ['pcr', 'PCR', 'بي سي آر'] },
        { id: 'vitamin-test', label: 'فحص الفيتامينات', helper: 'خدمة مختبر', chip: 'فحص الفيتامينات', keywords: ['فيتامين', 'فيتامينات'] },
        { id: 'home-sample', label: 'سحب عينة من المنزل', helper: 'خيار خدمة مختبر', chip: 'سحب عينة من المنزل', keywords: ['منزل', 'عينة', 'سحب عينة'] },
        { id: 'lab-khuwair', label: 'مختبر في الخوير', helper: 'بحث حسب المنطقة', area: 'الخوير', keywords: ['الخوير', 'مختبر الخوير'] }
      ] : [
        { id: 'blood-test', label: 'Blood test', helper: 'Lab service', chip: 'Blood test', keywords: ['blood', 'blood test', 'cbc'] },
        { id: 'pcr-test', label: 'PCR test', helper: 'Lab service', chip: 'PCR test', keywords: ['pcr', 'covid pcr'] },
        { id: 'vitamin-test', label: 'Vitamin test', helper: 'Lab service', chip: 'Vitamin test', keywords: ['vitamin', 'vitamin d'] },
        { id: 'home-sample', label: 'Home sample collection', helper: 'Lab service option', chip: 'Home sample collection', keywords: ['home', 'sample collection', 'collection'] },
        { id: 'lab-khuwair', label: 'Lab in Al Khuwair', helper: 'Area search path', area: 'Al Khuwair', keywords: ['khuwair', 'al khuwair lab'] }
      ])
    },
    results: {
      title: isAr ? 'تصفح المختبرات' : 'Browse labs',
      emptyText: isAr ? 'تظهر هنا نتائج البحث وقوائم المختبرات العامة بعد الاعتماد.' : 'Search results and public lab listings appear here after approval.'
    },
    visual: {
      label: isAr ? 'معرض صور اكتشاف المختبرات' : 'Lab discovery image gallery',
      previous: isAr ? 'الصورة السابقة' : 'Previous image',
      next: isAr ? 'الصورة التالية' : 'Next image',
      slideLabel: isAr ? 'عرض الصورة' : 'Show image',
      slides: labsSlides[locale]
    }
  };
}




const dentalSlides = {
  en: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'Dental clinic discovery visual for Oman', caption: 'Dental discovery across clinics, orthodontics and oral care' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'Premium public discovery visual for dental services in Oman', caption: 'Browse dental clinics and oral care services in Oman' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'Mobile-ready dental discovery visual', caption: 'Public discovery only, not medical advice' }
  ],
  ar: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'صورة اكتشاف عيادات الأسنان في عُمان', caption: 'اكتشاف الأسنان حسب العيادات والتقويم والعناية بالفم' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'واجهة اكتشاف عامة لخدمات الأسنان في عُمان', caption: 'تصفح عيادات الأسنان وخدمات العناية بالفم في عُمان' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'صورة اكتشاف أسنان مناسبة للجوال', caption: 'اكتشاف عام فقط وليس نصيحة طبية' }
  ]
} as const;

export function buildDentalDiscoveryConfig(locale: SupportedLocale, country: SupportedCountry, dir: 'ltr' | 'rtl'): PublicDiscoveryPageConfig {
  const isAr = locale === 'ar';

  return {
    locale,
    country,
    dir,
    categoryType: 'dental',
    path: '/dental',
    searchId: 'dental-search',
    resultsId: 'dental-results',
    showWhatsApp: false,
    badge: isAr ? 'رعاية الأسنان في عُمان' : 'Dental care in Oman',
    title: isAr ? 'ابحث عن عيادات الأسنان في عُمان.' : 'Find dental clinics in Oman.',
    subtitle: isAr
      ? 'تصفح عيادات الأسنان وأطباء الأسنان والتقويم والزراعة والتبييض وخدمات العناية بالفم في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
      : 'Browse dental clinics, dentists, orthodontics, implants, whitening and oral care services across Oman. Public discovery only, not medical advice.',
    primaryCta: isAr ? 'بحث' : 'Search',
    providerCta: isAr ? 'أدرج عيادة الأسنان' : 'List your dental clinic',
    search: {
      badge: isAr ? 'بحث الأسنان' : 'Dental search',
      title: isAr ? 'ابحث عن خدمات الأسنان أو العيادات أو المناطق' : 'Find dental services, clinics or areas',
      description: isAr ? 'ابدأ بخدمة أسنان أو اسم عيادة أو نوع علاج أو منطقة في مسقط.' : 'Start with a dental service, clinic name, treatment type or Muscat area.',
      inputLabel: isAr ? 'ما خدمة الأسنان التي تحتاجها؟' : 'What dental service do you need?',
      placeholder: isAr ? 'ابحث عن عيادة أسنان أو تقويم أو زراعة أو تبييض أو منطقة…' : 'Search dental clinic, braces, implants, whitening or area…',
      button: isAr ? 'بحث' : 'Search',
      legend: isAr ? 'فئات الأسنان' : 'Dental categories',
      moreFilters: isAr ? 'المزيد من الفلاتر' : 'More filters',
      moreLegend: isAr ? 'فئات أسنان إضافية' : 'More dental categories',
      countryLabel: isAr ? 'الدولة' : 'Country',
      cityLabel: isAr ? 'المدينة' : 'City',
      areaLabel: isAr ? 'المنطقة' : 'Area',
      suggestionLabel: isAr ? 'اقتراحات بحث الأسنان' : 'Dental search suggestions',
      useSuggestion: isAr ? 'استخدم الاقتراح' : 'Use suggestion',
      contentType: isAr ? 'الأسنان' : 'Dental',
      trustAria: isAr ? 'إرشادات بحث الأسنان' : 'Dental search guidance',
      trust: isAr ? ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة طبية'] : ['Public discovery only', 'Confirm details with provider', 'Not medical advice'],
      mainChips: isAr ? ['عيادة أسنان', 'تقويم الأسنان', 'زراعة الأسنان', 'تبييض الأسنان', 'طوارئ الأسنان'] : ['Dental clinic', 'Braces', 'Implants', 'Whitening', 'Emergency dental'],
      moreChips: isAr ? ['علاج العصب', 'طبيب أسنان أطفال', 'تجميل الأسنان', 'تنظيف الأسنان', 'خلع الأسنان', 'رعاية اللثة'] : ['Root canal', 'Pediatric dentist', 'Cosmetic dentistry', 'Cleaning', 'Tooth extraction', 'Gum care'],
      countryOptions: isAr ? ['عُمان'] : ['Oman'],
      cityOptions: isAr ? ['مسقط', 'السيب', 'بوشر', 'مطرح'] : ['Muscat', 'Seeb', 'Bawshar', 'Muttrah'],
      areaOptions: isAr ? ['الخوير', 'القرم', 'العذيبة', 'الغبرة', 'روي'] : ['Al Khuwair', 'Qurum', 'Azaiba', 'Al Ghubra', 'Ruwi'],
      defaultCountry: isAr ? 'عُمان' : 'Oman',
      defaultCity: isAr ? 'مسقط' : 'Muscat',
      defaultArea: isAr ? 'الخوير' : 'Al Khuwair',
      suggestions: (isAr ? [
        { id: 'dental-clinic', label: 'عيادة أسنان', helper: 'فئة أسنان', chip: 'عيادة أسنان', keywords: ['عيادة أسنان', 'أسنان'] },
        { id: 'dentist-muscat', label: 'طبيب أسنان في مسقط', helper: 'بحث حسب المدينة', city: 'مسقط', keywords: ['مسقط', 'طبيب أسنان مسقط'] },
        { id: 'dentist-khuwair', label: 'طبيب أسنان في الخوير', helper: 'بحث حسب المنطقة', area: 'الخوير', keywords: ['الخوير', 'طبيب أسنان الخوير'] },
        { id: 'dentist-qurum', label: 'طبيب أسنان في القرم', helper: 'بحث حسب المنطقة', area: 'القرم', keywords: ['القرم', 'طبيب أسنان القرم'] },
        { id: 'braces', label: 'تقويم الأسنان', helper: 'فئة علاج أسنان', chip: 'تقويم الأسنان', keywords: ['تقويم', 'تقويم الأسنان'] },
        { id: 'dental-implants', label: 'زراعة الأسنان', helper: 'فئة علاج أسنان', chip: 'زراعة الأسنان', keywords: ['زراعة', 'زراعة الأسنان'] },
        { id: 'teeth-whitening', label: 'تبييض الأسنان', helper: 'فئة علاج أسنان', chip: 'تبييض الأسنان', keywords: ['تبييض', 'تبييض الأسنان'] },
        { id: 'root-canal', label: 'علاج العصب', helper: 'فئة علاج أسنان', chip: 'علاج العصب', keywords: ['عصب', 'علاج العصب'] },
        { id: 'pediatric-dentist', label: 'طبيب أسنان أطفال', helper: 'فئة أسنان', chip: 'طبيب أسنان أطفال', keywords: ['أطفال', 'طبيب أسنان أطفال'] },
        { id: 'cosmetic-dentistry', label: 'تجميل الأسنان', helper: 'فئة أسنان', chip: 'تجميل الأسنان', keywords: ['تجميل الأسنان', 'تجميل'] },
        { id: 'dental-cleaning', label: 'تنظيف الأسنان', helper: 'فئة علاج أسنان', chip: 'تنظيف الأسنان', keywords: ['تنظيف', 'تنظيف الأسنان'] },
        { id: 'tooth-extraction', label: 'خلع الأسنان', helper: 'فئة علاج أسنان', chip: 'خلع الأسنان', keywords: ['خلع', 'خلع الأسنان'] },
        { id: 'gum-care', label: 'رعاية اللثة', helper: 'فئة عناية بالفم', chip: 'رعاية اللثة', keywords: ['لثة', 'رعاية اللثة'] },
        { id: 'emergency-dental', label: 'طوارئ الأسنان', helper: 'فئة أسنان', chip: 'طوارئ الأسنان', keywords: ['طوارئ', 'طوارئ الأسنان'] }
      ] : [
        { id: 'dental-clinic', label: 'Dental clinic', helper: 'Dental category', chip: 'Dental clinic', keywords: ['dental clinic', 'dentist'] },
        { id: 'dentist-muscat', label: 'Dentist in Muscat', helper: 'City search path', city: 'Muscat', keywords: ['muscat', 'dentist muscat'] },
        { id: 'dentist-khuwair', label: 'Dentist in Al Khuwair', helper: 'Area search path', area: 'Al Khuwair', keywords: ['khuwair', 'al khuwair dentist'] },
        { id: 'dentist-qurum', label: 'Dentist in Qurum', helper: 'Area search path', area: 'Qurum', keywords: ['qurum', 'qurum dentist'] },
        { id: 'braces', label: 'Braces', helper: 'Dental treatment category', chip: 'Braces', keywords: ['braces', 'orthodontics'] },
        { id: 'dental-implants', label: 'Dental implants', helper: 'Dental treatment category', chip: 'Implants', keywords: ['implants', 'dental implants'] },
        { id: 'teeth-whitening', label: 'Teeth whitening', helper: 'Dental treatment category', chip: 'Whitening', keywords: ['whitening', 'teeth whitening'] },
        { id: 'root-canal', label: 'Root canal', helper: 'Dental treatment category', chip: 'Root canal', keywords: ['root canal'] },
        { id: 'pediatric-dentist', label: 'Pediatric dentist', helper: 'Dental category', chip: 'Pediatric dentist', keywords: ['pediatric dentist', 'children dentist'] },
        { id: 'cosmetic-dentistry', label: 'Cosmetic dentistry', helper: 'Dental category', chip: 'Cosmetic dentistry', keywords: ['cosmetic dentistry'] },
        { id: 'dental-cleaning', label: 'Dental cleaning', helper: 'Dental treatment category', chip: 'Cleaning', keywords: ['cleaning', 'dental cleaning'] },
        { id: 'tooth-extraction', label: 'Tooth extraction', helper: 'Dental treatment category', chip: 'Tooth extraction', keywords: ['tooth extraction', 'extraction'] },
        { id: 'gum-care', label: 'Gum care', helper: 'Oral care category', chip: 'Gum care', keywords: ['gum care', 'gums'] },
        { id: 'emergency-dental', label: 'Emergency dental', helper: 'Dental category', chip: 'Emergency dental', keywords: ['emergency dental', 'dental emergency'] }
      ])
    },
    results: {
      title: isAr ? 'تصفح عيادات الأسنان' : 'Browse dental clinics',
      emptyText: isAr ? 'تظهر هنا نتائج البحث وقوائم عيادات الأسنان العامة بعد الاعتماد.' : 'Search results and public dental clinic listings appear here after approval.'
    },
    visual: {
      label: isAr ? 'معرض صور اكتشاف الأسنان' : 'Dental discovery image gallery',
      previous: isAr ? 'الصورة السابقة' : 'Previous image',
      next: isAr ? 'الصورة التالية' : 'Next image',
      slideLabel: isAr ? 'عرض الصورة' : 'Show image',
      slides: dentalSlides[locale]
    }
  };
}

const beautySlides = {
  en: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'Beauty center and salon discovery visual for Oman', caption: 'Beauty discovery across salons, skincare, hair and wellness' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'Premium public discovery visual for beauty services in Oman', caption: 'Browse beauty centers, salons and non-emergency wellness services' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'Mobile-ready beauty discovery visual', caption: 'Public discovery only, not medical advice' }
  ],
  ar: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'صورة اكتشاف مراكز التجميل والصالونات في عُمان', caption: 'اكتشاف التجميل حسب الصالونات والعناية بالبشرة والشعر والعافية' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'واجهة اكتشاف عامة لخدمات التجميل في عُمان', caption: 'تصفح مراكز التجميل والصالونات وخدمات العافية غير الطارئة' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'صورة اكتشاف تجميل مناسبة للجوال', caption: 'اكتشاف عام فقط وليس نصيحة طبية' }
  ]
} as const;

export function buildBeautyDiscoveryConfig(locale: SupportedLocale, country: SupportedCountry, dir: 'ltr' | 'rtl'): PublicDiscoveryPageConfig {
  const isAr = locale === 'ar';

  return {
    locale,
    country,
    dir,
    categoryType: 'beauty',
    path: '/beauty',
    searchId: 'beauty-search',
    resultsId: 'beauty-results',
    showWhatsApp: false,
    badge: isAr ? 'التجميل في عُمان' : 'Beauty in Oman',
    title: isAr ? 'ابحث عن مراكز التجميل والصالونات في عُمان.' : 'Find beauty centers and salons in Oman.',
    subtitle: isAr
      ? 'تصفح مراكز التجميل والصالونات والعناية بالبشرة والشعر والأظافر وخدمات العافية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
      : 'Browse beauty centers, salons, skincare, hair, nails and wellness services across Oman. Public discovery only, not medical advice.',
    primaryCta: isAr ? 'بحث' : 'Search',
    providerCta: isAr ? 'أدرج مركز التجميل' : 'List your beauty center',
    search: {
      badge: isAr ? 'بحث التجميل' : 'Beauty search',
      title: isAr ? 'ابحث عن خدمات التجميل أو الصالونات أو المناطق' : 'Find beauty services, salons or areas',
      description: isAr ? 'ابدأ بخدمة تجميل أو نوع صالون أو فئة علاج أو منطقة في مسقط.' : 'Start with a beauty service, salon type, treatment category or Muscat area.',
      inputLabel: isAr ? 'ما خدمة التجميل التي تحتاجها؟' : 'What beauty service do you need?',
      placeholder: isAr ? 'ابحث عن عيادة تجميل أو مساج أو سبا أو صالون تجميل أو فيشل أو ليزر أو عناية بالبشرة…' : 'Search beauty clinic, massage, spa, beauty salon, facial, laser or skincare…',
      button: isAr ? 'بحث' : 'Search',
      legend: isAr ? 'فئات التجميل' : 'Beauty categories',
      moreFilters: isAr ? 'المزيد من الفلاتر' : 'More filters',
      moreLegend: isAr ? 'فئات تجميل إضافية' : 'More beauty categories',
      countryLabel: isAr ? 'الدولة' : 'Country',
      cityLabel: isAr ? 'المدينة' : 'City',
      areaLabel: isAr ? 'المنطقة' : 'Area',
      suggestionLabel: isAr ? 'اقتراحات بحث التجميل' : 'Beauty search suggestions',
      useSuggestion: isAr ? 'استخدم الاقتراح' : 'Use suggestion',
      contentType: isAr ? 'التجميل' : 'Beauty',
      trustAria: isAr ? 'إرشادات بحث التجميل' : 'Beauty search guidance',
      trust: isAr ? ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة طبية'] : ['Public discovery only', 'Confirm details with provider', 'Not medical advice'],
      mainChips: isAr ? ['عيادة تجميل', 'مساج', 'سبا', 'صالون تجميل', 'فيشل', 'ليزر'] : ['Beauty clinic', 'Massage', 'Spa', 'Beauty salon', 'Facial', 'Laser'],
      moreChips: isAr ? ['العناية بالبشرة', 'الأظافر', 'إزالة الشعر', 'زراعة الشعر', 'عيادة جلدية'] : ['Skincare', 'Nails', 'Hair removal', 'Hair transplant', 'Derma clinic'],
      countryOptions: isAr ? ['عُمان'] : ['Oman'],
      cityOptions: isAr ? ['مسقط', 'السيب', 'بوشر', 'مطرح'] : ['Muscat', 'Seeb', 'Bawshar', 'Muttrah'],
      areaOptions: isAr ? ['الخوير', 'القرم', 'العذيبة', 'الغبرة', 'روي'] : ['Al Khuwair', 'Qurum', 'Azaiba', 'Al Ghubra', 'Ruwi'],
      defaultCountry: isAr ? 'عُمان' : 'Oman',
      defaultCity: isAr ? 'مسقط' : 'Muscat',
      defaultArea: isAr ? 'الخوير' : 'Al Khuwair',
      suggestions: (isAr ? [
        { id: 'beauty-clinic', label: 'عيادة تجميل', helper: 'نوع مقدم خدمة', chip: 'عيادة تجميل', keywords: ['عيادة تجميل', 'تجميل'] },
        { id: 'beauty-massage', label: 'مساج', helper: 'فئة عافية', chip: 'مساج', keywords: ['مساج'] },
        { id: 'beauty-spa', label: 'سبا', helper: 'فئة عافية', chip: 'سبا', keywords: ['سبا'] },
        { id: 'beauty-salon', label: 'صالون تجميل', helper: 'نوع صالون', chip: 'صالون تجميل', keywords: ['صالون تجميل', 'صالون'] },
        { id: 'beauty-facial', label: 'فيشل', helper: 'فئة تجميل', chip: 'فيشل', keywords: ['فيشل'] },
        { id: 'beauty-laser', label: 'ليزر', helper: 'فئة علاج', chip: 'ليزر', keywords: ['ليزر'] },
        { id: 'beauty-skincare', label: 'العناية بالبشرة', helper: 'فئة تجميل', chip: 'العناية بالبشرة', keywords: ['بشرة', 'العناية بالبشرة'] },
        { id: 'beauty-nails', label: 'الأظافر', helper: 'فئة تجميل', chip: 'الأظافر', keywords: ['اظافر', 'أظافر', 'الأظافر'] },
        { id: 'beauty-hair-removal', label: 'إزالة الشعر', helper: 'فئة تجميل', chip: 'إزالة الشعر', keywords: ['إزالة الشعر', 'ازالة الشعر'] },
        { id: 'beauty-hair-transplant', label: 'زراعة الشعر', helper: 'فئة تجميل', chip: 'زراعة الشعر', keywords: ['زراعة الشعر', 'زراعه الشعر'] },
        { id: 'beauty-derma-clinic', label: 'عيادة جلدية', helper: 'فئة تجميل', chip: 'عيادة جلدية', keywords: ['عيادة جلدية', 'جلدية'] },
        { id: 'beauty-muscat', label: 'مركز تجميل في مسقط', helper: 'بحث حسب المدينة', city: 'مسقط', keywords: ['مسقط', 'مركز تجميل مسقط'] },
        { id: 'beauty-khuwair', label: 'مركز تجميل في الخوير', helper: 'بحث حسب المنطقة', area: 'الخوير', keywords: ['الخوير', 'مركز تجميل الخوير'] },
        { id: 'beauty-qurum', label: 'مركز تجميل في القرم', helper: 'بحث حسب المنطقة', area: 'القرم', keywords: ['القرم', 'مركز تجميل القرم'] }
      ] : [
        { id: 'beauty-clinic', label: 'Beauty clinic', helper: 'Provider type', chip: 'Beauty clinic', keywords: ['beauty clinic', 'aesthetic clinic'] },
        { id: 'beauty-massage', label: 'Massage', helper: 'Wellness category', chip: 'Massage', keywords: ['massage'] },
        { id: 'beauty-spa', label: 'Spa', helper: 'Wellness category', chip: 'Spa', keywords: ['spa'] },
        { id: 'beauty-salon', label: 'Beauty salon', helper: 'Salon type', chip: 'Beauty salon', keywords: ['beauty salon', 'salon'] },
        { id: 'beauty-facial', label: 'Facial', helper: 'Beauty category', chip: 'Facial', keywords: ['facial'] },
        { id: 'beauty-laser', label: 'Laser', helper: 'Treatment category', chip: 'Laser', keywords: ['laser'] },
        { id: 'beauty-skincare', label: 'Skincare', helper: 'Beauty category', chip: 'Skincare', keywords: ['skincare', 'skin care'] },
        { id: 'beauty-nails', label: 'Nails', helper: 'Beauty category', chip: 'Nails', keywords: ['nails', 'nail'] },
        { id: 'beauty-hair-removal', label: 'Hair removal', helper: 'Beauty category', chip: 'Hair removal', keywords: ['hair removal'] },
        { id: 'beauty-hair-transplant', label: 'Hair transplant', helper: 'Beauty category', chip: 'Hair transplant', keywords: ['hair transplant'] },
        { id: 'beauty-derma-clinic', label: 'Derma clinic', helper: 'Beauty category', chip: 'Derma clinic', keywords: ['derma clinic', 'dermatology clinic'] },
        { id: 'beauty-muscat', label: 'Beauty center in Muscat', helper: 'City search path', city: 'Muscat', keywords: ['muscat', 'beauty center muscat'] },
        { id: 'beauty-khuwair', label: 'Beauty center in Al Khuwair', helper: 'Area search path', area: 'Al Khuwair', keywords: ['khuwair', 'al khuwair beauty'] },
        { id: 'beauty-qurum', label: 'Beauty center in Qurum', helper: 'Area search path', area: 'Qurum', keywords: ['qurum', 'qurum beauty'] }
      ])
    },
    results: {
      title: isAr ? 'تصفح مراكز التجميل والصالونات' : 'Browse beauty centers and salons',
      emptyText: isAr ? 'تظهر هنا نتائج البحث وقوائم مراكز التجميل العامة بعد الاعتماد.' : 'Search results and public beauty center listings appear here after approval.'
    },
    visual: {
      label: isAr ? 'معرض صور اكتشاف التجميل' : 'Beauty discovery image gallery',
      previous: isAr ? 'الصورة السابقة' : 'Previous image',
      next: isAr ? 'الصورة التالية' : 'Next image',
      slideLabel: isAr ? 'عرض الصورة' : 'Show image',
      slides: beautySlides[locale]
    }
  };
}

const centersSlides = {
  en: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'Clinic and medical center discovery visual for Oman', caption: 'Clinic discovery across services and areas' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'Healthcare platform visual for clinic and center search in Oman', caption: 'Browse clinics, medical centers and care options in Oman' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'Mobile-ready clinic and medical center discovery visual', caption: 'Public discovery only, not medical advice' }
  ],
  ar: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'صورة اكتشاف العيادات والمراكز الطبية في عُمان', caption: 'اكتشاف العيادات حسب الخدمات والمناطق' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'واجهة رعاية صحية لبحث العيادات والمراكز في عُمان', caption: 'تصفح العيادات والمراكز الطبية وخيارات الرعاية في عُمان' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'صورة اكتشاف عيادات ومراكز مناسبة للجوال', caption: 'اكتشاف عام فقط وليس نصيحة طبية' }
  ]
} as const;

export function buildCentersDiscoveryConfig(locale: SupportedLocale, country: SupportedCountry, dir: 'ltr' | 'rtl'): PublicDiscoveryPageConfig {
  const isAr = locale === 'ar';

  return {
    locale,
    country,
    dir,
    categoryType: 'centers',
    path: '/centers',
    searchId: 'center-search',
    resultsId: 'center-results',
    showWhatsApp: false,
    badge: isAr ? 'العيادات والمراكز في عُمان' : 'Clinics and centers in Oman',
    title: isAr ? 'ابحث عن عيادات ومراكز طبية في عُمان.' : 'Find clinics and medical centers in Oman.',
    subtitle: isAr
      ? 'تصفح العيادات والمراكز الطبية والخدمات وخيارات الرعاية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
      : 'Browse clinics, medical centers, services and care options across Oman. Public discovery only, not medical advice.',
    primaryCta: isAr ? 'ابحث عن العيادات' : 'Search clinics',
    providerCta: isAr ? 'أدرج مركزك' : 'List your center',
    search: {
      badge: isAr ? 'بحث المراكز' : 'Center search',
      title: isAr ? 'ابحث عن العيادات أو الخدمات أو المناطق' : 'Find clinics, services or areas',
      description: isAr ? 'ابدأ بنوع عيادة أو خدمة أو اسم مركز أو منطقة في مسقط.' : 'Start with a clinic type, service, center name or Muscat area.',
      inputLabel: isAr ? 'ما العيادة أو الخدمة التي تحتاجها؟' : 'What clinic or service do you need?',
      placeholder: isAr ? 'ابحث عن عيادة أو مركز طبي أو خدمة أو منطقة…' : 'Search clinic, medical center, service or area…',
      button: isAr ? 'بحث' : 'Search',
      legend: isAr ? 'خدمات العيادات والمراكز' : 'Clinic and center services',
      moreFilters: isAr ? 'المزيد من الفلاتر' : 'More filters',
      moreLegend: isAr ? 'خدمات عيادات ومراكز إضافية' : 'More clinic and center services',
      countryLabel: isAr ? 'الدولة' : 'Country',
      cityLabel: isAr ? 'المدينة' : 'City',
      areaLabel: isAr ? 'المنطقة' : 'Area',
      suggestionLabel: isAr ? 'اقتراحات بحث العيادات والمراكز' : 'Clinic and center search suggestions',
      useSuggestion: isAr ? 'استخدم الاقتراح' : 'Use suggestion',
      contentType: isAr ? 'العيادات والمراكز' : 'Clinics and centers',
      trustAria: isAr ? 'إرشادات بحث العيادات والمراكز' : 'Clinic and center search guidance',
      trust: isAr ? ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة طبية'] : ['Public discovery only', 'Confirm details with provider', 'Not medical advice'],
      mainChips: isAr ? ['عيادة أسنان', 'عيادة جلدية', 'عيادة عائلية', 'عيادة عيون', 'صحة المرأة'] : ['Dental clinic', 'Skin clinic', 'Family clinic', 'Eye clinic', 'Women’s health'],
      moreChips: isAr ? ['عيادة أنف وأذن وحنجرة', 'عيادة أطفال', 'عيادة عظام', 'عيادة قلب', 'علاج طبيعي', 'مركز طبي'] : ['ENT clinic', 'Pediatric clinic', 'Orthopedic clinic', 'Cardiology clinic', 'Physiotherapy', 'Medical center'],
      countryOptions: isAr ? ['عُمان'] : ['Oman'],
      cityOptions: isAr ? ['مسقط'] : ['Muscat'],
      areaOptions: isAr ? ['الخوير'] : ['Al Khuwair'],
      defaultCountry: isAr ? 'عُمان' : 'Oman',
      defaultCity: isAr ? 'مسقط' : 'Muscat',
      defaultArea: isAr ? 'الخوير' : 'Al Khuwair',
      suggestions: (isAr ? [
        { id: 'dental-clinic', label: 'عيادة أسنان', helper: 'اقتراح بحث عيادات', chip: 'عيادة أسنان', keywords: ['أسنان', 'عيادة أسنان'] },
        { id: 'skin-clinic', label: 'عيادة جلدية', helper: 'اقتراح بحث عيادات', chip: 'عيادة جلدية', keywords: ['جلدية', 'جلد'] },
        { id: 'family-clinic', label: 'عيادة عائلية', helper: 'اقتراح بحث عيادات', chip: 'عيادة عائلية', keywords: ['عائلة', 'عائلي'] },
        { id: 'eye-clinic', label: 'عيادة عيون', helper: 'اقتراح بحث عيادات', chip: 'عيادة عيون', keywords: ['عيون', 'عين'] },
        { id: 'womens-health-clinic', label: 'عيادة صحة المرأة', helper: 'اقتراح بحث عيادات', chip: 'صحة المرأة', keywords: ['المرأة', 'نساء', 'صحة المرأة'] },
        { id: 'ent-clinic', label: 'عيادة أنف وأذن وحنجرة', helper: 'اقتراح بحث عيادات', chip: 'عيادة أنف وأذن وحنجرة', keywords: ['أنف', 'اذن', 'حنجرة'] },
        { id: 'pediatric-clinic', label: 'عيادة أطفال', helper: 'اقتراح بحث عيادات', chip: 'عيادة أطفال', keywords: ['أطفال', 'طفل'] },
        { id: 'orthopedic-clinic', label: 'عيادة عظام', helper: 'اقتراح بحث عيادات', chip: 'عيادة عظام', keywords: ['عظام'] },
        { id: 'medical-center-muscat', label: 'مركز طبي في مسقط', helper: 'بحث حسب المدينة', city: 'مسقط', chip: 'مركز طبي', keywords: ['مسقط', 'مركز طبي مسقط'] },
        { id: 'clinic-khuwair', label: 'عيادة في الخوير', helper: 'بحث حسب المنطقة', area: 'الخوير', keywords: ['الخوير', 'عيادة الخوير'] },
        { id: 'clinic-qurum', label: 'عيادة في القرم', helper: 'بحث حسب المنطقة', keywords: ['القرم', 'عيادة القرم'] },
        { id: 'physiotherapy-center', label: 'مركز علاج طبيعي', helper: 'اقتراح بحث عيادات', chip: 'علاج طبيعي', keywords: ['علاج طبيعي', 'طبيعي'] }
      ] : [
        { id: 'dental-clinic', label: 'Dental clinic', helper: 'Clinic search suggestion', chip: 'Dental clinic', keywords: ['dental', 'dentist'] },
        { id: 'skin-clinic', label: 'Skin clinic', helper: 'Clinic search suggestion', chip: 'Skin clinic', keywords: ['skin', 'dermatology'] },
        { id: 'family-clinic', label: 'Family clinic', helper: 'Clinic search suggestion', chip: 'Family clinic', keywords: ['family', 'general clinic'] },
        { id: 'eye-clinic', label: 'Eye clinic', helper: 'Clinic search suggestion', chip: 'Eye clinic', keywords: ['eye', 'ophthalmology'] },
        { id: 'womens-health-clinic', label: 'Women’s health clinic', helper: 'Clinic search suggestion', chip: 'Women’s health', keywords: ['women', 'women’s health', 'womens health'] },
        { id: 'ent-clinic', label: 'ENT clinic', helper: 'Clinic search suggestion', chip: 'ENT clinic', keywords: ['ent', 'ear nose throat'] },
        { id: 'pediatric-clinic', label: 'Pediatric clinic', helper: 'Clinic search suggestion', chip: 'Pediatric clinic', keywords: ['pediatric', 'children'] },
        { id: 'orthopedic-clinic', label: 'Orthopedic clinic', helper: 'Clinic search suggestion', chip: 'Orthopedic clinic', keywords: ['orthopedic', 'bones'] },
        { id: 'medical-center-muscat', label: 'Medical center in Muscat', helper: 'City search path', city: 'Muscat', chip: 'Medical center', keywords: ['muscat', 'medical center muscat'] },
        { id: 'clinic-khuwair', label: 'Clinic in Al Khuwair', helper: 'Area search path', area: 'Al Khuwair', keywords: ['khuwair', 'al khuwair clinic'] },
        { id: 'clinic-qurum', label: 'Clinic in Qurum', helper: 'Area search path', keywords: ['qurum', 'qurum clinic'] },
        { id: 'physiotherapy-center', label: 'Physiotherapy center', helper: 'Clinic search suggestion', chip: 'Physiotherapy', keywords: ['physiotherapy', 'physical therapy'] }
      ])
    },
    results: {
      title: isAr ? 'تصفح العيادات والمراكز' : 'Browse clinics and centers',
      emptyText: isAr ? 'تظهر هنا نتائج البحث وقوائم العيادات والمراكز الطبية العامة بعد الاعتماد.' : 'Search results and public clinic or medical center listings appear here after approval.'
    },
    visual: {
      label: isAr ? 'معرض صور اكتشاف العيادات والمراكز' : 'Clinic and center discovery image gallery',
      previous: isAr ? 'الصورة السابقة' : 'Previous image',
      next: isAr ? 'الصورة التالية' : 'Next image',
      slideLabel: isAr ? 'عرض الصورة' : 'Show image',
      slides: centersSlides[locale]
    }
  };
}


const petClinicsSlides = {
  en: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'Pet clinic discovery visual for veterinary care in Oman', caption: 'Pet clinic discovery across services and areas' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'Healthcare platform visual for pet clinic search in Oman', caption: 'Browse veterinary clinics and pet care services in Oman' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'Mobile-ready pet clinic discovery visual', caption: 'Public discovery only, not veterinary advice' }
  ],
  ar: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'صورة اكتشاف العيادات البيطرية في عُمان', caption: 'اكتشاف العيادات البيطرية حسب الخدمات والمناطق' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'واجهة رعاية لبحث العيادات البيطرية في عُمان', caption: 'تصفح العيادات البيطرية وخدمات رعاية الحيوانات في عُمان' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'صورة اكتشاف عيادات بيطرية مناسبة للجوال', caption: 'اكتشاف عام فقط وليس نصيحة بيطرية' }
  ]
} as const;

export function buildPetClinicsDiscoveryConfig(locale: SupportedLocale, country: SupportedCountry, dir: 'ltr' | 'rtl'): PublicDiscoveryPageConfig {
  const isAr = locale === 'ar';

  return {
    locale,
    country,
    dir,
    categoryType: 'pet-clinics',
    path: '/pet-clinics',
    searchId: 'pet-clinic-search',
    resultsId: 'pet-clinic-results',
    showWhatsApp: false,
    badge: isAr ? 'العيادات البيطرية في عُمان' : 'Pet clinics in Oman',
    title: isAr ? 'ابحث عن عيادات بيطرية في عُمان.' : 'Find pet clinics in Oman.',
    subtitle: isAr
      ? 'تصفح العيادات البيطرية وخدمات رعاية الحيوانات وخيارات صحة الحيوانات في عُمان. اكتشاف عام فقط وليس نصيحة بيطرية.'
      : 'Browse veterinary clinics, pet care services and animal health options across Oman. Public discovery only, not veterinary advice.',
    primaryCta: isAr ? 'ابحث عن العيادات البيطرية' : 'Search pet clinics',
    providerCta: isAr ? 'أدرج عيادتك البيطرية' : 'List your pet clinic',
    search: {
      badge: isAr ? 'بحث العيادات البيطرية' : 'Pet clinic search',
      title: isAr ? 'ابحث عن العيادات البيطرية أو الخدمات أو المناطق' : 'Find pet clinics, services or areas',
      description: isAr ? 'ابدأ بخدمة للحيوانات أو اسم عيادة أو احتياج رعاية أو منطقة في مسقط.' : 'Start with a pet service, clinic name, animal care need or Muscat area.',
      inputLabel: isAr ? 'ما خدمة رعاية الحيوانات التي تحتاجها؟' : 'What pet care service do you need?',
      placeholder: isAr ? 'ابحث عن عيادة بيطرية أو تطعيم أو عناية وتنظيف أو طوارئ أو منطقة…' : 'Search vet clinic, vaccination, grooming, emergency or area…',
      button: isAr ? 'بحث' : 'Search',
      legend: isAr ? 'خدمات العيادات البيطرية' : 'Pet clinic services',
      moreFilters: isAr ? 'المزيد من الفلاتر' : 'More filters',
      moreLegend: isAr ? 'خدمات بيطرية إضافية' : 'More pet clinic services',
      countryLabel: isAr ? 'الدولة' : 'Country',
      cityLabel: isAr ? 'المدينة' : 'City',
      areaLabel: isAr ? 'المنطقة' : 'Area',
      suggestionLabel: isAr ? 'اقتراحات بحث العيادات البيطرية' : 'Pet clinic search suggestions',
      useSuggestion: isAr ? 'استخدم الاقتراح' : 'Use suggestion',
      contentType: isAr ? 'العيادات البيطرية' : 'Pet clinics',
      trustAria: isAr ? 'إرشادات بحث العيادات البيطرية' : 'Pet clinic search guidance',
      trust: isAr ? ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة بيطرية'] : ['Public discovery only', 'Confirm details with provider', 'Not veterinary advice'],
      mainChips: isAr ? ['عيادة بيطرية', 'تطعيم', 'عناية وتنظيف', 'طوارئ بيطرية', 'أسنان الحيوانات'] : ['Veterinary clinic', 'Vaccination', 'Grooming', 'Emergency vet', 'Pet dental care'],
      moreChips: isAr ? ['جراحة', 'علاج الديدان', 'شريحة إلكترونية', 'وثائق سفر الحيوانات', 'رعاية القطط', 'رعاية الكلاب'] : ['Surgery', 'Deworming', 'Microchip', 'Pet travel documents', 'Cat care', 'Dog care'],
      countryOptions: isAr ? ['عُمان'] : ['Oman'],
      cityOptions: isAr ? ['مسقط'] : ['Muscat'],
      areaOptions: isAr ? ['الخوير'] : ['Al Khuwair'],
      defaultCountry: isAr ? 'عُمان' : 'Oman',
      defaultCity: isAr ? 'مسقط' : 'Muscat',
      defaultArea: isAr ? 'الخوير' : 'Al Khuwair',
      suggestions: (isAr ? [
        { id: 'veterinary-clinic', label: 'عيادة بيطرية', helper: 'اقتراح بحث عيادات بيطرية', chip: 'عيادة بيطرية', keywords: ['عيادة بيطرية', 'بيطري'] },
        { id: 'vaccination', label: 'تطعيم', helper: 'اقتراح خدمة بيطرية', chip: 'تطعيم', keywords: ['تطعيم', 'لقاح'] },
        { id: 'grooming', label: 'عناية وتنظيف', helper: 'اقتراح خدمة حيوانات', chip: 'عناية وتنظيف', keywords: ['عناية', 'تنظيف'] },
        { id: 'emergency-vet', label: 'طوارئ بيطرية', helper: 'اقتراح خدمة بيطرية', chip: 'طوارئ بيطرية', keywords: ['طوارئ', 'بيطري'] },
        { id: 'pet-dental-care', label: 'أسنان الحيوانات', helper: 'اقتراح خدمة بيطرية', chip: 'أسنان الحيوانات', keywords: ['أسنان', 'اسنان'] },
        { id: 'vet-muscat', label: 'طبيب بيطري في مسقط', helper: 'بحث حسب المدينة', city: 'مسقط', keywords: ['مسقط', 'طبيب بيطري مسقط'] },
        { id: 'vet-khuwair', label: 'طبيب بيطري في الخوير', helper: 'بحث حسب المنطقة', area: 'الخوير', keywords: ['الخوير', 'بيطري الخوير'] },
        { id: 'vet-qurum', label: 'طبيب بيطري في القرم', helper: 'بحث حسب المنطقة', keywords: ['القرم', 'بيطري القرم'] },
        { id: 'cat-vaccination', label: 'تطعيم القطط', helper: 'اقتراح خدمة بيطرية', chip: 'تطعيم', keywords: ['قطط', 'تطعيم القطط'] },
        { id: 'dog-vaccination', label: 'تطعيم الكلاب', helper: 'اقتراح خدمة بيطرية', chip: 'تطعيم', keywords: ['كلاب', 'تطعيم الكلاب'] },
        { id: 'pet-travel-documents', label: 'وثائق سفر الحيوانات', helper: 'اقتراح خدمة بيطرية', chip: 'وثائق سفر الحيوانات', keywords: ['سفر', 'وثائق'] },
        { id: 'pet-microchip', label: 'شريحة إلكترونية للحيوانات', helper: 'اقتراح خدمة بيطرية', chip: 'شريحة إلكترونية', keywords: ['شريحة', 'الكترونية'] },
        { id: 'cat-grooming', label: 'عناية القطط', helper: 'اقتراح خدمة حيوانات', chip: 'رعاية القطط', keywords: ['قطط', 'عناية القطط'] },
        { id: 'dog-grooming', label: 'عناية الكلاب', helper: 'اقتراح خدمة حيوانات', chip: 'رعاية الكلاب', keywords: ['كلاب', 'عناية الكلاب'] }
      ] : [
        { id: 'veterinary-clinic', label: 'Veterinary clinic', helper: 'Pet clinic search suggestion', chip: 'Veterinary clinic', keywords: ['veterinary', 'vet clinic'] },
        { id: 'vaccination', label: 'Vaccination', helper: 'Pet service suggestion', chip: 'Vaccination', keywords: ['vaccination', 'vaccine'] },
        { id: 'grooming', label: 'Grooming', helper: 'Pet service suggestion', chip: 'Grooming', keywords: ['grooming', 'pet grooming'] },
        { id: 'emergency-vet', label: 'Emergency vet', helper: 'Pet clinic search suggestion', chip: 'Emergency vet', keywords: ['emergency', 'emergency vet'] },
        { id: 'pet-dental-care', label: 'Pet dental care', helper: 'Pet service suggestion', chip: 'Pet dental care', keywords: ['dental', 'pet dental'] },
        { id: 'vet-muscat', label: 'Vet in Muscat', helper: 'City search path', city: 'Muscat', keywords: ['muscat', 'vet muscat'] },
        { id: 'vet-khuwair', label: 'Vet in Al Khuwair', helper: 'Area search path', area: 'Al Khuwair', keywords: ['khuwair', 'al khuwair vet'] },
        { id: 'vet-qurum', label: 'Vet in Qurum', helper: 'Area search path', keywords: ['qurum', 'qurum vet'] },
        { id: 'cat-vaccination', label: 'Cat vaccination', helper: 'Pet service suggestion', chip: 'Vaccination', keywords: ['cat', 'cat vaccination'] },
        { id: 'dog-vaccination', label: 'Dog vaccination', helper: 'Pet service suggestion', chip: 'Vaccination', keywords: ['dog', 'dog vaccination'] },
        { id: 'pet-travel-documents', label: 'Pet travel documents', helper: 'Pet service suggestion', chip: 'Pet travel documents', keywords: ['travel', 'documents'] },
        { id: 'pet-microchip', label: 'Microchip for pets', helper: 'Pet service suggestion', chip: 'Microchip', keywords: ['microchip', 'chip'] },
        { id: 'cat-grooming', label: 'Cat grooming', helper: 'Pet service suggestion', chip: 'Cat care', keywords: ['cat grooming', 'cat'] },
        { id: 'dog-grooming', label: 'Dog grooming', helper: 'Pet service suggestion', chip: 'Dog care', keywords: ['dog grooming', 'dog'] }
      ])
    },
    results: {
      title: isAr ? 'تصفح العيادات البيطرية' : 'Browse pet clinics',
      emptyText: isAr ? 'تظهر هنا نتائج البحث وقوائم العيادات البيطرية العامة بعد الاعتماد.' : 'Search results and public pet clinic listings appear here after approval.'
    },
    visual: {
      label: isAr ? 'معرض صور اكتشاف العيادات البيطرية' : 'Pet clinic discovery image gallery',
      previous: isAr ? 'الصورة السابقة' : 'Previous image',
      next: isAr ? 'الصورة التالية' : 'Next image',
      slideLabel: isAr ? 'عرض الصورة' : 'Show image',
      slides: petClinicsSlides[locale]
    }
  };
}



const petShopsSlides = {
  en: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'Pet shop discovery visual for pet supplies in Oman', caption: 'Pet shop discovery across products and areas' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'Public pet shop search visual for Oman', caption: 'Browse pet food, supplies and grooming products in Oman' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'Mobile-ready pet shop discovery visual', caption: 'Public discovery only, not veterinary advice' }
  ],
  ar: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'صورة اكتشاف متاجر الحيوانات في عُمان', caption: 'اكتشاف متاجر الحيوانات حسب المنتجات والمناطق' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'واجهة بحث عامة عن متاجر الحيوانات في عُمان', caption: 'تصفح طعام الحيوانات والمستلزمات ومنتجات العناية في عُمان' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'صورة اكتشاف متاجر حيوانات مناسبة للجوال', caption: 'اكتشاف عام فقط وليس نصيحة بيطرية' }
  ]
} as const;

export function buildPetShopsDiscoveryConfig(locale: SupportedLocale, country: SupportedCountry, dir: 'ltr' | 'rtl'): PublicDiscoveryPageConfig {
  const isAr = locale === 'ar';

  return {
    locale,
    country,
    dir,
    categoryType: 'pet-shops',
    path: '/pet-shops',
    searchId: 'pet-shop-search',
    resultsId: 'pet-shop-results',
    showWhatsApp: false,
    badge: isAr ? 'متاجر الحيوانات في عُمان' : 'Pet shops in Oman',
    title: isAr ? 'ابحث عن متاجر الحيوانات في عُمان.' : 'Find pet shops in Oman.',
    subtitle: isAr
      ? 'تصفح طعام الحيوانات والمستلزمات ومنتجات العناية والاحتياجات الأساسية في عُمان. اكتشاف عام فقط وليس نصيحة بيطرية.'
      : 'Browse pet food, supplies, grooming products and care essentials across Oman. Public discovery only, not veterinary advice.',
    primaryCta: isAr ? 'ابحث عن متاجر الحيوانات' : 'Search pet shops',
    providerCta: isAr ? 'أدرج متجر الحيوانات' : 'List your pet shop',
    search: {
      badge: isAr ? 'بحث متاجر الحيوانات' : 'Pet shop search',
      title: isAr ? 'ابحث عن متاجر الحيوانات أو المنتجات أو المناطق' : 'Find pet shops, products or areas',
      description: isAr ? 'ابدأ بطعام الحيوانات أو المستلزمات أو منتجات العناية أو اسم متجر أو منطقة في مسقط.' : 'Start with pet food, supplies, grooming products, shop name or Muscat area.',
      inputLabel: isAr ? 'ما المنتج أو متجر الحيوانات الذي تحتاجه؟' : 'What pet product or shop do you need?',
      placeholder: isAr ? 'ابحث عن طعام الحيوانات أو الألعاب أو العناية أو مستلزمات القطط أو منطقة…' : 'Search pet food, toys, grooming, cat supplies or area…',
      button: isAr ? 'بحث' : 'Search',
      legend: isAr ? 'فئات متاجر الحيوانات' : 'Pet shop categories',
      moreFilters: isAr ? 'المزيد من الفلاتر' : 'More filters',
      moreLegend: isAr ? 'فئات إضافية لمتاجر الحيوانات' : 'More pet shop categories',
      countryLabel: isAr ? 'الدولة' : 'Country',
      cityLabel: isAr ? 'المدينة' : 'City',
      areaLabel: isAr ? 'المنطقة' : 'Area',
      suggestionLabel: isAr ? 'اقتراحات بحث متاجر الحيوانات' : 'Pet shop search suggestions',
      useSuggestion: isAr ? 'استخدم الاقتراح' : 'Use suggestion',
      contentType: isAr ? 'متاجر الحيوانات' : 'Pet shops',
      trustAria: isAr ? 'إرشادات بحث متاجر الحيوانات' : 'Pet shop search guidance',
      trust: isAr ? ['اكتشاف عام فقط', 'أكد التفاصيل مع المتجر', 'ليست نصيحة بيطرية'] : ['Public discovery only', 'Confirm details with shop', 'Not veterinary advice'],
      mainChips: isAr ? ['طعام الحيوانات', 'مستلزمات القطط', 'مستلزمات الكلاب', 'منتجات العناية', 'ألعاب'] : ['Pet food', 'Cat supplies', 'Dog supplies', 'Grooming products', 'Toys'],
      moreChips: isAr ? ['رمل القطط', 'إكسسوارات الحيوانات', 'أقفاص وحقائب نقل', 'مستلزمات الأحواض', 'مستلزمات الطيور', 'توصيل'] : ['Litter', 'Pet accessories', 'Cages and carriers', 'Aquarium supplies', 'Bird supplies', 'Delivery'],
      countryOptions: isAr ? ['عُمان'] : ['Oman'],
      cityOptions: isAr ? ['مسقط'] : ['Muscat'],
      areaOptions: isAr ? ['الخوير'] : ['Al Khuwair'],
      defaultCountry: isAr ? 'عُمان' : 'Oman',
      defaultCity: isAr ? 'مسقط' : 'Muscat',
      defaultArea: isAr ? 'الخوير' : 'Al Khuwair',
      suggestions: (isAr ? [
        { id: 'pet-food', label: 'طعام الحيوانات', helper: 'اقتراح بحث متاجر الحيوانات', chip: 'طعام الحيوانات', keywords: ['طعام الحيوانات', 'طعام'] },
        { id: 'cat-food', label: 'طعام القطط', helper: 'اقتراح منتج', chip: 'طعام الحيوانات', keywords: ['طعام القطط', 'قطط'] },
        { id: 'dog-food', label: 'طعام الكلاب', helper: 'اقتراح منتج', chip: 'طعام الحيوانات', keywords: ['طعام الكلاب', 'كلاب'] },
        { id: 'cat-supplies', label: 'مستلزمات القطط', helper: 'اقتراح فئة', chip: 'مستلزمات القطط', keywords: ['مستلزمات القطط', 'قطط'] },
        { id: 'dog-supplies', label: 'مستلزمات الكلاب', helper: 'اقتراح فئة', chip: 'مستلزمات الكلاب', keywords: ['مستلزمات الكلاب', 'كلاب'] },
        { id: 'pet-shop-muscat', label: 'متجر حيوانات في مسقط', helper: 'بحث حسب المدينة', city: 'مسقط', keywords: ['مسقط', 'متجر حيوانات مسقط'] },
        { id: 'pet-shop-khuwair', label: 'متجر حيوانات في الخوير', helper: 'بحث حسب المنطقة', area: 'الخوير', keywords: ['الخوير', 'متجر حيوانات الخوير'] },
        { id: 'pet-shop-qurum', label: 'متجر حيوانات في القرم', helper: 'بحث حسب المنطقة', keywords: ['القرم', 'متجر حيوانات القرم'] },
        { id: 'grooming-products', label: 'منتجات العناية', helper: 'اقتراح فئة', chip: 'منتجات العناية', keywords: ['عناية', 'منتجات العناية'] },
        { id: 'pet-toys', label: 'ألعاب الحيوانات', helper: 'اقتراح فئة', chip: 'ألعاب', keywords: ['ألعاب', 'العاب'] },
        { id: 'litter', label: 'رمل القطط', helper: 'اقتراح فئة', chip: 'رمل القطط', keywords: ['رمل القطط', 'رمل'] },
        { id: 'aquarium-supplies', label: 'مستلزمات الأحواض', helper: 'اقتراح فئة', chip: 'مستلزمات الأحواض', keywords: ['أحواض', 'احواض'] },
        { id: 'bird-supplies', label: 'مستلزمات الطيور', helper: 'اقتراح فئة', chip: 'مستلزمات الطيور', keywords: ['طيور'] },
        { id: 'pet-accessories', label: 'إكسسوارات الحيوانات', helper: 'اقتراح فئة', chip: 'إكسسوارات الحيوانات', keywords: ['إكسسوارات', 'اكسسوارات'] },
        { id: 'delivery', label: 'توصيل', helper: 'اقتراح خدمة', chip: 'توصيل', keywords: ['توصيل'] }
      ] : [
        { id: 'pet-food', label: 'Pet food', helper: 'Pet shop search suggestion', chip: 'Pet food', keywords: ['pet food', 'food'] },
        { id: 'cat-food', label: 'Cat food', helper: 'Product suggestion', chip: 'Pet food', keywords: ['cat food', 'cat'] },
        { id: 'dog-food', label: 'Dog food', helper: 'Product suggestion', chip: 'Pet food', keywords: ['dog food', 'dog'] },
        { id: 'cat-supplies', label: 'Cat supplies', helper: 'Category suggestion', chip: 'Cat supplies', keywords: ['cat supplies', 'cat'] },
        { id: 'dog-supplies', label: 'Dog supplies', helper: 'Category suggestion', chip: 'Dog supplies', keywords: ['dog supplies', 'dog'] },
        { id: 'pet-shop-muscat', label: 'Pet shop in Muscat', helper: 'City search path', city: 'Muscat', keywords: ['muscat', 'pet shop muscat'] },
        { id: 'pet-shop-khuwair', label: 'Pet shop in Al Khuwair', helper: 'Area search path', area: 'Al Khuwair', keywords: ['khuwair', 'al khuwair pet shop'] },
        { id: 'pet-shop-qurum', label: 'Pet shop in Qurum', helper: 'Area search path', keywords: ['qurum', 'qurum pet shop'] },
        { id: 'grooming-products', label: 'Grooming products', helper: 'Category suggestion', chip: 'Grooming products', keywords: ['grooming', 'grooming products'] },
        { id: 'pet-toys', label: 'Pet toys', helper: 'Category suggestion', chip: 'Toys', keywords: ['toys', 'pet toys'] },
        { id: 'litter', label: 'Litter', helper: 'Category suggestion', chip: 'Litter', keywords: ['litter', 'cat litter'] },
        { id: 'aquarium-supplies', label: 'Aquarium supplies', helper: 'Category suggestion', chip: 'Aquarium supplies', keywords: ['aquarium'] },
        { id: 'bird-supplies', label: 'Bird supplies', helper: 'Category suggestion', chip: 'Bird supplies', keywords: ['bird supplies', 'bird'] },
        { id: 'pet-accessories', label: 'Pet accessories', helper: 'Category suggestion', chip: 'Pet accessories', keywords: ['accessories'] },
        { id: 'delivery', label: 'Delivery', helper: 'Service suggestion', chip: 'Delivery', keywords: ['delivery'] }
      ])
    },
    results: {
      title: isAr ? 'تصفح متاجر الحيوانات' : 'Browse pet shops',
      emptyText: isAr ? 'تظهر هنا نتائج البحث وقوائم متاجر الحيوانات العامة بعد الاعتماد.' : 'Search results and public pet shop listings appear here after approval.'
    },
    visual: {
      label: isAr ? 'معرض صور اكتشاف متاجر الحيوانات' : 'Pet shop discovery image gallery',
      previous: isAr ? 'الصورة السابقة' : 'Previous image',
      next: isAr ? 'الصورة التالية' : 'Next image',
      slideLabel: isAr ? 'عرض الصورة' : 'Show image',
      slides: petShopsSlides[locale]
    }
  };
}



const hospitalSlides = {
  en: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'Hospital discovery visual for Oman', caption: 'Hospital discovery across departments and areas' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'Premium healthcare discovery visual for hospitals in Oman', caption: 'Browse hospitals, patient services and care options in Oman' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'Mobile-ready hospital discovery visual', caption: 'Public discovery only, not medical advice' }
  ],
  ar: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'صورة اكتشاف المستشفيات في عُمان', caption: 'اكتشاف المستشفيات حسب الأقسام والمناطق' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'واجهة اكتشاف رعاية صحية للمستشفيات في عُمان', caption: 'تصفح المستشفيات وخدمات المرضى وخيارات الرعاية في عُمان' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'صورة اكتشاف مستشفيات مناسبة للجوال', caption: 'اكتشاف عام فقط وليس نصيحة طبية' }
  ]
} as const;

export function buildHospitalsDiscoveryConfig(locale: SupportedLocale, country: SupportedCountry, dir: 'ltr' | 'rtl'): PublicDiscoveryPageConfig {
  const isAr = locale === 'ar';

  return {
    locale,
    country,
    dir,
    categoryType: 'hospitals',
    path: '/hospitals',
    searchId: 'hospital-search',
    resultsId: 'hospital-results',
    showWhatsApp: false,
    badge: isAr ? 'المستشفيات في عُمان' : 'Hospitals in Oman',
    title: isAr ? 'ابحث عن مستشفيات في عُمان.' : 'Find hospitals in Oman.',
    subtitle: isAr
      ? 'تصفح المستشفيات والأقسام وخدمات المرضى وخيارات الرعاية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
      : 'Browse hospitals, departments, patient services and care options across Oman. Public discovery only, not medical advice.',
    primaryCta: isAr ? 'بحث' : 'Search',
    providerCta: isAr ? 'إدارة ملف المستشفى' : 'Claim hospital profile',
    search: {
      badge: isAr ? 'بحث المستشفيات' : 'Hospital search',
      title: isAr ? 'ابحث عن المستشفيات أو الأقسام أو المناطق' : 'Find hospitals, departments or areas',
      description: isAr ? 'ابدأ باسم مستشفى أو قسم أو خدمة للمرضى أو منطقة في مسقط.' : 'Start with a hospital name, department, patient service or Muscat area.',
      inputLabel: isAr ? 'ما خدمة المستشفى التي تحتاجها؟' : 'What hospital service do you need?',
      placeholder: isAr ? 'ابحث عن مستشفى أو طوارئ أو ولادة أو منطقة…' : 'Search hospital, emergency, maternity or area…',
      button: isAr ? 'بحث' : 'Search',
      legend: isAr ? 'خدمات المستشفيات' : 'Hospital services',
      moreFilters: isAr ? 'المزيد من الفلاتر' : 'More filters',
      moreLegend: isAr ? 'خدمات مستشفيات إضافية' : 'More hospital services',
      countryLabel: isAr ? 'الدولة' : 'Country',
      cityLabel: isAr ? 'المدينة' : 'City',
      areaLabel: isAr ? 'المنطقة' : 'Area',
      suggestionLabel: isAr ? 'اقتراحات بحث المستشفيات' : 'Hospital search suggestions',
      useSuggestion: isAr ? 'استخدم الاقتراح' : 'Use suggestion',
      contentType: isAr ? 'المستشفيات' : 'Hospitals',
      trustAria: isAr ? 'إرشادات بحث المستشفيات' : 'Hospital search guidance',
      trust: isAr ? ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة طبية', 'للحالات العاجلة، تواصل مع خدمات الطوارئ المحلية أو المستشفى مباشرة.'] : ['Public discovery only', 'Confirm details with provider', 'Not medical advice', 'For urgent care, contact local emergency services or the hospital directly.'],
      mainChips: isAr ? ['الطوارئ', 'الولادة', 'الأطفال', 'الجراحة', 'القلب', 'خاص'] : ['Emergency', 'Maternity', 'Pediatrics', 'Surgery', 'Cardiology', 'Private'],
      moreChips: isAr ? ['العناية المركزة', 'الأشعة', 'المختبر', 'الصيدلية', 'التأمين', 'رعاية دولية'] : ['ICU', 'Radiology', 'Laboratory', 'Pharmacy', 'Insurance', 'International care'],
      countryOptions: isAr ? ['عُمان'] : ['Oman'],
      cityOptions: isAr ? ['مسقط'] : ['Muscat'],
      areaOptions: isAr ? ['الخوير', 'القرم'] : ['Al Khuwair', 'Qurum'],
      defaultCountry: isAr ? 'عُمان' : 'Oman',
      defaultCity: isAr ? 'مسقط' : 'Muscat',
      defaultArea: isAr ? 'الخوير' : 'Al Khuwair',
      suggestions: (isAr ? [
        { id: 'hospital-muscat', label: 'مستشفى في مسقط', helper: 'بحث حسب المدينة', city: 'مسقط', keywords: ['مسقط', 'مستشفى مسقط'] },
        { id: 'hospital-khuwair', label: 'مستشفى في الخوير', helper: 'بحث حسب المنطقة', area: 'الخوير', keywords: ['الخوير', 'مستشفى الخوير'] },
        { id: 'hospital-qurum', label: 'مستشفى في القرم', helper: 'بحث حسب المنطقة', area: 'القرم', keywords: ['القرم', 'مستشفى القرم'] },
        { id: 'emergency', label: 'الطوارئ', helper: 'فلتر اكتشاف', chip: 'الطوارئ', keywords: ['طوارئ'] },
        { id: 'maternity', label: 'الولادة', helper: 'فلتر اكتشاف', chip: 'الولادة', keywords: ['ولادة', 'مستشفى ولادة'] },
        { id: 'pediatrics', label: 'الأطفال', helper: 'فلتر اكتشاف', chip: 'الأطفال', keywords: ['أطفال', 'مستشفى أطفال'] },
        { id: 'surgery', label: 'الجراحة', helper: 'فلتر اكتشاف', chip: 'الجراحة', keywords: ['جراحة', 'قسم الجراحة'] },
        { id: 'cardiology', label: 'القلب', helper: 'فلتر اكتشاف', chip: 'القلب', keywords: ['قلب', 'قسم القلب'] },
        { id: 'private-hospital', label: 'مستشفى خاص', helper: 'فلتر اكتشاف', chip: 'خاص', keywords: ['خاص', 'مستشفى خاص'] },
        { id: 'icu', label: 'العناية المركزة', helper: 'فلتر اكتشاف', chip: 'العناية المركزة', keywords: ['العناية المركزة'] },
        { id: 'radiology', label: 'الأشعة', helper: 'فلتر اكتشاف', chip: 'الأشعة', keywords: ['الأشعة'] },
        { id: 'laboratory', label: 'المختبر', helper: 'فلتر اكتشاف', chip: 'المختبر', keywords: ['المختبر'] },
        { id: 'hospital-pharmacy', label: 'صيدلية المستشفى', helper: 'فلتر اكتشاف', chip: 'الصيدلية', keywords: ['صيدلية المستشفى'] },
        { id: 'insurance', label: 'التأمين', helper: 'فلتر اكتشاف', chip: 'التأمين', keywords: ['تأمين', 'التأمين'] },
        { id: 'international-care', label: 'رعاية دولية', helper: 'فلتر اكتشاف', chip: 'رعاية دولية', keywords: ['رعاية دولية', 'المرضى الدوليون'] }
      ] : [
        { id: 'hospital-muscat', label: 'Hospital in Muscat', helper: 'City search path', city: 'Muscat', keywords: ['muscat', 'hospital muscat'] },
        { id: 'hospital-khuwair', label: 'Hospital in Al Khuwair', helper: 'Area search path', area: 'Al Khuwair', keywords: ['khuwair', 'al khuwair hospital'] },
        { id: 'hospital-qurum', label: 'Hospital in Qurum', helper: 'Area search path', area: 'Qurum', keywords: ['qurum', 'qurum hospital'] },
        { id: 'emergency', label: 'Emergency', helper: 'Discovery filter', chip: 'Emergency', keywords: ['emergency'] },
        { id: 'maternity', label: 'Maternity', helper: 'Discovery filter', chip: 'Maternity', keywords: ['maternity', 'maternity hospital'] },
        { id: 'pediatrics', label: 'Pediatrics', helper: 'Discovery filter', chip: 'Pediatrics', keywords: ['pediatric', 'children hospital'] },
        { id: 'surgery', label: 'Surgery', helper: 'Discovery filter', chip: 'Surgery', keywords: ['surgery', 'surgery department'] },
        { id: 'cardiology', label: 'Cardiology', helper: 'Discovery filter', chip: 'Cardiology', keywords: ['cardiology', 'heart'] },
        { id: 'private-hospital', label: 'Private hospital', helper: 'Discovery filter', chip: 'Private', keywords: ['private', 'private hospital'] },
        { id: 'icu', label: 'ICU', helper: 'Discovery filter', chip: 'ICU', keywords: ['icu', 'intensive care'] },
        { id: 'radiology', label: 'Radiology', helper: 'Discovery filter', chip: 'Radiology', keywords: ['radiology', 'xray'] },
        { id: 'laboratory', label: 'Laboratory', helper: 'Discovery filter', chip: 'Laboratory', keywords: ['laboratory', 'lab'] },
        { id: 'hospital-pharmacy', label: 'Hospital pharmacy', helper: 'Discovery filter', chip: 'Pharmacy', keywords: ['hospital pharmacy'] },
        { id: 'insurance', label: 'Insurance', helper: 'Discovery filter', chip: 'Insurance', keywords: ['insurance'] },
        { id: 'international-care', label: 'International care', helper: 'Discovery filter', chip: 'International care', keywords: ['international care', 'international patients'] }
      ])
    },
    results: {
      title: isAr ? 'تصفح المستشفيات' : 'Browse hospitals',
      emptyText: isAr ? 'تظهر هنا نتائج البحث وقوائم المستشفيات العامة بعد الاعتماد.' : 'Search results and public hospital listings appear here after approval.'
    },
    visual: {
      label: isAr ? 'معرض صور اكتشاف المستشفيات' : 'Hospital discovery image gallery',
      previous: isAr ? 'الصورة السابقة' : 'Previous image',
      next: isAr ? 'الصورة التالية' : 'Next image',
      slideLabel: isAr ? 'عرض الصورة' : 'Show image',
      slides: hospitalSlides[locale]
    }
  };
}

const offersSlides = {
  en: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'Offer discovery visual for healthcare and wellness services in Oman', caption: 'Offer discovery across services and areas' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'Public healthcare and wellness offer discovery visual for Oman', caption: 'Browse approved offers after provider approval' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'Mobile-ready offer discovery visual', caption: 'Public discovery only, not medical advice' }
  ],
  ar: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'صورة اكتشاف عروض الصحة والعافية في عُمان', caption: 'اكتشاف العروض حسب الخدمات والمناطق' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'واجهة اكتشاف عامة لعروض الصحة والعافية في عُمان', caption: 'تصفح العروض المعتمدة بعد موافقة المقدم' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'صورة اكتشاف عروض مناسبة للجوال', caption: 'اكتشاف عام فقط وليس نصيحة طبية' }
  ]
} as const;

export function buildOffersDiscoveryConfig(locale: SupportedLocale, country: SupportedCountry, dir: 'ltr' | 'rtl'): PublicDiscoveryPageConfig {
  const isAr = locale === 'ar';

  return {
    locale,
    country,
    dir,
    categoryType: 'offers',
    path: '/offers',
    searchId: 'offer-search',
    resultsId: 'offer-results',
    showWhatsApp: false,
    badge: isAr ? 'العروض في عُمان' : 'Offers in Oman',
    title: isAr ? 'ابحث عن عروض الصحة والعافية في عُمان.' : 'Find healthcare and wellness offers in Oman.',
    subtitle: isAr
      ? 'تصفح العروض المعتمدة من العيادات ومراكز التجميل والصيدليات والمختبرات ومقدمي العافية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
      : 'Browse approved offers from clinics, beauty centers, pharmacies, labs and wellness providers across Oman. Public discovery only, not medical advice.',
    primaryCta: isAr ? 'بحث' : 'Search',
    providerCta: isAr ? 'أدرج عرضك' : 'List your offer',
    search: {
      badge: isAr ? 'بحث العروض' : 'Offer search',
      title: isAr ? 'ابحث عن العروض حسب الخدمة أو المقدم أو المنطقة' : 'Find offers by service, provider or area',
      description: isAr ? 'ابدأ بخدمة أو نوع مقدم أو فئة علاج أو منطقة في مسقط.' : 'Start with a service, provider type, treatment category or Muscat area.',
      inputLabel: isAr ? 'ما العرض الذي تبحث عنه؟' : 'What offer are you looking for?',
      placeholder: isAr ? 'ابحث عن أسنان أو جلدية أو فحص مختبر أو صيدلية أو عافية أو منطقة…' : 'Search dental, skin, lab test, pharmacy, wellness or area…',
      button: isAr ? 'بحث' : 'Search',
      legend: isAr ? 'فئات العروض' : 'Offer categories',
      moreFilters: isAr ? 'المزيد من الفلاتر' : 'More filters',
      moreLegend: isAr ? 'فئات عروض إضافية' : 'More offer categories',
      countryLabel: isAr ? 'الدولة' : 'Country',
      cityLabel: isAr ? 'المدينة' : 'City',
      areaLabel: isAr ? 'المنطقة' : 'Area',
      suggestionLabel: isAr ? 'اقتراحات بحث العروض' : 'Offer search suggestions',
      useSuggestion: isAr ? 'استخدم الاقتراح' : 'Use suggestion',
      contentType: isAr ? 'العروض' : 'Offers',
      trustAria: isAr ? 'إرشادات بحث العروض' : 'Offer search guidance',
      trust: isAr ? ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة طبية'] : ['Public discovery only', 'Confirm details with provider', 'Not medical advice'],
      mainChips: isAr ? ['عروض الأسنان', 'الجلدية والتجميل', 'فحوصات المختبر', 'عروض الصيدليات', 'العافية'] : ['Dental offers', 'Skin and beauty', 'Lab tests', 'Pharmacy offers', 'Wellness'],
      moreChips: isAr ? ['عيادات', 'مراكز التجميل', 'رعاية الحيوانات', 'رعاية العيون', 'علاج طبيعي', 'رعاية العائلة'] : ['Clinics', 'Beauty centers', 'Pet care', 'Eye care', 'Physiotherapy', 'Family care'],
      countryOptions: isAr ? ['عُمان'] : ['Oman'],
      cityOptions: isAr ? ['مسقط'] : ['Muscat'],
      areaOptions: isAr ? ['الخوير'] : ['Al Khuwair'],
      defaultCountry: isAr ? 'عُمان' : 'Oman',
      defaultCity: isAr ? 'مسقط' : 'Muscat',
      defaultArea: isAr ? 'الخوير' : 'Al Khuwair',
      suggestions: (isAr ? [
        { id: 'dental-offers', label: 'عروض الأسنان', helper: 'اقتراح بحث عروض', chip: 'عروض الأسنان', keywords: ['عروض الأسنان', 'أسنان'] },
        { id: 'skin-clinic-offers', label: 'عروض عيادات الجلدية', helper: 'اقتراح بحث عروض', chip: 'الجلدية والتجميل', keywords: ['جلدية', 'عروض عيادات الجلدية'] },
        { id: 'beauty-center-offers', label: 'عروض مراكز التجميل', helper: 'اقتراح بحث عروض', chip: 'مراكز التجميل', keywords: ['تجميل', 'عروض مراكز التجميل'] },
        { id: 'lab-test-offers', label: 'عروض فحوصات المختبر', helper: 'اقتراح بحث عروض', chip: 'فحوصات المختبر', keywords: ['مختبر', 'فحوصات'] },
        { id: 'pharmacy-offers', label: 'عروض الصيدليات', helper: 'اقتراح بحث عروض', chip: 'عروض الصيدليات', keywords: ['صيدلية', 'صيدليات'] },
        { id: 'wellness-offers', label: 'عروض العافية', helper: 'اقتراح بحث عروض', chip: 'العافية', keywords: ['عافية'] },
        { id: 'physiotherapy-offers', label: 'عروض العلاج الطبيعي', helper: 'اقتراح بحث عروض', chip: 'علاج طبيعي', keywords: ['علاج طبيعي'] },
        { id: 'eye-care-offers', label: 'عروض رعاية العيون', helper: 'اقتراح بحث عروض', chip: 'رعاية العيون', keywords: ['عيون'] },
        { id: 'pet-care-offers', label: 'عروض رعاية الحيوانات', helper: 'اقتراح بحث عروض', chip: 'رعاية الحيوانات', keywords: ['حيوانات'] },
        { id: 'offers-muscat', label: 'عروض في مسقط', helper: 'بحث حسب المدينة', city: 'مسقط', keywords: ['مسقط'] },
        { id: 'offers-khuwair', label: 'عروض في الخوير', helper: 'بحث حسب المنطقة', area: 'الخوير', keywords: ['الخوير'] },
        { id: 'offers-qurum', label: 'عروض في القرم', helper: 'بحث حسب المنطقة', area: 'القرم', keywords: ['القرم'] }
      ] : [
        { id: 'dental-offers', label: 'Dental offers', helper: 'Offer search suggestion', chip: 'Dental offers', keywords: ['dental', 'dental offers'] },
        { id: 'skin-clinic-offers', label: 'Skin clinic offers', helper: 'Offer search suggestion', chip: 'Skin and beauty', keywords: ['skin', 'skin clinic'] },
        { id: 'beauty-center-offers', label: 'Beauty center offers', helper: 'Offer search suggestion', chip: 'Beauty centers', keywords: ['beauty', 'beauty center'] },
        { id: 'lab-test-offers', label: 'Lab test offers', helper: 'Offer search suggestion', chip: 'Lab tests', keywords: ['lab', 'lab test'] },
        { id: 'pharmacy-offers', label: 'Pharmacy offers', helper: 'Offer search suggestion', chip: 'Pharmacy offers', keywords: ['pharmacy'] },
        { id: 'wellness-offers', label: 'Wellness offers', helper: 'Offer search suggestion', chip: 'Wellness', keywords: ['wellness'] },
        { id: 'physiotherapy-offers', label: 'Physiotherapy offers', helper: 'Offer search suggestion', chip: 'Physiotherapy', keywords: ['physiotherapy'] },
        { id: 'eye-care-offers', label: 'Eye care offers', helper: 'Offer search suggestion', chip: 'Eye care', keywords: ['eye care'] },
        { id: 'pet-care-offers', label: 'Pet care offers', helper: 'Offer search suggestion', chip: 'Pet care', keywords: ['pet care'] },
        { id: 'offers-muscat', label: 'Offers in Muscat', helper: 'City search path', city: 'Muscat', keywords: ['muscat'] },
        { id: 'offers-khuwair', label: 'Offers in Al Khuwair', helper: 'Area search path', area: 'Al Khuwair', keywords: ['khuwair'] },
        { id: 'offers-qurum', label: 'Offers in Qurum', helper: 'Area search path', area: 'Qurum', keywords: ['qurum'] }
      ])
    },
    results: {
      title: isAr ? 'تصفح العروض المعتمدة' : 'Browse approved offers',
      emptyText: isAr ? 'تظهر هنا نتائج البحث والعروض العامة المعتمدة بعد موافقة المقدم.' : 'Search results and approved public offers appear here after provider approval.'
    },
    visual: {
      label: isAr ? 'معرض صور اكتشاف العروض' : 'Offer discovery image gallery',
      previous: isAr ? 'الصورة السابقة' : 'Previous image',
      next: isAr ? 'الصورة التالية' : 'Next image',
      slideLabel: isAr ? 'عرض الصورة' : 'Show image',
      slides: offersSlides[locale]
    }
  };
}

const pharmaciesSlides = {
  en: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'Pharmacy discovery visual for public healthcare search', caption: 'Pharmacy discovery across services, care needs and areas' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'Healthcare platform visual for pharmacy search in Oman', caption: 'Search pharmacy services and care essentials in Oman' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'Mobile-ready pharmacy discovery visual', caption: 'Public discovery only, not medical advice' }
  ],
  ar: [
    { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: 'صورة اكتشاف الصيدليات للبحث العام في الرعاية الصحية', caption: 'اكتشاف الصيدليات حسب الخدمات والاحتياجات والمناطق' },
    { src: '/images/home/provider-cta-healthcare-platform-preview.webp', alt: 'واجهة رعاية صحية لبحث الصيدليات في عُمان', caption: 'ابحث عن خدمات الصيدليات واحتياجات الرعاية في عُمان' },
    { src: '/images/home/provider-cta-healthcare-platform-preview-mobile.webp', alt: 'صورة اكتشاف صيدليات مناسبة للجوال', caption: 'اكتشاف عام فقط وليس نصيحة طبية' }
  ]
} as const;

export function buildPharmaciesDiscoveryConfig(locale: SupportedLocale, country: SupportedCountry, dir: 'ltr' | 'rtl'): PublicDiscoveryPageConfig {
  const isAr = locale === 'ar';

  return {
    locale,
    country,
    dir,
    categoryType: 'pharmacies',
    path: '/pharmacies',
    searchId: 'pharmacy-search',
    resultsId: 'pharmacy-results',
    showWhatsApp: false,
    badge: isAr ? 'الصيدليات في عُمان' : 'Pharmacies in Oman',
    title: isAr ? 'ابحث عن صيدليات في عُمان.' : 'Find pharmacies in Oman.',
    subtitle: isAr
      ? 'تصفح الصيدليات وخدمات الوصول للأدوية والمنتجات الصحية واحتياجات الرعاية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
      : 'Browse pharmacies, medicine access, health products and care essentials across Oman. Public discovery only, not medical advice.',
    primaryCta: isAr ? 'ابحث عن الصيدليات' : 'Search pharmacies',
    providerCta: isAr ? 'أدرج صيدليتك' : 'List your pharmacy',
    search: {
      badge: isAr ? 'بحث الصيدليات' : 'Pharmacy search',
      title: isAr ? 'ابحث عن الصيدليات أو خدمات الأدوية أو المناطق' : 'Find pharmacies, medicine access or areas',
      description: isAr ? 'ابدأ باسم صيدلية أو احتياج صحي أو فئة منتج أو منطقة في مسقط.' : 'Start with a pharmacy name, care need, product category or Muscat area.',
      inputLabel: isAr ? 'ما خدمة الصيدلية التي تحتاجها؟' : 'What pharmacy service do you need?',
      placeholder: isAr ? 'ابحث عن صيدلية أو دواء أو عناية بالبشرة أو رعاية الأطفال أو منطقة…' : 'Search pharmacy, medicine, skincare, baby care or area…',
      button: isAr ? 'بحث' : 'Search',
      legend: isAr ? 'خدمات الصيدلية' : 'Pharmacy services',
      moreFilters: isAr ? 'المزيد من الفلاتر' : 'More filters',
      moreLegend: isAr ? 'خدمات صيدلية إضافية' : 'More pharmacy services',
      countryLabel: isAr ? 'الدولة' : 'Country',
      cityLabel: isAr ? 'المدينة' : 'City',
      areaLabel: isAr ? 'المنطقة' : 'Area',
      suggestionLabel: isAr ? 'اقتراحات بحث الصيدليات' : 'Pharmacy search suggestions',
      useSuggestion: isAr ? 'استخدم الاقتراح' : 'Use suggestion',
      contentType: isAr ? 'الصيدليات' : 'Pharmacies',
      trustAria: isAr ? 'إرشادات بحث الصيدليات' : 'Pharmacy search guidance',
      trust: isAr ? ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة طبية'] : ['Public discovery only', 'Confirm details with provider', 'Not medical advice'],
      mainChips: isAr ? ['صيدلية 24 ساعة', 'أدوية بوصفة', 'رعاية الأطفال', 'العناية بالبشرة', 'فيتامينات'] : ['24/7 pharmacy', 'Prescription medicine', 'Baby care', 'Skincare', 'Vitamins'],
      moreChips: isAr ? ['توصيل', 'أجهزة طبية', 'عناية شخصية', 'إسعافات أولية', 'رعاية السكري', 'رعاية الأم'] : ['Delivery', 'Medical devices', 'Personal care', 'First aid', 'Diabetes care', 'Mother care'],
      countryOptions: isAr ? ['عُمان'] : ['Oman'],
      cityOptions: isAr ? ['مسقط', 'السيب', 'بوشر', 'مطرح'] : ['Muscat', 'Seeb', 'Bawshar', 'Muttrah'],
      areaOptions: isAr ? ['الخوير', 'القرم', 'العذيبة', 'الغبرة', 'روي'] : ['Al Khuwair', 'Qurum', 'Azaiba', 'Al Ghubra', 'Ruwi'],
      defaultCountry: isAr ? 'عُمان' : 'Oman',
      defaultCity: isAr ? 'مسقط' : 'Muscat',
      defaultArea: isAr ? 'الخوير' : 'Al Khuwair',
      suggestions: (isAr ? [
        { id: 'pharmacy-24-7', label: 'صيدلية 24 ساعة', helper: 'اقتراح بحث صيدليات', chip: 'صيدلية 24 ساعة', keywords: ['صيدلية 24 ساعة', '٢٤ ساعة', '24'] },
        { id: 'prescription-medicine', label: 'أدوية بوصفة', helper: 'اقتراح بحث صيدليات', chip: 'أدوية بوصفة', keywords: ['وصفة', 'أدوية بوصفة'] },
        { id: 'pharmacy-muscat', label: 'صيدلية في مسقط', helper: 'بحث حسب المدينة', city: 'مسقط', keywords: ['مسقط', 'صيدلية مسقط'] },
        { id: 'pharmacy-khuwair', label: 'صيدلية في الخوير', helper: 'بحث حسب المنطقة', area: 'الخوير', keywords: ['الخوير', 'صيدلية الخوير'] },
        { id: 'pharmacy-qurum', label: 'صيدلية في القرم', helper: 'بحث حسب المنطقة', area: 'القرم', keywords: ['القرم', 'صيدلية القرم'] },
        { id: 'baby-care-products', label: 'منتجات رعاية الأطفال', helper: 'اقتراح بحث صيدليات', chip: 'رعاية الأطفال', keywords: ['أطفال', 'رعاية الأطفال'] },
        { id: 'skincare-pharmacy', label: 'العناية بالبشرة', helper: 'اقتراح بحث صيدليات', chip: 'العناية بالبشرة', keywords: ['بشرة', 'العناية بالبشرة'] },
        { id: 'vitamins', label: 'فيتامينات', helper: 'اقتراح بحث صيدليات', chip: 'فيتامينات', keywords: ['فيتامين', 'فيتامينات'] },
        { id: 'diabetes-care', label: 'رعاية السكري', helper: 'اقتراح بحث صيدليات', chip: 'رعاية السكري', keywords: ['سكري', 'رعاية السكري'] },
        { id: 'medical-devices', label: 'أجهزة طبية', helper: 'اقتراح بحث صيدليات', chip: 'أجهزة طبية', keywords: ['أجهزة', 'أجهزة طبية'] },
        { id: 'first-aid', label: 'إسعافات أولية', helper: 'اقتراح بحث صيدليات', chip: 'إسعافات أولية', keywords: ['اسعافات', 'إسعافات أولية', 'اسعافات اوليه'] },
        { id: 'mother-care', label: 'رعاية الأم', helper: 'اقتراح بحث صيدليات', chip: 'رعاية الأم', keywords: ['ام', 'الأم', 'رعاية الأم'] }
      ] : [
        { id: 'pharmacy-24-7', label: '24/7 pharmacy', helper: 'Pharmacy search suggestion', chip: '24/7 pharmacy', keywords: ['24/7', '24 hour', 'pharmacy'] },
        { id: 'prescription-medicine', label: 'Prescription medicine', helper: 'Pharmacy search suggestion', chip: 'Prescription medicine', keywords: ['prescription', 'medicine'] },
        { id: 'pharmacy-muscat', label: 'Pharmacy in Muscat', helper: 'City search path', city: 'Muscat', keywords: ['muscat', 'muscat pharmacy'] },
        { id: 'pharmacy-khuwair', label: 'Pharmacy in Al Khuwair', helper: 'Area search path', area: 'Al Khuwair', keywords: ['khuwair', 'al khuwair pharmacy'] },
        { id: 'pharmacy-qurum', label: 'Pharmacy in Qurum', helper: 'Area search path', area: 'Qurum', keywords: ['qurum', 'qurum pharmacy'] },
        { id: 'baby-care-products', label: 'Baby care products', helper: 'Pharmacy search suggestion', chip: 'Baby care', keywords: ['baby', 'baby care'] },
        { id: 'skincare-pharmacy', label: 'Skincare pharmacy', helper: 'Pharmacy search suggestion', chip: 'Skincare', keywords: ['skincare', 'skin care'] },
        { id: 'vitamins', label: 'Vitamins', helper: 'Pharmacy search suggestion', chip: 'Vitamins', keywords: ['vitamin', 'vitamins'] },
        { id: 'diabetes-care', label: 'Diabetes care', helper: 'Pharmacy search suggestion', chip: 'Diabetes care', keywords: ['diabetes', 'diabetes care'] },
        { id: 'medical-devices', label: 'Medical devices', helper: 'Pharmacy search suggestion', chip: 'Medical devices', keywords: ['devices', 'medical devices'] },
        { id: 'first-aid', label: 'First aid', helper: 'Pharmacy search suggestion', chip: 'First aid', keywords: ['first aid', 'aid'] },
        { id: 'mother-care', label: 'Mother care', helper: 'Pharmacy search suggestion', chip: 'Mother care', keywords: ['mother care', 'mother'] }
      ])
    },
    results: {
      title: isAr ? 'تصفح الصيدليات' : 'Browse pharmacies',
      emptyText: isAr ? 'تظهر هنا نتائج البحث وقوائم الصيدليات العامة بعد الاعتماد.' : 'Search results and public pharmacy listings appear here after approval.'
    },
    visual: {
      label: isAr ? 'معرض صور اكتشاف الصيدليات' : 'Pharmacy discovery image gallery',
      previous: isAr ? 'الصورة السابقة' : 'Previous image',
      next: isAr ? 'الصورة التالية' : 'Next image',
      slideLabel: isAr ? 'عرض الصورة' : 'Show image',
      slides: pharmaciesSlides[locale]
    }
  };
}
