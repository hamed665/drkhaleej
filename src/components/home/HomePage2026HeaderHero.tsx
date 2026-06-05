import Link from 'next/link';
import { HomeSearch2026 } from '@/components/home/HomeSearch2026';
import { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicDiscoveryRoute, publicProviderRoute } from '@/lib/routes/public';

type HomePage2026HeaderHeroProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

type HeaderHeroCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  heroNote: string;
  safetyTitle: string;
  safetyItems: readonly string[];
  visualTitle: string;
  visualItems: readonly string[];
  search: Parameters<typeof HomeSearch2026>[0]['copy'];
};

const home2026Copy: Record<SupportedLocale, HeaderHeroCopy> = {
  en: {
    eyebrow: 'Oman-first public discovery',
    title: 'Find healthcare options in Oman with a calmer search-first experience.',
    subtitle:
      'Explore doctors, clinics, labs, pharmacies and services through a bilingual DrMuscat homepage designed for clear public discovery in Muscat.',
    primaryCta: 'Search healthcare options',
    secondaryCta: 'For providers',
    heroNote: 'Public discovery information only. Confirm details directly with the provider. Not medical advice.',
    safetyTitle: 'Discovery safety',
    safetyItems: ['Public discovery only', 'Confirm details with the provider', 'Not medical advice'],
    visualTitle: 'Muscat-focused discovery',
    visualItems: ['English + Arabic', 'Mobile-safe search', 'No fake ratings'],
    search: {
      eyebrow: 'Search DrMuscat',
      title: 'Start with what you need, then narrow by place and provider type.',
      description: 'Choose a care need, provider type and Muscat area to start exploring public healthcare options in Oman.',
      careNeedLabel: 'Care need, specialty or service',
      careNeedPlaceholder: 'Dentist, dermatology, lab tests, pharmacy...',
      providerTypeLabel: 'Provider type',
      countryLabel: 'Country',
      cityLabel: 'City',
      areaLabel: 'Area',
      searchLabel: 'Search',
      providerLabel: 'List your center',
      staticPreviewLabel: 'General example suggestions',
      staticPreviewNote: 'Suggestions are general examples. Confirm details directly with providers.',
      providerTypes: ['Doctors', 'Clinics / Centers', 'Labs', 'Pharmacies', 'Services'],
      countries: [
        { label: 'Oman' },
        { label: 'UAE — coming soon', disabled: true },
        { label: 'Saudi Arabia — coming soon', disabled: true },
        { label: 'Qatar — coming soon', disabled: true },
        { label: 'Bahrain — coming soon', disabled: true },
        { label: 'Kuwait — coming soon', disabled: true },
        { label: 'Iran — coming soon', disabled: true }
      ],
      cities: [
        { label: 'Muscat' },
        { label: 'Seeb' },
        { label: 'Salalah' },
        { label: 'Sohar' },
        { label: 'Nizwa' }
      ],
      areas: ['Al Khuwair', 'Qurum', 'Azaiba', 'Al Ghubra', 'Ruwi', 'Seeb', 'Madinat Sultan Qaboos'],
      suggestions: ['Dentist', 'Dermatology', 'Pediatrics', 'Lab tests', 'Pharmacy', 'Pet clinic', 'Beauty clinic', 'Al Khuwair', 'Qurum']
    }
  },
  ar: {
    eyebrow: 'اكتشاف عام يبدأ من عُمان',
    title: 'ابحث عن خيارات الرعاية الصحية في عُمان بتجربة هادئة تبدأ من البحث.',
    subtitle:
      'استكشف الأطباء والعيادات والمختبرات والصيدليات والخدمات عبر صفحة DrMuscat ثنائية اللغة والمصممة لاكتشاف عام أوضح في مسقط.',
    primaryCta: 'ابحث عن خيارات الرعاية',
    secondaryCta: 'للمقدّمين',
    heroNote: 'معلومات اكتشاف عامة فقط. يرجى تأكيد التفاصيل مباشرة مع مقدّم الخدمة. ليست نصيحة طبية.',
    safetyTitle: 'سلامة الاكتشاف',
    safetyItems: ['اكتشاف عام فقط', 'أكّد التفاصيل مع مقدّم الخدمة', 'ليست نصيحة طبية'],
    visualTitle: 'اكتشاف يركّز على مسقط',
    visualItems: ['العربية + الإنجليزية', 'بحث مناسب للجوال', 'دون تقييمات وهمية'],
    search: {
      eyebrow: 'ابحث في DrMuscat',
      title: 'ابدأ بما تحتاجه، ثم حدّد المكان ونوع مقدّم الخدمة.',
      description: 'اختر احتياج الرعاية ونوع مقدّم الخدمة والمنطقة في مسقط لبدء استكشاف خيارات عامة في عُمان.',
      careNeedLabel: 'احتياج الرعاية أو التخصص أو الخدمة',
      careNeedPlaceholder: 'طبيب أسنان، جلدية، فحوصات مختبر، صيدلية...',
      providerTypeLabel: 'نوع مقدّم الخدمة',
      countryLabel: 'الدولة',
      cityLabel: 'المدينة',
      areaLabel: 'المنطقة',
      searchLabel: 'بحث',
      providerLabel: 'أدرج مركزك',
      staticPreviewLabel: 'اقتراحات عامة',
      staticPreviewNote: 'الاقتراحات أمثلة عامة فقط. يرجى تأكيد التفاصيل مباشرة مع مقدّمي الخدمة.',
      providerTypes: ['الأطباء', 'العيادات / المراكز', 'المختبرات', 'الصيدليات', 'الخدمات'],
      countries: [
        { label: 'عُمان' },
        { label: 'الإمارات — قريباً', disabled: true },
        { label: 'السعودية — قريباً', disabled: true },
        { label: 'قطر — قريباً', disabled: true },
        { label: 'البحرين — قريباً', disabled: true },
        { label: 'الكويت — قريباً', disabled: true },
        { label: 'إيران — قريباً', disabled: true }
      ],
      cities: [
        { label: 'مسقط' },
        { label: 'السيب' },
        { label: 'صلالة' },
        { label: 'صحار' },
        { label: 'نزوى' }
      ],
      areas: ['الخوير', 'القرم', 'العذيبة', 'الغبرة', 'روي', 'السيب', 'مدينة السلطان قابوس'],
      suggestions: ['طبيب أسنان', 'جلدية', 'طب الأطفال', 'فحوصات مختبر', 'صيدلية', 'عيادة بيطرية', 'عيادة تجميل', 'الخوير', 'القرم']
    }
  }
};

