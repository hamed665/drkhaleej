import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { isPublicImportProfileIndexEligible } from "@/lib/catalog/public-import-profile-index-eligibility";
import {
  buildPublicImportProfileMetaDescription,
  buildPublicImportProfileSummary,
  type PublicImportProfileSummaryInput,
} from "@/lib/catalog/public-import-profile-summary";
import { isSupportedCountry, isSupportedLocale, localeDirection, type SupportedLocale } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/seo/site";

type PublicImportHospitalRelatedDoctor = {
  name: string;
  nameAr: string | null;
  slug: string | null;
  specialty: string | null;
  department: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  confidence: string | null;
};

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
  doctors: PublicImportHospitalRelatedDoctor[];
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
  doctorsTitle: string;
  doctorsDescription: string;
  doctorProfileLabel: string;
  contactTitle: string;
  sourceLabel: string;
  relatedTitle: string;
  directoryLabel: string;
  directoryDescription: string;
  locationLabelPrefix: string;
  locationDescription: string;
  serviceLabelPrefix: string;
  serviceDescription: string;
};

type RelatedInternalLink = {
  href: string;
  label: string;
  description: string;
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    badge: "Public hospital profile",
    overviewTitle: "Profile overview",
    servicesTitle: "Hospital services",
    doctorsTitle: "Doctors connected to this hospital",
    doctorsDescription: "Public doctor links appear only when the hospital relationship has reviewed source evidence.",
    doctorProfileLabel: "View doctor profile",
    contactTitle: "Contact and directions",
    sourceLabel: "Source",
    relatedTitle: "Explore related care options",
    directoryLabel: "Browse hospitals in Oman",
    directoryDescription: "See more public hospital profiles across Oman.",
    locationLabelPrefix: "Hospitals near",
    locationDescription: "Find more public hospital profiles around this location.",
    serviceLabelPrefix: "Search care options for",
    serviceDescription: "Use DrKhaleej search to compare related public care options.",
  },
  ar: {
    badge: "ملف مستشفى عام",
    overviewTitle: "نظرة عامة على الملف",
    servicesTitle: "خدمات المستشفى",
    doctorsTitle: "أطباء مرتبطون بهذا المستشفى",
    doctorsDescription: "تظهر روابط الأطباء العامة فقط عند وجود دليل مصدر للعلاقة مع المستشفى.",
    doctorProfileLabel: "عرض ملف الطبيب",
    contactTitle: "التواصل والاتجاهات",
    sourceLabel: "المصدر",
    relatedTitle: "استكشف خيارات رعاية مرتبطة",
    directoryLabel: "تصفح المستشفيات في عُمان",
    directoryDescription: "اطلع على ملفات مستشفيات عامة أخرى في عُمان.",
    locationLabelPrefix: "مستشفيات بالقرب من",
    locationDescription: "اعثر على ملفات مستشفيات عامة أخرى حول هذا الموقع.",
    serviceLabelPrefix: "ابحث عن خيارات رعاية لـ",
    serviceDescription: "استخدم بحث DrKhaleej لمقارنة خيارات رعاية عامة مرتبطة.",
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

function displayName(locale: SupportedLocale, name: string, nameAr: string | null): string {
  return locale === "ar" && nameAr ? nameAr : name;
}

function doctorDisplayName(locale: SupportedLocale, doctor: PublicImportHospitalRelatedDoctor): string {
  return locale === "ar" && doctor.nameAr ? doctor.nameAr : doctor.name;
}

function localArea(parts: Array<string | null>): string {
  return parts.filter(Boolean).join(", ") || "Oman";
}

function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteConfig.baseUrl).toString();
}

function publicSearchHref(locale: SupportedLocale, country: string, query: string): string {
  return `/${locale}/${country}/search?q=${encodeURIComponent(query)}`;
}

function publicHospitalsHref(locale: SupportedLocale, country: string): string {
  return `/${locale}/${country}/hospitals`;
}

function publicDoctorHref(locale: SupportedLocale, country: string, doctor: PublicImportHospitalRelatedDoctor): string {
  return doctor.slug ? `/${locale}/${country}/doctor/${doctor.slug}` : publicSearchHref(locale, country, doctor.name);
}

function uniqueText(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

function dedupeLinks(links: RelatedInternalLink[]): RelatedInternalLink[] {
  const seen = new Set<string>();
  const result: RelatedInternalLink[] = [];

  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    result.push(link);
  }

  return result;
}

