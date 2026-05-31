export type PublicLandingGateDataErrorCode =
  | 'UNSUPPORTED_LOCALE'
  | 'UNSUPPORTED_COUNTRY'
  | 'UNSUPPORTED_FAMILY'
  | 'QUERY_HELPER_NOT_IMPLEMENTED'
  | 'CONTENT_SOURCE_MISSING'
  | 'MEDICAL_REVIEW_SOURCE_MISSING'
  | 'RELATIONSHIP_POLICY_BLOCKED'
  | 'UNCLAIMED_COUNT_POLICY_UNRESOLVED'
  | 'ENTITY_AMBIGUOUS'
  | 'PRIVATE_DATA_RISK';

export type PublicLandingGateDataSourceTable = never;

export type PublicLandingGateBaseInput = {
  locale: string;
  country: string;
};

export type PublicSpecialtyLandingGateInput = PublicLandingGateBaseInput & {
  specialtySlug: string;
};

export type PublicSpecialtyAreaLandingGateInput = PublicLandingGateBaseInput & {
  specialtySlug: string;
  areaSlug: string;
};

export type PublicAreaLandingGateInput = PublicLandingGateBaseInput & {
  areaSlug: string;
};

export type PublicServiceLandingGateInput = PublicLandingGateBaseInput & {
  serviceSlug: string;
};

export type PublicServiceAreaLandingGateInput = PublicLandingGateBaseInput & {
  serviceSlug: string;
  areaSlug: string;
};

export type PublicLandingGateFamily = 'specialty' | 'specialty_area' | 'area' | 'service' | 'service_area';

export type PublicLandingGateInput = {
  locale: string;
  country: string;
  family: PublicLandingGateFamily;
  entityExists: false;
  providerCount: 0;
  centerCount: 0;
  exactCombinationCount: 0;
  hasUniqueVisibleIntro: false;
  hasLocalRelevance: false;
  medicalReviewStatus: 'missing';
  canonicalIsUnique: false;
  privateDataExcluded: boolean;
  helperAvailable: false;
  entityIsAmbiguous: boolean;
  routeFamilyAllowed: boolean;
};

export type PublicLandingGateDataResult = {
  ok: false;
  input: PublicLandingGateInput;
  error: {
    code: PublicLandingGateDataErrorCode;
    message: 'Public landing gate data unavailable.';
  };
  sourceTables: PublicLandingGateDataSourceTable[];
};

function isSupportedLocale(value: string): boolean {
  return value === 'en' || value === 'ar';
}

function isSupportedCountry(value: string): boolean {
  return value === 'om';
}

function isNonBlankSlug(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function chooseBaseError(input: PublicLandingGateBaseInput, slugs: unknown[]): PublicLandingGateDataErrorCode {
  if (!isSupportedLocale(input.locale)) return 'UNSUPPORTED_LOCALE';
  if (!isSupportedCountry(input.country)) return 'UNSUPPORTED_COUNTRY';
  if (!slugs.every(isNonBlankSlug)) return 'QUERY_HELPER_NOT_IMPLEMENTED';

  return 'QUERY_HELPER_NOT_IMPLEMENTED';
}

function makeFailClosedResult(
  input: PublicLandingGateBaseInput,
  family: PublicLandingGateFamily,
  code: PublicLandingGateDataErrorCode
): PublicLandingGateDataResult {
  return {
    ok: false,
    input: {
      locale: input.locale,
      country: input.country,
      family,
      entityExists: false,
      providerCount: 0,
      centerCount: 0,
      exactCombinationCount: 0,
      hasUniqueVisibleIntro: false,
      hasLocalRelevance: false,
      medicalReviewStatus: 'missing',
      canonicalIsUnique: false,
      privateDataExcluded: true,
      helperAvailable: false,
      entityIsAmbiguous: false,
      routeFamilyAllowed: true
    },
    error: {
      code,
      message: 'Public landing gate data unavailable.'
    },
    sourceTables: []
  };
}

export function getSpecialtyLandingGateData(
  input: PublicSpecialtyLandingGateInput
): PublicLandingGateDataResult {
  return makeFailClosedResult(input, 'specialty', chooseBaseError(input, [input.specialtySlug]));
}

export function getSpecialtyAreaLandingGateData(
  input: PublicSpecialtyAreaLandingGateInput
): PublicLandingGateDataResult {
  return makeFailClosedResult(input, 'specialty_area', chooseBaseError(input, [input.specialtySlug, input.areaSlug]));
}

export function getAreaLandingGateData(input: PublicAreaLandingGateInput): PublicLandingGateDataResult {
  return makeFailClosedResult(input, 'area', chooseBaseError(input, [input.areaSlug]));
}

export function getServiceLandingGateData(input: PublicServiceLandingGateInput): PublicLandingGateDataResult {
  return makeFailClosedResult(input, 'service', chooseBaseError(input, [input.serviceSlug]));
}

export function getServiceAreaLandingGateData(
  input: PublicServiceAreaLandingGateInput
): PublicLandingGateDataResult {
  return makeFailClosedResult(input, 'service_area', chooseBaseError(input, [input.serviceSlug, input.areaSlug]));
}
