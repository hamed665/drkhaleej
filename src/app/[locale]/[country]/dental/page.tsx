import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicDiscoveryHero2026 } from "@/components/public/discovery/PublicDiscoveryHero2026";
import { PublicDiscoveryFaq2026 } from "@/components/public/discovery/PublicDiscoveryFaq2026";
import { PublicDiscoveryResultsShell2026 } from "@/components/public/discovery/PublicDiscoveryResultsShell2026";
import { buildDentalDiscoveryConfig } from "@/components/public/discovery/publicDiscoveryPageConfig";
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
    title: "Dental Clinics in Oman | DrMuscat",
    description:
      "Browse dental clinics, dentists, orthodontics, implants, whitening and oral care services in Oman. Public discovery only, not medical advice.",
  },
  ar: {
    title: "عيادات الأسنان في عُمان | DrMuscat",
    description:
      "تصفح عيادات الأسنان وأطباء الأسنان والتقويم والزراعة والتبييض وخدمات العناية بالفم في عُمان. اكتشاف عام فقط وليس نصيحة طبية.",
  },
};

const emptyStateCopyByLocale: Record<SupportedLocale, string> = {
  en: "No approved dental listings are available yet.",
  ar: "لا توجد قوائم أسنان معتمدة متاحة حالياً.",
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
    pathname: "/dental",
    title: copy.title,
    description: copy.description,
  });
}

export default async function PublicDentalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const config = buildDentalDiscoveryConfig(safeLocale, safeCountry, dir);

  return (
    <main
      className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--dental"
      dir={dir}
      data-country={safeCountry}
      data-locale={safeLocale}
    >
      <PublicDiscoveryHero2026 config={config} whatsAppHref={null} />
      <PublicDiscoveryResultsShell2026 config={config}>
        <section
          className="mt-10 rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-sm leading-6 text-slate-600 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <p>{emptyStateCopyByLocale[safeLocale]}</p>
        </section>
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
