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
      title: 'Find healthcare, dental, beauty and wellness providers in Muscat.',
      subtitle:
        'Explore doctors, clinics, pharmacies, labs and services in one trusted Oman-first platform built for clear public discovery.',
      findCare: 'Start exploring',
      forClinics: 'For clinics and centers',
      note: 'Browse by specialty, service or area while richer public profiles are prepared safely.',
      actionsLabel: 'Primary actions',
      highlightsLabel: 'Homepage discovery principles',
      chips: ['Doctors', 'Clinics', 'Pharmacies', 'Labs'],
      highlights: ['Bilingual English and Arabic experience', 'Muscat-first discovery flow', 'Static safe public information']
    },
    search: {
      eyebrow: 'Search entry',
      title: 'Choose how you want to explore care in Muscat',
      description:
        'Use the quick paths below to browse existing public discovery pages. No live provider suggestions, tracking, or private data are used here.',
      primaryLabel: 'Open full search',
      quickLinksLabel: 'Quick discovery paths',
      quickLinks: [
        { key: 'doctors', label: 'Doctors' },
        { key: 'centers', label: 'Clinics and centers' },
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
        'Clear provider profile foundations without fake ratings or review claims',
        'Careful public information with no diagnosis or guaranteed medical results'
      ]
    },
    categories: {
      eyebrow: 'Care categories',
      title: 'Browse trusted discovery paths',
      subtitle: 'Explore approved public route families while future profile depth is prepared through safe phases.',
      items: [
        {
          key: 'doctors',
          label: 'Doctors',
          description: 'Explore doctor discovery pages prepared for specialty-first public navigation.',
          accentClass: 'home-categories__card--doctors'
        },
        {
          key: 'centers',
          label: 'Clinics and centers',
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
      title: 'Explore care around familiar Muscat areas',
      subtitle:
        'Area prompts are shown as simple browsing cues only. They do not represent provider counts, live coverage, or guaranteed availability.',
      ctaLabel: 'Browse centers',
      prompts: ['Al Khuwair', 'Qurum', 'Azaiba', 'Madinat Sultan Qaboos', 'Seeb', 'Ruwi']
    },
    featured: {
      eyebrow: 'Prepared for future highlights',
      title: 'Featured discovery areas are being prepared',
      description:
        'Provider highlights will appear only after the correct review, data, and visibility phases are approved. No fake listings are shown here.',
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
        'DrMuscat helps clinics and centers prepare a cleaner public profile path for patients browsing healthcare, dental, beauty and wellness services in Oman.',
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
      title: 'اكتشف الأطباء والعيادات والصيدليات والمختبرات وخدمات الرعاية في مسقط.',
      subtitle: 'منصة مخصصة لعُمان تساعدك على تصفح الخدمات الصحية والجمالية والرفاهية بسهولة وبحضور عام أوضح.',
      findCare: 'ابدأ التصفح',
      forClinics: 'للمراكز والعيادات',
      note: 'تصفح حسب التخصص أو الخدمة أو المنطقة بينما يتم تجهيز ملفات عامة أكثر تفصيلاً بأمان.',
      actionsLabel: 'الإجراءات الرئيسية',
      highlightsLabel: 'مبادئ اكتشاف الصفحة الرئيسية',
      chips: ['الأطباء', 'العيادات', 'الصيدليات', 'المختبرات'],
      highlights: ['تجربة عربية وإنجليزية', 'مسار اكتشاف يركز على مسقط', 'معلومات عامة آمنة وثابتة']
    },
    search: {
      eyebrow: 'مدخل البحث',
      title: 'اختر طريقة تصفح الرعاية في مسقط',
      description:
        'استخدم المسارات السريعة أدناه لتصفح صفحات الاكتشاف العامة الحالية. لا توجد اقتراحات مباشرة أو تتبع أو استخدام لبيانات خاصة هنا.',
      primaryLabel: 'افتح البحث الكامل',
      quickLinksLabel: 'مسارات تصفح سريعة',
      quickLinks: [
        { key: 'doctors', label: 'الأطباء' },
        { key: 'centers', label: 'العيادات والمراكز' },
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
        'أساس أوضح لملفات مقدمي الخدمة دون تقييمات أو مراجعات غير موجودة',
        'معلومات عامة حذرة دون تشخيص أو نتائج طبية مضمونة'
      ]
    },
    categories: {
      eyebrow: 'فئات الرعاية',
      title: 'تصفح مسارات اكتشاف واضحة',
      subtitle: 'استكشف عائلات المسارات العامة المعتمدة بينما يتم إعداد عمق أكبر للملفات في مراحل آمنة لاحقة.',
      items: [
        {
          key: 'doctors',
          label: 'الأطباء',
          description: 'تصفح صفحات اكتشاف الأطباء المهيأة للتنقل العام حسب التخصص.',
          accentClass: 'home-categories__card--doctors'
        },
        {
          key: 'centers',
          label: 'العيادات والمراكز',
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
      title: 'تصفح الرعاية حول مناطق مألوفة في مسقط',
      subtitle:
        'تظهر المناطق كإشارات تصفح عامة فقط. لا تعبر عن أعداد مقدمي الخدمة أو تغطية مباشرة أو توفر مضمون.',
      ctaLabel: 'تصفح المراكز',
      prompts: ['الخوير', 'القرم', 'العذيبة', 'مدينة السلطان قابوس', 'السيب', 'روي']
    },
    featured: {
      eyebrow: 'قيد التجهيز للمستقبل',
      title: 'يتم تجهيز مناطق الاكتشاف المميزة',
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
        'يساعد DrMuscat العيادات والمراكز على تجهيز مسار ملف عام أوضح للمرضى الذين يتصفحون خدمات الرعاية والصحة والجمال والرفاهية في عُمان.',
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

      <section className="home-search-panel glass-soft" dir={dir} aria-labelledby="home-search-title">
        <div className="home-section-head home-search-panel__intro">
          <p className="home-section-eyebrow">{copy.search.eyebrow}</p>
          <h2 id="home-search-title">{copy.search.title}</h2>
          <p>{copy.search.description}</p>
        </div>
        <div className="home-search-panel__surface" aria-label={copy.search.quickLinksLabel}>
          <Link href={searchHref} className="home-search-panel__main-link">
            <span className="home-search-panel__glass-icon" aria-hidden="true" />
            <span>{copy.search.primaryLabel}</span>
          </Link>
          <div className="home-search-panel__quick-links">
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

      <section className="home-areas glass-soft" dir={dir} aria-labelledby="home-areas-title">
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
            <article key={item.title} className="home-featured-placeholder__card glass-soft">
              <span className="home-featured-placeholder__mark" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-provider-cta glass-strong" dir={dir} aria-labelledby="home-provider-cta-title">
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
