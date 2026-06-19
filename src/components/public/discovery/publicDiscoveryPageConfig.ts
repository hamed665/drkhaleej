import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

export type PublicDiscoveryCategoryType = 'doctors' | 'labs' | 'centers' | 'pharmacies' | 'pet-clinics' | 'services';

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
