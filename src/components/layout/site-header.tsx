import Link from 'next/link';
import { headers } from 'next/headers';
import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/ui/container';
import { isSupportedLocale, localeDirection, SupportedLocale } from '@/lib/i18n/config';

const navCopy: Record<
  SupportedLocale,
  { doctors: string; clinics: string; pharmacies: string; labs: string; switchLabel: string }
> = {
  en: {
    doctors: 'Doctors',
    clinics: 'Clinics',
    pharmacies: 'Pharmacies',
    labs: 'Labs',
    switchLabel: 'English / العربية'
  },
  ar: {
    doctors: 'الأطباء',
    clinics: 'العيادات',
    pharmacies: 'الصيدليات',
    labs: 'المختبرات',
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
      <Container className="site-header__outer">
        <div className="site-header__capsule">
          <div className="site-header__brand">
            <Logo />
          </div>
          <nav aria-label="Primary" className="site-header__nav">
            <ul>
              <li><span>{copy.doctors}</span></li>
              <li><span>{copy.clinics}</span></li>
              <li><span>{copy.pharmacies}</span></li>
              <li><span>{copy.labs}</span></li>
            </ul>
          </nav>
          <div className="site-header__locale" aria-label={copy.switchLabel}>
            <Link href={switchHref} className="site-header__locale-switch">
              <span>{copy.switchLabel}</span>
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
