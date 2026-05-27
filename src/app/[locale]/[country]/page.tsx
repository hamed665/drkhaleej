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
    findCare: string;
    forClinics: string;
    note: string;
    chips: readonly string[];
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
    metadataTitle: 'DrMuscat Oman | Healthcare Discovery Foundation',
    metadataDescription:
      'Find trusted healthcare in Oman, faster. DrMuscat is building a bilingual healthcare discovery foundation for patients and providers across Oman.',
    hero: {
      announcement: 'Oman-first bilingual healthcare discovery',
      title: 'Find trusted healthcare in Oman, faster.',
      subtitle:
        'DrMuscat is building a bilingual healthcare discovery experience for patients and providers across Oman.',
      findCare: 'Find care',
      forClinics: 'For clinics',
      note: 'Richer provider profiles and discovery tools are rolling out in upcoming phases.',
      chips: ['Doctors', 'Clinics', 'Pharmacies', 'Labs']
    },
    trust: [
      'Bilingual experience designed for English and Arabic users',
      'Oman-first healthcare discovery with GCC-ready foundations',
      'Built for future verified provider data workflows',
      'SEO-ready visibility architecture for healthcare providers'
    ],
    categories: {
      title: 'Future care categories in progress',
      subtitle: 'Structured to expand safely as provider data and coverage phases are approved.',
      items: [
        {
          key: 'doctors',
          label: 'Doctors',
          description: 'Specialty-first discovery framework prepared for future profile enrichment.',
          accentClass: 'home-categories__card--doctors'
        },
        {
          key: 'clinics',
          label: 'Clinics',
          description: 'Location-ready clinic visibility foundation aligned with Oman-first navigation.',
          accentClass: 'home-categories__card--clinics'
        },
        {
          key: 'pharmacies',
          label: 'Pharmacies',
          description: 'Prepared for future pharmacy discovery and structured local availability signals.',
          accentClass: 'home-categories__card--pharmacies'
        },
        {
          key: 'laboratories',
          label: 'Laboratories',
          description: 'Built to support upcoming diagnostic and laboratory provider surfaces.',
          accentClass: 'home-categories__card--laboratories'
        }
      ]
    }
  },
  ar: {
    metadataTitle: 'د.مسقط عُمان | أساس اكتشاف الرعاية الصحية',
    metadataDescription:
      'اكتشف الرعاية الصحية في عُمان بسهولة أكبر. يعمل DrMuscat على بناء تجربة ثنائية اللغة لاكتشاف مقدمي الرعاية الصحية للمرضى والجهات الطبية في عُمان.',
    hero: {
      announcement: 'منصة عُمانية لاكتشاف الرعاية الصحية بثنائية اللغة',
      title: 'اكتشف الرعاية الصحية في عُمان بسهولة أكبر.',
      subtitle: 'يبني DrMuscat تجربة ثنائية اللغة لاكتشاف مقدمي الرعاية الصحية للمرضى والجهات الطبية في عُمان.',
      findCare: 'ابحث عن رعاية',
      forClinics: 'للعيادات',
      note: 'سيتم إطلاق ملفات مقدمي الرعاية وميزات اكتشاف أكثر تفصيلاً في المراحل القادمة.',
      chips: ['الأطباء', 'العيادات', 'الصيدليات', 'المختبرات']
    },
    trust: [
      'تجربة ثنائية اللغة مصممة للمستخدمين بالعربية والإنجليزية',
      'اكتشاف رعاية صحية يركز على عُمان مع جاهزية للتوسع الخليجي',
      'مبنية لدعم تدفقات بيانات مقدمي الخدمة الموثقة مستقبلاً',
      'أساس ظهور رقمي متوافق مع متطلبات SEO لمقدمي الرعاية الصحية'
    ],
    categories: {
      title: 'فئات رعاية مستقبلية قيد التطوير',
      subtitle: 'تم إعداد الهيكل للتوسع الآمن مع اعتماد مراحل البيانات والتغطية القادمة.',
      items: [
        {
          key: 'doctors',
          label: 'الأطباء',
          description: 'هيكل اكتشاف قائم على التخصصات ومهيأ لتوسيع الملفات التعريفية لاحقاً.',
          accentClass: 'home-categories__card--doctors'
        },
        {
          key: 'clinics',
          label: 'العيادات',
          description: 'أساس ظهور للعيادات مهيأ للمواقع ومتوافق مع التنقل المحلي داخل عُمان.',
          accentClass: 'home-categories__card--clinics'
        },
        {
          key: 'pharmacies',
          label: 'الصيدليات',
          description: 'مهيأ لدعم اكتشاف الصيدليات وإشارات التوفر المحلي المنظمة مستقبلاً.',
          accentClass: 'home-categories__card--pharmacies'
        },
        {
          key: 'laboratories',
          label: 'المختبرات',
          description: 'أساس جاهز لدعم واجهات مقدمي خدمات التشخيص والمختبرات في المراحل القادمة.',
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
