import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HomeCategoryPreview } from '@/components/home/home-category-preview';
import { HomeHero } from '@/components/home/home-hero';
import { HomeTrustStrip } from '@/components/home/home-trust-strip';
import { publicDiscoveryRoute, publicProviderRoute } from '@/lib/routes/public';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  SupportedCountry,
  SupportedLocale
} from '@/lib/i18n/config';

type Params = { locale: string; country: string };

type DiscoveryKey = 'doctors' | 'centers' | 'pharmacies' | 'labs' | 'services' | 'search';

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
    actionsLabel: string;
    highlightsLabel: string;
    chips: readonly string[];
    highlights: readonly string[];
  };
  search: {
    eyebrow: string;
    title: string;
    description: string;
    primaryLabel: string;
    serviceLabel: string;
    serviceValue: string;
    locationLabel: string;
    locationValue: string;
    quickLinksLabel: string;
    quickLinks: readonly {
      key: DiscoveryKey;
      label: string;
    }[];
  };
  trust: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: readonly string[];
  };
  categories: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: readonly {
      key: DiscoveryKey;
      label: string;
      description: string;
      accentClass: string;
    }[];
  };
  areas: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    prompts: readonly string[];
  };
  featured: {
    eyebrow: string;
    title: string;
    description: string;
    items: readonly {
      title: string;
      description: string;
    }[];
  };
  providerCta: {
    eyebrow: string;
    title: string;
    description: string;
    linkLabel: string;
    supporting: string;
  };
};

