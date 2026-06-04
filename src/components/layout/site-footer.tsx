import Link from 'next/link';
import { headers } from 'next/headers';
import { LanguageSwitch } from '@/components/layout/language-switch';
import { Container } from '@/components/ui/container';
import { isSupportedLocale, localeDirection, SupportedLocale } from '@/lib/i18n/config';
import {
  homeRoute,
  publicArticlesRoute,
  publicDiscoveryRoute,
  publicListYourCenterRoute,
  publicProviderRoute,
  publicRegisterRoute,
  publicSignInRoute,
} from '@/lib/routes/public';

type FooterColumn = { title: string; items: readonly { label: string; href?: string }[] };

const footerCopy: Record<
  SupportedLocale,
  {
    brand: string;
    tagline: string;
    navLabel: string;
    discover: string;
    providers: string;
    support: string;
    about: string;
    home: string;
    doctors: string;
    centers: string;
    pharmacies: string;
    labs: string;
    services: string;
    search: string;
    articles: string;
    forProviders: string;
    signIn: string;
    register: string;
    listYourCenter: string;
    contact: string;
    privacy: string;
    terms: string;
    aboutText: string;
    utility: string;
    switchLabel: string;
    localeSwitch: string;
  }
> = {
  en: {
    brand: 'DrMuscat',
    tagline: 'Calm, bilingual healthcare discovery for Oman.',
    navLabel: 'Footer public navigation',
    discover: 'Discover',
    providers: 'For Providers',
    support: 'Support',
    about: 'About',
    home: 'Home',
    doctors: 'Doctors',
    centers: 'Centers',
    pharmacies: 'Pharmacies',
    labs: 'Labs',
    services: 'Services',
    search: 'Search',
    articles: 'Articles',
    forProviders: 'For Providers',
    signIn: 'Sign in',
    register: 'Create account',
    listYourCenter: 'List your center',
    contact: 'Contact options coming soon',
    privacy: 'Privacy',
    terms: 'Terms',
    aboutText: 'Oman-focused public discovery for doctors, clinics, pharmacies, labs and healthcare services.',
    utility: 'No emergency, diagnosis, rating, or booking claims are made from this footer.',
    switchLabel: 'Switch language to Arabic',
    localeSwitch: 'العربية'
  },
  ar: {
    brand: 'دكتور مسقط',
    tagline: 'اكتشاف صحي هادئ وثنائي اللغة في عُمان.',
    navLabel: 'تنقل التذييل العام',
    discover: 'اكتشف',
    providers: 'لمقدمي الرعاية',
    support: 'الدعم',
    about: 'حول المنصة',
    home: 'الرئيسية',
    doctors: 'الأطباء',
    centers: 'المراكز',
    pharmacies: 'الصيدليات',
    labs: 'المختبرات',
    services: 'الخدمات',
    search: 'البحث',
    articles: 'المقالات',
    forProviders: 'لمقدمي الرعاية',
    signIn: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    listYourCenter: 'أدرج مركزك',
    contact: 'خيارات التواصل قريباً',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    aboutText: 'دليل عام مخصص لعُمان لاكتشاف الأطباء والعيادات والصيدليات والمختبرات وخدمات الرعاية الصحية.',
    utility: 'لا يقدم هذا التذييل ادعاءات طوارئ أو تشخيص أو تقييمات أو حجز.',
    switchLabel: 'تبديل اللغة إلى الإنجليزية',
    localeSwitch: 'English'
  }
};

export async function SiteFooter() {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const safeLocale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';
  const copy = footerCopy[safeLocale];
  const dir = localeDirection(safeLocale);
  const homeHref = homeRoute(safeLocale, 'om');
  const columns: FooterColumn[] = [
    {
      title: copy.discover,
      items: [
        { href: homeHref, label: copy.home },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'doctors'), label: copy.doctors },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'centers'), label: copy.centers },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'pharmacies'), label: copy.pharmacies },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'labs'), label: copy.labs },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'services'), label: copy.services },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'search'), label: copy.search },
        { href: publicArticlesRoute(safeLocale, 'om'), label: copy.articles }
      ]
    },
    {
      title: copy.providers,
      items: [
        { href: publicProviderRoute(safeLocale, 'om'), label: copy.forProviders },
        { href: publicListYourCenterRoute(safeLocale, 'om'), label: copy.listYourCenter }
      ]
    },
    {
      title: copy.support,
      items: [
        { href: publicSignInRoute(safeLocale, 'om'), label: copy.signIn },
        { href: publicRegisterRoute(safeLocale, 'om'), label: copy.register },
        { label: copy.contact },
        { label: copy.privacy },
        { label: copy.terms }
      ]
    },
    {
      title: copy.about,
      items: [{ label: copy.aboutText }]
    }
  ];

  return (
    <footer className="site-footer site-footer--premium" role="contentinfo" dir={dir}>
      <Container className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>{copy.brand}</strong>
          <p>{copy.tagline}</p>
          <LanguageSwitch
            locale={safeLocale}
            label={copy.localeSwitch}
            ariaLabel={copy.switchLabel}
            className="site-footer__locale-switch"
          />
        </div>
        <nav className="site-footer__links" aria-label={copy.navLabel}>
          {columns.map((column) => (
            <div key={column.title} className="site-footer__column">
              <h2>{column.title}</h2>
              <ul>
                {column.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="site-footer__utility">{copy.utility}</p>
      </Container>
    </footer>
  );
}
