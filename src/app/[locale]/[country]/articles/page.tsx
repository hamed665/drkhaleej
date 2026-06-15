import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticlesHubShell, ArticlesShellStyles } from '@/components/public/articles/articles-hub-shell';
import { articleShellContent } from '@/lib/articles/article-shell-content';
import { isSupportedCountry, isSupportedLocale, localeDirection, type SupportedCountry, type SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return {};
  }

  const safeLocale = locale as SupportedLocale;
  const copy = articleShellContent[safeLocale];

  return buildLocalizedMetadata({
    locale: safeLocale,
    country: country as SupportedCountry,
    pathname: '/articles',
    title: safeLocale === 'ar' ? 'مقالات DrMuscat | أدلة صحية في عُمان' : 'DrMuscat Articles | Health Guides in Oman',
    description: copy.heroIntro
  });
}

export default async function ArticlesPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;

  return (
    <>
      <ArticlesHubShell locale={safeLocale} country={safeCountry} dir={localeDirection(safeLocale)} />
      <ArticlesShellStyles />
    </>
  );
}
