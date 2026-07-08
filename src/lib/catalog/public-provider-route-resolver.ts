import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicCenterDetailRoute, publicDoctorDetailRoute } from '@/lib/routes/public';

export const publicProviderRouteFamilies = [
  'doctor',
  'center',
  'hospital',
  'clinic',
  'dental_clinic',
  'dentist',
  'pharmacy',
  'lab',
  'imaging_center',
  'beauty_clinic',
  'charity_center',
  'pet_clinic',
  'pet_shop',
] as const;

export type PublicProviderRouteFamily = (typeof publicProviderRouteFamilies)[number];

export type PublicProviderRouteReason =
  | 'enabled'
  | 'unsupported_family'
  | 'missing_slug'
  | 'route_disabled'
  | 'invalid_locale'
  | 'invalid_country';

export type PublicProviderCanonicalRouteResult = {
  canonicalPath: string | null;
  routeFamily: PublicProviderRouteFamily | null;
  publicRouteEnabled: boolean;
  reason: PublicProviderRouteReason;
};

export type PublicProviderCanonicalRouteInput = {
  family: string;
  slug: string | null | undefined;
  locale: SupportedLocale | string;
  country: SupportedCountry | string;
};

const supportedLocales = new Set(['en', 'ar']);
const supportedCountries = new Set(['om']);
const supportedFamilies = new Set<string>(publicProviderRouteFamilies);

function normalizeSlug(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const slug = value.trim();
  if (slug.length === 0) return null;
  if (slug.includes('/')) return null;
  return slug;
}

function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.has(value);
}

function isSupportedCountry(value: string): value is SupportedCountry {
  return supportedCountries.has(value);
}

function isPublicProviderRouteFamily(value: string): value is PublicProviderRouteFamily {
  return supportedFamilies.has(value);
}

export function resolvePublicProviderCanonicalRoute(
  input: PublicProviderCanonicalRouteInput,
): PublicProviderCanonicalRouteResult {
  const { family } = input;

  if (!isPublicProviderRouteFamily(family)) {
    return {
      canonicalPath: null,
      routeFamily: null,
      publicRouteEnabled: false,
      reason: 'unsupported_family',
    };
  }

  if (!isSupportedLocale(input.locale)) {
    return {
      canonicalPath: null,
      routeFamily: family,
      publicRouteEnabled: false,
      reason: 'invalid_locale',
    };
  }

  if (!isSupportedCountry(input.country)) {
    return {
      canonicalPath: null,
      routeFamily: family,
      publicRouteEnabled: false,
      reason: 'invalid_country',
    };
  }

  const slug = normalizeSlug(input.slug);
  if (slug === null) {
    return {
      canonicalPath: null,
      routeFamily: family,
      publicRouteEnabled: false,
      reason: 'missing_slug',
    };
  }

  if (family === 'doctor') {
    return {
      canonicalPath: publicDoctorDetailRoute(input.locale, input.country, slug),
      routeFamily: family,
      publicRouteEnabled: true,
      reason: 'enabled',
    };
  }

  if (family === 'center') {
    return {
      canonicalPath: publicCenterDetailRoute(input.locale, input.country, slug),
      routeFamily: family,
      publicRouteEnabled: true,
      reason: 'enabled',
    };
  }

  return {
    canonicalPath: null,
    routeFamily: family,
    publicRouteEnabled: false,
    reason: 'route_disabled',
  };
}
