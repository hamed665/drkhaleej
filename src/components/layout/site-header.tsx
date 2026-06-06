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
    actionsLabel: string;
    home: string;
    doctors: string;
    centers: string;
    hospitals: string;
    pharmacies: string;
    labs: string;
    services: string;
    offers: string;
    articles: string;
    forProviders: string;
    signIn: string;
    createAccount: string;
    comingSoon: string;
    switchLabel: string;
    brandLabel: string;
  }
> = {
  en: {
    ariaLabel: 'Primary public navigation',
    actionsLabel: 'Account and language actions',
    home: 'Home',
    doctors: 'Doctors',
    centers: 'Centers',
    hospitals: 'Hospitals',
    pharmacies: 'Pharmacies',
    labs: 'Labs',
    services: 'Services',
    offers: 'Offers',
    articles: 'Articles',
    forProviders: 'For Providers',
    signIn: 'Sign in',
    createAccount: 'Create account',
    comingSoon: 'coming soon',
    switchLabel: 'Switch language to Arabic',
    brandLabel: 'DrMuscat home'
  },
  ar: {
    ariaLabel: 'التنقل العام الرئيسي',
    actionsLabel: 'إجراءات الحساب واللغة',
    home: 'الرئيسية',
    doctors: 'الأطباء',
    centers: 'المراكز',
    hospitals: 'المستشفيات',
    pharmacies: 'الصيدليات',
    labs: 'المختبرات',
    services: 'الخدمات',
    offers: 'العروض',
    articles: 'المقالات',
    forProviders: 'للمقدّمين',
    signIn: 'تسجيل الدخول',
    createAccount: 'إنشاء حساب',
    comingSoon: 'قريباً',
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
  const linkedNavItems = [
    { href: homeHref, label: copy.home },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'doctors'), label: copy.doctors },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'centers'), label: copy.centers },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'labs'), label: copy.labs },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'pharmacies'), label: copy.pharmacies },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'services'), label: copy.services }
  ] as const;
  const pendingNavItems = [copy.hospitals, copy.offers, copy.articles] as const;

  return (
    <header className="site-header site-header--premium dm2026-site-header" role="banner" dir={dir}>
      <Container className="site-header__inner dm2026-site-header__inner">
        <Link href={homeHref} className="site-header__brand" aria-label={copy.brandLabel}>
          <Logo />
        </Link>
        <nav aria-label={copy.ariaLabel} className="site-header__nav dm2026-site-header__nav">
          <ul>
            {linkedNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            {pendingNavItems.map((item) => (
              <li key={item}>
                <span className="dm2026-site-header__pending" aria-disabled="true" title={copy.comingSoon}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header__locale dm2026-site-header__actions" aria-label={copy.actionsLabel}>
          <Link href={providerHref} className="dm2026-site-header__provider">
            {copy.forProviders}
          </Link>
          <span className="dm2026-site-header__account" aria-disabled="true" title={copy.comingSoon}>
            {copy.signIn}
          </span>
          <span className="dm2026-site-header__account dm2026-site-header__account--primary" aria-disabled="true" title={copy.comingSoon}>
            {copy.createAccount}
          </span>
          <Link href={switchHref} className="site-header__locale-switch dm2026-site-header__locale-switch" hrefLang={safeLocale === 'en' ? 'ar' : 'en'} aria-label={copy.switchLabel}>
            <span>{safeLocale === 'en' ? 'العربية' : 'English'}</span>
          </Link>
        </div>
      </Container>
    </header>
  );
}
