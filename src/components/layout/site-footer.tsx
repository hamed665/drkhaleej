'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderLanguageSwitch } from '@/components/layout/header-language-switch';
import { footerCopy, resolveLayoutPathnameI18n } from '@/components/layout/layout-i18n-copy';
import { Container } from '@/components/ui/container';
import { publicDiscoveryRoute, publicProviderRoute } from '@/lib/routes/public';

export function SiteFooter() {
  const pathname = usePathname();
  const { locale, country, dir } = resolveLayoutPathnameI18n(pathname);
  const copy = footerCopy[locale];
  const browseLinks = [
    { href: publicDiscoveryRoute(locale, country, 'doctors'), label: copy.doctors },
    { href: publicDiscoveryRoute(locale, country, 'centers'), label: copy.centers },
    { href: publicDiscoveryRoute(locale, country, 'labs'), label: copy.labs },
    { href: publicDiscoveryRoute(locale, country, 'pharmacies'), label: copy.pharmacies },
    { href: publicDiscoveryRoute(locale, country, 'services'), label: copy.services }
  ] as const;
  const disabledBrowseItems = [copy.hospitals, copy.offers] as const;
  const providerLinks = [{ href: publicProviderRoute(locale, country), label: copy.listYourCenter }] as const;
  const disabledProviderItems = [copy.reviewedProfile, copy.photosGallery, copy.offers, copy.whatsappCallDirections] as const;
  const trustItems = [copy.publicDiscoveryOnly, copy.notMedicalAdvice, copy.confirmWithProvider, copy.sponsoredVisibility] as const;

  return (
    <footer className="site-footer site-footer--premium" role="contentinfo" dir={dir}>
      <Container className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>DrMuscat</strong>
          <p>{copy.brandText}</p>
        </div>
        <nav className="site-footer__links" aria-label={copy.navLabel}>
          <div>
            <strong>{copy.browseHeading}</strong>
            <ul>
              {browseLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              {disabledBrowseItems.map((item) => (
                <li key={item}>
                  <span aria-disabled="true" title={copy.comingSoon}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <strong>{copy.providersHeading}</strong>
            <ul>
              {providerLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              {disabledProviderItems.map((item) => (
                <li key={item}>
                  <span aria-disabled="true" title={copy.comingSoon}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="site-footer__utility">
          <strong>{copy.trustHeading}</strong>
          <ul>
            {trustItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <HeaderLanguageSwitch className="site-footer__locale-switch" />
        </div>
      </Container>
    </footer>
  );
}
