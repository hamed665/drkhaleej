import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { isSupportedCountry, isSupportedLocale, localeDirection, type SupportedLocale } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/seo/site";

type PublicImportHospitalProfile = {
  family: "hospitals";
  canonicalPath: string;
  entityType: "hospital";
  name: string;
  nameAr: string | null;
  area: string | null;
  wilayat: string | null;
  governorate: string | null;
  services: string[];
  departments: string[];
  languages: string[];
  phoneE164: string | null;
  whatsappE164: string | null;
  email: string | null;
  websiteUrl: string | null;
  googleMapsUrl: string | null;
  directionUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  qualityScore: number;
};

type HospitalProfileApiPayload =
  | { ok: true; profile: PublicImportHospitalProfile }
  | { ok: false };

type HospitalPageProps = {
  locale: SupportedLocale;
  country: "om";
  hospitalSlug: string;
  profile: PublicImportHospitalProfile;
};

type MaybeParam = string | string[] | undefined;

type RouteCopy = {
  badge: string;
  overviewTitle: string;
  servicesTitle: string;
  contactTitle: string;
  sourceLabel: string;
  qualityLabel: string;
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    badge: "Public hospital profile",
    overviewTitle: "Profile overview",
    servicesTitle: "Hospital services",
    contactTitle: "Contact and directions",
    sourceLabel: "Source",
    qualityLabel: "Quality score",
  },
  ar: {
    badge: "ملف مستشفى عام",
    overviewTitle: "نظرة عامة على الملف",
    servicesTitle: "خدمات المستشفى",
    contactTitle: "التواصل والاتجاهات",
    sourceLabel: "المصدر",
    qualityLabel: "درجة الجودة",
  },
};

function singleParam(value: MaybeParam): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function headerValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function requestBaseUrl(context: GetServerSidePropsContext): string | null {
  const host = headerValue(context.req.headers["x-forwarded-host"]) ?? headerValue(context.req.headers.host);
  if (host === null) return null;

  const proto = headerValue(context.req.headers["x-forwarded-proto"]) ?? "https";
  return `${proto.split(",")[0]}://${host.split(",")[0]}`;
}

function hospitalProfileEndpointUrl(context: GetServerSidePropsContext, locale: string, country: string, hospitalSlug: string): string | null {
  const baseUrl = requestBaseUrl(context);
  if (baseUrl === null) return null;
  return new URL(`/api/_drk/hospital-profile/${locale}/${country}/${hospitalSlug}`, baseUrl).toString();
}

async function loadHospitalProfile(
  context: GetServerSidePropsContext,
  locale: string,
  country: string,
  hospitalSlug: string,
): Promise<PublicImportHospitalProfile | null> {
  const endpointUrl = hospitalProfileEndpointUrl(context, locale, country, hospitalSlug);
  if (endpointUrl === null) return null;

  const response = await fetch(endpointUrl, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as HospitalProfileApiPayload;
  return payload.ok ? payload.profile : null;
}

function metadataTitle(name: string): string {
  return `${name} | DrKhaleej`;
}

function profileDescription(name: string): string {
  return `${name} on DrKhaleej. Public hospital discovery in Oman only; not medical advice or emergency care.`;
}

function displayName(locale: SupportedLocale, name: string, nameAr: string | null): string {
  return locale === "ar" && nameAr ? nameAr : name;
}

function localArea(parts: Array<string | null>): string {
  return parts.filter(Boolean).join(", ") || "Oman";
}

function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteConfig.baseUrl).toString();
}

export const getServerSideProps: GetServerSideProps<HospitalPageProps> = async (context) => {
  const locale = singleParam(context.params?.locale);
  const country = singleParam(context.params?.country);
  const hospitalSlug = singleParam(context.params?.hospitalSlug);

  if (!locale || !country || !hospitalSlug || !isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return { notFound: true };
  }

  const profile = await loadHospitalProfile(context, locale, country, hospitalSlug);
  if (profile === null) {
    return { notFound: true };
  }

  return {
    props: {
      locale,
      country,
      hospitalSlug,
      profile,
    },
  };
};

export default function PublicImportedHospitalProfilePage({
  locale,
  country,
  hospitalSlug,
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const copy = copyByLocale[locale];
  const dir = localeDirection(locale);
  const title = displayName(locale, profile.name, profile.nameAr);
  const description = profileDescription(title);
  const pathname = `/${locale}/${country}/hospitals/${hospitalSlug}`;
  const canonical = absoluteUrl(pathname);
  const englishAlternate = absoluteUrl(`/en/${country}/hospitals/${hospitalSlug}`);
  const arabicAlternate = absoluteUrl(`/ar/${country}/hospitals/${hospitalSlug}`);
  const location = localArea([profile.area, profile.wilayat, profile.governorate]);
  const serviceSignals = [...profile.services, ...profile.departments].slice(0, 8);

  return (
    <>
      <Head>
        <title>{metadataTitle(title)}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en-OM" href={englishAlternate} />
        <link rel="alternate" hrefLang="ar-OM" href={arabicAlternate} />
        <link rel="alternate" hrefLang="x-default" href={englishAlternate} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteConfig.siteName} />
        <meta property="og:title" content={metadataTitle(title)} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadataTitle(title)} />
        <meta name="twitter:description" content={description} />
      </Head>

      <main className="home-foundation dm2026-home-page" dir={dir} data-profile-family={profile.family}>
        <section className="dm2026-container dm2026-search-surface" aria-labelledby="hospital-profile-title">
          <div className="dm2026-doctors-hero__copy">
            <span className="dm2026-badge">{copy.badge}</span>
            <h1 id="hospital-profile-title">{title}</h1>
            {profile.nameAr && locale !== "ar" ? <p>{profile.nameAr}</p> : null}
            <p>{description}</p>
          </div>
        </section>

        <section className="dm2026-container dm2026-doctors-listings" aria-labelledby="hospital-profile-overview-title">
          <div className="dm2026-card-soft">
            <h2 id="hospital-profile-overview-title">{copy.overviewTitle}</h2>
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
    </>
  );
}
