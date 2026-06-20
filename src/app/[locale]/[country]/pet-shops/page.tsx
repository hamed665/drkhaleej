import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicDiscoveryHero2026 } from "@/components/public/discovery/PublicDiscoveryHero2026";
import { PublicDiscoveryFaq2026 } from "@/components/public/discovery/PublicDiscoveryFaq2026";
import { PublicDiscoveryResultsShell2026 } from "@/components/public/discovery/PublicDiscoveryResultsShell2026";
import { buildPetShopsDiscoveryConfig } from "@/components/public/discovery/publicDiscoveryPageConfig";
import { PublicDirectoryListingContent } from "@/components/public/public-directory-listing-content";
import type {
  PublicCatalogQueryResult,
  PublicCenterSummary,
} from "@/lib/catalog/public-types";
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

const compactEmptyCopyByLocale: Record<SupportedLocale, string> = {
  en: "Approved pet shop listings will appear here after review.",
  ar: "ستظهر قوائم متاجر الحيوانات المعتمدة هنا بعد المراجعة.",
};

const metadataCopyByLocale: Record<
  SupportedLocale,
  { title: string; description: string }
> = {
  en: {
    title: "Pet Shops in Oman | DrMuscat",
    description:
      "Browse pet shops, pet food, supplies, grooming products and care essentials in Oman. Public discovery only, not veterinary advice.",
  },
  ar: {
    title: "متاجر الحيوانات في عُمان | DrMuscat",
    description:
      "تصفح متاجر الحيوانات وطعام الحيوانات والمستلزمات ومنتجات العناية والاحتياجات الأساسية في عُمان. اكتشاف عام فقط وليس نصيحة بيطرية.",
  },
};

const emptyPetShopResult: PublicCatalogQueryResult<PublicCenterSummary[]> = {
  ok: true,
  data: [],
  emptyReason: "query_not_implemented",
  error: null,
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
    pathname: "/pet-shops",
    title: copy.title,
    description: copy.description,
  });
}

export default async function PublicPetShopsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = buildPetShopsDiscoveryConfig(safeLocale, safeCountry, dir);

  return (
    <main
      className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--pet-shops"
      dir={dir}
      data-country={safeCountry}
      data-locale={safeLocale}
    >
      <PublicDiscoveryHero2026 config={config} whatsAppHref={null} />
      <PublicDiscoveryResultsShell2026
        config={config}
        isEmpty={emptyPetShopResult.ok && emptyPetShopResult.data.length === 0}
        compactEmptyText={compactEmptyCopyByLocale[safeLocale]}
      >
        <PublicDirectoryListingContent
          locale={safeLocale}
          variant="center"
          result={emptyPetShopResult}
          emptyText={compactEmptyCopyByLocale[safeLocale]}
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
