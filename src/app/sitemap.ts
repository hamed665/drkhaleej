import type { MetadataRoute } from 'next';
import { localizedRootPath, siteConfig } from '@/lib/seo/site';

const discoveryRoutes = ['/doctors', '/centers', '/pharmacies', '/labs', '/services', '/search'] as const;
const providerRoutes = ['/for-providers'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const localeRoots = [localizedRootPath('en'), localizedRootPath('ar')];

  const urls = [
    ...localeRoots,
    ...localeRoots.flatMap((root) => discoveryRoutes.map((route) => `${root}${route}`)),
    ...localeRoots.flatMap((root) => providerRoutes.map((route) => `${root}${route}`))
  ];

  return urls.map((path) => ({
    url: new URL(path, siteConfig.baseUrl).toString(),
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '/en/om' || path === '/ar/om' ? 1 : 0.8
  }));
}
