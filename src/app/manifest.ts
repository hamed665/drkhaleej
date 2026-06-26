import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/seo/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.siteName,
    short_name: 'DrKhaleej',
    description: siteConfig.defaultDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f7faf9',
    theme_color: '#0e6e64',
    categories: ['health', 'medical', 'lifestyle'],
    lang: siteConfig.defaultLocale
  };
}
