import Link from 'next/link';
import { headers } from 'next/headers';
import { Container } from '@/components/ui/container';
import { isSupportedLocale, localeDirection, SupportedLocale } from '@/lib/i18n/config';

const footerCopy: Record<SupportedLocale, {
  tagline: string;
  doctors: string;
  centers: string;
  services: string;
  utility: string;
  switchLabel: string;
}> = {
  en: {
    tagline: 'Trusted healthcare discovery foundation for Oman.',
    doctors: 'Doctors',
    centers: 'Centers',
    services: 'Services',
    utility: 'Privacy · Terms · Contact',
    switchLabel: 'English / العربية'
  },
  ar: {
    tagline: 'أساس موثوق لاكتشاف الرعاية الصحية في عُمان.',
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
  const dir = localeDirection(safeLocale);

  return (
    <footer className="site-footer" role="contentinfo" dir={dir}>
      <Container className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>DrMuscat</strong>
          <p>{copy.tagline}</p>
        </div>
        <div className="site-footer__links" aria-label="Footer placeholders">
          <p>{copy.doctors} · {copy.centers} · {copy.services}</p>
          <p>{copy.utility}</p>
          <Link href={switchHref} className="site-footer__locale-switch" aria-label={copy.switchLabel}>
            {copy.switchLabel}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
