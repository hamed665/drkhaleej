import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicEmptyState } from '@/components/public/public-empty-state';
import { PublicListingError } from '@/components/public/public-listing-error';
import { PublicListingGrid } from '@/components/public/public-listing-grid';
import { PublicPageShell } from '@/components/public/public-page-shell';
import { listPublicServices } from '@/lib/catalog/public-queries';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };
type RouteCopy = { title: string; description: string; badge: string };

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    title: 'Healthcare Services in Oman | DrMuscat',
    description: 'Browse public healthcare service listings in Oman with bilingual-ready, server-rendered pages.',
    badge: 'Public service listings'
  },
  ar: {
    title: 'الخدمات الصحية في عُمان | DrMuscat',
    description: 'تصفح القوائم العامة للخدمات الصحية في عُمان ضمن صفحات خادمية ثنائية اللغة.',
    badge: 'قوائم الخدمات العامة'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/services', title: copy.title, description: copy.description });
}

export default async function PublicServicesPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const copy = copyByLocale[locale];
  const result = await listPublicServices();

  const content = !result.ok ? (
    <PublicListingError locale={locale} />
  ) : result.data.length === 0 ? (
    <PublicEmptyState locale={locale} />
  ) : (
    <PublicListingGrid locale={locale} variant="service" items={result.data} />
  );

  return (
    <PublicPageShell
      dir={localeDirection(locale)}
      heroBadge={copy.badge}
      heroTitle={copy.title}
      heroDescription={copy.description}
      content={content}
    />
  );
}
