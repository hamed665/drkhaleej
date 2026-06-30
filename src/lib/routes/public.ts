import { SupportedCountry, SupportedLocale } from "@/lib/i18n/config";

export const homeRoute = (locale: SupportedLocale, country: SupportedCountry) =>
  `/${locale}/${country}`;

export const publicDiscoverySlugs = [
  "doctors",
  "dental",
  "centers",
  "labs",
  "pharmacies",
  "hospitals",
  "offers",
  "beauty",
  "pet-clinics",
  "pet-shops",
  "services",
  "search",
] as const;
export type PublicDiscoverySlug = (typeof publicDiscoverySlugs)[number];

export const publicDiscoveryRoute = (
  locale: SupportedLocale,
  country: SupportedCountry,
  slug: PublicDiscoverySlug,
) => `/${locale}/${country}/${slug}`;

export const publicProviderRoute = (
  locale: SupportedLocale,
  country: SupportedCountry,
) => `/${locale}/${country}/for-providers`;

export const publicCenterDetailRoute = (
  locale: SupportedLocale,
  country: SupportedCountry,
  centerSlug: string,
) => `/${locale}/${country}/center/${centerSlug}`;

export const publicDoctorDetailRoute = (
  locale: SupportedLocale,
  country: SupportedCountry,
  doctorSlug: string,
) => `/${locale}/${country}/doctor/${doctorSlug}`;

export const localeCountryRoutePattern = /^\/(en|ar)\/(om)(?:\/)?$/;
export const localeCountryDiscoveryRoutePattern =
  /^\/(en|ar)\/(om)\/(doctors|dental|centers|labs|pharmacies|hospitals|offers|beauty|pet-clinics|pet-shops|services|search)(?:\/)?$/;
export const publicProviderRoutePattern =
  /^\/(en|ar)\/(om)\/for-providers(?:\/)?$/;
export const publicCenterDetailRoutePattern =
  /^\/(en|ar)\/(om)\/center\/([^/]+)(?:\/)?$/;
export const publicDoctorDetailRoutePattern =
  /^\/(en|ar)\/(om)\/doctor\/([^/]+)(?:\/)?$/;
