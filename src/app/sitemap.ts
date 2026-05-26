import type { MetadataRoute } from 'next';
import { localizedRootPath, siteConfig } from '@/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [localizedRootPath('en'), localizedRootPath('ar')].map((path) => ({
    url: new URL(path, siteConfig.baseUrl).toString(),
    lastModified,
    changeFrequency: 'weekly',
    priority: 1
  }));
}
