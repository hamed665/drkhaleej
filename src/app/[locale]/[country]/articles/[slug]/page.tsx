import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleDetailShell } from '@/components/public/articles/article-detail-shell';
import { ArticlesShellStyles } from '@/components/public/articles/articles-hub-shell';
import { articleShellContent, getArticleShellCard } from '@/lib/articles/article-shell-content';
import { isSupportedCountry, isSupportedLocale, localeDirection, type SupportedCountry, type SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, slug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return {};
  }

  const safeLocale = locale as SupportedLocale;
  const card = getArticleShellCard(safeLocale, slug);

  return buildLocalizedMetadata({
    locale: safeLocale,
    country: country as SupportedCountry,
    pathname: `/articles/${slug}`,
    title: `${card.title} | DrMuscat`,
    description: articleShellContent[safeLocale].detail.excerpt
  });
}

export default async function ArticleDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, country, slug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;

  return (
    <>
      <ArticleDetailShell locale={safeLocale} country={safeCountry} slug={slug} dir={localeDirection(safeLocale)} />
      <ArticlesShellStyles />
    </>
  );
}
