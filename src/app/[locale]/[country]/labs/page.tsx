import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicDiscoveryHero2026 } from '@/components/public/discovery/PublicDiscoveryHero2026';
import { PublicDiscoveryResultsShell2026 } from '@/components/public/discovery/PublicDiscoveryResultsShell2026';
import { buildLabsDiscoveryConfig } from '@/components/public/discovery/publicDiscoveryPageConfig';
import { PublicDirectoryListingContent } from '@/components/public/public-directory-listing-content';
import { listPublicCenters } from '@/lib/catalog/public-queries';
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from '@/lib/contact/whatsapp';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const metadataCopyByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  en: {
    title: 'Labs in Oman | DrMuscat',
    description: 'Browse medical labs, test services and sample collection options across Oman. Public discovery only, not medical advice.'
  },
  ar: {
    title: 'المختبرات في عُمان | DrMuscat',
    description: 'تصفح المختبرات الطبية وخدمات الفحوصات وخيارات سحب العينات في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = metadataCopyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/labs', title: copy.title, description: copy.description });
}

export default async function PublicLabsPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = buildLabsDiscoveryConfig(safeLocale, safeCountry, dir);
  const result = await listPublicCenters({ country: safeCountry, centerType: 'laboratory' });
  const whatsAppNumber = normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER);
  const whatsAppHref = buildWhatsAppUrl(whatsAppNumber, config.whatsAppMessage);

  return (
    <main className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--labs" dir={dir} data-country={safeCountry} data-locale={safeLocale}>
      <PublicDiscoveryHero2026 config={config} whatsAppHref={whatsAppHref} />
      <PublicDiscoveryResultsShell2026 config={config}>
        <PublicDirectoryListingContent locale={safeLocale} variant="center" result={result} />
      </PublicDiscoveryResultsShell2026>
    </main>
  );
}
