import type { MetadataRoute } from "next";

import { sitemapMarketCountries } from "@/lib/market/public-market";
import { listSitemapEligibleSeoPageDefinitions } from "@/lib/seo/page-registry";
import { localizedRootPath, siteConfig } from "@/lib/seo/site";
import { listPublicImportSitemapEntries } from "@/server/public/import-sitemap";

type SitemapEntryInput = {
  readonly pathname: string;
  readonly lastModified?: Date;
  readonly changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  readonly priority: number;
};

export const dynamic = "force-dynamic";

function localizedAlternates(
  pathname: string,
  eligiblePathnames: ReadonlySet<string>,
): MetadataRoute.Sitemap[number]["alternates"] | undefined {
  const match = pathname.match(/^\/(en|ar)\/(om)(\/.*)?$/);
  if (match === null) return undefined;

  const [, , country, suffix = ""] = match;
  const englishPathname = `/en/${country}${suffix}`;
  const arabicPathname = `/ar/${country}${suffix}`;

  if (!eligiblePathnames.has(englishPathname) || !eligiblePathnames.has(arabicPathname)) {
    return undefined;
  }

  const englishUrl = new URL(englishPathname, siteConfig.baseUrl).toString();

  return {
    languages: {
      "en-OM": englishUrl,
      "ar-OM": new URL(arabicPathname, siteConfig.baseUrl).toString(),
      "x-default": englishUrl,
    },
  };
}

function toSitemapEntry(
  entry: SitemapEntryInput,
  eligiblePathnames: ReadonlySet<string>,
): MetadataRoute.Sitemap[number] {
  const alternates = localizedAlternates(entry.pathname, eligiblePathnames);

  return {
    url: new URL(entry.pathname, siteConfig.baseUrl).toString(),
    ...(entry.lastModified === undefined ? {} : { lastModified: entry.lastModified }),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    ...(alternates === undefined ? {} : { alternates }),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketRootPaths = sitemapMarketCountries.flatMap((country) =>
    siteConfig.locales.map((locale) => localizedRootPath(locale, country)),
  );
  const marketRootPathSet = new Set<string>(marketRootPaths);

  const staticEntries: SitemapEntryInput[] = listSitemapEligibleSeoPageDefinitions().map((page) => ({
    pathname: page.pathname,
    changeFrequency: page.changeFrequency,
    priority: marketRootPathSet.has(page.pathname) ? 1 : page.priority,
  }));

  const importEntries = await listPublicImportSitemapEntries();
  const importedEntries: SitemapEntryInput[] = importEntries.map((entry) => ({
    pathname: entry.pathname,
    lastModified: entry.lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const candidates = [...staticEntries, ...importedEntries];
  const eligiblePathnames = new Set(candidates.map((entry) => entry.pathname));
  const uniqueEntries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const candidate of candidates) {
    const entry = toSitemapEntry(candidate, eligiblePathnames);
    if (!uniqueEntries.has(entry.url)) uniqueEntries.set(entry.url, entry);
  }

  return [...uniqueEntries.values()];
}
