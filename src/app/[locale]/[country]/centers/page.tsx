import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicDiscoveryHero2026 } from "@/components/public/discovery/PublicDiscoveryHero2026";
import { PublicDiscoveryFaq2026 } from "@/components/public/discovery/PublicDiscoveryFaq2026";
import { PublicDiscoveryResultsShell2026 } from "@/components/public/discovery/PublicDiscoveryResultsShell2026";
import { buildCentersDiscoveryConfig } from "@/components/public/discovery/publicDiscoveryPageConfig";
import { cleanConfigBrand } from "@/components/public/discovery/configBrand";
import { PublicDirectoryListingContent } from "@/components/public/public-directory-listing-content";
import {
  centerDirectoryResultFromSearch,
  firstDirectorySearchParamValue,
  isDirectorySearchQuery,
} from "@/lib/catalog/public-directory-query";
import { listPublicCenters, searchPublicCatalog } from "@/lib/catalog/public-eligible-queries";
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";
import { buildFaqJsonLd } from "@/lib/seo/faq-jsonld";

type Params = { locale: string; country: string };
type SearchParams = Record<string, string | string[] | undefined>;

const compactEmptyCopyByLocale: Record<SupportedLocale, string> = {
  en: "Approved clinic and center listings will appear here after review.",
  ar: "ستظهر قوائم العيادات والمراكز المعتمدة هنا بعد المراجعة.",
};

const searchEmptyCopyByLocale: Record<SupportedLocale, string> = {
  en: "No public eligible center results matched this search yet.",
  ar: "لا توجد نتائج مراكز عامة مؤهلة لهذا البحث حتى الآن.",
};

const metadataCopyByLocale: Record<
  SupportedLocale,
  { title: string; description: string }
> = {
  en: {
    title: "Clinics and Medical Centers in Oman | DrKhaleej",
    description:
      "Browse clinics, medical centers, services and care options in Oman. Public discovery only, not medical advice.",
  },
  ar: {
    title: "العيادات والمراكز الطبية في عُمان | DrKhaleej",
    description:
      "تصفح العيادات والمراكز الطبية والخدمات وخيارات الرعاية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = metadataCopyByLocale[locale];
  return buildLocalizedMetadata({
    locale,
    country,
    pathname: "/centers",
    title: copy.title,
    description: copy.description,
  });
}

export default async function PublicCentersPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = cleanConfigBrand(buildCentersDiscoveryConfig(safeLocale, safeCountry, dir));
  const query = firstDirectorySearchParamValue((await searchParams).q);
  const isDirectorySearch = isDirectorySearchQuery(query);
  const result = isDirectorySearch
    ? centerDirectoryResultFromSearch(await searchPublicCatalog(query, { limit: 24 }))
    : await listPublicCenters({ country: safeCountry });
  const emptyText = isDirectorySearch
    ? searchEmptyCopyByLocale[safeLocale]
    : compactEmptyCopyByLocale[safeLocale];

  return (
    <main
      className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--centers"
      dir={dir}
      data-country={safeCountry}
      data-locale={safeLocale}
    >
      <PublicDiscoveryHero2026 config={config} whatsAppHref={null} />
      <PublicDiscoveryResultsShell2026
        config={config}
        isEmpty={result.ok && result.data.length === 0}
        compactEmptyText={emptyText}
      >
        <PublicDirectoryListingContent
          locale={safeLocale}
          variant="center"
          result={result}
          emptyText={emptyText}
        />
      </PublicDiscoveryResultsShell2026>
      {config.faq ? (
        <PublicDiscoveryFaq2026
          faq={config.faq}
          locale={safeLocale}
          dir={dir}
          idPrefix={config.categoryType}
        />
      ) : null}
      {config.faq ? (
        <script
          id={`dm2026-public-discovery-faq-jsonld-${config.categoryType}-${safeLocale}`}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildFaqJsonLd(config.faq)),
          }}
        />
      ) : null}
    </main>
  );
}
