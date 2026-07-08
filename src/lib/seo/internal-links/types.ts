export const publicInternalLinkSourcePageTypes = [
  'doctor_profile',
  'center_profile',
  'hospital_profile',
  'pharmacy_profile',
  'lab_profile',
  'imaging_profile',
  'dental_profile',
  'beauty_profile',
  'pet_profile',
  'charity_profile',
  'geo_page',
  'specialty_page',
  'service_page',
  'article_page',
] as const;

export type PublicInternalLinkSourcePageType = (typeof publicInternalLinkSourcePageTypes)[number];

export const publicInternalLinkRelationTypes = [
  'doctor_practices_at_facility',
  'facility_has_doctor',
  'facility_offers_service',
  'doctor_has_specialty',
  'provider_located_in_area',
  'provider_near_provider',
  'service_available_in_area',
  'specialty_available_in_area',
  'article_related_to_entity',
  'article_related_to_service',
  'article_related_to_area',
  'same_specialty_provider',
  'same_service_provider',
  'same_area_provider',
  'nearby_pharmacy',
  'nearby_lab',
  'nearby_imaging',
  'nearby_pet_service',
  'nearby_beauty_service',
  'nearby_dental_service',
] as const;

export type PublicInternalLinkRelationType = (typeof publicInternalLinkRelationTypes)[number];

export type PublicInternalLinkReviewStatus =
  | 'deterministic_approved'
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'blocked';

export type PublicInternalLinkCandidate = {
  sourcePageType: PublicInternalLinkSourcePageType;
  sourceEntityType: string;
  sourceEntityId: string;
  targetPageType: PublicInternalLinkSourcePageType;
  targetEntityType: string;
  targetEntityId: string;
  relationType: PublicInternalLinkRelationType;
  anchorEn: string;
  anchorAr: string;
  priority: number;
  reason: string;
  reviewStatus: PublicInternalLinkReviewStatus;
  canonicalPath: string | null;
  publicSafe: boolean;
  routeEnabled: boolean;
};

export type PublicInternalLinkProjection = PublicInternalLinkCandidate & {
  canonicalPath: string;
  publicSafe: true;
  routeEnabled: true;
  reviewStatus: 'deterministic_approved' | 'approved';
};

export type PublicInternalLinkBudgetFamily =
  | 'primaryRelations'
  | 'geo'
  | 'specialty'
  | 'services'
  | 'nearby'
  | 'articles'
  | 'faq'
  | 'sameArea'
  | 'sameFamily';

export type PublicInternalLinkBudgetPolicy = {
  pageType: PublicInternalLinkSourcePageType;
  maxTotal: number;
  families: Partial<Record<PublicInternalLinkBudgetFamily, number>>;
};

export function isProjectablePublicInternalLink(
  candidate: PublicInternalLinkCandidate,
): candidate is PublicInternalLinkProjection {
  return Boolean(
    candidate.canonicalPath &&
      candidate.publicSafe === true &&
      candidate.routeEnabled === true &&
      (candidate.reviewStatus === 'approved' || candidate.reviewStatus === 'deterministic_approved') &&
      candidate.sourceEntityId !== candidate.targetEntityId &&
      candidate.anchorEn.trim().length > 0 &&
      candidate.anchorAr.trim().length > 0,
  );
}
