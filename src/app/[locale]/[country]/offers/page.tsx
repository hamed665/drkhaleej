import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicDiscoveryHero2026 } from '@/components/public/discovery/PublicDiscoveryHero2026';
import { PublicDiscoveryResultsShell2026 } from '@/components/public/discovery/PublicDiscoveryResultsShell2026';
import { buildOffersDiscoveryConfig } from '@/components/public/discovery/publicDiscoveryPageConfig';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { isSupportedCountry, isSupportedLocale, localeDirection } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const metadataCopyByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  en: {
    title: 'Healthcare and Wellness Offers in Oman | DrMuscat',
    description: 'Browse approved healthcare, beauty, pharmacy, lab and wellness offers in Oman. Public discovery only, not medical advice.'
  },
  ar: {
    title: 'عروض الصحة والعافية في عُمان | DrMuscat',
    description: 'تصفح عروض الصحة والتجميل والصيدليات والمختبرات والعافية المعتمدة في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
  }
};

const emptyStateCopyByLocale: Record<SupportedLocale, string> = {
  en: 'No approved offers are available yet.',
  ar: 'لا توجد عروض معتمدة متاحة حالياً.'
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = metadataCopyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/offers', title: copy.title, description: copy.description });
}

export default async function PublicOffersPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = buildOffersDiscoveryConfig(safeLocale, safeCountry, dir);

  return (
    <main className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--offers" dir={dir} data-country={safeCountry} data-locale={safeLocale}>
      <PublicDiscoveryHero2026 config={config} whatsAppHref={null} />
      <PublicDiscoveryResultsShell2026 config={config}>
        <section className="mt-10 rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-sm leading-6 text-slate-600 shadow-sm" role="status" aria-live="polite">
          <p>{emptyStateCopyByLocale[safeLocale]}</p>
        </section>
      </PublicDiscoveryResultsShell2026>
    </main>
  );
}
