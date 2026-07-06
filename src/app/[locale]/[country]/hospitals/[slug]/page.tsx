import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

type Params = { locale: string; country: string; slug: string };
type JsonRecord = Record<string, Json | undefined>;

type ImportPublishQueueRow = {
  id: string;
  metadata: Json;
  target_entity: string | null;
  publish_status: string | null;
  index_policy: string | null;
  sitemap_policy: string | null;
  updated_at: string | null;
};

type ImportEntityCandidateRow = {
  id: string;
  candidate_payload: Json;
  candidate_status: string | null;
  entity_type: string | null;
};

type ImportedHospitalProfile = {
  slug: string;
  nameEn: string;
  nameAr: string | null;
  summaryEn: string;
  area: string | null;
  wilayat: string | null;
  governorate: string | null;
  languages: string[];
  services: string[];
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
};

function jsonRecord(value: Json | undefined): JsonRecord {
  if (value === null || value === undefined || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonRecord;
}

function stringValue(record: JsonRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

function stringList(record: JsonRecord, ...keys: string[]): string[] {
  for (const key of keys) {
    const value = record[key];
    if (!Array.isArray(value)) continue;
    return value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim());
  }
  return [];
}

function canonicalSlug(path: string | null): string | null {
  if (!path) return null;
  const parts = path.split("/").filter(Boolean);
  const hospitalsIndex = parts.indexOf("hospitals");
  const slug = hospitalsIndex >= 0 ? parts[hospitalsIndex + 1] : parts.at(-1);
  return slug && /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

function candidateSections(candidate: ImportEntityCandidateRow | null) {
  const root = jsonRecord(candidate?.candidate_payload);
  return {
    root,
    profile: jsonRecord(root.profile),
    identity: jsonRecord(root.identity),
    geo: jsonRecord(root.geo),
    taxonomy: jsonRecord(root.taxonomy),
    evidence: jsonRecord(root.evidence),
  };
}

function candidateName(candidate: ImportEntityCandidateRow | null): string | null {
  const { root, profile, identity } = candidateSections(candidate);
  return stringValue(profile, "name", "nameEn", "name_en") ?? stringValue(identity, "name", "nameEn", "name_en") ?? stringValue(root, "name", "nameEn", "name_en");
}

function candidateLocation(candidate: ImportEntityCandidateRow | null) {
  const { root, profile, geo } = candidateSections(candidate);
  return {
    area: stringValue(profile, "area") ?? stringValue(geo, "area") ?? stringValue(root, "area"),
    wilayat: stringValue(profile, "wilayat") ?? stringValue(geo, "wilayat") ?? stringValue(root, "wilayat"),
    governorate: stringValue(profile, "governorate") ?? stringValue(geo, "governorate") ?? stringValue(root, "governorate"),
  };
}

function candidateId(row: ImportPublishQueueRow): string | null {
  return stringValue(jsonRecord(row.metadata), "import_entity_candidate_id", "candidate_id", "candidateId");
}

function isPublicHospitalQueueRow(row: ImportPublishQueueRow, slug: string): boolean {
  const metadata = jsonRecord(row.metadata);
  const canonicalPath = stringValue(metadata, "canonical_path", "canonicalPath");
  return (
    row.target_entity === "hospital" &&
    row.publish_status === "index_eligible" &&
    row.index_policy === "index" &&
    row.sitemap_policy === "included" &&
    canonicalSlug(canonicalPath) === slug
  );
}

async function getImportedHospitalProfile(slug: string): Promise<ImportedHospitalProfile | null> {
  const supabase = createSupabaseServerClient() as unknown as { from: (table: string) => any };
  const { data: queueRows, error: queueError } = await supabase
    .from("import_publish_queue")
    .select("id,metadata,target_entity,publish_status,index_policy,sitemap_policy,updated_at")
    .eq("target_entity", "hospital")
    .eq("publish_status", "index_eligible")
    .eq("index_policy", "index")
    .eq("sitemap_policy", "included")
    .limit(50);

  if (queueError || !queueRows) return null;

  const row = ((queueRows as ImportPublishQueueRow[]).find((item) => isPublicHospitalQueueRow(item, slug))) ?? null;
  if (!row) return null;

  const id = candidateId(row);
  let candidate: ImportEntityCandidateRow | null = null;

  if (id) {
    const { data: candidateRow, error: candidateError } = await supabase
      .from("import_entity_candidates")
      .select("id,candidate_payload,candidate_status,entity_type")
      .eq("id", id)
      .maybeSingle();

    if (!candidateError && candidateRow) candidate = candidateRow as ImportEntityCandidateRow;
  }

  if (candidate?.entity_type && candidate.entity_type !== "hospital") return null;
  if (candidate?.candidate_status && candidate.candidate_status !== "approved") return null;

  const metadata = jsonRecord(row.metadata);
  const nameEn = candidateName(candidate) ?? stringValue(metadata, "name", "nameEn", "name_en", "title");
  if (!nameEn) return null;

  const { root, profile, taxonomy, evidence } = candidateSections(candidate);
  const nameAr = stringValue(profile, "nameAr", "name_ar") ?? stringValue(root, "nameAr", "name_ar") ?? stringValue(metadata, "nameAr", "name_ar");
  const location = candidateLocation(candidate);
  const services = Array.from(new Set([...stringList(taxonomy, "services", "service_slugs"), ...stringList(profile, "services", "service_slugs"), ...stringList(root, "services", "service_slugs")]));
  const languages = Array.from(new Set([...stringList(taxonomy, "languages"), ...stringList(profile, "languages"), ...stringList(root, "languages")]));
  const sourceName = stringValue(evidence, "sourceName", "source_name") ?? stringValue(root, "sourceName", "source_name") ?? stringValue(metadata, "sourceName", "source_name");
  const sourceUrl = stringValue(evidence, "sourceUrl", "source_url", "url") ?? stringValue(root, "sourceUrl", "source_url", "url") ?? stringValue(metadata, "sourceUrl", "source_url", "url");
  const lastCheckedAt = stringValue(evidence, "lastCheckedAt", "last_checked_at", "checkedAt", "checked_at") ?? stringValue(root, "lastCheckedAt", "last_checked_at", "checkedAt", "checked_at") ?? stringValue(metadata, "lastCheckedAt", "last_checked_at", "checkedAt", "checked_at") ?? row.updated_at;
  const locationText = [location.area, location.wilayat, location.governorate].filter(Boolean).join(", ") || "Oman";
  const serviceText = services.length > 0 ? services.map((service) => service.replace(/[-_]/g, " ")).join(", ") : "hospital services";

  return {
    slug,
    nameEn,
    nameAr,
    summaryEn: `${nameEn} is listed as a reviewed public hospital profile in ${locationText}. Public directory signals include ${serviceText}. Current details should be confirmed directly with the provider.`,
    ...location,
    languages,
    services,
    sourceName,
    sourceUrl,
    lastCheckedAt,
  };
}

function label(locale: SupportedLocale, en: string, ar: string): string {
  return locale === "ar" ? ar : en;
}

function profileName(profile: ImportedHospitalProfile, locale: SupportedLocale): string {
  return locale === "ar" ? profile.nameAr ?? profile.nameEn : profile.nameEn;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country, slug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const profile = await getImportedHospitalProfile(slug);
  if (!profile) return {};

  return buildLocalizedMetadata({
    locale,
    country,
    pathname: `/hospitals/${slug}`,
    title: `${profileName(profile, locale)} | Hospitals in Oman | DrKhaleej`,
    description: profile.summaryEn,
  });
}

export default async function ImportedHospitalDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, country, slug } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const profile = await getImportedHospitalProfile(slug);
  if (!profile) notFound();

  const name = profileName(profile, safeLocale);
  const location = [profile.area, profile.wilayat, profile.governorate].filter(Boolean).join(", ");

  return (
    <main
      className="home-foundation dm2026-home-page dm2026-doctors-page dm2026-public-discovery-page dm2026-public-discovery-page--hospitals dm2026-imported-provider-detail"
      dir={dir}
      data-country={safeCountry}
      data-locale={safeLocale}
      data-profile-family="hospitals"
    >
      <nav className="dm2026-container" aria-label={label(safeLocale, "Breadcrumb", "مسار التنقل")}>
        <ol className="dm2026-breadcrumbs">
          <li><Link href={`/${safeLocale}/${safeCountry}`}>{label(safeLocale, "Home", "الرئيسية")}</Link></li>
          <li><Link href={`/${safeLocale}/${safeCountry}/hospitals`}>{label(safeLocale, "Hospitals in Oman", "المستشفيات في عُمان")}</Link></li>
          <li aria-current="page">{name}</li>
        </ol>
      </nav>

      <section className="dm2026-container dm2026-search-surface">
        <div className="dm2026-doctors-hero__copy">
          <p className="dm2026-badge">{label(safeLocale, "Reviewed public hospital profile", "ملف مستشفى عام مُراجع")}</p>
          <h1>{name}</h1>
          <p>{profile.summaryEn}</p>
        </div>
      </section>

      <section className="dm2026-container dm2026-doctors-listings" aria-label={label(safeLocale, "Hospital profile details", "تفاصيل ملف المستشفى")}>
        <article className="dm2026-card-soft">
          <h2>{label(safeLocale, "Profile overview", "نظرة عامة على الملف")}</h2>
          <p>{profile.summaryEn}</p>
          <dl className="dm2026-profile-facts-grid">
            {location ? <div><dt>{label(safeLocale, "Location", "الموقع")}</dt><dd>{location}</dd></div> : null}
            {profile.languages.length > 0 ? <div><dt>{label(safeLocale, "Languages", "اللغات")}</dt><dd>{profile.languages.join(", ")}</dd></div> : null}
            {profile.services.length > 0 ? <div><dt>{label(safeLocale, "Reviewed service signals", "إشارات الخدمات المراجعة")}</dt><dd>{profile.services.map((service) => service.replace(/[-_]/g, " ")).join(", ")}</dd></div> : null}
            {profile.lastCheckedAt ? <div><dt>{label(safeLocale, "Last checked", "آخر مراجعة")}</dt><dd>{profile.lastCheckedAt.slice(0, 10)}</dd></div> : null}
          </dl>
        </article>

        <article className="dm2026-card-soft">
          <h2>{label(safeLocale, "Source and verification", "المصدر والتحقق")}</h2>
          <p>{label(safeLocale, "This profile is generated from reviewed public import data. It is for discovery only and should not be treated as medical advice or a guarantee of availability.", "تم إنشاء هذا الملف من بيانات عامة مستوردة ومراجعة. الغرض منه الاكتشاف فقط ولا يُعد نصيحة طبية أو ضماناً لتوفر الخدمة.")}</p>
          {profile.sourceUrl ? <p><a href={profile.sourceUrl} rel="nofollow noopener noreferrer" target="_blank">{profile.sourceName ?? label(safeLocale, "Source", "المصدر")}</a></p> : null}
        </article>
      </section>
    </main>
  );
}
