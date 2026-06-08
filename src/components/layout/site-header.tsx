'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderLanguageSwitch } from '@/components/layout/header-language-switch';
import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/ui/container';
import { headerCopy, resolveLayoutPathnameI18n } from '@/components/layout/layout-i18n-copy';
import { homeRoute, publicDiscoveryRoute, publicProviderRoute } from '@/lib/routes/public';

export function SiteHeader() {
  const pathname = usePathname();
  const { locale, country, dir } = resolveLayoutPathnameI18n(pathname);
  const copy = headerCopy[locale];
  const homeHref = homeRoute(locale, country);
  const providerHref = publicProviderRoute(locale, country);
  const mobileMenuId = `dm2026-mobile-menu-${locale}`;
  const accountPopoverId = `dm2026-account-menu-${locale}`;
  const accountLabel = locale === 'ar' ? 'دخول' : 'Login';
  const linkedNavItems = [
    { href: homeHref, label: copy.home },
    { href: publicDiscoveryRoute(locale, country, 'doctors'), label: copy.doctors },
    { href: publicDiscoveryRoute(locale, country, 'centers'), label: copy.centers },
    { href: publicDiscoveryRoute(locale, country, 'labs'), label: copy.labs },
    { href: publicDiscoveryRoute(locale, country, 'pharmacies'), label: copy.pharmacies },
    { href: publicDiscoveryRoute(locale, country, 'services'), label: copy.services }
  ] as const;
  const pendingNavItems = [copy.hospitals, copy.offers, copy.articles] as const;

  useEffect(() => {
    const closeMenu = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;

      const trigger = target.closest('[data-dm2026-mobile-menu-close]');
      if (!trigger) return;

      const menu = target.closest('[data-dm2026-mobile-menu]');
      if (menu instanceof HTMLElement && typeof menu.hidePopover === 'function') {
        menu.hidePopover();
      }
    };

    const handleClick = (event: MouseEvent) => closeMenu(event.target);
    document.addEventListener('click', handleClick);

    return () => document.removeEventListener('click', handleClick);
  }, []);

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
          <span className="dm2026-site-header__ecg-line" aria-hidden="true" />
        </nav>
        <div className="site-header__locale dm2026-site-header__actions" aria-label={copy.actionsLabel}>
          <Link href={providerHref} className="dm2026-site-header__provider">
            {copy.forProviders}
          </Link>
          <button
            type="button"
            className="dm2026-site-header__account-trigger"
            popoverTarget={accountPopoverId}
            aria-haspopup="menu"
          >
            {accountLabel}
          </button>
          <div id={accountPopoverId} className="dm2026-site-header__account-popover" popover="auto" dir={dir}>
            <strong>{accountLabel}</strong>
            <span aria-disabled="true" title={copy.comingSoon}>
              {copy.signIn}
            </span>
            <span aria-disabled="true" title={copy.comingSoon}>
              {copy.createAccount}
            </span>
          </div>
          <HeaderLanguageSwitch className="site-header__locale-switch dm2026-site-header__locale-switch" />
        </div>
        <button
          type="button"
          className="dm2026-site-header__menu-button"
          popoverTarget={mobileMenuId}
          aria-haspopup="menu"
          aria-expanded="false"
          aria-label={copy.menuLabel}
        >
          <span className="dm2026-hamburger-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </Container>
      <div id={mobileMenuId} className="dm2026-site-header__mobile-menu" popover="auto" dir={dir} data-dm2026-mobile-menu>
        <div className="dm2026-site-header__mobile-menu-head">
          <Logo />
          <button type="button" popoverTarget={mobileMenuId} popoverTargetAction="hide" aria-label={copy.closeMenu}>
            ×
          </button>
        </div>
        <div className="dm2026-site-header__mobile-account" aria-label={accountLabel}>
          <strong>{accountLabel}</strong>
          <div>
            <span aria-disabled="true" title={copy.comingSoon} data-dm2026-mobile-menu-close>
              {copy.signIn}
            </span>
            <span aria-disabled="true" title={copy.comingSoon} data-dm2026-mobile-menu-close>
              {copy.createAccount}
            </span>
          </div>
        </div>
        <nav aria-label={copy.ariaLabel}>
          <ul>
            {linkedNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} data-dm2026-mobile-menu-close>
                  {item.label}
                </Link>
              </li>
            ))}
            {pendingNavItems.map((item) => (
              <li key={item}>
                <span aria-disabled="true" title={copy.comingSoon} data-dm2026-mobile-menu-close>
                  {item}
                </span>
              </li>
            ))}
            <li>
              <Link href={providerHref} data-dm2026-mobile-menu-close>
                {copy.forProviders}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
