import { HomeDiscoveryCategories2026 } from '@/components/home/HomeDiscoveryCategories2026';
import { HomeFeaturedBoard2026 } from '@/components/home/HomeFeaturedBoard2026';
import { HomeProviderCTA2026 } from '@/components/home/HomeProviderCTA2026';
import { HomeSpecialOffersShowcase2026 } from '@/components/home/HomeSpecialOffersShowcase2026';
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
      description: 'Use premium filters to explore public discovery by provider type, specialty, city and area.',
      careNeedLabel: 'Care need, specialty or service',
      careNeedPlaceholder: 'Search doctors, clinics, services, offers or areas…',
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
      moreLabel: 'More',
      suggestionPreviewCta: 'Use this suggestion',
      cityWideAreaLabel: 'City-wide discovery',
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
      cityAreas: {
        Muscat: ['Al Khuwair', 'Qurum', 'Azaiba', 'Al Ghubra', 'Ruwi', 'Muttrah', 'Seeb', 'Bawshar', 'Madinat Sultan Qaboos', 'Ghala', 'Al Hail', 'Al Mouj', 'Muscat Hills', 'Wadi Kabir', 'Darsait', 'Al Amerat', 'Mabela'],
        Salalah: ['Al Haffa', 'Salalah Gardens', 'Al Wadi', 'Awqad', 'Dahariz', 'Raysut'],
        Sohar: ['Sohar Center', 'Al Hambar', 'Falaj Al Qabail', 'Al Batinah'],
        Seeb: ['Al Hail', 'Al Mouj', 'Mabela', 'Al Khoudh', 'Seeb Souq']
      },
      contentTypes: ['Doctors', 'Clinics', 'Hospitals', 'Labs', 'Pharmacies', 'Services', 'Offers', 'Articles'],
      specialties: ['Dentist', 'Dermatology', 'Pediatrics', 'Gynecology', 'ENT', 'Orthopedics', 'General Practice', 'Lab tests', 'Dental cleaning', 'Skin clinic', 'Pharmacy', 'Pet clinic', 'Beauty clinic', 'Wellness center'],
      suggestions: [
        { label: 'Dentist', group: 'Services', helper: 'Explore dental care options' },
        { label: 'Dermatology', group: 'Services', helper: 'Browse skin clinic discovery paths' },
        { label: 'Lab tests', group: 'Services', helper: 'Find laboratory-related discovery paths' },
        { label: 'Laser hair removal', group: 'Services', helper: 'Explore beauty and wellness service paths' },
        { label: 'Doctors', group: 'Provider types', helper: 'Explore doctor discovery pages' },
        { label: 'Labs', group: 'Provider types', helper: 'Explore laboratory provider paths' },
        { label: 'Pet clinic', group: 'Provider types', helper: 'Explore pet care discovery paths' },
        { label: 'Al Khuwair', group: 'Areas', helper: 'Explore public discovery around Al Khuwair' },
        { label: 'Qurum', group: 'Areas', helper: 'Explore public discovery around Qurum' },
        { label: 'Al Hail', group: 'Areas', helper: 'Explore public discovery around Al Hail' },
        { label: 'Clinics in Qurum', group: 'Areas', helper: 'Generic clinic discovery around Qurum' },
        { label: 'Pharmacy near Qurum', group: 'Areas', helper: 'Generic pharmacy discovery around Qurum' },
        { label: 'Dental offers', group: 'Offers', helper: 'Provider-approved offers can appear after review' },
        { label: 'Pet clinic offers', group: 'Offers', helper: 'Approved pet care offers can appear after review' },
        { label: 'Dental guide', group: 'Guides', helper: 'Educational guide preview' },
        { label: 'Choosing a clinic', group: 'Guides', helper: 'Educational guide preview' },
        { label: 'Pet care guide', group: 'Guides', helper: 'Educational guide preview' }
      ]
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
      description: 'استخدم المرشحات لاستكشاف الخيارات العامة حسب نوع المقدم والتخصص والمدينة والمنطقة.',
      careNeedLabel: 'احتياج الرعاية أو التخصص أو الخدمة',
      careNeedPlaceholder: 'ابحث عن طبيب، عيادة، خدمة، عرض أو منطقة…',
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
      moreLabel: 'المزيد',
      suggestionPreviewCta: 'استخدام هذا الاقتراح',
      cityWideAreaLabel: 'اكتشاف على مستوى المدينة',
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
      cityAreas: {
        'مسقط': ['الخوير', 'القرم', 'العذيبة', 'الغبرة', 'روي', 'مطرح', 'السيب', 'بوشر', 'مدينة السلطان قابوس', 'غلا', 'الحيل', 'الموج', 'مسقط هيلز', 'وادي الكبير', 'دارسيت', 'العامرات', 'المعبيلة'],
        'صلالة': ['الحافة', 'صلالة جاردنز', 'الوادي', 'عوقد', 'الدهاريز', 'ريسوت'],
        'صحار': ['مركز صحار', 'الهمبار', 'فلج القبائل', 'الباطنة'],
        'السيب': ['الحيل', 'الموج', 'المعبيلة', 'الخوض', 'سوق السيب']
      },
      contentTypes: ['الأطباء', 'العيادات', 'المستشفيات', 'المختبرات', 'الصيدليات', 'الخدمات', 'العروض', 'المقالات'],
      specialties: ['طبيب أسنان', 'جلدية', 'طب الأطفال', 'نساء وولادة', 'أنف وأذن وحنجرة', 'عظام', 'طب عام', 'فحوصات مختبر', 'تنظيف الأسنان', 'عيادة جلدية', 'صيدلية', 'عيادة بيطرية', 'عيادة تجميل', 'مركز رفاهية'],
      suggestions: [
        { label: 'طبيب أسنان', group: 'الخدمات', helper: 'استكشف خيارات رعاية الأسنان' },
        { label: 'جلدية', group: 'الخدمات', helper: 'استكشف مسارات عيادات الجلدية' },
        { label: 'فحوصات مختبر', group: 'الخدمات', helper: 'مسارات اكتشاف مرتبطة بالمختبرات' },
        { label: 'تنظيف الأسنان', group: 'الخدمات', helper: 'استكشف خيارات رعاية الأسنان' },
        { label: 'الأطباء', group: 'أنواع المقدمين', helper: 'استكشف صفحات اكتشاف الأطباء' },
        { label: 'المختبرات', group: 'أنواع المقدمين', helper: 'استكشف مسارات مقدّمي المختبرات' },
        { label: 'عيادة بيطرية', group: 'أنواع المقدمين', helper: 'استكشف مسارات رعاية الحيوانات' },
        { label: 'الخوير', group: 'المناطق', helper: 'استكشف خيارات الاكتشاف حول الخوير' },
        { label: 'القرم', group: 'المناطق', helper: 'استكشف خيارات الاكتشاف حول القرم' },
        { label: 'الحيل', group: 'المناطق', helper: 'استكشف خيارات الاكتشاف حول الحيل' },
        { label: 'عيادات في القرم', group: 'المناطق', helper: 'اكتشاف عام للعيادات حول القرم' },
        { label: 'صيدلية قرب القرم', group: 'المناطق', helper: 'اكتشاف عام للصيدليات حول القرم' },
        { label: 'عروض الأسنان', group: 'العروض', helper: 'تظهر العروض المعتمدة بعد المراجعة' },
        { label: 'عروض العيادات البيطرية', group: 'العروض', helper: 'تظهر عروض رعاية الحيوانات بعد المراجعة' },
        { label: 'دليل الأسنان', group: 'الأدلة', helper: 'دليل تعليمي مختصر' },
        { label: 'اختيار عيادة', group: 'الأدلة', helper: 'دليل تعليمي مختصر' },
        { label: 'دليل رعاية الحيوانات', group: 'الأدلة', helper: 'دليل تعليمي مختصر' }
      ]
    }
  }
};

export function HomePage2026HeaderHero({ locale, country, dir }: HomePage2026HeaderHeroProps) {
  const copy = home2026Copy[locale];
  const searchHref = publicDiscoveryRoute(locale, country, 'search');
  const providerHref = publicProviderRoute(locale, country);

  return (
    <section className="dm2026-home-top dm2026-shell" dir={dir} aria-label={copy.search.title}>
      <div className="dm2026-container dm2026-home-top__container dm2026-home-top__container--search-first">
        <HomeSearch2026 copy={copy.search} dir={dir} searchHref={searchHref} providerHref={providerHref} />

        <div className="dm2026-home-safety dm2026-home-safety--compact dm2026-card-soft" aria-label={copy.safetyTitle}>
          <strong>{copy.safetyTitle}</strong>
          <ul>
            {copy.safetyItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <HomeFeaturedBoard2026 locale={locale} country={country} dir={dir} />
      <HomeDiscoveryCategories2026 locale={locale} country={country} dir={dir} />
      <HomeSpecialOffersShowcase2026 locale={locale} country={country} dir={dir} />
      <HomeProviderCTA2026 locale={locale} dir={dir} />
    </section>
  );
}
