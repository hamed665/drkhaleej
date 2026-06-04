import { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

export const homeRoute = (locale: SupportedLocale, country: SupportedCountry) => `/${locale}/${country}`;

export const publicDiscoverySlugs = ['doctors', 'centers', 'pharmacies', 'labs', 'services', 'search'] as const;
export type PublicDiscoverySlug = (typeof publicDiscoverySlugs)[number];

export const publicDiscoveryRoute = (
  locale: SupportedLocale,
  country: SupportedCountry,
  slug: PublicDiscoverySlug
) => `/${locale}/${country}/${slug}`;

export const publicUiSlugs = ['articles', 'sign-in', 'register', 'list-your-center', 'for-providers'] as const;
export type PublicUiSlug = (typeof publicUiSlugs)[number];

export const publicUiRoute = (locale: SupportedLocale, country: SupportedCountry, slug: PublicUiSlug) =>
  `/${locale}/${country}/${slug}`;

export const publicArticlesRoute = (locale: SupportedLocale, country: SupportedCountry) =>
  publicUiRoute(locale, country, 'articles');

export const publicArticleDetailRoute = (
  locale: SupportedLocale,
  country: SupportedCountry,
  articleSlug: string
) => `/${locale}/${country}/articles/${articleSlug}`;

export const publicSignInRoute = (locale: SupportedLocale, country: SupportedCountry) =>
  publicUiRoute(locale, country, 'sign-in');

export const publicRegisterRoute = (locale: SupportedLocale, country: SupportedCountry) =>
  publicUiRoute(locale, country, 'register');

export const publicListYourCenterRoute = (locale: SupportedLocale, country: SupportedCountry) =>
  publicUiRoute(locale, country, 'list-your-center');

export const publicProviderRoute = (locale: SupportedLocale, country: SupportedCountry) =>
  `/${locale}/${country}/for-providers`;

export const publicCenterDetailRoute = (
  locale: SupportedLocale,
  country: SupportedCountry,
  centerSlug: string
) => `/${locale}/${country}/center/${centerSlug}`;

export const publicDoctorDetailRoute = (
  locale: SupportedLocale,
  country: SupportedCountry,
  doctorSlug: string
) => `/${locale}/${country}/doctor/${doctorSlug}`;

export const localeCountryRoutePattern = /^\/(en|ar)\/(om)(?:\/)?$/;
export const localeCountryDiscoveryRoutePattern =
  /^\/(en|ar)\/(om)\/(doctors|centers|pharmacies|labs|services|search)(?:\/)?$/;
export const publicUiRoutePattern = /^\/(en|ar)\/(om)\/(articles|sign-in|register|list-your-center|for-providers)(?:\/)?$/;
export const publicArticleDetailRoutePattern = /^\/(en|ar)\/(om)\/articles\/([^/]+)(?:\/)?$/;
export const publicProviderRoutePattern = /^\/(en|ar)\/(om)\/for-providers(?:\/)?$/;
export const publicDoctorDetailRoutePattern = /^\/(en|ar)\/(om)\/doctor\/([^/]+)(?:\/)?$/;
