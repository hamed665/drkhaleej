import { sitemapMarketCountries } from '@/lib/market/public-market';
import { localizedPathname, localizedRootPath, siteConfig, type SiteCountry, type SiteLocale } from '@/lib/seo/site';

export type SeoPageFamily =
  | 'country_root'
  | 'directory'
  | 'provider_onboarding';

export type SeoPageIndexPolicy = 'index' | 'noindex_until_ready';

export type PublicSeoPageDefinition = {
  readonly id: string;
  readonly pathname: string;
  readonly family: SeoPageFamily;
  readonly indexPolicy: SeoPageIndexPolicy;
  readonly sitemapEligible: boolean;
  readonly priority: number;
  readonly changeFrequency: 'daily' | 'weekly' | 'monthly';
};

const publicDirectoryPages = [
  '/doctors',
  '/dental',
  '/centers',
  '/labs',
  '/pharmacies',
  '/hospitals',
  '/offers',
  '/beauty',
  '/pet-clinics',
  '/pet-shops',
  '/services',
  '/search',
] as const;

const publicProviderPages = ['/for-providers'] as const;

function pageId(locale: SiteLocale, country: SiteCountry, pathname: string): string {
  const normalizedPath = pathname === '/' ? 'root' : pathname.replace(/^\//, '').replace(/\//g, '_');
  return `${locale}_${country}_${normalizedPath}`;
}

function countryRootPage(locale: SiteLocale, country: SiteCountry): PublicSeoPageDefinition {
  const pathname = localizedRootPath(locale, country);

  return {
    id: pageId(locale, country, '/'),
    pathname,
    family: 'country_root',
    indexPolicy: 'index',
    sitemapEligible: true,
    priority: 1,
    changeFrequency: 'weekly',
  };
}

function localizedStaticPage(
  locale: SiteLocale,
  country: SiteCountry,
  pathname: string,
  family: Exclude<SeoPageFamily, 'country_root'>,
): PublicSeoPageDefinition {
  return {
    id: pageId(locale, country, pathname),
    pathname: localizedPathname(pathname, locale, country),
    family,
    indexPolicy: 'index',
    sitemapEligible: true,
    priority: 0.8,
    changeFrequency: 'weekly',
  };
}

export function listPublicSeoPageDefinitions(): PublicSeoPageDefinition[] {
  return sitemapMarketCountries.flatMap((country) =>
    siteConfig.locales.flatMap((locale) => [
      countryRootPage(locale, country),
      ...publicDirectoryPages.map((pathname) =>
        localizedStaticPage(locale, country, pathname, 'directory'),
      ),
      ...publicProviderPages.map((pathname) =>
        localizedStaticPage(locale, country, pathname, 'provider_onboarding'),
      ),
    ]),
  );
}

export function listSitemapEligibleSeoPageDefinitions(): PublicSeoPageDefinition[] {
  return listPublicSeoPageDefinitions().filter(
    (page) => page.indexPolicy === 'index' && page.sitemapEligible,
  );
}
