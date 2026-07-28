import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  buildPublicImportProfileMetaDescription,
  buildPublicImportProfileSummary,
  type PublicImportProfileSummaryInput,
} from "@/lib/catalog/public-import-profile-summary";
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { createJsonLd, serializeJsonLd } from "@/lib/seo/jsonld";
import { buildCanonicalUrl, buildLocalizedMetadata } from "@/lib/seo/metadata";
import { buildProfileNoindexMetadata } from "@/lib/seo/profile-metadata-index-gate";
import { getPublicImportPharmacyProfile } from "@/server/public/import-pharmacy-profile-guard";

type Params = { locale: string; country: string; pharmacySlug: string };

type RouteCopy = {
  badge: string;
  fallbackTitle: string;
  fallbackDescription: string;
  overviewTitle: string;
  servicesTitle: string;
  contactTitle: string;
  sourceLabel: string;
  locationLabel: string;
  languagesLabel: string;
  lastCheckedLabel: string;
  notListed: string;
  callLabel: string;
  whatsappLabel: string;
  emailLabel: string;
  websiteLabel: string;
  mapsLabel: string;
  directionsLabel: string;
  directoryLabel: string;
  providerConfirmation: string;
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    badge: "Public pharmacy profile",
    fallbackTitle: "Pharmacy Profile | DrKhaleej",
    fallbackDescription: "View reviewed public pharmacy information in Oman on DrKhaleej.",
    overviewTitle: "Profile overview",
    servicesTitle: "Pharmacy services",
    contactTitle: "Contact and directions",
    sourceLabel: "Source",
    locationLabel: "Location",
    languagesLabel: "Languages",
    lastCheckedLabel: "Last checked",
    notListed: "Not listed",
    callLabel: "Call",
    whatsappLabel: "WhatsApp",
    emailLabel: "Email",
    websiteLabel: "Website",
    mapsLabel: "Google Maps",
    directionsLabel: "Directions",
    directoryLabel: "Browse pharmacies",
    providerConfirmation: "Confirm details directly with the provider.",
  },
  ar: {
    badge: "ملف صيدلية عام",
    fallbackTitle: "ملف صيدلية | DrKhaleej",
    fallbackDescription: "اطلع على معلومات عامة مراجعة عن الصيدليات في عُمان عبر DrKhaleej.",
    overviewTitle: "نظرة عامة على الملف",
    servicesTitle: "خدمات الصيدلية",
    contactTitle: "التواصل والاتجاهات",
    sourceLabel: "المصدر",
    locationLabel: "الموقع",
    languagesLabel: "اللغات",
    lastCheckedLabel: "آخر تحقق",
    notListed: "غير مدرج",
    callLabel: "اتصال",
    whatsappLabel: "واتساب",
    emailLabel: "البريد الإلكتروني",
    websiteLabel: "الموقع الإلكتروني",
    mapsLabel: "خرائط Google",
    directionsLabel: "الاتجاهات",
    directoryLabel: "تصفح الصيدليات",
    providerConfirmation: "يرجى تأكيد التفاصيل مباشرةً مع مقدم الخدمة.",
  },
};

function metadataTitle(name: string): string {
  return `${name} | DrKhaleej`;
}

function displayName(locale: SupportedLocale, name: string, nameAr: string | null): string {
  return locale === "ar" && nameAr ? nameAr : name;
}

function localArea(parts: Array<string | null>): string {
  return parts.filter(Boolean).join(", ") || "Oman";
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, pharmacySlug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const result = await getPublicImportPharmacyProfile({ locale, country, pharmacySlug });
  if (!result.ok) {
    const copy = copyByLocale[locale];
    return {
      ...buildLocalizedMetadata({
        locale,
        country,
        pathname: `/pharmacies/${pharmacySlug}`,
        title: copy.fallbackTitle,
        description: copy.fallbackDescription,
      }),
      robots: { index: false, follow: true },
    };
  }

  const name = displayName(locale, result.profile.name, result.profile.nameAr);
  const profileSummary = buildPublicImportProfileSummary(locale, result.profile satisfies PublicImportProfileSummaryInput);
  const metadata = buildLocalizedMetadata({
    locale,
    country,
    pathname: `/pharmacies/${pharmacySlug}`,
    title: metadataTitle(name),
    description: buildPublicImportProfileMetaDescription(profileSummary),
  });
  return buildProfileNoindexMetadata(metadata);
}

