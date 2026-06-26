import type { PublicAreaPageTemplate2026Props } from '@/components/geo/PublicAreaPageTemplate2026';
import type { PublicDirectoryTemplate2026Props } from '@/components/directory/PublicDirectoryTemplate2026';
import type { PublicProfileTemplate2026Props } from '@/components/profiles/PublicProfileTemplate2026';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { evaluatePublicProfilePublication } from '@/lib/profiles/public-profile-guards';
import { publicDiscoveryRoute, publicDoctorDetailRoute } from '@/lib/routes/public';
import {
  createDirectoryInternalLinks,
  createGeoInternalLinks,
  selectPrimaryInternalLinks
} from '@/lib/seo/internal-linking';

type DemoLocaleCopy = {
  areaName: string;
  parentLabel: string;
  countryLabel: string;
  doctorName: string;
  doctorCategory: string;
  directoryTitle: string;
  directoryDescription: string;
  areaDescription: string;
  services: readonly string[];
  badges: readonly string[];
  doctorsLink: string;
  pharmaciesLink: string;
  hospitalsLink: string;
  doctorGroupTitle: string;
  doctorGroupDescription: string;
};

const demoCopy: Record<SupportedLocale, DemoLocaleCopy> = {
  en: {
    areaName: 'Al Khuwair',
    parentLabel: 'Muscat',
    countryLabel: 'Oman',
    doctorName: 'Demo Family Medicine Profile',
    doctorCategory: 'Family medicine',
    directoryTitle: 'Demo doctors in Oman',
    directoryDescription: 'A safe non-indexed demo dataset for checking the public directory template before live provider data is connected.',
    areaDescription: 'A safe demo area page for checking local healthcare discovery layouts without making medical, booking or verification claims.',
    services: ['General consultation', 'Preventive care', 'Follow-up visits'],
    badges: ['Demo data', 'Public-template test'],
    doctorsLink: 'Doctors in Al Khuwair',
    pharmaciesLink: 'Pharmacies in Al Khuwair',
    hospitalsLink: 'Hospitals near Al Khuwair',
    doctorGroupTitle: 'Demo public doctors',
    doctorGroupDescription: 'Example cards only. Replace with reviewed public provider profiles before indexing.'
  },
  ar: {
    areaName: 'الخوير',
    parentLabel: 'مسقط',
    countryLabel: 'عُمان',
    doctorName: 'ملف تجريبي لطب الأسرة',
    doctorCategory: 'طب الأسرة',
    directoryTitle: 'أطباء تجريبيون في عُمان',
    directoryDescription: 'بيانات تجريبية آمنة لاختبار قالب الدليل العام قبل ربط بيانات مقدمي الخدمة الحقيقية.',
    areaDescription: 'صفحة منطقة تجريبية آمنة لاختبار تجربة البحث المحلي بدون ادعاءات طبية أو حجز أو تحقق.',
    services: ['استشارة عامة', 'رعاية وقائية', 'زيارات متابعة'],
    badges: ['بيانات تجريبية', 'اختبار القالب العام'],
    doctorsLink: 'الأطباء في الخوير',
    pharmaciesLink: 'الصيدليات في الخوير',
    hospitalsLink: 'المستشفيات قرب الخوير',
    doctorGroupTitle: 'أطباء عامون تجريبيون',
    doctorGroupDescription: 'بطاقات مثال فقط. استبدلها بملفات عامة تمت مراجعتها قبل الفهرسة.'
  }
};

const demoAreaSlug = 'al-khuwair';
const demoDoctorSlug = 'demo-family-medicine-profile';

function copyFor(locale: SupportedLocale): DemoLocaleCopy {
  return demoCopy[locale];
}

export function createDemoPublicProfileTemplateProps(
  locale: SupportedLocale,
  country: SupportedCountry
): PublicProfileTemplate2026Props {
  const copy = copyFor(locale);
  const internalLinks = selectPrimaryInternalLinks([
    ...createDirectoryInternalLinks({ locale, country, currentSlug: 'doctors' }),
    ...createGeoInternalLinks({
      locale,
      country,
      entity: 'area',
      slug: demoAreaSlug,
      label: copy.areaName,
      parentLabel: copy.parentLabel,
      directorySlugs: ['doctors', 'pharmacies', 'hospitals']
    })
  ], 6);

  return {
    locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    entityType: 'doctor',
    displayName: copy.doctorName,
    categoryLabel: copy.doctorCategory,
    description: locale === 'ar'
      ? 'ملف تجريبي آمن لاختبار عرض الملف العام بدون أي ادعاء طبي أو تحقق رسمي.'
      : 'A safe demo profile for checking the public profile layout without any medical or official verification claims.',
    services: copy.services,
    contact: {
      phone: '+968 0000 0000',
      website: 'https://example.com',
      whatsappHref: 'https://wa.me/96800000000'
    },
    location: {
      area: copy.areaName,
      city: copy.parentLabel,
      country: copy.countryLabel
    },
    publicationDecision: evaluatePublicProfilePublication({
      entityType: 'doctor',
      isActive: true,
      reviewStatus: 'approved',
      readinessStatus: 'ready',
      slug: demoDoctorSlug,
      displayName: copy.doctorName,
      hasUnsafeMedicalClaims: false
    }),
    internalLinks
  };
}

