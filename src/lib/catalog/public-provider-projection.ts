export type PublicProviderSourceKind = "manual" | "import";

export type PublicProviderEntityType =
  | "doctor"
  | "pharmacy"
  | "hospital"
  | "clinic"
  | "lab"
  | "radiology"
  | "dentistry"
  | "beauty";

export type PublicProviderFamily =
  | "doctors"
  | "pharmacies"
  | "hospitals"
  | "centers"
  | "labs"
  | "radiology"
  | "dentistry"
  | "beauty";

export type PublicProviderCountry = "om";

export type PublicProviderDiscoveryEntry = {
  id: string;
  sourceKind: PublicProviderSourceKind;
  entityType: PublicProviderEntityType;
  family: PublicProviderFamily;
  slug: string;
  canonicalPath: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  country: PublicProviderCountry;
  governorate: string | null;
  wilayat: string | null;
  area: string | null;
  services: string[];
  departments: string[];
  languages: string[];
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  publicDetailEligible: boolean;
  publicDiscoveryEligible: boolean;
  publicSitemapEligible: boolean;
};

export type PublicProviderRouteTarget = Pick<
  PublicProviderDiscoveryEntry,
  "canonicalPath"
>;

export function normalizePublicProviderCanonicalPath(path: string): string {
  const trimmedPath = path.trim();

  if (trimmedPath.length === 0) {
    return "/";
  }

  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
}

export function routeFromPublicProviderCanonicalPath(
  entry: PublicProviderRouteTarget,
): string {
  return normalizePublicProviderCanonicalPath(entry.canonicalPath);
}
