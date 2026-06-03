import Link from 'next/link';
import { localeDirection, type SupportedCountry, type SupportedLocale } from '@/lib/i18n/config';
import { publicDiscoveryRoute, publicProviderRoute } from '@/lib/routes/public';

type DiscoveryKey = 'doctors' | 'centers' | 'pharmacies' | 'labs' | 'services' | 'search';

type DesignLabCopy = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  locationCue: string;
  primaryCta: string;
  secondaryCta: string;
  categoriesLabel: string;
  areaTitle: string;
  areaText: string;
  trustTitle: string;
  trustText: string;
  providerTitle: string;
  providerText: string;
  previewNote: string;
  categories: readonly { key: DiscoveryKey; label: string; text: string }[];
};

const copyByLocale: Record<SupportedLocale, DesignLabCopy> = {
  en: {
    eyebrow: 'Design lab preview',
    heading: 'Find trusted healthcare in Muscat.',
    subtitle:
      'Browse doctors, clinics, pharmacies, labs and care services through a calm Oman-focused discovery experience.',
    searchLabel: 'What are you looking for?',
    searchPlaceholder: 'Doctor, clinic, pharmacy, lab or service',
    locationCue: 'Muscat, Oman',
    primaryCta: 'Search care',
    secondaryCta: 'List your center',
    categoriesLabel: 'Quick discovery paths',
    areaTitle: 'Start with familiar Muscat areas',
    areaText:
      'Use location prompts as a visual planning aid for the future homepage. They do not represent provider counts, rankings, or availability.',
    trustTitle: 'Built for careful healthcare discovery',
    trustText:
      'This preview prioritizes clear navigation, safe public information, and no unsupported ratings, reviews, or medical claims.',
    providerTitle: 'For healthcare providers',
    providerText:
      'A safe listing path can help centers prepare public visibility without payments, dashboards, or claim approvals in this phase.',
    previewNote: 'No live search, autocomplete, tracking, provider data, ratings, reviews, or availability are included.',
    categories: [
      { key: 'doctors', label: 'Doctors', text: 'Browse doctor discovery' },
      { key: 'centers', label: 'Centers', text: 'Explore clinics and centers' },
      { key: 'pharmacies', label: 'Pharmacies', text: 'Find pharmacy paths' },
      { key: 'labs', label: 'Labs', text: 'Open lab discovery' },
      { key: 'services', label: 'Services', text: 'Browse care services' },
      { key: 'search', label: 'Search', text: 'Start broad discovery' }
    ]
  },
  ar: {
    eyebrow: 'معاينة مختبر التصميم',
    heading: 'ابحث عن رعاية صحية موثوقة في مسقط.',
    subtitle:
      'تصفح الأطباء والعيادات والصيدليات والمختبرات وخدمات الرعاية من خلال تجربة هادئة مخصصة لعُمان.',
    searchLabel: 'ما الذي تبحث عنه؟',
    searchPlaceholder: 'طبيب، عيادة، صيدلية، مختبر أو خدمة',
    locationCue: 'مسقط، عُمان',
    primaryCta: 'ابحث عن رعاية',
    secondaryCta: 'أدرج مركزك',
    categoriesLabel: 'مسارات اكتشاف سريعة',
    areaTitle: 'ابدأ بمناطق مألوفة في مسقط',
    areaText:
      'تُستخدم إشارات الموقع كمساعدة بصرية لتخطيط الصفحة الرئيسية المستقبلية. لا تعبّر عن أعداد مقدمي الخدمة أو ترتيبهم أو توفرهم.',
    trustTitle: 'مصممة لاكتشاف الرعاية بعناية',
    trustText:
      'تعطي هذه المعاينة الأولوية للتنقل الواضح والمعلومات العامة الآمنة دون تقييمات أو مراجعات أو ادعاءات طبية غير مدعومة.',
    providerTitle: 'لمقدمي الرعاية الصحية',
    providerText:
      'يمكن لمسار إدراج آمن أن يساعد المراكز على تجهيز ظهور عام دون مدفوعات أو لوحات تحكم أو اعتماد مطالبات في هذه المرحلة.',
    previewNote: 'لا تتضمن هذه المعاينة بحثاً مباشراً أو إكمالاً تلقائياً أو تتبعاً أو بيانات مقدمي خدمة أو تقييمات أو مراجعات أو توفر.',
    categories: [
      { key: 'doctors', label: 'الأطباء', text: 'تصفح اكتشاف الأطباء' },
      { key: 'centers', label: 'المراكز', text: 'استكشف العيادات والمراكز' },
      { key: 'pharmacies', label: 'الصيدليات', text: 'افتح مسارات الصيدليات' },
      { key: 'labs', label: 'المختبرات', text: 'افتح اكتشاف المختبرات' },
      { key: 'services', label: 'الخدمات', text: 'تصفح خدمات الرعاية' },
      { key: 'search', label: 'البحث', text: 'ابدأ اكتشافاً أوسع' }
    ]
  }
};

