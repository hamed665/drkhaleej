export const publicGeoNodeTypes = [
  'country',
  'governorate',
  'wilayat_or_city',
  'area',
  'neighborhood_or_landmark',
  'provider_location',
] as const;

export type PublicGeoNodeType = (typeof publicGeoNodeTypes)[number];

export const publicGeoConfidenceValues = [
  'verified',
  'admin_reviewed',
  'imported_candidate',
  'unknown',
] as const;

export type PublicGeoConfidence = (typeof publicGeoConfidenceValues)[number];

export const publicGeoInventoryStatuses = [
  'unknown',
  'insufficient',
  'candidate_ready',
  'index_ready',
] as const;

export type PublicGeoInventoryStatus = (typeof publicGeoInventoryStatuses)[number];

export type PublicGeoIndexEligibility = {
  indexable: boolean;
  sitemapEligible: boolean;
  noindexRequired: boolean;
  reason:
    | 'ready'
    | 'missing_canonical'
    | 'low_inventory'
    | 'low_family_diversity'
    | 'missing_intro'
    | 'missing_breadcrumb'
    | 'missing_hreflang'
    | 'missing_internal_links'
    | 'low_confidence'
    | 'thin_content'
    | 'blocked_by_imported_hospital_release';
};

export type PublicGeoNode = {
  id: string;
  type: PublicGeoNodeType;
  countryCode: 'om';
  governorateSlug: string | null;
  citySlug: string | null;
  areaSlug: string | null;
  neighborhoodSlug: string | null;
  nameEn: string;
  nameAr: string | null;
  canonicalPath: string | null;
  parentCanonicalPath: string | null;
  latitude: number | null;
  longitude: number | null;
  geoConfidence: PublicGeoConfidence;
  inventoryStatus: PublicGeoInventoryStatus;
  indexEligibility: PublicGeoIndexEligibility;
};

export type PublicGeoNearbyRankInput = {
  sameExactArea: boolean;
  sameCityOrWilayat: boolean;
  coordinateDistanceMeters: number | null;
  sameSpecialtyOrService: boolean;
  sourceQualityScore: number;
  profileCompletenessScore: number;
  freshnessScore: number;
};

export function canPromotePublicGeoNode(node: PublicGeoNode): boolean {
  return Boolean(
    node.canonicalPath &&
      node.indexEligibility.indexable &&
      node.indexEligibility.sitemapEligible &&
      !node.indexEligibility.noindexRequired &&
      (node.geoConfidence === 'verified' || node.geoConfidence === 'admin_reviewed') &&
      node.inventoryStatus === 'index_ready',
  );
}

export function comparePublicGeoNearbyRank(a: PublicGeoNearbyRankInput, b: PublicGeoNearbyRankInput): number {
  if (a.sameExactArea !== b.sameExactArea) return a.sameExactArea ? -1 : 1;
  if (a.sameCityOrWilayat !== b.sameCityOrWilayat) return a.sameCityOrWilayat ? -1 : 1;

  const aDistance = a.coordinateDistanceMeters ?? Number.POSITIVE_INFINITY;
  const bDistance = b.coordinateDistanceMeters ?? Number.POSITIVE_INFINITY;
  if (aDistance !== bDistance) return aDistance - bDistance;

  if (a.sameSpecialtyOrService !== b.sameSpecialtyOrService) return a.sameSpecialtyOrService ? -1 : 1;
  if (a.sourceQualityScore !== b.sourceQualityScore) return b.sourceQualityScore - a.sourceQualityScore;
  if (a.profileCompletenessScore !== b.profileCompletenessScore) return b.profileCompletenessScore - a.profileCompletenessScore;
  return b.freshnessScore - a.freshnessScore;
}
