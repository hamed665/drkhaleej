import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomeCategoryPreview } from '@/components/home/home-category-preview';
import { HomeHero } from '@/components/home/home-hero';
import { HomeTrustStrip } from '@/components/home/home-trust-strip';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  SupportedCountry,
  SupportedLocale
} from '@/lib/i18n/config';

type Params = { locale: string; country: string };

type HomeCopy = {
  metadataTitle: string;
  metadataDescription: string;
  hero: {
    announcement: string;
    title: string;
    subtitle: string;
    note: string;
    search: {
      primaryPlaceholder: string;
      servicePlaceholder: string;
      locationPlaceholder: string;
      ctaLabel: string;
      categories: readonly string[];
    };
    popularSearchLabel: string;
    popularSearches: readonly string[];
    visualTags: readonly string[];
  };
  trust: readonly string[];
  categories: {
    title: string;
    subtitle: string;
    items: readonly {
      key: string;
      label: string;
      description: string;
      accentClass: string;
    }[];
  };
};

const homeCopyByLocale: Record<SupportedLocale, HomeCopy> = {
  en: {
    metadataTitle: 'DrMuscat Oman | Search-First Healthcare Discovery',
    metadataDescription:
      'Find healthcare in Oman without guessing. Search doctors, clinics, pharmacies, and labs in one bilingual healthcare discovery experience.',
    hero: {
      announcement: 'Pastel premium healthcare discovery for Oman',
      title: 'Find healthcare in Oman without guessing.',
      subtitle:
        'Search doctors, clinics, pharmacies, and labs in one bilingual healthcare discovery experience.',
      note: 'This phase introduces a safer search-first experience shell while verified data workflows are prepared.',
      search: {
        primaryPlaceholder: 'Search doctors, clinics, pharmacies, labs...',
        servicePlaceholder: 'Dentist, dermatologist, lab test...',
        locationPlaceholder: 'Muscat, Al Khuwair, Qurum...',
        ctaLabel: 'Search',
        categories: ['Dental care', 'Dermatology', 'Pediatrics', 'Lab tests', 'Pharmacy']
      },
      popularSearchLabel: 'Popular searches',
      popularSearches: ['Dental care', 'Dermatology', 'Pediatrics', 'Lab tests', 'Pharmacy'],
      visualTags: ['Arabic + English', 'Oman-first', 'Doctors · Clinics · Labs']
    },
    trust: [
      'Search-first healthcare discovery',
      'Bilingual Arabic and English experience',
      'Built for provider visibility',
      'Prepared for verified data workflows'
    ],
    categories: {
      title: 'Explore healthcare categories',
      subtitle: 'Doctors, clinics, pharmacies, and labs in a clean bilingual discovery structure.',
      items: [
        {
          key: 'doctors',
          label: 'Doctors',
          description: 'Structured for specialty-led healthcare discovery across Oman.',
          accentClass: 'home-categories__card--doctors'
        },
        {
          key: 'clinics',
          label: 'Clinics',
          description: 'Prepared for local clinic visibility with Arabic-first and English support.',
          accentClass: 'home-categories__card--clinics'
        },
        {
          key: 'pharmacies',
          label: 'Pharmacies',
          description: 'Ready for pharmacy discovery pathways in future verified data phases.',
          accentClass: 'home-categories__card--pharmacies'
        },
        {
          key: 'laboratories',
          label: 'Labs',
          description: 'Prepared for diagnostic and lab search experiences as approved phases expand.',
          accentClass: 'home-categories__card--laboratories'
        }
      ]
    }
  },
  ar: {
    metadataTitle: 'د.مسقط عُمان | تجربة بحث أولاً للرعاية الصحية',
    metadataDescription:
      'اعثر على الرعاية الصحية في عُمان بوضوح. ابحث عن الأطباء والعيادات والصيدليات والمختبرات من تجربة واحدة ثنائية اللغة.',
    hero: {
      announcement: 'تجربة بحث طبية راقية لعُمان',
      title: 'اعثر على الرعاية الصحية في عُمان بوضوح.',
      subtitle: 'ابحث عن الأطباء والعيادات والصيدليات والمختبرات من تجربة واحدة ثنائية اللغة.',
      note: 'تقدم هذه المرحلة واجهة بحث أولاً بشكل آمن تمهيداً لمسارات بيانات موثوقة في المراحل القادمة.',
      search: {
        primaryPlaceholder: 'ابحث عن طبيب، عيادة، صيدلية أو مختبر...',
        servicePlaceholder: 'طبيب أسنان، جلدية، تحليل دم...',
        locationPlaceholder: 'مسقط، الخوير، القرم...',
        ctaLabel: 'ابحث',
        categories: ['طب الأسنان', 'الجلدية', 'طب الأطفال', 'التحاليل', 'الصيدليات']
      },
      popularSearchLabel: 'عمليات بحث شائعة',
      popularSearches: ['طب الأسنان', 'الجلدية', 'طب الأطفال', 'التحاليل', 'الصيدليات'],
      visualTags: ['العربية + الإنجليزية', 'عُمان أولاً', 'أطباء · عيادات · مختبرات']
    },
    trust: [
      'تجربة بحث طبية واضحة',
      'تجربة ثنائية اللغة بالعربية والإنجليزية',
      'مهيأ لظهور مقدمي الرعاية الصحية',
      'جاهز لمسارات البيانات الموثوقة'
    ],
    categories: {
      title: 'استكشف فئات الرعاية الصحية',
      subtitle: 'الأطباء والعيادات والصيدليات والمختبرات ضمن هيكل بحث ثنائي اللغة واضح.',
      items: [
        {
          key: 'doctors',
          label: 'الأطباء',
          description: 'مهيأ لاكتشاف الرعاية الصحية حسب التخصصات داخل عُمان.',
          accentClass: 'home-categories__card--doctors'
        },
        {
          key: 'clinics',
          label: 'العيادات',
          description: 'مجهز لمسارات ظهور العيادات محلياً بدعم عربي وإنجليزي.',
          accentClass: 'home-categories__card--clinics'
        },
        {
          key: 'pharmacies',
          label: 'الصيدليات',
          description: 'أساس جاهز لمسارات اكتشاف الصيدليات في مراحل البيانات الموثوقة.',
          accentClass: 'home-categories__card--pharmacies'
        },
        {
          key: 'laboratories',
          label: 'المختبرات',
          description: 'مهيأ لتجارب بحث التحاليل والمختبرات عند توسع المراحل المعتمدة.',
          accentClass: 'home-categories__card--laboratories'
        }
      ]
    }
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return {};
  }

  const copy = homeCopyByLocale[locale as SupportedLocale];

  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: {
      canonical: `/${locale}/${country}`
    }
  };
}

export default async function LocaleCountryHome({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const copy = homeCopyByLocale[safeLocale];

  return (
    <div className="home-foundation" dir={dir} data-country={safeCountry} data-locale={safeLocale}>
      <HomeHero copy={copy.hero} dir={dir} />
      <HomeTrustStrip items={copy.trust} dir={dir} />
      <HomeCategoryPreview
        title={copy.categories.title}
        subtitle={copy.categories.subtitle}
        categories={copy.categories.items}
        dir={dir}
      />
    </div>
  );
}
