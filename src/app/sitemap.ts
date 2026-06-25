import type { MetadataRoute } from "next";

import { sitemapMarketCountries } from "@/lib/market/public-market";
import { localizedRootPath, siteConfig } from "@/lib/seo/site";
import { listPublicImportSitemapEntries } from "@/server/public/import-sitemap";

const discoveryRoutes = [
  "/doctors",
  "/dental",
  "/centers",
  "/labs",
  "/pharmacies",
  "/hospitals",
  "/offers",
  "/beauty",
  "/pet-clinics",
  "/pet-shops",
  "/services",
  "/search",
] as const;
const providerRoutes = ["/for-providers"] as const;

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const localeCountryRoots = sitemapMarketCountries.flatMap((country) =>
    siteConfig.locales.map((locale) => localizedRootPath(locale, country)),
  );

  const urls = [
    ...localeCountryRoots,
    ...localeCountryRoots.flatMap((root) => discoveryRoutes.map((route) => `${root}${route}`)),
    ...localeCountryRoots.flatMap((root) => providerRoutes.map((route) => `${root}${route}`)),
  ];

  const staticEntries: MetadataRoute.Sitemap = urls.map((path) => ({
    url: new URL(path, siteConfig.baseUrl).toString(),
    lastModified,
    changeFrequency: "weekly",
    priority: path === "/en/om" || path === "/ar/om" ? 1 : 0.8,
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