export function HomePage2026HeaderHero({ locale, country, dir }: HomePage2026HeaderHeroProps) {
  const copy = home2026Copy[locale];
  const searchHref = publicDiscoveryRoute(locale, country, 'search');
  const providerHref = publicProviderRoute(locale, country);

  return (
    <section className="dm2026-home-top dm2026-shell" dir={dir} aria-labelledby="dm2026-home-hero-title">
      <div className="dm2026-container dm2026-home-top__container">
        <HomeSearch2026 copy={copy.search} dir={dir} searchHref={searchHref} providerHref={providerHref} />

        <div className="dm2026-home-hero">
          <div className="dm2026-home-hero__copy">
            <span className="dm2026-badge">{copy.eyebrow}</span>
            <h1 id="dm2026-home-hero-title">{copy.title}</h1>
            <p className="dm2026-home-hero__subtitle">{copy.subtitle}</p>
            <div className="dm2026-home-hero__actions">
              <Link href={searchHref} className="dm2026-button dm2026-button-primary">
                {copy.primaryCta}
              </Link>
              <Link href={providerHref} className="dm2026-button dm2026-button-secondary">
                {copy.secondaryCta}
              </Link>
            </div>
            <p className="dm2026-home-hero__note">{copy.heroNote}</p>
          </div>

          <aside className="dm2026-home-visual dm2026-card-glass" aria-label={copy.visualTitle}>
            <div className="dm2026-home-visual__orb" aria-hidden="true" />
            <div className="dm2026-home-visual__panel">
              <span className="dm2026-badge">{copy.visualTitle}</span>
              <ul>
                {copy.visualItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="dm2026-home-safety dm2026-card-soft" aria-label={copy.safetyTitle}>
          <strong>{copy.safetyTitle}</strong>
          <ul>
            {copy.safetyItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
