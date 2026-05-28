import Link from 'next/link';
import { headers } from 'next/headers';
import { Container } from '@/components/ui/container';
import { isSupportedLocale, localeDirection, SupportedLocale } from '@/lib/i18n/config';
import { publicDiscoveryRoute } from '@/lib/routes/public';

const footerCopy: Record<SupportedLocale, {
  tagline: string;
  doctors: string;
  centers: string;
  services: string;
  utility: string;
  switchLabel: string;
}> = {
  en: {
    tagline: 'Healthcare discovery foundation for Oman.',
    doctors: 'Doctors',
    centers: 'Centers',
    services: 'Services',
    utility: 'Privacy · Terms · Contact',
    switchLabel: 'English / العربية'
  },
  ar: {
    tagline: 'أساس لاكتشاف الرعاية الصحية في عُمان.',
    doctors: 'الأطباء',
    centers: 'المراكز',
    services: 'الخدمات',
    utility: 'الخصوصية · الشروط · التواصل',
    switchLabel: 'English / العربية'
  }
};

export async function SiteFooter() {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const safeLocale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';
  const copy = footerCopy[safeLocale];
  const switchHref = safeLocale === 'en' ? '/ar/om' : '/en/om';
  const doctorsHref = publicDiscoveryRoute(safeLocale, 'om', 'doctors');
  const centersHref = publicDiscoveryRoute(safeLocale, 'om', 'centers');
  const servicesHref = publicDiscoveryRoute(safeLocale, 'om', 'services');
  const dir = localeDirection(safeLocale);

  return (
    <footer className="site-footer site-footer--premium" role="contentinfo" dir={dir}>
      <Container className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>DrMuscat</strong>
          <p>{copy.tagline}</p>
        </div>
        <div className="site-footer__links" aria-label="Footer placeholders">
          <p>
            <Link href={doctorsHref}>{copy.doctors}</Link> · <Link href={centersHref}>{copy.centers}</Link> ·{' '}
            <Link href={servicesHref}>{copy.services}</Link>
          </p>
          <p>{copy.utility}</p>
          <Link href={switchHref} className="site-footer__locale-switch" aria-label={copy.switchLabel}>
            {copy.switchLabel}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
