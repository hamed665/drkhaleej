'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { LanguageSwitch } from '@/components/layout/language-switch';
import { Container } from '@/components/ui/container';
import { localeDirection, SupportedLocale } from '@/lib/i18n/config';
import {
  homeRoute,
  publicArticlesRoute,
  publicDiscoveryRoute,
  publicListYourCenterRoute,
  publicProviderRoute,
  publicRegisterRoute,
  publicSignInRoute,
} from '@/lib/routes/public';

const navCopy: Record<
  SupportedLocale,
  {
    ariaLabel: string;
    brand: string;
    secondaryBrand: string;
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
    switchLabel: string;
    brandLabel: string;
    localeSwitch: string;
    menu: string;
    closeMenu: string;
  }
> = {
  en: {
    ariaLabel: 'Primary public navigation',
    brand: 'DrMuscat',
    secondaryBrand: 'Oman healthcare',
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
    switchLabel: 'Switch language to Arabic',
    brandLabel: 'DrMuscat home',
    localeSwitch: 'العربية',
    menu: 'Menu',
    closeMenu: 'Close menu',
  },
  ar: {
    ariaLabel: 'التنقل العام الرئيسي',
    brand: 'دكتور مسقط',
    secondaryBrand: 'رعاية صحية في عُمان',
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
    switchLabel: 'تبديل اللغة إلى الإنجليزية',
    brandLabel: 'الرئيسية دكتور مسقط',
    localeSwitch: 'English',
    menu: 'القائمة',
    closeMenu: 'إغلاق القائمة',
  },
};

function getLocaleFromPathname(pathname: string | null): SupportedLocale {
  const firstSegment = pathname?.split('/').filter(Boolean)[0];
  return firstSegment === 'ar' ? 'ar' : 'en';
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const safeLocale = getLocaleFromPathname(pathname);
  const copy = navCopy[safeLocale];
  const dir = localeDirection(safeLocale);
  const homeHref = homeRoute(safeLocale, 'om');
  const navItems = [
    { href: homeHref, label: copy.home },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'doctors'), label: copy.doctors },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'centers'), label: copy.centers },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'pharmacies'), label: copy.pharmacies },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'labs'), label: copy.labs },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'services'), label: copy.services },
    { href: publicDiscoveryRoute(safeLocale, 'om', 'search'), label: copy.search },
    { href: publicArticlesRoute(safeLocale, 'om'), label: copy.articles },
    { href: publicProviderRoute(safeLocale, 'om'), label: copy.forProviders },
  ] as const;

  return (
    <header className="site-header site-header--premium" role="banner" dir={dir}>
      <Container className="site-header__inner">
        <Link href={homeHref} className="site-header__brand" aria-label={copy.brandLabel}>
          <span className="dm-logo__mark" aria-hidden="true">
            DM
          </span>
          <span className="site-header__wordmark-wrap">
            <span className="dm-logo__wordmark">{copy.brand}</span>
            <span className="site-header__brand-subtitle">{copy.secondaryBrand}</span>
          </span>
        </Link>
        <nav aria-label={copy.ariaLabel} className="site-header__nav site-header__nav--desktop">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header__actions site-header__actions--desktop" aria-label={safeLocale === 'ar' ? 'روابط الحساب والإدراج' : 'Account and listing links'}>
          <Link className="site-header__action-link" href={publicSignInRoute(safeLocale, 'om')}>{copy.signIn}</Link>
          <Link className="site-header__action-link" href={publicRegisterRoute(safeLocale, 'om')}>{copy.register}</Link>
          <Link className="site-header__action-link site-header__action-link--primary" href={publicListYourCenterRoute(safeLocale, 'om')}>{copy.listYourCenter}</Link>
        </div>
        <div className="site-header__locale" aria-label={copy.switchLabel}>
          <LanguageSwitch locale={safeLocale} label={copy.localeSwitch} ariaLabel={copy.switchLabel} className="site-header__locale-switch" />
        </div>
        <button
          type="button"
          className="site-header__menu-button"
          aria-expanded={isMenuOpen}
          aria-controls="site-header-mobile-menu"
          aria-label={isMenuOpen ? copy.closeMenu : copy.menu}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{isMenuOpen ? '×' : '☰'}</span>
          <span>{copy.menu}</span>
        </button>
        {isMenuOpen ? (
          <nav id="site-header-mobile-menu" aria-label={copy.ariaLabel} className="site-header__mobile-menu">
            <ul>
              {navItems.map((item) => (
                <li key={item.href}><Link href={item.href} onClick={() => setIsMenuOpen(false)}>{item.label}</Link></li>
              ))}
            </ul>
            <div className="site-header__mobile-actions">
              <Link href={publicSignInRoute(safeLocale, 'om')} onClick={() => setIsMenuOpen(false)}>{copy.signIn}</Link>
              <Link href={publicRegisterRoute(safeLocale, 'om')} onClick={() => setIsMenuOpen(false)}>{copy.register}</Link>
              <Link className="site-header__mobile-primary" href={publicListYourCenterRoute(safeLocale, 'om')} onClick={() => setIsMenuOpen(false)}>{copy.listYourCenter}</Link>
            </div>
          </nav>
        ) : null}
      </Container>
    </header>
  );
}
