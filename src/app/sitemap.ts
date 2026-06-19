import type { MetadataRoute } from 'next';
import { sitemapMarketCountries } from '@/lib/market/public-market';
import { localizedRootPath, siteConfig } from '@/lib/seo/site';

const discoveryRoutes = ['/doctors', '/centers', '/pharmacies', '/pet-clinics', '/labs', '/services', '/search'] as const;
const providerRoutes = ['/for-providers'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const localeCountryRoots = sitemapMarketCountries.flatMap((country) =>
    siteConfig.locales.map((locale) => localizedRootPath(locale, country))
  );

  const urls = [
    ...localeCountryRoots,
    ...localeCountryRoots.flatMap((root) => discoveryRoutes.map((route) => `${root}${route}`)),
    ...localeCountryRoots.flatMap((root) => providerRoutes.map((route) => `${root}${route}`))
  ];

  return urls.map((path) => ({
    url: new URL(path, siteConfig.baseUrl).toString(),
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '/en/om' || path === '/ar/om' ? 1 : 0.8
  }));
}
