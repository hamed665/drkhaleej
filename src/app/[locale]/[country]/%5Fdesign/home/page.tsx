import { notFound } from 'next/navigation';
import { HomeDesignLab } from '@/components/home/home-design-lab';
import { isSupportedCountry, isSupportedLocale, type SupportedCountry, type SupportedLocale } from '@/lib/i18n/config';

type Params = { locale: string; country: string };

export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function HomeDesignLabPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  return <HomeDesignLab locale={locale as SupportedLocale} country={country as SupportedCountry} />;
}
