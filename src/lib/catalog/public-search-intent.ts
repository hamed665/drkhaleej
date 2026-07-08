import type {
  PublicEntityFamilyVertical,
  PublicProviderEntityFamily,
} from './public-entity-family-registry';
import type { PublicGeoConfidence } from './public-geo-registry';

export const publicSearchIntentKinds = [
  'provider_name',
  'doctor_by_specialty',
  'center_by_category',
  'service_near_area',
  'specialty_near_area',
  'pharmacy_near_area',
  'lab_near_area',
  'imaging_near_area',
  'emergency_near_area',
  'pet_service_near_area',
  'beauty_service_near_area',
  'charity_near_area',
  'dental_service_near_area',
  'near_me',
  'unknown',
] as const;

export type PublicSearchIntentKind = (typeof publicSearchIntentKinds)[number];

export type PublicSearchLanguage = 'en' | 'ar' | 'unknown';

export type PublicSearchParsedIntent = {
  rawQuery: string;
  normalizedQuery: string;
  language: PublicSearchLanguage;
  intent: PublicSearchIntentKind;
  entityFamily: string | null;
  providerFamily: PublicProviderEntityFamily | null;
  vertical: PublicEntityFamilyVertical | null;
  specialtySlug: string | null;
  serviceSlug: string | null;
  citySlug: string | null;
  areaSlug: string | null;
  nearMe: boolean;
  geoConfidence: PublicGeoConfidence;
  minimumResultFamilyDiversity: number;
  indexableLandingAllowed: boolean;
};

export type PublicSearchRankInput = {
  exactProviderNameMatch: boolean;
  exactAreaMatch: boolean;
  exactCityOrWilayatMatch: boolean;
  specialtyOrServiceMatch: boolean;
  entityFamilyMatch: boolean;
  coordinateDistanceMeters: number | null;
  sourceQualityScore: number;
  profileCompletenessScore: number;
  freshnessScore: number;
};

export function normalizePublicSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function canCreateIndexableSearchLanding(intent: PublicSearchParsedIntent): boolean {
  return Boolean(
    intent.indexableLandingAllowed &&
      !intent.nearMe &&
      intent.intent !== 'near_me' &&
      intent.intent !== 'unknown' &&
      (intent.citySlug !== null || intent.areaSlug !== null) &&
      (intent.serviceSlug !== null || intent.specialtySlug !== null || intent.providerFamily !== null) &&
      (intent.geoConfidence === 'verified' || intent.geoConfidence === 'admin_reviewed'),
  );
}

export function comparePublicSearchRank(a: PublicSearchRankInput, b: PublicSearchRankInput): number {
  if (a.exactProviderNameMatch !== b.exactProviderNameMatch) return a.exactProviderNameMatch ? -1 : 1;
  if (a.exactAreaMatch !== b.exactAreaMatch) return a.exactAreaMatch ? -1 : 1;
  if (a.exactCityOrWilayatMatch !== b.exactCityOrWilayatMatch) return a.exactCityOrWilayatMatch ? -1 : 1;
  if (a.specialtyOrServiceMatch !== b.specialtyOrServiceMatch) return a.specialtyOrServiceMatch ? -1 : 1;
  if (a.entityFamilyMatch !== b.entityFamilyMatch) return a.entityFamilyMatch ? -1 : 1;

  const aDistance = a.coordinateDistanceMeters ?? Number.POSITIVE_INFINITY;
  const bDistance = b.coordinateDistanceMeters ?? Number.POSITIVE_INFINITY;
  if (aDistance !== bDistance) return aDistance - bDistance;

  if (a.sourceQualityScore !== b.sourceQualityScore) return b.sourceQualityScore - a.sourceQualityScore;
  if (a.profileCompletenessScore !== b.profileCompletenessScore) return b.profileCompletenessScore - a.profileCompletenessScore;
  return b.freshnessScore - a.freshnessScore;
}