export default async function PublicImportedPharmacyProfilePage({ params }: { params: Promise<Params> }) {
  const { locale, country, pharmacySlug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const result = await getPublicImportPharmacyProfile({ locale, country, pharmacySlug });
  if (!result.ok) notFound();

  const copy = copyByLocale[locale];
  const profile = result.profile;
  const dir = localeDirection(locale);
  const title = displayName(locale, profile.name, profile.nameAr);
  const profileSummary = buildPublicImportProfileSummary(locale, profile satisfies PublicImportProfileSummaryInput);
  const location = localArea([profile.area, profile.wilayat, profile.governorate]);
  const serviceSignals = [...profile.services, ...profile.departments].slice(0, 8);
  const addressLocality = profile.area ?? profile.wilayat;
  const jsonLd = createJsonLd({
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    name: title,
    url: buildCanonicalUrl(`/pharmacies/${pharmacySlug}`, locale, country),
    description: profileSummary,
    address: {
      "@type": "PostalAddress",
      ...(addressLocality ? { addressLocality } : {}),
      ...(profile.governorate ? { addressRegion: profile.governorate } : {}),
      addressCountry: "OM",
    },
  });

  return (
    <main
      className="home-foundation dm2026-home-page"
      dir={dir}
      data-profile-family={profile.family}
      data-index-policy="noindex"
      data-sitemap-policy="excluded"
    >
      <section className="dm2026-container dm2026-search-surface" aria-labelledby="pharmacy-profile-title">
        <div className="dm2026-doctors-hero__copy">
          <span className="dm2026-badge">{copy.badge}</span>
          <h1 id="pharmacy-profile-title">{title}</h1>
          {profile.nameAr && locale !== "ar" ? <p>{profile.nameAr}</p> : null}
          <p>{profileSummary}</p>
        </div>
      </section>

      <section className="dm2026-container dm2026-doctors-listings" aria-labelledby="pharmacy-profile-overview-title">
        <div className="dm2026-card-soft">
          <h2 id="pharmacy-profile-overview-title">{copy.overviewTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{profileSummary}</p>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-950">{copy.locationLabel}</dt>
              <dd>{location}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">{copy.languagesLabel}</dt>
              <dd>{profile.languages.length > 0 ? profile.languages.join(", ") : copy.notListed}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">{copy.lastCheckedLabel}</dt>
              <dd>{profile.lastCheckedAt}</dd>
            </div>
          </dl>
        </div>

        {serviceSignals.length > 0 ? (
          <div className="dm2026-card-soft mt-4">
            <h2>{copy.servicesTitle}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {serviceSignals.map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="dm2026-card-soft mt-4">
          <h2>{copy.contactTitle}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.phoneE164 ? (
              <a className="dm2026-button dm2026-button-secondary" href={`tel:${profile.phoneE164}`}>
                {copy.callLabel}
              </a>
            ) : null}
            {profile.whatsappE164 ? (
              <a className="dm2026-button dm2026-button-secondary" href={`https://wa.me/${profile.whatsappE164.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
                {copy.whatsappLabel}
              </a>
            ) : null}
            {profile.email ? (
              <a className="dm2026-button dm2026-button-secondary" href={`mailto:${profile.email}`}>
                {copy.emailLabel}
              </a>
            ) : null}
            {profile.websiteUrl ? (
              <a className="dm2026-button dm2026-button-secondary" href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                {copy.websiteLabel}
              </a>
            ) : null}
            {profile.googleMapsUrl ? (
              <a className="dm2026-button dm2026-button-secondary" href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                {copy.mapsLabel}
              </a>
            ) : null}
            {profile.directionUrl ? (
              <a className="dm2026-button dm2026-button-secondary" href={profile.directionUrl} target="_blank" rel="noopener noreferrer">
                {copy.directionsLabel}
              </a>
            ) : null}
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          {copy.sourceLabel}: {profile.sourceName ?? profile.sourceUrl}. {copy.providerConfirmation}
        </p>
        <Link
          className="mt-4 inline-flex text-sm font-semibold text-teal-800 underline-offset-4 hover:underline"
          href={`/${locale}/${country}/pharmacies`}
        >
          {copy.directoryLabel}
        </Link>
      </section>
      <script
        id={`pharmacy-profile-jsonld-${locale}-${pharmacySlug}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
    </main>
  );
}
