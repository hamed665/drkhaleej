export const supportedLocales = ['en', 'ar'] as const;
export type SiteLocale = (typeof supportedLocales)[number];

export const supportedCountries = ['om'] as const;
export type SiteCountry = (typeof supportedCountries)[number];

export type LocaleCountry = {
  locale: SiteLocale;
  country: SiteCountry;
};

const PRODUCTION_FALLBACK_URL = 'https://drmuscat.com';
const LOCAL_FALLBACK_URL = 'http://localhost:3000';

function normalizeBaseUrl(url: URL): URL {
  return new URL(url.origin);
}

function parsePublicAppUrl(envUrl: string | undefined): URL | null {
  if (!envUrl) return null;

  try {
    const parsedUrl = new URL(envUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) return null;

    return normalizeBaseUrl(parsedUrl);
  } catch {
    return null;
  }
}

function getBaseUrl(): URL {
  const envBaseUrl = parsePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (envBaseUrl) return envBaseUrl;

  if (process.env.NODE_ENV === 'development') {
    return new URL(LOCAL_FALLBACK_URL);
  }

  return new URL(PRODUCTION_FALLBACK_URL);
}

export const siteConfig = {
  siteName: 'DrMuscat',
  defaultLocale: 'en' as SiteLocale,
  locales: supportedLocales,
  defaultCountry: 'om' as SiteCountry,
  countries: supportedCountries,
  defaultTitle: 'DrMuscat | Healthcare discovery in Oman',
  defaultDescription:
    'Discover trusted healthcare providers in Oman with a fast, bilingual-ready experience.',
  baseUrl: getBaseUrl()
} as const;

export function localizedRootPath(locale: SiteLocale, country: SiteCountry = siteConfig.defaultCountry): `/${SiteLocale}/${SiteCountry}` {
  return `/${locale}/${country}`;
}

export function localizedPathname(pathname: string, locale: SiteLocale, country: SiteCountry = siteConfig.defaultCountry): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${localizedRootPath(locale, country)}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export const languageAlternates = {
  en: localizedRootPath('en'),
  ar: localizedRootPath('ar')
} as const;
