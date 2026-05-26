import type { Metadata } from 'next';
import { languageAlternates, localizedPathname, siteConfig, type SiteCountry, type SiteLocale } from './site';

type BuildLocalizedMetadataInput = {
  locale?: SiteLocale;
  country?: SiteCountry;
  pathname?: string;
  title?: string;
  description?: string;
};

function toAbsoluteUrl(pathname: string): string {
  return new URL(pathname, siteConfig.baseUrl).toString();
}

export function buildCanonicalUrl(pathname: string, locale: SiteLocale, country: SiteCountry): string {
  return toAbsoluteUrl(localizedPathname(pathname, locale, country));
}

export function buildLocalizedMetadata(input: BuildLocalizedMetadataInput = {}): Metadata {
  const locale = input.locale ?? siteConfig.defaultLocale;
  const country = input.country ?? siteConfig.defaultCountry;
  const pathname = input.pathname ?? '/';
  const title = input.title ?? siteConfig.defaultTitle;
  const description = input.description ?? siteConfig.defaultDescription;
  const canonical = buildCanonicalUrl(pathname, locale, country);

  return {
    metadataBase: siteConfig.baseUrl,
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: toAbsoluteUrl(localizedPathname(pathname, 'en', country)),
        ar: toAbsoluteUrl(localizedPathname(pathname, 'ar', country)),
        'x-default': toAbsoluteUrl(languageAlternates.en)
      }
    },
    openGraph: {
      type: 'website',
      locale,
      siteName: siteConfig.siteName,
      title,
      description,
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export const defaultMetadata = buildLocalizedMetadata();
