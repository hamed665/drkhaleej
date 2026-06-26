import type { Metadata } from 'next';
import { localizedPathname, siteConfig, type SiteCountry, type SiteLocale } from './site';

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

function regionalLanguageCode(locale: SiteLocale, country: SiteCountry): string {
  return `${locale}-${country.toUpperCase()}`;
}

function openGraphLocale(locale: SiteLocale, country: SiteCountry): string {
  return `${locale}_${country.toUpperCase()}`;
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
  const englishAlternate = toAbsoluteUrl(localizedPathname(pathname, 'en', country));
  const arabicAlternate = toAbsoluteUrl(localizedPathname(pathname, 'ar', country));

  return {
    metadataBase: siteConfig.baseUrl,
    applicationName: siteConfig.siteName,
    manifest: '/manifest.webmanifest',
    title,
    description,
    alternates: {
      canonical,
      languages: {
        [regionalLanguageCode('en', country)]: englishAlternate,
        [regionalLanguageCode('ar', country)]: arabicAlternate,
        en: englishAlternate,
        ar: arabicAlternate,
        'x-default': englishAlternate
      }
    },
    openGraph: {
      type: 'website',
      locale: openGraphLocale(locale, country),
      siteName: siteConfig.siteName,
      title,
      description,
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
      other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#0e7469' }]
    }
  };
}

export const defaultMetadata = buildLocalizedMetadata();
