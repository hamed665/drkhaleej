import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicDiscoveryHero2026 } from "@/components/public/discovery/PublicDiscoveryHero2026";
import { PublicDiscoveryFaq2026 } from "@/components/public/discovery/PublicDiscoveryFaq2026";
import { PublicDiscoveryResultsShell2026 } from "@/components/public/discovery/PublicDiscoveryResultsShell2026";
import { buildPetClinicsDiscoveryConfig } from "@/components/public/discovery/publicDiscoveryPageConfig";
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
  en: "Approved pet clinic listings will appear here after review.",
  ar: "ستظهر قوائم العيادات البيطرية المعتمدة هنا بعد المراجعة.",
};

const metadataCopyByLocale: Record<
  SupportedLocale,
  { title: string; description: string }
> = {
  en: {
    title: "Pet Clinics in Oman | DrMuscat",
    description:
      "Browse veterinary clinics, pet care services and animal health options in Oman. Public discovery only, not veterinary advice.",
  },
  ar: {
    title: "العيادات البيطرية في عُمان | DrMuscat",
    description:
      "تصفح العيادات البيطرية وخدمات رعاية الحيوانات وخيارات صحة الحيوانات في عُمان. اكتشاف عام فقط وليس نصيحة بيطرية.",
  },
};

const emptyPetClinicResult: PublicCatalogQueryResult<PublicCenterSummary[]> = {
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
    pathname: "/pet-clinics",
    title: copy.title,
    description: copy.description,
  });
}

export default async function PublicPetClinicsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = buildPetClinicsDiscoveryConfig(safeLocale, safeCountry, dir);

  return (
    <main
      className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--pet-clinics"
      dir={dir}
      data-country={safeCountry}
      data-locale={safeLocale}
    >
      <PublicDiscoveryHero2026 config={config} whatsAppHref={null} />
      <PublicDiscoveryResultsShell2026
        config={config}
        isEmpty={emptyPetClinicResult.ok && emptyPetClinicResult.data.length === 0}
        compactEmptyText={compactEmptyCopyByLocale[safeLocale]}
      >
        <PublicDirectoryListingContent
          locale={safeLocale}
          variant="center"
          result={emptyPetClinicResult}
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