const homeCopyByLocale: Record<SupportedLocale, HomeCopy> = {
  en: {
    metadataTitle: 'DrMuscat Oman | Healthcare Discovery Foundation',
    metadataDescription:
      'Find healthcare options in Oman, faster. DrMuscat is building a bilingual healthcare discovery foundation for patients and providers across Oman.',
    hero: {
      announcement: 'Oman-first healthcare discovery',
      title: 'Find trusted healthcare across Muscat.',
      subtitle:
        'Browse doctors, clinics, pharmacies, labs and care services through a calm Oman-first discovery experience.',
      findCare: 'Search care',
      forClinics: 'For providers',
      note: 'Use approved discovery routes while richer public profiles are prepared through safe phases.',
      actionsLabel: 'Primary actions',
      highlightsLabel: 'Homepage discovery principles',
      chips: ['Doctors', 'Clinics', 'Pharmacies', 'Labs'],
      highlights: ['Bilingual English and Arabic flow', 'Muscat-first discovery', 'No invented profile metrics']
    },
    search: {
      eyebrow: 'Search entry',
      title: 'Start with a simple care search',
      description:
        'A static discovery entry shaped like the prototype search rail. It links only to approved public routes and does not run autocomplete or tracking.',
      primaryLabel: 'Open search',
      serviceLabel: 'Care or service',
      serviceValue: 'Doctor, clinic, pharmacy, lab or service',
      locationLabel: 'Location',
      locationValue: 'Muscat, Oman',
      quickLinksLabel: 'Quick discovery paths',
      quickLinks: [
        { key: 'doctors', label: 'Doctors' },
        { key: 'centers', label: 'Centers' },
        { key: 'pharmacies', label: 'Pharmacies' },
        { key: 'labs', label: 'Labs' },
        { key: 'services', label: 'Services' },
        { key: 'search', label: 'Search' }
      ]
    },
    trust: {
      eyebrow: 'Trust and safety',
      title: 'Built for careful public healthcare discovery',
      subtitle:
        'DrMuscat is designed to organize public-facing healthcare information without replacing clinical advice, emergency care, or professional consultation.',
      items: [
        'Bilingual platform for English and Arabic users in Oman',
        'Oman-first navigation shaped around Muscat discovery needs',
        'Clear provider profile foundations without invented score or testimonial claims',
        'Careful public information with no diagnosis or guaranteed medical results'
      ]
    },
    categories: {
      eyebrow: 'Care categories',
      title: 'Browse by category',
      subtitle: 'Choose an approved route family with clear labels and matching links.',
      items: [
        {
          key: 'doctors',
          label: 'Doctors',
          description: 'Explore doctor discovery pages prepared for specialty-first public navigation.',
          accentClass: 'home-categories__card--doctors'
        },
        {
          key: 'centers',
          label: 'Centers',
          description: 'Browse center-focused discovery for clinics, medical centers and public profile foundations.',
          accentClass: 'home-categories__card--clinics'
        },
        {
          key: 'pharmacies',
          label: 'Pharmacies',
          description: 'Use the pharmacy discovery route as the platform prepares structured public visibility.',
          accentClass: 'home-categories__card--pharmacies'
        },
        {
          key: 'labs',
          label: 'Labs',
          description: 'Find the laboratory discovery path for future diagnostic and testing provider surfaces.',
          accentClass: 'home-categories__card--laboratories'
        },
        {
          key: 'services',
          label: 'Services',
          description: 'Browse service-first discovery without claims of availability, booking, or provider ranking.',
          accentClass: 'home-categories__card--services'
        },
        {
          key: 'search',
          label: 'Search',
          description: 'Open the general search surface for a wider healthcare discovery starting point.',
          accentClass: 'home-categories__card--search'
        }
      ]
    },
    areas: {
      eyebrow: 'Muscat discovery',
      title: 'Browse by Muscat area',
      subtitle:
        'Area prompts are shown as simple browsing cues only. They do not represent provider counts, live coverage, or guaranteed availability.',
      ctaLabel: 'Browse centers',
      prompts: ['Al Khuwair', 'Qurum', 'Azaiba', 'Madinat Sultan Qaboos', 'Seeb', 'Ruwi']
    },
    featured: {
      eyebrow: 'Prepared for future highlights',
      title: 'Profile highlights will stay honest',
      description:
        'Provider highlights will appear only after the correct review, data, and visibility phases are approved. No invented listings are shown here.',
      items: [
        {
          title: 'Public profile clarity',
          description: 'Future highlights can help users understand services, contact options and profile completeness.'
        },
        {
          title: 'Review-first presentation',
          description: 'Visible provider highlights should be backed by approved public information before publication.'
        },
        {
          title: 'Mobile-ready discovery',
          description: 'Homepage sections are structured for phones first, then tablets, laptops and desktops.'
        }
      ]
    },
    providerCta: {
      eyebrow: 'For clinics and centers',
      title: 'Build a clearer public presence for your healthcare center.',
      description:
        'DrMuscat helps healthcare providers prepare a cleaner public profile path for patients browsing care services in Oman.',
      linkLabel: 'Learn how to list your center',
      supporting: 'No dashboard, payment, claim approval, or subscription workflow is part of this homepage section.'
    }
  },
  ar: {
    metadataTitle: 'د.مسقط عُمان | أساس اكتشاف الرعاية الصحية',
    metadataDescription:
      'اكتشف الرعاية الصحية في عُمان بسهولة أكبر. يعمل DrMuscat على بناء تجربة ثنائية اللغة لاكتشاف مقدمي الرعاية الصحية للمرضى والجهات الطبية في عُمان.',
    hero: {
      announcement: 'اكتشاف الرعاية في عُمان أولاً',
      title: 'اعثر على رعاية صحية موثوقة في مسقط.',
      subtitle: 'تصفح الأطباء والعيادات والصيدليات والمختبرات وخدمات الرعاية من خلال تجربة هادئة مخصصة لعُمان.',
      findCare: 'ابحث عن رعاية',
      forClinics: 'لمقدمي الرعاية',
      note: 'استخدم مسارات الاكتشاف المعتمدة بينما يتم تجهيز ملفات عامة أكثر تفصيلاً ضمن مراحل آمنة.',
      actionsLabel: 'الإجراءات الرئيسية',
      highlightsLabel: 'مبادئ اكتشاف الصفحة الرئيسية',
      chips: ['الأطباء', 'العيادات', 'الصيدليات', 'المختبرات'],
      highlights: ['تجربة عربية وإنجليزية', 'اكتشاف يركز على مسقط', 'دون مؤشرات ملفات غير حقيقية']
    },
    search: {
      eyebrow: 'مدخل البحث',
      title: 'ابدأ ببحث رعاية بسيط',
      description:
        'مدخل اكتشاف ثابت مستوحى من نموذج البحث في التصميم. يربط فقط بالمسارات العامة المعتمدة دون اقتراحات تلقائية أو تتبع.',
      primaryLabel: 'افتح البحث',
      serviceLabel: 'الرعاية أو الخدمة',
      serviceValue: 'طبيب أو مركز أو صيدلية أو مختبر أو خدمة',
      locationLabel: 'الموقع',
      locationValue: 'مسقط، عُمان',
      quickLinksLabel: 'مسارات تصفح سريعة',
      quickLinks: [
        { key: 'doctors', label: 'الأطباء' },
        { key: 'centers', label: 'المراكز' },
        { key: 'pharmacies', label: 'الصيدليات' },
        { key: 'labs', label: 'المختبرات' },
        { key: 'services', label: 'الخدمات' },
        { key: 'search', label: 'البحث' }
      ]
    },
    trust: {
      eyebrow: 'الثقة والسلامة',
      title: 'مصممة لاكتشاف معلومات الرعاية العامة بعناية',
      subtitle:
        'يساعد DrMuscat على تنظيم معلومات الرعاية الصحية العامة دون أن يكون بديلاً عن الاستشارة الطبية أو خدمات الطوارئ أو رأي المختص.',
      items: [
        'منصة ثنائية اللغة للمستخدمين بالعربية والإنجليزية في عُمان',
        'تنقل يركز على عُمان واحتياجات التصفح داخل مسقط',
        'أساس أوضح لملفات مقدمي الخدمة دون درجات أو شهادات غير موجودة',
        'معلومات عامة حذرة دون تشخيص أو نتائج طبية مضمونة'
      ]
    },
    categories: {
      eyebrow: 'فئات الرعاية',
      title: 'تصفح حسب الفئة',
      subtitle: 'اختر عائلة مسار معتمدة مع تسميات وروابط متطابقة بوضوح.',
      items: [
        {
          key: 'doctors',
          label: 'الأطباء',
          description: 'تصفح صفحات اكتشاف الأطباء المهيأة للتنقل العام حسب التخصص.',
          accentClass: 'home-categories__card--doctors'
        },
        {
          key: 'centers',
          label: 'المراكز',
          description: 'تصفح مسار المراكز للعيادات والمراكز الطبية وأساس الملفات العامة.',
          accentClass: 'home-categories__card--clinics'
        },
        {
          key: 'pharmacies',
          label: 'الصيدليات',
          description: 'استخدم مسار اكتشاف الصيدليات بينما يتم تجهيز ظهور عام منظم لاحقاً.',
          accentClass: 'home-categories__card--pharmacies'
        },
        {
          key: 'labs',
          label: 'المختبرات',
          description: 'افتح مسار المختبرات المخصص مستقبلاً لواجهات التشخيص والفحوصات.',
          accentClass: 'home-categories__card--laboratories'
        },
        {
          key: 'services',
          label: 'الخدمات',
          description: 'تصفح مسار الخدمات دون ادعاءات عن التوفر أو الحجز أو ترتيب مقدمي الخدمة.',
          accentClass: 'home-categories__card--services'
        },
        {
          key: 'search',
          label: 'البحث',
          description: 'افتح صفحة البحث العامة كنقطة بداية أوسع لاكتشاف الرعاية.',
          accentClass: 'home-categories__card--search'
        }
      ]
    },
    areas: {
      eyebrow: 'اكتشاف مسقط',
      title: 'تصفح حسب منطقة في مسقط',
      subtitle:
        'تظهر المناطق كإشارات تصفح عامة فقط. لا تعبر عن أعداد مقدمي الخدمة أو تغطية مباشرة أو توفر مضمون.',
      ctaLabel: 'تصفح المراكز',
      prompts: ['الخوير', 'القرم', 'العذيبة', 'مدينة السلطان قابوس', 'السيب', 'روي']
    },
    featured: {
      eyebrow: 'قيد التجهيز للمستقبل',
      title: 'ستبقى إبرازات الملفات صادقة',
      description:
        'ستظهر أبرز الملفات فقط بعد اعتماد مراحل المراجعة والبيانات والظهور المناسبة. لا يتم عرض أي قوائم وهمية هنا.',
      items: [
        {
          title: 'وضوح الملفات العامة',
          description: 'يمكن أن تساعد الميزات المستقبلية المستخدم على فهم الخدمات وخيارات التواصل واكتمال الملف.'
        },
        {
          title: 'عرض مبني على المراجعة',
          description: 'يجب أن تستند أبرز الملفات الظاهرة إلى معلومات عامة معتمدة قبل النشر.'
        },
        {
          title: 'اكتشاف مناسب للجوال',
          description: 'تم ترتيب أقسام الصفحة للجوال أولاً ثم للأجهزة اللوحية والحواسيب.'
        }
      ]
    },
    providerCta: {
      eyebrow: 'للمراكز والعيادات',
      title: 'ابنِ حضوراً عاماً أوضح لمركزك الصحي.',
      description:
        'يساعد DrMuscat مقدمي الرعاية الصحية على تجهيز مسار ملف عام أوضح للمرضى الذين يتصفحون خدمات الرعاية في عُمان.',
      linkLabel: 'تعرّف على طريقة إدراج مركزك',
      supporting: 'لا يتضمن هذا القسم لوحة تحكم أو دفعاً أو اعتماد مطالبات أو اشتراكات.'
    }
  }
};

