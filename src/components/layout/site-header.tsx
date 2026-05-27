import Link from 'next/link';
import { headers } from 'next/headers';
import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/ui/container';
import { isSupportedLocale, localeDirection, SupportedLocale } from '@/lib/i18n/config';

const navCopy: Record<SupportedLocale, { doctors: string; centers: string; services: string; switchLabel: string }> = {
  en: {
    doctors: 'Doctors',
    centers: 'Centers',
    services: 'Services',
    switchLabel: 'English / العربية'
  },
  ar: {
    doctors: 'الأطباء',
    centers: 'المراكز',
    services: 'الخدمات',
    switchLabel: 'English / العربية'
  }
};

export async function SiteHeader() {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const safeLocale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';
  const copy = navCopy[safeLocale];
  const switchHref = safeLocale === 'en' ? '/ar/om' : '/en/om';
  const dir = localeDirection(safeLocale);

  return (
    <header className="site-header site-header--premium" role="banner" dir={dir}>
      <Container className="site-header__inner">
        <div className="site-header__brand">
          <Logo />
        </div>
        <nav aria-label="Primary" className="site-header__nav">
          <ul>
            <li><span>{copy.doctors}</span></li>
            <li><span>{copy.centers}</span></li>
            <li><span>{copy.services}</span></li>
          </ul>
        </nav>
        <div className="site-header__locale" aria-label={copy.switchLabel}>
          <Link href={switchHref} className="site-header__locale-switch">
            <span>{copy.switchLabel}</span>
          </Link>
        </div>
      </Container>
    </header>
  );
}
