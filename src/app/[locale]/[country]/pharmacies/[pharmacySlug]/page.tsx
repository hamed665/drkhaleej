import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";
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
  qualityLabel: string;
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
    qualityLabel: "Quality score",
  },
  ar: {
    badge: "ملف صيدلية عام",
    fallbackTitle: "ملف صيدلية | DrKhaleej",
    fallbackDescription: "اطلع على معلومات عامة مراجعة عن الصيدليات في عُمان عبر DrKhaleej.",
    overviewTitle: "نظرة عامة على الملف",
    servicesTitle: "خدمات الصيدلية",
    contactTitle: "التواصل والاتجاهات",
    sourceLabel: "المصدر",
    qualityLabel: "درجة الجودة",
  },
};

function metadataTitle(name: string): string {
  return `${name} | DrKhaleej`;
}

function profileDescription(name: string): string {
  return `${name} on DrKhaleej. Public pharmacy discovery in Oman only; not medical advice or emergency care.`;
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
  return buildLocalizedMetadata({
    locale,
    country,
    pathname: `/pharmacies/${pharmacySlug}`,
    title: metadataTitle(name),
    description: profileDescription(name),
  });
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
  const location = localArea([profile.area, profile.wilayat, profile.governorate]);
  const serviceSignals = [...profile.services, ...profile.departments].slice(0, 8);

  return (
    <main className="home-foundation dm2026-home-page" dir={dir} data-profile-family={profile.family}>
      <section className="dm2026-container dm2026-search-surface" aria-labelledby="pharmacy-profile-title">
        <div className="dm2026-doctors-hero__copy">
          <span className="dm2026-badge">{copy.badge}</span>
          <h1 id="pharmacy-profile-title">{title}</h1>
          {profile.nameAr && locale !== "ar" ? <p>{profile.nameAr}</p> : null}
          <p>{profileDescription(title)}</p>
        </div>
      </section>

      <section className="dm2026-container dm2026-doctors-listings" aria-labelledby="pharmacy-profile-overview-title">
        <div className="dm2026-card-soft">
          <h2 id="pharmacy-profile-overview-title">{copy.overviewTitle}</h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-950">Location</dt>
              <dd>{location}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Languages</dt>
              <dd>{profile.languages.length > 0 ? profile.languages.join(", ") : "Not listed"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Last checked</dt>
              <dd>{profile.lastCheckedAt}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Canonical path</dt>
              <dd>{profile.canonicalPath}</dd>
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
                Call
              </a>
            ) : null}
            {profile.whatsappE164 ? (
              <a className="dm2026-button dm2026-button-secondary" href={`https://wa.me/${profile.whatsappE164.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : null}
            {profile.email ? (
              <a className="dm2026-button dm2026-button-secondary" href={`mailto:${profile.email}`}>
                Email
              </a>
            ) : null}
            {profile.websiteUrl ? (
              <a className="dm2026-button dm2026-button-secondary" href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            ) : null}
            {profile.googleMapsUrl ? (
              <a className="dm2026-button dm2026-button-secondary" href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                Google Maps
              </a>
            ) : null}
            {profile.directionUrl ? (
              <a className="dm2026-button dm2026-button-secondary" href={profile.directionUrl} target="_blank" rel="noopener noreferrer">
                Directions
              </a>
            ) : null}
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          {copy.sourceLabel}: {profile.sourceName ?? profile.sourceUrl}. {copy.qualityLabel}: {profile.qualityScore}.
        </p>
      </section>
    </main>
  );
}
