import { sitemapMarketCountries } from '@/lib/market/public-market';
import { localizedPathname, localizedRootPath, siteConfig, type SiteCountry, type SiteLocale } from '@/lib/seo/site';

export type SeoPageFamily =
  | 'country_root'
  | 'directory'
  | 'provider_onboarding'
  | 'policy';

export type SeoPageIndexPolicy = 'index' | 'noindex_until_ready';
export type SeoPageReadiness = 'ready' | 'needs_content' | 'blocked';

export type SeoPageLaunchGateReason =
  | 'market-root'
  | 'trust-directory'
  | 'provider-onboarding'
  | 'policy-noindex'
  | 'search-utility-noindex'
  | 'money-page-needs-real-data'
  | 'offers-engine-not-public'
  | 'legacy-non-core-needs-reapproval';

export type PublicSeoPageDefinition = {
  readonly id: string;
  readonly pathname: string;
  readonly family: SeoPageFamily;
  readonly indexPolicy: SeoPageIndexPolicy;
  readonly readiness: SeoPageReadiness;
  readonly sitemapEligible: boolean;
  readonly priority: number;
  readonly changeFrequency: 'daily' | 'weekly' | 'monthly';
  readonly launchGateReason: SeoPageLaunchGateReason;
};

type StaticPublicPageDefinition = {
  readonly pathname: string;
  readonly family: Exclude<SeoPageFamily, 'country_root'>;
  readonly indexPolicy: SeoPageIndexPolicy;
  readonly readiness: SeoPageReadiness;
  readonly sitemapEligible: boolean;
  readonly priority: number;
  readonly changeFrequency: 'daily' | 'weekly' | 'monthly';
  readonly launchGateReason: SeoPageLaunchGateReason;
};

const publicStaticPages = [
  {
    pathname: '/doctors',
    family: 'directory',
    indexPolicy: 'index',
    readiness: 'ready',
    sitemapEligible: true,
    priority: 0.8,
    changeFrequency: 'weekly',
    launchGateReason: 'trust-directory',
  },
  {
    pathname: '/dental',
    family: 'directory',
    indexPolicy: 'noindex_until_ready',
    readiness: 'needs_content',
    sitemapEligible: false,
    priority: 0.6,
    changeFrequency: 'weekly',
    launchGateReason: 'money-page-needs-real-data',
  },
  {
    pathname: '/centers',
    family: 'directory',
    indexPolicy: 'index',
    readiness: 'ready',
    sitemapEligible: true,
    priority: 0.8,
    changeFrequency: 'weekly',
    launchGateReason: 'trust-directory',
  },
  {
    pathname: '/labs',
    family: 'directory',
    indexPolicy: 'index',
    readiness: 'ready',
    sitemapEligible: true,
    priority: 0.8,
    changeFrequency: 'weekly',
    launchGateReason: 'trust-directory',
  },
  {
    pathname: '/pharmacies',
    family: 'directory',
    indexPolicy: 'index',
    readiness: 'ready',
    sitemapEligible: true,
    priority: 0.85,
    changeFrequency: 'weekly',
    launchGateReason: 'trust-directory',
  },
  {
    pathname: '/hospitals',
    family: 'directory',
    indexPolicy: 'index',
    readiness: 'ready',
    sitemapEligible: true,
    priority: 0.85,
    changeFrequency: 'weekly',
    launchGateReason: 'trust-directory',
  },
  {
    pathname: '/offers',
    family: 'directory',
    indexPolicy: 'noindex_until_ready',
    readiness: 'blocked',
    sitemapEligible: false,
    priority: 0.4,
    changeFrequency: 'weekly',
    launchGateReason: 'offers-engine-not-public',
  },
  {
    pathname: '/beauty',
    family: 'directory',
    indexPolicy: 'noindex_until_ready',
    readiness: 'needs_content',
    sitemapEligible: false,
    priority: 0.5,
    changeFrequency: 'weekly',
    launchGateReason: 'money-page-needs-real-data',
  },
  {
    pathname: '/pet-clinics',
    family: 'directory',
    indexPolicy: 'noindex_until_ready',
    readiness: 'blocked',
    sitemapEligible: false,
    priority: 0.3,
    changeFrequency: 'monthly',
    launchGateReason: 'legacy-non-core-needs-reapproval',
  },
  {
    pathname: '/pet-shops',
    family: 'directory',
    indexPolicy: 'noindex_until_ready',
    readiness: 'blocked',
    sitemapEligible: false,
    priority: 0.3,
    changeFrequency: 'monthly',
    launchGateReason: 'legacy-non-core-needs-reapproval',
  },
  {
    pathname: '/services',
    family: 'directory',
    indexPolicy: 'index',
    readiness: 'ready',
    sitemapEligible: true,
    priority: 0.75,
    changeFrequency: 'weekly',
    launchGateReason: 'trust-directory',
  },
  {
    pathname: '/search',
    family: 'directory',
    indexPolicy: 'noindex_until_ready',
    readiness: 'needs_content',
    sitemapEligible: false,
    priority: 0.4,
    changeFrequency: 'monthly',
    launchGateReason: 'search-utility-noindex',
  },
  {
    pathname: '/for-providers',
    family: 'provider_onboarding',
    indexPolicy: 'index',
    readiness: 'ready',
    sitemapEligible: true,
    priority: 0.7,
    changeFrequency: 'weekly',
    launchGateReason: 'provider-onboarding',
  },
  {
    pathname: '/source-policy',
    family: 'policy',
    indexPolicy: 'noindex_until_ready',
    readiness: 'needs_content',
    sitemapEligible: false,
    priority: 0.25,
    changeFrequency: 'monthly',
    launchGateReason: 'policy-noindex',
  },
] as const satisfies readonly StaticPublicPageDefinition[];

