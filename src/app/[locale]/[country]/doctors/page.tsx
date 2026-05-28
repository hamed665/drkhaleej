import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicEmptyState } from '@/components/public/public-empty-state';
import { PublicListingError } from '@/components/public/public-listing-error';
import { PublicListingGrid } from '@/components/public/public-listing-grid';
import { PublicPageShell } from '@/components/public/public-page-shell';
import { listPublicDoctors } from '@/lib/catalog/public-queries';
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
    title: 'Doctors in Oman | DrMuscat',
    description: 'Browse public doctor listings in Oman with bilingual-ready, server-rendered pages.',
    badge: 'Public doctor listings'
  },
  ar: {
    title: 'الأطباء في عُمان | DrMuscat',
    description: 'تصفح القوائم العامة للأطباء في عُمان ضمن صفحات خادمية ثنائية اللغة.',
    badge: 'قوائم الأطباء العامة'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/doctors', title: copy.title, description: copy.description });
}

export default async function PublicDoctorsPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const copy = copyByLocale[locale];
  const result = await listPublicDoctors({ country });

  const content = !result.ok ? (
    <PublicListingError locale={locale} />
  ) : result.data.length === 0 ? (
    <PublicEmptyState locale={locale} />
  ) : (
    <PublicListingGrid locale={locale} variant="doctor" items={result.data} />
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
