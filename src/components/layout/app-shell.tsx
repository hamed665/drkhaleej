import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type AppShellProps = {
  children: ReactNode;
  locale?: SupportedLocale;
  country?: SupportedCountry;
};

const skipLinkCopy: Record<SupportedLocale, string> = {
  en: 'Skip to main content',
  ar: 'انتقل إلى المحتوى الرئيسي'
};

export function AppShell({ children, locale, country }: AppShellProps) {
  if (!locale || !country) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        {skipLinkCopy[locale]}
      </a>
      <SiteHeader locale={locale} country={country} />
      <main id="main-content" className="app-shell__main">
        {children}
      </main>
      <SiteFooter locale={locale} country={country} />
    </div>
  );
}
