import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicDirectoryListingContent } from '@/components/public/public-directory-listing-content';
import { PublicPageShell } from '@/components/public/public-page-shell';
import { listPublicCenters } from '@/lib/catalog/public-queries';
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
    title: 'Laboratories in Oman | DrMuscat',
    description: 'Browse reviewed public laboratory listings in Oman when provider information is available.',
    badge: 'Public laboratory listings'
  },
  ar: {
    title: 'المختبرات الطبية في عُمان | DrMuscat',
    description: 'تصفح قوائم المختبرات الطبية العامة في عُمان عند توفر معلومات مقدمي الخدمة بعد مراجعتها.',
    badge: 'قوائم المختبرات العامة'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/labs', title: copy.title, description: copy.description });
}

export default async function PublicLabsPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const copy = copyByLocale[locale];
  const result = await listPublicCenters({ country, centerType: 'laboratory' });

  const content = <PublicDirectoryListingContent locale={locale} variant="center" result={result} />;

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
