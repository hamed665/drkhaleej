import type {
  CenterType,
  DoctorTitle,
  PublicCenterSummary,
  PublicDoctorSummary,
} from "./public-types";
import type {
  PublicProviderCountry,
  PublicProviderDiscoveryEntry,
  PublicProviderEntityType,
  PublicProviderFamily,
} from "./public-provider-projection";

export type PublicProviderListOptions = {
  country?: "om";
  family?: PublicProviderFamily;
  entityType?: PublicProviderEntityType;
  limit?: number;
  includeImported?: boolean;
};

const DEFAULT_PROVIDER_LIMIT = 20;
const MAX_PROVIDER_LIMIT = 50;

function clampProviderLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || Number.isNaN(limit)) return DEFAULT_PROVIDER_LIMIT;
  if (limit < 1) return 1;
  return Math.min(limit, MAX_PROVIDER_LIMIT);
}

function providerKey(entry: PublicProviderDiscoveryEntry): string {
  return `${entry.country}:${entry.family}:${entry.slug}`.toLocaleLowerCase();
}

function matchesProviderOptions(entry: PublicProviderDiscoveryEntry, options: PublicProviderListOptions): boolean {
  if (options.country && entry.country !== options.country) return false;
  if (options.family && entry.family !== options.family) return false;
  if (options.entityType && entry.entityType !== options.entityType) return false;
  return true;
}

function publicProviderCountry(country: string): PublicProviderCountry | null {
  return country === "om" ? "om" : null;
}

function centerFamily(centerType: CenterType): PublicProviderFamily {
  if (centerType === "hospital") return "hospitals";
  if (centerType === "pharmacy") return "pharmacies";
  if (centerType === "laboratory") return "labs";
  if (centerType === "imaging_center") return "radiology";
  if (centerType === "dental_clinic") return "dentistry";
  if (centerType === "beauty_clinic" || centerType === "spa") return "beauty";
  return "centers";
}

function centerEntityType(centerType: CenterType): PublicProviderEntityType {
  if (centerType === "hospital") return "hospital";
  if (centerType === "pharmacy") return "pharmacy";
  if (centerType === "laboratory") return "lab";
  if (centerType === "imaging_center") return "radiology";
  if (centerType === "dental_clinic") return "dentistry";
  if (centerType === "beauty_clinic" || centerType === "spa") return "beauty";
  return "clinic";
}

function familyPath(family: PublicProviderFamily, slug: string): string {
  return `/${family}/${slug}`;
}

function doctorTitleLabel(title: DoctorTitle): string {
  return title === "dr" ? "Dr." : title;
}

export function publicProviderFromManualCenter(summary: PublicCenterSummary): PublicProviderDiscoveryEntry | null {
  const country = publicProviderCountry(summary.defaultCountry);
  if (!country) return null;

  const family = centerFamily(summary.centerType);

  return {
    id: `manual:center:${summary.id}`,
    sourceKind: "manual",
    entityType: centerEntityType(summary.centerType),
    family,
    slug: summary.slug,
    canonicalPath: familyPath(family, summary.slug),
    nameEn: summary.nameEn,
    nameAr: summary.nameAr,
    descriptionEn: summary.descriptionEn ?? summary.shortDescriptionEn,
    descriptionAr: summary.descriptionAr ?? summary.shortDescriptionAr,
    country,
    governorate: null,
    wilayat: null,
    area: null,
    services: [],
    departments: [],
    languages: [],
    sourceName: null,
    sourceUrl: null,
    lastCheckedAt: null,
    publicDetailEligible: true,
    publicDiscoveryEligible: true,
    publicSitemapEligible: true,
  };
}

export function publicProviderFromManualDoctor(summary: PublicDoctorSummary): PublicProviderDiscoveryEntry | null {
  const country = publicProviderCountry(summary.defaultCountry);
  if (!country) return null;

  return {
    id: `manual:doctor:${summary.id}`,
    sourceKind: "manual",
    entityType: "doctor",
    family: "doctors",
    slug: summary.slug,
    canonicalPath: familyPath("doctors", summary.slug),
    nameEn: `${doctorTitleLabel(summary.titleEn)} ${summary.fullNameEn}`,
    nameAr: summary.fullNameAr,
    descriptionEn: null,
    descriptionAr: null,
    country,
    governorate: null,
    wilayat: null,
    area: null,
    services: [],
    departments: [],
    languages: [],
    sourceName: null,
    sourceUrl: null,
    lastCheckedAt: null,
    publicDetailEligible: true,
    publicDiscoveryEligible: true,
    publicSitemapEligible: true,
  };
}

export function publicProvidersFromManualCenters(
  summaries: readonly PublicCenterSummary[],
): PublicProviderDiscoveryEntry[] {
  return summaries.flatMap((summary) => {
    const entry = publicProviderFromManualCenter(summary);
    return entry ? [entry] : [];
  });
}

export function publicProvidersFromManualDoctors(
  summaries: readonly PublicDoctorSummary[],
): PublicProviderDiscoveryEntry[] {
  return summaries.flatMap((summary) => {
    const entry = publicProviderFromManualDoctor(summary);
    return entry ? [entry] : [];
  });
}

export function mergePublicProviderDiscoveryEntries(
  manualEntries: readonly PublicProviderDiscoveryEntry[],
  importedEntries: readonly PublicProviderDiscoveryEntry[],
  options: PublicProviderListOptions = {},
): PublicProviderDiscoveryEntry[] {
  const limit = clampProviderLimit(options.limit);
  const includeImported = options.includeImported ?? true;
  const merged: PublicProviderDiscoveryEntry[] = [];
  const seen = new Set<string>();

  for (const entry of manualEntries) {
    if (!matchesProviderOptions(entry, options)) continue;
    if (!entry.publicDiscoveryEligible) continue;

    seen.add(providerKey(entry));
    merged.push(entry);
  }

  if (includeImported) {
    for (const entry of importedEntries) {
      if (!matchesProviderOptions(entry, options)) continue;
      if (!entry.publicDiscoveryEligible) continue;

      const key = providerKey(entry);
      if (seen.has(key)) continue;

      seen.add(key);
      merged.push(entry);
    }
  }

  return merged.slice(0, limit);
}

export function publicProviderSitemapEntries(
  entries: readonly PublicProviderDiscoveryEntry[],
  options: PublicProviderListOptions = {},
): PublicProviderDiscoveryEntry[] {
  const limit = clampProviderLimit(options.limit);

  return entries
    .filter((entry) => matchesProviderOptions(entry, options))
    .filter((entry) => entry.publicDiscoveryEligible && entry.publicSitemapEligible)
    .slice(0, limit);
}
