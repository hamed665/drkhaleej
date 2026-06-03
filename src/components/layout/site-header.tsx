import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/ui/container';
import { localeDirection, type SupportedCountry, type SupportedLocale } from '@/lib/i18n/config';
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
    forProviders: 'لمقدمي الرعاية',
    switchLabel: 'تبديل اللغة إلى الإنجليزية',
    brandLabel: 'الرئيسية DrMuscat'
  }
};

type SiteHeaderProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
};

export function SiteHeader({ locale, country }: SiteHeaderProps) {
  const safeLocale = locale;
  const safeCountry = country;
  const copy = navCopy[safeLocale];
  const dir = localeDirection(safeLocale);
  const homeHref = homeRoute(safeLocale, safeCountry);
  const switchHref = homeRoute(safeLocale === 'en' ? 'ar' : 'en', safeCountry);
  const navItems = [
    { href: homeHref, label: copy.home },
    { href: publicDiscoveryRoute(safeLocale, safeCountry, 'doctors'), label: copy.doctors },
    { href: publicDiscoveryRoute(safeLocale, safeCountry, 'centers'), label: copy.centers },
    { href: publicDiscoveryRoute(safeLocale, safeCountry, 'pharmacies'), label: copy.pharmacies },
    { href: publicDiscoveryRoute(safeLocale, safeCountry, 'labs'), label: copy.labs },
    { href: publicDiscoveryRoute(safeLocale, safeCountry, 'services'), label: copy.services },
    { href: publicDiscoveryRoute(safeLocale, safeCountry, 'search'), label: copy.search },
    { href: publicProviderRoute(safeLocale, safeCountry), label: copy.forProviders }
  ] as const;

  return (
    <header className="site-header site-header--premium" role="banner" dir={dir}>
      <Container className="site-header__inner">
        <Link href={homeHref} className="site-header__brand" aria-label={copy.brandLabel}>
          <Logo />
        </Link>
        <nav aria-label={copy.ariaLabel} className="site-header__nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header__locale" aria-label={copy.switchLabel}>
          <Link href={switchHref} className="site-header__locale-switch" hrefLang={safeLocale === 'en' ? 'ar' : 'en'}>
            <span>{safeLocale === 'en' ? 'العربية' : 'English'}</span>
          </Link>
        </div>
      </Container>
    </header>
  );
}
