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
    title: 'Discover doctors, clinics, labs, pharmacies and care services in Oman.',
    subtitle:
      'A premium bilingual DrMuscat experience for Muscat and Oman discovery. Start broad, compare public options, then confirm details directly with providers.',
    primaryCta: 'Search healthcare options',
    secondaryCta: 'For providers',
    heroNote: 'Public discovery information only. Confirm details directly with the provider. Not medical advice.',
    safetyTitle: 'Discovery safety',
    safetyItems: ['Public discovery only', 'Confirm details with the provider', 'Not medical advice'],
    visualTitle: 'Premium Oman discovery shell',
    visualItems: ['English + Arabic', 'Search-first command center', 'Provider visibility ready'],
    search: {
      eyebrow: 'Search DrMuscat',
      title: 'Search doctors, clinics, services, offers and guides from one command center.',
      description: 'Use the premium filters to explore by provider type, specialty, country, city, area and content type. This is public discovery, not live booking.',
      careNeedLabel: 'Care need, specialty or service',
      careNeedPlaceholder: 'Search doctors, clinics, services, areas…',
      providerTypeLabel: 'Provider type',
      specialtyLabel: 'Specialty or service',
      countryLabel: 'Country',
      cityLabel: 'City',
      areaLabel: 'Area',
      contentTypeLabel: 'Content type',
      searchLabel: 'Search',
      providerLabel: 'List your center',
      staticPreviewLabel: 'General example suggestions',
      staticPreviewNote: 'Suggestions are general examples. Confirm details directly with providers.',
      providerTypes: ['Doctors', 'Clinics / Centers', 'Hospitals', 'Labs', 'Pharmacies', 'Beauty & Wellness', 'Pet Clinics', 'Services'],
      countries: [
        { label: 'Oman' },
        { label: 'UAE — coming soon', disabled: true },
        { label: 'Saudi Arabia — coming soon', disabled: true },
        { label: 'Qatar — coming soon', disabled: true },
        { label: 'Bahrain — coming soon', disabled: true },
        { label: 'Kuwait — coming soon', disabled: true },
        { label: 'Iran — coming soon', disabled: true }
      ],
      cities: ['Muscat', 'Seeb', 'Bawshar', 'Muttrah', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Ibri', 'Rustaq', 'Barka', 'Duqm'],
      areas: ['Al Khuwair', 'Qurum', 'Azaiba', 'Al Ghubra', 'Ruwi', 'Muttrah', 'Seeb', 'Bawshar', 'Madinat Sultan Qaboos', 'Ghala', 'Al Hail', 'Al Mouj', 'Muscat Hills', 'Wadi Kabir', 'Darsait', 'Al Amerat', 'Mabela'],
      contentTypes: ['Doctors', 'Clinics', 'Hospitals', 'Labs', 'Pharmacies', 'Services', 'Offers', 'Articles'],
      specialties: ['Dentist', 'Dermatology', 'Pediatrics', 'Gynecology', 'ENT', 'Orthopedics', 'Ophthalmology', 'General Practice', 'Cardiology', 'Physiotherapy', 'Lab tests', 'Dental cleaning', 'Skin clinic', 'Laser hair removal', 'Pharmacy', 'Pet clinic', 'Nutrition', 'Mental health', 'Beauty clinic', 'Wellness center']
    }
  },
  ar: {
    eyebrow: 'اكتشاف عام يبدأ من عُمان',
    title: 'اكتشف خيارات الرعاية الصحية في عُمان',
    subtitle:
      'تجربة DrMuscat مميزة بثنائية اللغة لاكتشاف الرعاية في مسقط وعُمان. ابدأ من البحث ثم أكّد التفاصيل مباشرة مع مقدّمي الخدمة.',
    primaryCta: 'ابحث عن خيارات الرعاية',
    secondaryCta: 'للمقدّمين',
    heroNote: 'معلومات اكتشاف عامة فقط. يرجى تأكيد التفاصيل مباشرة مع مقدّم الخدمة. ليست نصيحة طبية.',
    safetyTitle: 'سلامة الاكتشاف',
    safetyItems: ['اكتشاف عام فقط', 'أكّد التفاصيل مع مقدّم الخدمة', 'ليست نصيحة طبية'],
    visualTitle: 'واجهة اكتشاف مميزة لعُمان',
    visualItems: ['العربية + الإنجليزية', 'مركز بحث متقدم', 'جاهزية لظهور المقدّمين'],
    search: {
      eyebrow: 'ابحث في DrMuscat',
      title: 'ابحث عن الأطباء والعيادات والخدمات والعروض والأدلة من مركز واحد.',
      description: 'استخدم المرشحات المميزة للاستكشاف حسب نوع المقدّم والتخصص والدولة والمدينة والمنطقة ونوع المحتوى. هذه تجربة اكتشاف عام وليست حجزاً مباشراً.',
      careNeedLabel: 'احتياج الرعاية أو التخصص أو الخدمة',
      careNeedPlaceholder: 'ابحث عن طبيب، عيادة، خدمة أو منطقة…',
      providerTypeLabel: 'نوع مقدّم الخدمة',
      specialtyLabel: 'التخصص أو الخدمة',
      countryLabel: 'الدولة',
      cityLabel: 'المدينة',
      areaLabel: 'المنطقة',
      contentTypeLabel: 'نوع المحتوى',
      searchLabel: 'بحث',
      providerLabel: 'أدرج مركزك',
      staticPreviewLabel: 'اقتراحات عامة',
      staticPreviewNote: 'الاقتراحات أمثلة عامة فقط. يرجى تأكيد التفاصيل مباشرة مع مقدّمي الخدمة.',
      providerTypes: ['الأطباء', 'العيادات / المراكز', 'المستشفيات', 'المختبرات', 'الصيدليات', 'الجمال والرفاهية', 'العيادات البيطرية', 'الخدمات'],
      countries: [
        { label: 'عُمان' },
        { label: 'الإمارات — قريباً', disabled: true },
        { label: 'السعودية — قريباً', disabled: true },
        { label: 'قطر — قريباً', disabled: true },
        { label: 'البحرين — قريباً', disabled: true },
        { label: 'الكويت — قريباً', disabled: true },
        { label: 'إيران — قريباً', disabled: true }
      ],
      cities: ['مسقط', 'السيب', 'بوشر', 'مطرح', 'صلالة', 'صحار', 'نزوى', 'صور', 'عبري', 'الرستاق', 'بركاء', 'الدقم'],
      areas: ['الخوير', 'القرم', 'العذيبة', 'الغبرة', 'روي', 'مطرح', 'السيب', 'بوشر', 'مدينة السلطان قابوس', 'غلا', 'الحيل', 'الموج', 'مسقط هيلز', 'وادي الكبير', 'دارسيت', 'العامرات', 'المعبيلة'],
      contentTypes: ['الأطباء', 'العيادات', 'المستشفيات', 'المختبرات', 'الصيدليات', 'الخدمات', 'العروض', 'المقالات'],
      specialties: ['طبيب أسنان', 'جلدية', 'طب الأطفال', 'نساء وولادة', 'أنف وأذن وحنجرة', 'عظام', 'عيون', 'طب عام', 'قلب', 'علاج طبيعي', 'فحوصات مختبر', 'تنظيف الأسنان', 'عيادة جلدية', 'إزالة الشعر بالليزر', 'صيدلية', 'عيادة بيطرية', 'تغذية', 'صحة نفسية', 'عيادة تجميل', 'مركز رفاهية']
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
