import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicDiscoveryHero2026 } from "@/components/public/discovery/PublicDiscoveryHero2026";
import { PublicDiscoveryFaq2026 } from "@/components/public/discovery/PublicDiscoveryFaq2026";
import { PublicDiscoveryResultsShell2026 } from "@/components/public/discovery/PublicDiscoveryResultsShell2026";
import { buildPharmaciesDiscoveryConfig } from "@/components/public/discovery/publicDiscoveryPageConfig";
import { PublicDirectoryListingContent } from "@/components/public/public-directory-listing-content";
import { listPublicCenters } from "@/lib/catalog/public-queries";
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
  en: "Approved pharmacy listings will appear here after review.",
  ar: "ستظهر قوائم الصيدليات المعتمدة هنا بعد المراجعة.",
};

const metadataCopyByLocale: Record<
  SupportedLocale,
  { title: string; description: string }
> = {
  en: {
    title: "Pharmacies in Oman | DrMuscat",
    description:
      "Browse pharmacies, medicine access, health products and care essentials in Oman. Public discovery only, not medical advice.",
  },
  ar: {
    title: "الصيدليات في عُمان | DrMuscat",
    description:
      "تصفح الصيدليات وخدمات الوصول للأدوية والمنتجات الصحية واحتياجات الرعاية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.",
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
    pathname: "/pharmacies",
    title: copy.title,
    description: copy.description,
  });
}

export default async function PublicPharmaciesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = buildPharmaciesDiscoveryConfig(safeLocale, safeCountry, dir);
  const result = await listPublicCenters({
    country: safeCountry,
    centerType: "pharmacy",
  });

  return (
    <main
      className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--pharmacies"
      dir={dir}
      data-country={safeCountry}
      data-locale={safeLocale}
    >
      <PublicDiscoveryHero2026 config={config} whatsAppHref={null} />
      <PublicDiscoveryResultsShell2026
        config={config}
        isEmpty={result.ok && result.data.length === 0}
        compactEmptyText={compactEmptyCopyByLocale[safeLocale]}
      >
        <PublicDirectoryListingContent
          locale={safeLocale}
          variant="center"
          result={result}
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