const areaPrompts: Record<SupportedLocale, readonly string[]> = {
  en: ['Al Khuwair', 'Qurum', 'Madinat Sultan Qaboos'],
  ar: ['الخوير', 'القرم', 'مدينة السلطان قابوس']
};

type HomeDesignLabProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
};

export function HomeDesignLab({ locale, country }: HomeDesignLabProps) {
  const copy = copyByLocale[locale];
  const dir = localeDirection(locale);
  const searchHref = publicDiscoveryRoute(locale, country, 'search');
  const providerHref = publicProviderRoute(locale, country);

  return (
    <div className="home-design-lab" dir={dir} data-locale={locale} data-country={country}>
      <section className="home-design-lab__hero" aria-labelledby="home-design-lab-title">
        <div className="home-design-lab__intro">
          <p className="home-design-lab__eyebrow">{copy.eyebrow}</p>
          <h1 id="home-design-lab-title">{copy.heading}</h1>
          <p className="home-design-lab__subtitle">{copy.subtitle}</p>
        </div>

        <div className="home-design-lab__search-card" aria-label={copy.searchLabel}>
          <div className="home-design-lab__search-fields">
            <div className="home-design-lab__search-field">
              <span>{copy.searchLabel}</span>
              <strong>{copy.searchPlaceholder}</strong>
            </div>
            <div className="home-design-lab__location-field">
              <span>{copy.locationCue}</span>
            </div>
          </div>
          <div className="home-design-lab__actions">
            <Link href={searchHref} className="home-design-lab__button home-design-lab__button--primary">
              {copy.primaryCta}
            </Link>
            <Link href={providerHref} className="home-design-lab__button home-design-lab__button--secondary">
              {copy.secondaryCta}
            </Link>
          </div>
        </div>

        <nav className="home-design-lab__chips" aria-label={copy.categoriesLabel}>
          {copy.categories.map((category) => (
            <Link
              key={category.key}
              href={publicDiscoveryRoute(locale, country, category.key)}
              className="home-design-lab__chip"
            >
              <span>{category.label}</span>
              <small>{category.text}</small>
            </Link>
          ))}
        </nav>
      </section>

      <section className="home-design-lab__grid" aria-label={copy.areaTitle}>
        <article className="home-design-lab__panel home-design-lab__panel--areas">
          <h2>{copy.areaTitle}</h2>
          <p>{copy.areaText}</p>
          <div className="home-design-lab__areas" aria-label={copy.areaTitle}>
            {areaPrompts[locale].map((area) => (
              <span key={area}>{area}</span>
            ))}
          </div>
        </article>
        <article className="home-design-lab__panel home-design-lab__panel--trust">
          <h2>{copy.trustTitle}</h2>
          <p>{copy.trustText}</p>
          <p className="home-design-lab__note">{copy.previewNote}</p>
        </article>
        <article className="home-design-lab__panel home-design-lab__panel--provider">
          <h2>{copy.providerTitle}</h2>
          <p>{copy.providerText}</p>
          <Link href={providerHref} className="home-design-lab__text-link">
            {copy.secondaryCta}
          </Link>
        </article>
      </section>
    </div>
  );
}
