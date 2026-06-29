import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { HomeWhatsAppFloat2026 } from '@/components/home/HomeSupportContact2026';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { isSupportedLocale, localeDirection, type SupportedLocale } from '@/lib/i18n/config';

type AppShellProps = {
  children: ReactNode;
};

const skipLinkCopy: Record<SupportedLocale, string> = {
  en: 'Skip to main content',
  ar: '\u0627\u0646\u062a\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0631\u0626\u064a\u0633\u064a'
};

export async function AppShell({ children }: AppShellProps) {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const safeLocale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';
  const dir = localeDirection(safeLocale);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        {skipLinkCopy[safeLocale]}
      </a>
      <SiteHeader />
      <div id="main-content" className="app-shell__main">
        {children}
      </div>
      <SiteFooter />
      <HomeWhatsAppFloat2026 locale={safeLocale} dir={dir} />
    </div>
  );
}
