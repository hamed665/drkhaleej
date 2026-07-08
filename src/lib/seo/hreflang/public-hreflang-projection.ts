export type PublicHreflangLocale = 'en-OM' | 'ar-OM' | 'x-default';

export type PublicHreflangProjectionInput = {
  pageType: string;
  entityType: string;
  entityId: string;
  locale: 'en' | 'ar';
  country: 'om';
  canonicalPath: string | null;
  publicRouteEnabled: boolean;
  publicSafe: boolean;
  indexable: boolean;
  pairedLocaleCanonicalPath: string | null;
  pairedLocalePublicSafe: boolean;
  pairedLocaleRouteEnabled: boolean;
  pairedLocaleIndexable: boolean;
  blockedByImportedHospitalRelease: boolean;
};

export type PublicHreflangAlternate = {
  hreflang: PublicHreflangLocale;
  path: string;
};

export type PublicHreflangProjection = {
  pageType: string;
  entityType: string;
  entityId: string;
  canonicalPath: string;
  alternates: PublicHreflangAlternate[];
  sitemapAlternates: PublicHreflangAlternate[];
};

function localeCode(locale: 'en' | 'ar'): Exclude<PublicHreflangLocale, 'x-default'> {
  return locale === 'en' ? 'en-OM' : 'ar-OM';
}

function pairedLocaleCode(locale: 'en' | 'ar'): Exclude<PublicHreflangLocale, 'x-default'> {
  return locale === 'en' ? 'ar-OM' : 'en-OM';
}

function isValidCanonicalPath(path: string | null): path is string {
  return typeof path === 'string' && path.startsWith('/') && path.trim().length > 1;
}

export function projectPublicHreflang(
  input: PublicHreflangProjectionInput,
): PublicHreflangProjection | null {
  if (input.country !== 'om') return null;
  if (!isValidCanonicalPath(input.canonicalPath)) return null;
  if (!input.publicRouteEnabled) return null;
  if (!input.publicSafe) return null;
  if (!input.indexable) return null;
  if (!isValidCanonicalPath(input.pairedLocaleCanonicalPath)) return null;
  if (!input.pairedLocalePublicSafe) return null;
  if (!input.pairedLocaleRouteEnabled) return null;
  if (!input.pairedLocaleIndexable) return null;
  if (input.blockedByImportedHospitalRelease) return null;

  const selfAlternate: PublicHreflangAlternate = {
    hreflang: localeCode(input.locale),
    path: input.canonicalPath,
  };

  const pairedAlternate: PublicHreflangAlternate = {
    hreflang: pairedLocaleCode(input.locale),
    path: input.pairedLocaleCanonicalPath,
  };

  const defaultAlternate: PublicHreflangAlternate = {
    hreflang: 'x-default',
    path: input.locale === 'en' ? input.canonicalPath : input.pairedLocaleCanonicalPath,
  };

  const alternates = [selfAlternate, pairedAlternate, defaultAlternate];

  return {
    pageType: input.pageType,
    entityType: input.entityType,
    entityId: input.entityId,
    canonicalPath: input.canonicalPath,
    alternates,
    sitemapAlternates: alternates,
  };
}
