import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicDiscoveryHero2026 } from '@/components/public/discovery/PublicDiscoveryHero2026';
import { PublicDiscoveryResultsShell2026 } from '@/components/public/discovery/PublicDiscoveryResultsShell2026';
import { buildBeautyDiscoveryConfig } from '@/components/public/discovery/publicDiscoveryPageConfig';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { isSupportedCountry, isSupportedLocale, localeDirection } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const metadataCopyByLocale: Record<SupportedLocale, { title: string; description: string }> = {
  en: {
    title: 'Beauty Centers and Salons in Oman | DrMuscat',
    description: 'Browse beauty centers, salons, skincare, hair, nails and wellness services in Oman. Public discovery only, not medical advice.'
  },
  ar: {
    title: 'مراكز التجميل والصالونات في عُمان | DrMuscat',
    description: 'تصفح مراكز التجميل والصالونات والعناية بالبشرة والشعر والأظافر وخدمات العافية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.'
  }
};

const emptyStateCopyByLocale: Record<SupportedLocale, string> = {
  en: 'No approved beauty listings are available yet.',
  ar: 'لا توجد قوائم تجميل معتمدة متاحة حالياً.'
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = metadataCopyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/beauty', title: copy.title, description: copy.description });
}

export default async function PublicBeautyPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = buildBeautyDiscoveryConfig(safeLocale, safeCountry, dir);

  return (
    <main className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--beauty" dir={dir} data-country={safeCountry} data-locale={safeLocale}>
      <PublicDiscoveryHero2026 config={config} whatsAppHref={null} />
      <PublicDiscoveryResultsShell2026 config={config}>
        <section className="mt-10 rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-sm leading-6 text-slate-600 shadow-sm" role="status" aria-live="polite">
          <p>{emptyStateCopyByLocale[safeLocale]}</p>
        </section>
      </PublicDiscoveryResultsShell2026>
    </main>
  );
}
