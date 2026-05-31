export type LandingPageGateFamily = 'specialty' | 'specialty_area' | 'area' | 'service' | 'service_area';

export type MedicalReviewStatus = 'not_required' | 'required' | 'approved' | 'missing';

export type LandingPageGateInput = {
  locale: string;
  country: string;
  family: LandingPageGateFamily;
  entityExists: boolean;
  providerCount: number;
  centerCount: number;
  exactCombinationCount: number;
  hasUniqueVisibleIntro: boolean;
  hasLocalRelevance: boolean;
  medicalReviewStatus: MedicalReviewStatus;
  canonicalIsUnique: boolean;
  privateDataExcluded: boolean;
  helperAvailable: boolean;
  entityIsAmbiguous: boolean;
  routeFamilyAllowed: boolean;
};

export type LandingPageGateStatus =
  | 'not_found'
  | 'noindex_required'
  | 'indexable_later_only'
  | 'blocked'
  | 'unsupported_locale'
  | 'unsupported_country'
  | 'medical_review_required'
  | 'insufficient_public_data'
  | 'helper_unavailable'
  | 'ambiguous_entity';

export type LandingPageGateReasonCode =
  | 'unsupported_locale'
  | 'unsupported_country'
  | 'missing_entity'
  | 'ambiguous_entity'
  | 'insufficient_provider_count'
  | 'insufficient_center_count'
  | 'insufficient_exact_combination_count'
  | 'missing_visible_intro'
  | 'missing_local_relevance'
  | 'medical_review_missing'
  | 'canonical_conflict'
  | 'private_data_risk'
  | 'forbidden_route_family'
  | 'helper_error';

export type LandingPageGateResult = {
  status: LandingPageGateStatus;
  reasons: LandingPageGateReasonCode[];
  safeForVisibleNoindex: false;
  safeForIndexing: false;
};

const MIN_SPECIALTY_PROVIDER_COUNT = 3;
const MIN_SPECIALTY_CENTER_COUNT = 1;
const MIN_SPECIALTY_AREA_EXACT_COMBINATION_COUNT = 2;
const MIN_SPECIALTY_AREA_PROVIDER_COUNT = 2;
const MIN_SPECIALTY_AREA_CENTER_COUNT = 1;
const MIN_AREA_PROVIDER_COUNT = 3;
const MIN_AREA_CENTER_COUNT = 1;
const MIN_SERVICE_PROVIDER_COUNT = 3;
const MIN_SERVICE_CENTER_COUNT = 1;
const MIN_SERVICE_AREA_EXACT_COMBINATION_COUNT = 2;
const MIN_SERVICE_AREA_PROVIDER_COUNT = 2;
const MIN_SERVICE_AREA_CENTER_COUNT = 1;

const makeResult = (
  status: LandingPageGateStatus,
  reasons: LandingPageGateReasonCode[]
): LandingPageGateResult => ({
  status,
  reasons,
  safeForVisibleNoindex: false,
  safeForIndexing: false
});

const isKnownFamily = (value: unknown): value is LandingPageGateFamily =>
  value === 'specialty' ||
  value === 'specialty_area' ||
  value === 'area' ||
  value === 'service' ||
  value === 'service_area';

const isKnownMedicalReviewStatus = (value: unknown): value is MedicalReviewStatus =>
  value === 'not_required' || value === 'required' || value === 'approved' || value === 'missing';

const isExplicitBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

const isFiniteNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0;

