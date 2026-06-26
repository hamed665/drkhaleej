import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/seo/site';

const robotsBlockedPaths = [
  '/api/',
  '/admin/',
  '/dashboard/',
  '/import/',
  '/preview/'
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...robotsBlockedPaths]
    },
    sitemap: new URL('/sitemap.xml', siteConfig.baseUrl).toString()
  };
}
