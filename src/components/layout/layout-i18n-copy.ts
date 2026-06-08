import { localeDirection, type SupportedCountry, type SupportedLocale } from '@/lib/i18n/config';

export type LayoutPathnameI18n = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

export const resolveLayoutPathnameI18n = (pathname: string | null): LayoutPathnameI18n => {
  const segments = (pathname ?? '').split('/').filter(Boolean);
  const locale: SupportedLocale = segments[0] === 'ar' ? 'ar' : 'en';
  const country: SupportedCountry = segments[1] === 'om' ? 'om' : 'om';

  return {
    locale,
    country,
    dir: localeDirection(locale)
  };
};

export const headerCopy = {
  en: {
    ariaLabel: 'Primary public navigation',
    actionsLabel: 'Account and language actions',
    home: 'Home',
    doctors: 'Doctors',
    centers: 'Centers',
    hospitals: 'Hospitals',
    pharmacies: 'Pharmacies',
    labs: 'Labs',
    services: 'Services',
    offers: 'Special Offers',
    articles: 'Articles',
    forProviders: 'For Providers',
    signIn: 'Sign in',
    createAccount: 'Create account',
    comingSoon: 'coming soon',
    brandLabel: 'DrMuscat home',
    menuLabel: 'Open navigation',
    closeMenu: 'Close navigation'
  },
  ar: {
    ariaLabel: 'التنقل العام الرئيسي',
    actionsLabel: 'إجراءات الحساب واللغة',
    home: 'الرئيسية',
    doctors: 'الأطباء',
    centers: 'المراكز',
    hospitals: 'المستشفيات',
    pharmacies: 'الصيدليات',
    labs: 'المختبرات',
    services: 'الخدمات',
    offers: 'العروض الخاصة',
    articles: 'المقالات',
    forProviders: 'لمقدمي الخدمة',
    signIn: 'تسجيل الدخول',
    createAccount: 'إنشاء حساب',
    comingSoon: 'قريباً',
    brandLabel: 'الرئيسية DrMuscat',
    menuLabel: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة'
  }
} as const satisfies Record<SupportedLocale, Record<string, string>>;

export const footerCopy = {
  en: {
    brandText: 'Public healthcare discovery for Oman, built for Arabic and English users.',
    navLabel: 'Footer public navigation',
    browseHeading: 'Browse',
    providersHeading: 'For Providers',
    trustHeading: 'Trust & Safety',
    doctors: 'Doctors',
    centers: 'Centers',
    labs: 'Labs',
    pharmacies: 'Pharmacies',
    hospitals: 'Hospitals',
    services: 'Services',
    offers: 'Special Offers',
    listYourCenter: 'List your center',
    reviewedProfile: 'Reviewed profile',
    photosGallery: 'Photos & gallery',
    whatsappCallDirections: 'WhatsApp, Call & Directions',
    publicDiscoveryOnly: 'Public discovery only',
    notMedicalAdvice: 'Not medical advice',
    confirmWithProvider: 'Confirm with provider',
    sponsoredVisibility: 'Sponsored visibility is not quality ranking',
    comingSoon: 'coming soon'
  },
  ar: {
    brandText: 'اكتشاف عام للرعاية الصحية في عُمان، مصمم للمستخدمين بالعربية والإنجليزية.',
    navLabel: 'تنقل التذييل العام',
    browseHeading: 'تصفح',
    providersHeading: 'لمقدمي الخدمة',
    trustHeading: 'الثقة والسلامة',
    doctors: 'الأطباء',
    centers: 'المراكز',
    labs: 'المختبرات',
    pharmacies: 'الصيدليات',
    hospitals: 'المستشفيات',
    services: 'الخدمات',
    offers: 'العروض الخاصة',
    listYourCenter: 'أدرج مركزك',
    reviewedProfile: 'ملف بعد المراجعة',
    photosGallery: 'صور ومعرض',
    whatsappCallDirections: 'واتساب، اتصال واتجاهات',
    publicDiscoveryOnly: 'اكتشاف عام فقط',
    notMedicalAdvice: 'ليست نصيحة طبية',
    confirmWithProvider: 'أكّد مع مقدم الخدمة',
    sponsoredVisibility: 'الظهور المدعوم ليس ترتيب جودة',
    comingSoon: 'قريباً'
  }
} as const satisfies Record<SupportedLocale, Record<string, string>>;
