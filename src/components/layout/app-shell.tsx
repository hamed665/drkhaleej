import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';

type AppShellProps = {
  children: ReactNode;
};

const skipLinkCopy: Record<SupportedLocale, string> = {
  en: 'Skip to main content',
  ar: 'انتقل إلى المحتوى الرئيسي'
};

export async function AppShell({ children }: AppShellProps) {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const safeLocale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        {skipLinkCopy[safeLocale]}
      </a>
      <SiteHeader />
      <main id="main-content" className="app-shell__main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
