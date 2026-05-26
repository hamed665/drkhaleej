export const supportedLocales = ['en', 'ar'] as const;
export type SiteLocale = (typeof supportedLocales)[number];

export const supportedCountries = ['om'] as const;
export type SiteCountry = (typeof supportedCountries)[number];

export type LocaleCountry = {
  locale: SiteLocale;
  country: SiteCountry;
};

const LOCAL_FALLBACK_URL = 'http://localhost:3000';

function getBaseUrl(): URL {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!envUrl) return new URL(LOCAL_FALLBACK_URL);

  try {
    return new URL(envUrl);
  } catch {
    return new URL(LOCAL_FALLBACK_URL);
  }
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
