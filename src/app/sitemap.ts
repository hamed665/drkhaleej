import type { MetadataRoute } from "next";

import { sitemapMarketCountries } from "@/lib/market/public-market";
import { listSitemapEligibleSeoPageDefinitions } from "@/lib/seo/page-registry";
import { localizedRootPath, siteConfig } from "@/lib/seo/site";
import { listPublicImportSitemapEntries } from "@/server/public/import-sitemap";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const marketRootPaths = sitemapMarketCountries.flatMap((country) =>
    siteConfig.locales.map((locale) => localizedRootPath(locale, country)),
  );
  const marketRootPathSet = new Set<string>(marketRootPaths);

  const staticEntries: MetadataRoute.Sitemap = listSitemapEligibleSeoPageDefinitions().map((page) => ({
    url: new URL(page.pathname, siteConfig.baseUrl).toString(),
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: marketRootPathSet.has(page.pathname) ? 1 : page.priority,
  }));

  const importEntries = await listPublicImportSitemapEntries();
  const importedEntries: MetadataRoute.Sitemap = importEntries.map((entry) => ({
    url: new URL(entry.pathname, siteConfig.baseUrl).toString(),
    lastModified: entry.lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...importedEntries];
}