function buildRelatedInternalLinks(input: {
  locale: SupportedLocale;
  country: string;
  profile: PublicImportHospitalProfile;
  serviceSignals: string[];
}): RelatedInternalLink[] {
  const { locale, country, profile, serviceSignals } = input;
  const copy = copyByLocale[locale];
  const links: RelatedInternalLink[] = [
    {
      href: publicHospitalsHref(locale, country),
      label: copy.directoryLabel,
      description: copy.directoryDescription,
    },
  ];

  for (const place of uniqueText([profile.area, profile.wilayat, profile.governorate]).slice(0, 3)) {
    links.push({
      href: publicSearchHref(locale, country, `${place} hospital`),
      label: `${copy.locationLabelPrefix} ${place}`,
      description: copy.locationDescription,
    });
  }

  for (const signal of serviceSignals.slice(0, 5)) {
    links.push({
      href: publicSearchHref(locale, country, signal),
      label: `${copy.serviceLabelPrefix} ${signal}`,
      description: copy.serviceDescription,
    });
  }

  return dedupeLinks(links).slice(0, 9);
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
  const profileSummary = buildPublicImportProfileSummary(locale, profile satisfies PublicImportProfileSummaryInput);
  const description = buildPublicImportProfileMetaDescription(profileSummary);
  const pathname = `/${locale}/${country}/hospitals/${hospitalSlug}`;
  const canonical = absoluteUrl(pathname);
  const englishAlternate = absoluteUrl(`/en/${country}/hospitals/${hospitalSlug}`);
  const arabicAlternate = absoluteUrl(`/ar/${country}/hospitals/${hospitalSlug}`);
  const location = localArea([profile.area, profile.wilayat, profile.governorate]);
  const serviceSignals = uniqueText([...profile.services, ...profile.departments]).slice(0, 8);
  const relatedInternalLinks = buildRelatedInternalLinks({ locale, country, profile, serviceSignals });
  const importIndexEligibility = isPublicImportProfileIndexEligible(profile);

  return (
    <>
      <Head>
        <title>{metadataTitle(title)}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={importIndexEligibility.eligible ? "index,follow" : "noindex,follow"} />
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
            <p>{profileSummary}</p>
          </div>
        </section>

        <section className="dm2026-container dm2026-doctors-listings" aria-labelledby="hospital-profile-overview-title">
          <div className="dm2026-card-soft">
            <h2 id="hospital-profile-overview-title">{copy.overviewTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{profileSummary}</p>
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
            </dl>
          </div>

          {serviceSignals.length > 0 ? (
            <div className="dm2026-card-soft mt-4">
              <h2>{copy.servicesTitle}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {serviceSignals.map((item) => (
                  <Link key={item} href={publicSearchHref(locale, country, item)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {profile.doctors.length > 0 ? (
            <div className="dm2026-card-soft mt-4">
              <h2>{copy.doctorsTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy.doctorsDescription}</p>
              <ul className="mt-3 grid gap-3 md:grid-cols-2" role="list">
                {profile.doctors.map((doctor) => {
                  const doctorName = doctorDisplayName(locale, doctor);
                  return (
                    <li key={doctor.slug ?? doctor.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3>
                        <Link href={publicDoctorHref(locale, country, doctor)} className="text-sm font-semibold text-slate-950 underline-offset-4 hover:underline">
                          {doctorName}
                        </Link>
                      </h3>
                      {doctor.specialty || doctor.department ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {[doctor.specialty, doctor.department].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      <Link href={publicDoctorHref(locale, country, doctor)} className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline-offset-4 hover:underline">
                        {copy.doctorProfileLabel}
                      </Link>
                    </li>
                  );
                })}
              </ul>
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

          {relatedInternalLinks.length > 0 ? (
            <div className="dm2026-card-soft mt-4">
              <h2>{copy.relatedTitle}</h2>
              <ul className="mt-3 grid gap-3 md:grid-cols-2" role="list">
                {relatedInternalLinks.map((link) => (
                  <li key={link.href} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <Link href={link.href} className="text-sm font-semibold text-slate-950 underline-offset-4 hover:underline">
                      {link.label}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-4 text-xs leading-5 text-slate-500">
            {copy.sourceLabel}: {profile.sourceName ?? profile.sourceUrl}. Confirm details directly with the provider.
          </p>
        </section>
      </main>
    </>
  );
}
