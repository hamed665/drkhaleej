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
  ar: 'انتقل إلى المحتوى الرئيسي'
};

function normalizeRequestPath(path: string | null): string | null {
  if (!path) return null;

  const pathname = path.split('?')[0]?.split('#')[0] ?? '';
  const normalizedPath = pathname.replace(/\/+$/, '');

  return normalizedPath.length > 0 ? normalizedPath : '/';
}

function isHomeRequestPath(path: string | null): boolean {
  const normalizedPath = normalizeRequestPath(path);
  if (!normalizedPath) return false;

  return normalizedPath === '/' || /^\/(en|ar)\/om$/.test(normalizedPath);
}

export async function AppShell({ children }: AppShellProps) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get('x-drmuscat-locale');
  const requestPath =
    requestHeaders.get('x-next-url') ??
    requestHeaders.get('x-matched-path') ??
    requestHeaders.get('next-url');
  const safeLocale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';
  const dir = localeDirection(safeLocale);
  const showHomeWhatsAppFloat = isHomeRequestPath(requestPath);

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
      {showHomeWhatsAppFloat ? <HomeWhatsAppFloat2026 locale={safeLocale} dir={dir} /> : null}
    </div>
  );
}