function pageId(locale: SiteLocale, country: SiteCountry, pathname: string): string {
  const normalizedPath = pathname === '/' ? 'root' : pathname.replace(/^\//, '').replace(/\//g, '_');
  return `${locale}_${country}_${normalizedPath}`;
}

function normalizeStaticPathname(pathname: string): string {
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const trimmed = withLeadingSlash.replace(/\/+$/g, '');
  return trimmed.length === 0 ? '/' : trimmed;
}

function countryRootPage(locale: SiteLocale, country: SiteCountry): PublicSeoPageDefinition {
  const pathname = localizedRootPath(locale, country);

  return {
    id: pageId(locale, country, '/'),
    pathname,
    family: 'country_root',
    indexPolicy: 'index',
    readiness: 'ready',
    sitemapEligible: true,
    priority: 1,
    changeFrequency: 'weekly',
    launchGateReason: 'market-root',
  };
}

function localizedStaticPage(
  locale: SiteLocale,
  country: SiteCountry,
  definition: StaticPublicPageDefinition,
): PublicSeoPageDefinition {
  return {
    id: pageId(locale, country, definition.pathname),
    pathname: localizedPathname(definition.pathname, locale, country),
    family: definition.family,
    indexPolicy: definition.indexPolicy,
    readiness: definition.readiness,
    sitemapEligible: definition.sitemapEligible,
    priority: definition.priority,
    changeFrequency: definition.changeFrequency,
    launchGateReason: definition.launchGateReason,
  };
}

export function listPublicSeoPageDefinitions(): PublicSeoPageDefinition[] {
  return sitemapMarketCountries.flatMap((country) =>
    siteConfig.locales.flatMap((locale) => [
      countryRootPage(locale, country),
      ...publicStaticPages.map((definition) => localizedStaticPage(locale, country, definition)),
    ]),
  );
}

export function getPublicSeoPageDefinition(input: {
  pathname: string;
  locale?: SiteLocale;
  country?: SiteCountry;
}): PublicSeoPageDefinition | null {
  const locale = input.locale ?? siteConfig.defaultLocale;
  const country = input.country ?? siteConfig.defaultCountry;
  const staticPathname = normalizeStaticPathname(input.pathname);
  const targetPathname = staticPathname === '/'
    ? localizedRootPath(locale, country)
    : localizedPathname(staticPathname, locale, country);

  return listPublicSeoPageDefinitions().find((page) => page.pathname === targetPathname) ?? null;
}

export function isSitemapReadySeoPageDefinition(page: PublicSeoPageDefinition): boolean {
  return page.indexPolicy === 'index' && page.readiness === 'ready' && page.sitemapEligible;
}

export function listSitemapEligibleSeoPageDefinitions(): PublicSeoPageDefinition[] {
  return listPublicSeoPageDefinitions().filter(isSitemapReadySeoPageDefinition);
}
