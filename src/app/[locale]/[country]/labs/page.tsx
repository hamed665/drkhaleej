import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicDiscoveryHero2026 } from "@/components/public/discovery/PublicDiscoveryHero2026";
import { PublicDiscoveryFaq2026 } from "@/components/public/discovery/PublicDiscoveryFaq2026";
import { PublicDiscoveryResultsShell2026 } from "@/components/public/discovery/PublicDiscoveryResultsShell2026";
import { buildLabsDiscoveryConfig } from "@/components/public/discovery/publicDiscoveryPageConfig";
import { cleanConfigBrand } from "@/components/public/discovery/configBrand";
import { PublicDirectoryListingContent } from "@/components/public/public-directory-listing-content";
import { listPublicCenters } from "@/lib/catalog/public-eligible-queries";
import { buildWhatsAppUrl, getPublicWhatsAppNumber } from "@/lib/contact/whatsapp";
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
  en: "Approved lab listings will appear here after review.",
  ar: "ستظهر قوائم المختبرات المعتمدة هنا بعد المراجعة.",
};

const metadataCopyByLocale: Record<
  SupportedLocale,
  { title: string; description: string }
> = {
  en: {
    title: "Labs in Oman | DrKhaleej",
    description:
      "Browse medical labs, test services and sample collection options across Oman. Public discovery only, not medical advice.",
  },
  ar: {
    title: "المختبرات في عُمان | DrKhaleej",
    description:
      "تصفح المختبرات الطبية وخدمات الفحوصات وخيارات سحب العينات في عُمان. اكتشاف عام فقط وليس نصيحة طبية.",
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
    pathname: "/labs",
    title: copy.title,
    description: copy.description,
  });
}

export default async function PublicLabsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = cleanConfigBrand(buildLabsDiscoveryConfig(safeLocale, safeCountry, dir));
  const result = await listPublicCenters({
    country: safeCountry,
    centerType: "laboratory",
  });
  const whatsAppNumber = getPublicWhatsAppNumber();
  const whatsAppHref = buildWhatsAppUrl(
    whatsAppNumber,
    config.whatsAppMessage ?? "",
  );

  return (
    <main
      className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--labs"
      dir={dir}
      data-country={safeCountry}
      data-locale={safeLocale}
    >
      <PublicDiscoveryHero2026 config={config} whatsAppHref={whatsAppHref} />
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