const discoverySlugByKey: Record<DiscoveryKey, DiscoveryKey> = {
  doctors: 'doctors',
  centers: 'centers',
  pharmacies: 'pharmacies',
  labs: 'labs',
  services: 'services',
  search: 'search'
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
  const searchHref = publicDiscoveryRoute(safeLocale, safeCountry, 'search');
  const centersHref = publicDiscoveryRoute(safeLocale, safeCountry, 'centers');
  const providerHref = publicProviderRoute(safeLocale, safeCountry);

  return (
    <div className="home-foundation" dir={dir} data-country={safeCountry} data-locale={safeLocale}>
      <HomeHero copy={copy.hero} dir={dir} primaryHref={searchHref} secondaryHref={providerHref} />

      <section className="home-search-panel" dir={dir} aria-labelledby="home-search-title">
        <div className="home-section-head home-search-panel__intro">
          <p className="home-section-eyebrow">{copy.search.eyebrow}</p>
          <h2 id="home-search-title">{copy.search.title}</h2>
          <p>{copy.search.description}</p>
        </div>
        <div className="home-search-panel__surface" aria-label={copy.search.quickLinksLabel}>
          <div className="home-search-panel__field">
            <span className="home-search-panel__field-label">{copy.search.serviceLabel}</span>
            <span className="home-search-panel__field-value">{copy.search.serviceValue}</span>
          </div>
          <div className="home-search-panel__field">
            <span className="home-search-panel__field-label">{copy.search.locationLabel}</span>
            <span className="home-search-panel__field-value">{copy.search.locationValue}</span>
          </div>
          <Link href={searchHref} className="home-search-panel__main-link">
            <span className="home-search-panel__glass-icon" aria-hidden="true" />
            <span>{copy.search.primaryLabel}</span>
          </Link>
        </div>
        <div className="home-search-panel__quick-links" aria-label={copy.search.quickLinksLabel}>
          {copy.search.quickLinks.map((link) => (
            <Link
              key={link.key}
              href={publicDiscoveryRoute(safeLocale, safeCountry, discoverySlugByKey[link.key])}
              className="home-search-panel__quick-link"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <HomeCategoryPreview
        eyebrow={copy.categories.eyebrow}
        title={copy.categories.title}
        subtitle={copy.categories.subtitle}
        categories={copy.categories.items.map((item) => ({
          ...item,
          href: publicDiscoveryRoute(safeLocale, safeCountry, discoverySlugByKey[item.key])
        }))}
        dir={dir}
      />

      <section className="home-areas" dir={dir} aria-labelledby="home-areas-title">
        <div className="home-section-head">
          <p className="home-section-eyebrow">{copy.areas.eyebrow}</p>
          <h2 id="home-areas-title">{copy.areas.title}</h2>
          <p>{copy.areas.subtitle}</p>
        </div>
        <div className="home-areas__body">
          <div className="home-areas__prompts" aria-label={copy.areas.title}>
            {copy.areas.prompts.map((prompt) => (
              <Link key={prompt} href={searchHref} className="home-areas__prompt">
                {prompt}
              </Link>
            ))}
          </div>
          <Link href={centersHref} className="ui-button ui-button--secondary ui-button--lg home-areas__cta">
            {copy.areas.ctaLabel}
          </Link>
        </div>
      </section>

      <HomeTrustStrip eyebrow={copy.trust.eyebrow} title={copy.trust.title} subtitle={copy.trust.subtitle} items={copy.trust.items} dir={dir} />

      <section className="home-featured-placeholder" dir={dir} aria-labelledby="home-featured-title">
        <div className="home-section-head">
          <p className="home-section-eyebrow">{copy.featured.eyebrow}</p>
          <h2 id="home-featured-title">{copy.featured.title}</h2>
          <p>{copy.featured.description}</p>
        </div>
        <div className="home-featured-placeholder__grid">
          {copy.featured.items.map((item) => (
            <article key={item.title} className="home-featured-placeholder__card">
              <span className="home-featured-placeholder__mark" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-provider-cta" dir={dir} aria-labelledby="home-provider-cta-title">
        <div className="home-provider-cta__copy">
          <p className="home-section-eyebrow">{copy.providerCta.eyebrow}</p>
          <h2 id="home-provider-cta-title">{copy.providerCta.title}</h2>
          <p>{copy.providerCta.description}</p>
          <p className="home-provider-cta__supporting">{copy.providerCta.supporting}</p>
        </div>
        <Link href={providerHref} className="ui-button ui-button--primary ui-button--lg home-provider-cta__link">
          {copy.providerCta.linkLabel}
        </Link>
      </section>
    </div>
  );
}
