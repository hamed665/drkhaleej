import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { isSupportedLocale, localeDirection } from '@/lib/i18n/config';
import { defaultMetadata } from '@/lib/seo/meta';
import '@/styles/globals.css';

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const locale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';

  return (
    <html lang={locale} dir={localeDirection(locale)}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
