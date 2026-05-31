import { notFound } from 'next/navigation';

import { getServiceLandingGateData } from '@/lib/catalog/public-landing-page-queries';
import { isSupportedCountry, isSupportedLocale } from '@/lib/i18n/config';
import { decideLandingPageGate } from '@/lib/seo/landing-page-indexability';

type Params = { locale: string; country: string; serviceSlug: string };

export default async function ServiceScaffoldPage({ params }: { params: Promise<Params> }) {
  const { locale, country, serviceSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const landingGateData = getServiceLandingGateData({
    locale,
    country,
    serviceSlug
  });
  const gate = decideLandingPageGate(landingGateData.input);

  if (gate.status !== 'indexable_later_only') notFound();

  notFound();
}
