import Link from 'next/link';
import { headers } from 'next/headers';
import { Container } from '@/components/ui/container';
import { isSupportedLocale, localeDirection, SupportedLocale } from '@/lib/i18n/config';
import { homeRoute, publicDiscoveryRoute, publicProviderRoute } from '@/lib/routes/public';

const footerCopy: Record<
  SupportedLocale,
  {
    tagline: string;
    navLabel: string;
    home: string;
    doctors: string;
    centers: string;
    pharmacies: string;
    labs: string;
    services: string;
    search: string;
    forProviders: string;
    utility: string;
    switchLabel: string;
  }
> = {
  en: {
    tagline: 'Healthcare discovery foundation for Oman.',
    navLabel: 'Footer public navigation',
    home: 'Home',
    doctors: 'Doctors',
    centers: 'Centers',
    pharmacies: 'Pharmacies',
    labs: 'Labs',
    services: 'Services',
    search: 'Search',
    forProviders: 'For Providers',
    utility: 'Oman-first public healthcare discovery in English and Arabic.',
    switchLabel: 'Switch language to Arabic'
  },
  ar: {
    tagline: 'أساس لاكتشاف الرعاية الصحية في عُمان.',
    navLabel: 'تنقل التذييل العام',
    home: 'الرئيسية',
    doctors: 'الأطباء',
    centers: 'المراكز',
    pharmacies: 'الصيدليات',
    labs: 'المختبرات',
    services: 'الخدمات',
    search: 'البحث',
    forProviders: 'لمقدمي الرعاية',
    utility: 'اكتشاف الرعاية الصحية في عُمان بالعربية والإنجليزية.',
    switchLabel: 'تبديل اللغة إلى الإنجليزية'
  }
};

export async function SiteFooter() {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const safeLocale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';
  const copy = footerCopy[safeLocale];
  const dir = localeDirection(safeLocale);
  const homeHref = homeRoute(safeLocale, 'om');
  const switchHref = homeRoute(safeLocale === 'en' ? 'ar' : 'en', 'om');
  const navItems = [
    { href: homeHref, label: copy.home },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'doctors'), label: copy.doctors },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'centers'), label: copy.centers },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'pharmacies'), label: copy.pharmacies },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'labs'), label: copy.labs },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'services'), label: copy.services },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'search'), label: copy.search },
    { href: publicProviderRoute(safeLocale, 'om'), label: copy.forProviders }
  ] as const;

  return (
    <footer className="site-footer site-footer--premium" role="contentinfo" dir={dir}>
      <Container className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>DrMuscat</strong>
          <p>{copy.tagline}</p>
        </div>
        <nav className="site-footer__links" aria-label={copy.navLabel}>
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-footer__utility">
          <p>{copy.utility}</p>
          <Link href={switchHref} className="site-footer__locale-switch" hrefLang={safeLocale === 'en' ? 'ar' : 'en'}>
            {safeLocale === 'en' ? 'العربية' : 'English'}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
