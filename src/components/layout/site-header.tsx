import Link from 'next/link';
import { headers } from 'next/headers';
import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/ui/container';
import { isSupportedLocale, localeDirection, SupportedLocale } from '@/lib/i18n/config';
import { homeRoute, publicDiscoveryRoute, publicProviderRoute } from '@/lib/routes/public';

const navCopy: Record<
  SupportedLocale,
  {
    ariaLabel: string;
    home: string;
    doctors: string;
    centers: string;
    pharmacies: string;
    labs: string;
    services: string;
    search: string;
    forProviders: string;
    switchLabel: string;
    brandLabel: string;
  }
> = {
  en: {
    ariaLabel: 'Primary public navigation',
    home: 'Home',
    doctors: 'Doctors',
    centers: 'Centers',
    pharmacies: 'Pharmacies',
    labs: 'Labs',
    services: 'Services',
    search: 'Search',
    forProviders: 'For Providers',
    switchLabel: 'Switch language to Arabic',
    brandLabel: 'DrMuscat home'
  },
  ar: {
    ariaLabel: 'التنقل العام الرئيسي',
    home: 'الرئيسية',
    doctors: 'الأطباء',
    centers: 'المراكز',
    pharmacies: 'الصيدليات',
    labs: 'المختبرات',
    services: 'الخدمات',
    search: 'البحث',
    forProviders: 'للمقدّمين',
    switchLabel: 'تبديل اللغة إلى الإنجليزية',
    brandLabel: 'الرئيسية DrMuscat'
  }
};

export async function SiteHeader() {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const safeLocale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';
  const copy = navCopy[safeLocale];
  const dir = localeDirection(safeLocale);
  const homeHref = homeRoute(safeLocale, 'om');
  const switchHref = homeRoute(safeLocale === 'en' ? 'ar' : 'en', 'om');
  const providerHref = publicProviderRoute(safeLocale, 'om');
  const navItems = [
    { href: homeHref, label: copy.home },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'doctors'), label: copy.doctors },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'centers'), label: copy.centers },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'pharmacies'), label: copy.pharmacies },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'labs'), label: copy.labs },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'services'), label: copy.services },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'search'), label: copy.search }
  ] as const;

  return (
    <header className="site-header site-header--premium dm2026-site-header" role="banner" dir={dir}>
      <Container className="site-header__inner dm2026-site-header__inner">
        <Link href={homeHref} className="site-header__brand" aria-label={copy.brandLabel}>
          <Logo />
        </Link>
        <nav aria-label={copy.ariaLabel} className="site-header__nav dm2026-site-header__nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header__locale dm2026-site-header__actions" aria-label={copy.switchLabel}>
          <Link href={switchHref} className="site-header__locale-switch dm2026-site-header__locale-switch" hrefLang={safeLocale === 'en' ? 'ar' : 'en'}>
            <span>{safeLocale === 'en' ? 'العربية' : 'English'}</span>
          </Link>
          <Link href={providerHref} className="dm2026-site-header__provider">
            {copy.forProviders}
          </Link>
        </div>
      </Container>
    </header>
  );
}
