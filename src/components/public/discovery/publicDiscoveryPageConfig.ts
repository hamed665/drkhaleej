import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

export type PublicDiscoveryCategoryType = 'doctors' | 'labs' | 'centers' | 'pharmacies' | 'services';

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
  whatsAppCta: string;
  whatsAppMessage: string;
  whatsAppUnavailable: string;
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
