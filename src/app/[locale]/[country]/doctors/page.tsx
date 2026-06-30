import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorsHeroCarousel } from "@/components/public/doctors/DoctorsHeroCarousel";
import { DoctorsSearch2026 } from "@/components/public/doctors/DoctorsSearch2026";
import { PublicDiscoveryFaq2026 } from "@/components/public/discovery/PublicDiscoveryFaq2026";
import { buildDiscoveryFaq } from "@/components/public/discovery/publicDiscoveryPageConfig";
import { PublicDirectoryListingContent } from "@/components/public/public-directory-listing-content";
import {
  doctorDirectoryResultFromSearch,
  firstDirectorySearchParamValue,
  isDirectorySearchQuery,
} from "@/lib/catalog/public-directory-query";
import { listPublicDoctors, searchPublicCatalog } from "@/lib/catalog/public-eligible-queries";
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { buildWhatsAppUrl, getPublicWhatsAppNumber } from "@/lib/contact/whatsapp";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";
import { buildFaqJsonLd } from "@/lib/seo/faq-jsonld";

type Params = { locale: string; country: string };
type SearchParams = Record<string, string | string[] | undefined>;

type RouteCopy = {
  metadataTitle: string;
  metadataDescription: string;
  badge: string;
  title: string;
  description: string;
  listCta: string;
  whatsappCta: string;
  whatsappMessage: string;
  whatsappUnavailable: string;
  resultsHeading: string;
  searchResultsHeading: string;
  resultsSubtext: string;
  searchResultsSubtext: string;
  compactEmptyText: string;
  searchEmptyText: string;
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    metadataTitle: "Doctors in Oman | DrKhaleej",
    metadataDescription:
      "Browse doctors, specialties, clinics and care paths in Oman. Public discovery only, not medical advice.",
    badge: "Doctors in Oman",
    title: "Find doctors in Oman.",
    description:
      "Browse doctors, specialties, clinics and care paths across Oman. Public discovery only, not medical advice.",
    listCta: "List your center",
    whatsappCta: "WhatsApp",
    whatsappMessage:
      "Hello DrKhaleej, I need help with doctor discovery in Oman.",
    whatsappUnavailable: "WhatsApp activation pending",
    resultsHeading: "Browse doctors",
    searchResultsHeading: "Doctor search results",
    resultsSubtext:
      "Search results and public doctor listings appear here after approval.",
    searchResultsSubtext:
      "Showing public eligible doctor results only. Query URLs remain canonical to the base doctors page.",
    compactEmptyText: "Approved doctor profiles will appear here after review.",
    searchEmptyText: "No public eligible doctor results matched this search yet.",
  },
  ar: {
    metadataTitle: "الأطباء في عُمان | DrKhaleej",
    metadataDescription:
      "تصفح الأطباء والتخصصات والعيادات ومسارات الرعاية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.",
    badge: "الأطباء في عُمان",
    title: "ابحث عن أطباء في عُمان.",
    description:
      "تصفح الأطباء والتخصصات والعيادات ومسارات الرعاية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.",
    listCta: "أدرج مركزك",
    whatsappCta: "واتساب",
    whatsappMessage:
      "مرحباً DrKhaleej، أحتاج مساعدة في اكتشاف الأطباء في عُمان.",
    whatsappUnavailable: "تفعيل واتساب قيد الإعداد",
    resultsHeading: "تصفح الأطباء",
    searchResultsHeading: "نتائج البحث عن الأطباء",
    resultsSubtext: "تظهر هنا نتائج البحث وقوائم الأطباء العامة بعد الاعتماد.",
    searchResultsSubtext:
      "تظهر فقط نتائج الأطباء العامة المؤهلة. تبقى روابط البحث مرتبطة بالصفحة الأساسية للأطباء.",
    compactEmptyText: "ستظهر ملفات الأطباء المعتمدة هنا بعد المراجعة.",
    searchEmptyText: "لا توجد نتائج أطباء عامة مؤهلة لهذا البحث حتى الآن.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];

  return buildLocalizedMetadata({
    locale,
    country,
    pathname: "/doctors",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

export default async function PublicDoctorsPage({
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
  const copy = copyByLocale[safeLocale];
  const query = firstDirectorySearchParamValue((await searchParams).q);
  const isDirectorySearch = isDirectorySearchQuery(query);
  const result = isDirectorySearch
    ? doctorDirectoryResultFromSearch(await searchPublicCatalog(query, { limit: 24 }))
    : await listPublicDoctors({ country: safeCountry });
  const whatsAppNumber = getPublicWhatsAppNumber();
  const whatsAppHref = buildWhatsAppUrl(whatsAppNumber, copy.whatsappMessage);
  const faq = buildDiscoveryFaq("doctors", safeLocale === "ar");
  const resultsHeading = isDirectorySearch ? copy.searchResultsHeading : copy.resultsHeading;
  const resultsSubtext = isDirectorySearch ? copy.searchResultsSubtext : copy.resultsSubtext;
  const emptyText = isDirectorySearch ? copy.searchEmptyText : copy.compactEmptyText;

  return (
    <main
      className="home-foundation dm2026-home-page dm2026-doctors-page"
      dir={dir}
      data-country={safeCountry}
      data-locale={safeLocale}
    >
      <section
        className="dm2026-doctors-first-fold dm2026-container"
        aria-labelledby="dm2026-doctors-title"
      >
        <div className="dm2026-doctors-hero-shell dm2026-search-surface">
          <div className="dm2026-doctors-hero-content">
            <div className="dm2026-doctors-hero__copy">
              <span className="dm2026-badge">{copy.badge}</span>
              <h1 id="dm2026-doctors-title">{copy.title}</h1>
              <p>{copy.description}</p>
            </div>
            <div
              className="dm2026-doctors-hero__actions"
              aria-label={copy.badge}
            >
              <Link
                className="dm2026-button dm2026-button-secondary"
                href={`/${safeLocale}/${safeCountry}/for-providers`}
              >
                {copy.listCta}
              </Link>
              {whatsAppHref ? (
                <a
                  className="dm2026-button dm2026-button-ghost"
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.whatsappCta}
                </a>
              ) : (
                <span
                  className="dm2026-button dm2026-button-ghost"
                  aria-disabled="true"
                  title={copy.whatsappUnavailable}
                >
                  {copy.whatsappCta}
                </span>
              )}
            </div>
            <div id="doctor-search" className="dm2026-doctors-hero__search">
              <DoctorsSearch2026
                locale={safeLocale}
                country={safeCountry}
                dir={dir}
                resultsId="doctor-results"
              />
            </div>
          </div>

          <DoctorsHeroCarousel locale={safeLocale} dir={dir} />
        </div>
      </section>

      <section
        id="doctor-results"
        className={
          result.ok && result.data.length === 0
            ? "dm2026-container dm2026-doctors-listings dm2026-public-discovery-listings--compact-empty"
            : "dm2026-container dm2026-doctors-listings"
        }
        aria-labelledby="doctor-results-title"
      >
        {result.ok && result.data.length === 0 ? (
          <div
            className="dm2026-public-discovery-empty-compact dm2026-card-soft"
            role="status"
            aria-live="polite"
          >
            <h2 id="doctor-results-title">{emptyText}</h2>
          </div>
        ) : (
          <>
            <div className="dm2026-doctors-results-header dm2026-card-soft">
              <h2 id="doctor-results-title">{resultsHeading}</h2>
              <p>{resultsSubtext}</p>
            </div>
            <PublicDirectoryListingContent
              locale={safeLocale}
              variant="doctor"
              result={result}
              emptyText={emptyText}
            />
          </>
        )}
      </section>
      <PublicDiscoveryFaq2026
        faq={faq}
        locale={safeLocale}
        dir={dir}
        idPrefix="doctors"
      />
      <script
        id={`dm2026-public-discovery-faq-jsonld-doctors-${safeLocale}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd(faq)),
        }}
      />
    </main>
  );
}
