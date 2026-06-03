import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';

type Params = { locale: string; country: string };

export default async function LocaleCountryLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  return (
    <AppShell locale={locale} country={country}>
      {children}
    </AppShell>
  );
}
