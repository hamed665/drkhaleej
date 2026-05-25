import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Container } from '@/components/ui/container';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  SupportedCountry,
  SupportedLocale
} from '@/lib/i18n/config';

type Params = { locale: string; country: string };

export default async function LocaleCountryHome({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;

  return (
    <AppShell>
      <Container>
        <section dir={localeDirection(safeLocale)}>
          <h1>DrMuscat Foundation</h1>
          <p>
            Locale: {safeLocale} | Country: {safeCountry}
          </p>
        </section>
      </Container>
    </AppShell>
  );
}