export function createDemoPublicDirectoryTemplateProps(
  locale: SupportedLocale,
  country: SupportedCountry
): PublicDirectoryTemplate2026Props {
  const copy = copyFor(locale);
  const profileHref = publicDoctorDetailRoute(locale, country, demoDoctorSlug);

  return {
    locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    entityType: 'doctor',
    eyebrow: locale === 'ar' ? 'دليل تجريبي' : 'Demo directory',
    title: copy.directoryTitle,
    description: copy.directoryDescription,
    totalResults: 1,
    filters: [
      {
        key: 'area',
        label: copy.areaName,
        value: demoAreaSlug,
        href: `${publicDiscoveryRoute(locale, country, 'doctors')}?area=${demoAreaSlug}`,
        active: true
      },
      {
        key: 'category',
        label: copy.doctorCategory,
        value: 'family-medicine',
        href: publicDiscoveryRoute(locale, country, 'doctors')
      }
    ],
    results: [
      {
        id: demoDoctorSlug,
        href: profileHref,
        entityType: 'doctor',
        displayName: copy.doctorName,
        categoryLabel: copy.doctorCategory,
        summary: copy.directoryDescription,
        area: copy.areaName,
        city: copy.parentLabel,
        badges: copy.badges,
        isPublic: true
      }
    ],
    internalLinks: selectPrimaryInternalLinks(
      createDirectoryInternalLinks({ locale, country, currentSlug: 'doctors' }),
      6
    )
  };
}

export function createDemoPublicAreaTemplateProps(
  locale: SupportedLocale,
  country: SupportedCountry
): PublicAreaPageTemplate2026Props {
  const copy = copyFor(locale);
  const doctorsHref = publicDiscoveryRoute(locale, country, 'doctors');
  const profileHref = publicDoctorDetailRoute(locale, country, demoDoctorSlug);

  return {
    locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    areaName: copy.areaName,
    parentLabel: copy.parentLabel,
    countryLabel: copy.countryLabel,
    description: copy.areaDescription,
    directoryLinks: [
      {
        key: 'doctors',
        href: `${doctorsHref}?area=${demoAreaSlug}`,
        label: copy.doctorsLink,
        entityType: 'doctor',
        count: 1
      },
      {
        key: 'pharmacies',
        href: `${publicDiscoveryRoute(locale, country, 'pharmacies')}?area=${demoAreaSlug}`,
        label: copy.pharmaciesLink,
        entityType: 'pharmacy'
      },
      {
        key: 'hospitals',
        href: `${publicDiscoveryRoute(locale, country, 'hospitals')}?area=${demoAreaSlug}`,
        label: copy.hospitalsLink,
        entityType: 'hospital'
      }
    ],
    providerGroups: [
      {
        key: 'demo-doctors',
        title: copy.doctorGroupTitle,
        entityType: 'doctor',
        description: copy.doctorGroupDescription,
        providers: [
          {
            id: demoDoctorSlug,
            href: profileHref,
            displayName: copy.doctorName,
            entityType: 'doctor',
            categoryLabel: copy.doctorCategory,
            summary: copy.areaDescription,
            isPublic: true
          }
        ]
      }
    ],
    internalLinks: selectPrimaryInternalLinks(
      createGeoInternalLinks({
        locale,
        country,
        entity: 'area',
        slug: demoAreaSlug,
        label: copy.areaName,
        parentLabel: copy.parentLabel,
        directorySlugs: ['doctors', 'pharmacies', 'hospitals', 'labs']
      }),
      6
    )
  };
}

export function createPublicTemplateDemoBundle(locale: SupportedLocale, country: SupportedCountry) {
  return {
    profile: createDemoPublicProfileTemplateProps(locale, country),
    directory: createDemoPublicDirectoryTemplateProps(locale, country),
    area: createDemoPublicAreaTemplateProps(locale, country)
  };
}
