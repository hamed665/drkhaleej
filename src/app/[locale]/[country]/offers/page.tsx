import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicDiscoveryHero2026 } from "@/components/public/discovery/PublicDiscoveryHero2026";
import { PublicDiscoveryFaq2026 } from "@/components/public/discovery/PublicDiscoveryFaq2026";
import { PublicDiscoveryResultsShell2026 } from "@/components/public/discovery/PublicDiscoveryResultsShell2026";
import { buildOffersDiscoveryConfig } from "@/components/public/discovery/publicDiscoveryPageConfig";
import type { SupportedCountry, SupportedLocale } from "@/lib/i18n/config";
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
} from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";
import { buildFaqJsonLd } from "@/lib/seo/faq-jsonld";

type Params = { locale: string; country: string };

const metadataCopyByLocale: Record<
  SupportedLocale,
  { title: string; description: string }
> = {
  en: {
    title: "Healthcare and Wellness Offers in Oman | DrKhaleej",
    description:
      "Browse approved healthcare, beauty, pharmacy, lab and wellness offers in Oman. Public discovery only, not medical advice.",
  },
  ar: {
    title: "عروض الصحة والعافية في عُمان | DrKhaleej",
    description:
      "تصفح عروض الصحة والتجميل والصيدليات والمختبرات والعافية المعتمدة في عُمان. اكتشاف عام فقط وليس نصيحة طبية.",
  },
};

const compactEmptyCopyByLocale: Record<SupportedLocale, string> = {
  en: "Approved public offers will appear here after provider review.",
  ar: "ستظهر العروض العامة المعتمدة هنا بعد مراجعة مقدم الخدمة.",
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
    pathname: "/offers",
    title: copy.title,
    description: copy.description,
  });
}

export default async function PublicOffersPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = buildOffersDiscoveryConfig(safeLocale, safeCountry, dir);

  return (
    <main
      className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--offers"
      dir={dir}
      data-country={safeCountry}
      data-locale={safeLocale}
    >
      <PublicDiscoveryHero2026 config={config} whatsAppHref={null} />
      <PublicDiscoveryResultsShell2026
        config={config}
        isEmpty
        compactEmptyText={compactEmptyCopyByLocale[safeLocale]}
      >
        {null}
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