const collectInsufficiencyReasons = (input: LandingPageGateInput): LandingPageGateReasonCode[] => {
  const reasons: LandingPageGateReasonCode[] = [];

  if (
    (input.family === 'specialty_area' &&
      input.exactCombinationCount < MIN_SPECIALTY_AREA_EXACT_COMBINATION_COUNT) ||
    (input.family === 'service_area' && input.exactCombinationCount < MIN_SERVICE_AREA_EXACT_COMBINATION_COUNT)
  ) {
    reasons.push('insufficient_exact_combination_count');
  }

  if (
    (input.family === 'specialty' && input.providerCount < MIN_SPECIALTY_PROVIDER_COUNT) ||
    (input.family === 'specialty_area' && input.providerCount < MIN_SPECIALTY_AREA_PROVIDER_COUNT) ||
    (input.family === 'area' && input.providerCount < MIN_AREA_PROVIDER_COUNT) ||
    (input.family === 'service' && input.providerCount < MIN_SERVICE_PROVIDER_COUNT) ||
    (input.family === 'service_area' && input.providerCount < MIN_SERVICE_AREA_PROVIDER_COUNT)
  ) {
    reasons.push('insufficient_provider_count');
  }

  if (
    (input.family === 'specialty' && input.centerCount < MIN_SPECIALTY_CENTER_COUNT) ||
    (input.family === 'specialty_area' && input.centerCount < MIN_SPECIALTY_AREA_CENTER_COUNT) ||
    (input.family === 'area' && input.centerCount < MIN_AREA_CENTER_COUNT) ||
    (input.family === 'service' && input.centerCount < MIN_SERVICE_CENTER_COUNT) ||
    (input.family === 'service_area' && input.centerCount < MIN_SERVICE_AREA_CENTER_COUNT)
  ) {
    reasons.push('insufficient_center_count');
  }

  if (input.hasUniqueVisibleIntro !== true) {
    reasons.push('missing_visible_intro');
  }

  if (
    (input.family === 'specialty_area' || input.family === 'area' || input.family === 'service_area') &&
    input.hasLocalRelevance !== true
  ) {
    reasons.push('missing_local_relevance');
  }

  return reasons;
};

export function decideLandingPageGate(input: LandingPageGateInput): LandingPageGateResult {
  if (input.locale !== 'en' && input.locale !== 'ar') {
    return makeResult('unsupported_locale', ['unsupported_locale']);
  }

  if (input.country !== 'om') {
    return makeResult('unsupported_country', ['unsupported_country']);
  }

  if (!isKnownFamily(input.family)) {
    return makeResult('blocked', ['forbidden_route_family']);
  }

  if (
    !isExplicitBoolean(input.entityExists) ||
    !isExplicitBoolean(input.hasUniqueVisibleIntro) ||
    !isExplicitBoolean(input.hasLocalRelevance) ||
    !isExplicitBoolean(input.canonicalIsUnique) ||
    !isExplicitBoolean(input.privateDataExcluded) ||
    !isExplicitBoolean(input.helperAvailable) ||
    !isExplicitBoolean(input.entityIsAmbiguous) ||
    !isExplicitBoolean(input.routeFamilyAllowed)
  ) {
    return makeResult('helper_unavailable', ['helper_error']);
  }

  if (input.routeFamilyAllowed !== true) {
    return makeResult('blocked', ['forbidden_route_family']);
  }

  if (input.privateDataExcluded !== true) {
    return makeResult('blocked', ['private_data_risk']);
  }

  if (input.canonicalIsUnique !== true) {
    return makeResult('blocked', ['canonical_conflict']);
  }

  if (input.helperAvailable !== true) {
    return makeResult('helper_unavailable', ['helper_error']);
  }

  if (input.entityIsAmbiguous === true) {
    return makeResult('ambiguous_entity', ['ambiguous_entity']);
  }

  if (input.entityExists !== true) {
    return makeResult('not_found', ['missing_entity']);
  }

  if (
    !isFiniteNonNegativeInteger(input.providerCount) ||
    !isFiniteNonNegativeInteger(input.centerCount) ||
    !isFiniteNonNegativeInteger(input.exactCombinationCount)
  ) {
    return makeResult('helper_unavailable', ['helper_error']);
  }

  if (!isKnownMedicalReviewStatus(input.medicalReviewStatus)) {
    return makeResult('medical_review_required', ['medical_review_missing']);
  }

  if (input.medicalReviewStatus === 'required' || input.medicalReviewStatus === 'missing') {
    return makeResult('medical_review_required', ['medical_review_missing']);
  }

  const insufficiencyReasons = collectInsufficiencyReasons(input);
  if (insufficiencyReasons.length > 0) {
    return makeResult('insufficient_public_data', insufficiencyReasons);
  }

  return makeResult('indexable_later_only', []);
}
