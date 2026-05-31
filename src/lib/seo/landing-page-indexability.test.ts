import { describe, expect, it } from 'vitest';

import {
  decideLandingPageGate,
  type LandingPageGateFamily,
  type LandingPageGateInput,
  type MedicalReviewStatus
} from './landing-page-indexability';

const validInput = (overrides: Partial<LandingPageGateInput> = {}): LandingPageGateInput => ({
  locale: 'en',
  country: 'om',
  family: 'specialty',
  entityExists: true,
  providerCount: 3,
  centerCount: 1,
  exactCombinationCount: 0,
  hasUniqueVisibleIntro: true,
  hasLocalRelevance: false,
  medicalReviewStatus: 'not_required',
  canonicalIsUnique: true,
  privateDataExcluded: true,
  helperAvailable: true,
  entityIsAmbiguous: false,
  routeFamilyAllowed: true,
  ...overrides
});

const expectSafeResultShape = (result: ReturnType<typeof decideLandingPageGate>) => {
  expect(result.safeForVisibleNoindex).toBe(false);
  expect(result.safeForIndexing).toBe(false);
  expect(Object.keys(result).sort()).toEqual(
    ['reasons', 'safeForIndexing', 'safeForVisibleNoindex', 'status'].sort()
  );
};

const expectGateResult = (
  input: LandingPageGateInput,
  expected: Pick<ReturnType<typeof decideLandingPageGate>, 'status' | 'reasons'>
) => {
  const result = decideLandingPageGate(input);

  expectSafeResultShape(result);
  expect(result.status).toBe(expected.status);
  expect(result.reasons).toEqual(expected.reasons);
};

describe('decideLandingPageGate', () => {
  it('blocks unsupported locale', () => {
    expectGateResult(validInput({ locale: 'fr' }), {
      status: 'unsupported_locale',
      reasons: ['unsupported_locale']
    });
  });

  it('blocks unsupported country', () => {
    expectGateResult(validInput({ country: 'ae' }), {
      status: 'unsupported_country',
      reasons: ['unsupported_country']
    });
  });

  it('blocks an invalid family supplied at runtime', () => {
    expectGateResult(validInput({ family: 'doctor_area' as LandingPageGateFamily }), {
      status: 'blocked',
      reasons: ['forbidden_route_family']
    });
  });

  it('returns helper unavailable for an invalid boolean supplied at runtime', () => {
    expectGateResult(validInput({ entityExists: 'true' as unknown as boolean }), {
      status: 'helper_unavailable',
      reasons: ['helper_error']
    });
  });

  it('blocks a forbidden route family', () => {
    expectGateResult(validInput({ routeFamilyAllowed: false }), {
      status: 'blocked',
      reasons: ['forbidden_route_family']
    });
  });

  it('blocks private data risk', () => {
    expectGateResult(validInput({ privateDataExcluded: false }), {
      status: 'blocked',
      reasons: ['private_data_risk']
    });
  });

  it('blocks canonical conflicts', () => {
    expectGateResult(validInput({ canonicalIsUnique: false }), {
      status: 'blocked',
      reasons: ['canonical_conflict']
    });
  });

  it('returns helper unavailable when the helper is unavailable', () => {
    expectGateResult(validInput({ helperAvailable: false }), {
      status: 'helper_unavailable',
      reasons: ['helper_error']
    });
  });

  it('blocks ambiguous entities', () => {
    expectGateResult(validInput({ entityIsAmbiguous: true }), {
      status: 'ambiguous_entity',
      reasons: ['ambiguous_entity']
    });
  });

  it('returns not found for a missing entity', () => {
    expectGateResult(validInput({ entityExists: false }), {
      status: 'not_found',
      reasons: ['missing_entity']
    });
  });

  it('returns helper unavailable for an invalid provider count', () => {
    expectGateResult(validInput({ providerCount: -1 }), {
      status: 'helper_unavailable',
      reasons: ['helper_error']
    });
  });

  it('returns helper unavailable for an invalid center count', () => {
    expectGateResult(validInput({ centerCount: Number.NaN }), {
      status: 'helper_unavailable',
      reasons: ['helper_error']
    });
  });

  it('returns helper unavailable for an invalid exact combination count', () => {
    expectGateResult(validInput({ exactCombinationCount: 1.5 }), {
      status: 'helper_unavailable',
      reasons: ['helper_error']
    });
  });

  it('requires medical review when review is required', () => {
    expectGateResult(validInput({ medicalReviewStatus: 'required' }), {
      status: 'medical_review_required',
      reasons: ['medical_review_missing']
    });
  });

  it('requires medical review when review is missing', () => {
    expectGateResult(validInput({ medicalReviewStatus: 'missing' }), {
      status: 'medical_review_required',
      reasons: ['medical_review_missing']
    });
  });

  it('requires medical review for an unknown medical review status supplied at runtime', () => {
    expectGateResult(validInput({ medicalReviewStatus: 'pending' as MedicalReviewStatus }), {
      status: 'medical_review_required',
      reasons: ['medical_review_missing']
    });
  });

  it('blocks specialty pages with insufficient provider count', () => {
    expectGateResult(validInput({ family: 'specialty', providerCount: 2 }), {
      status: 'insufficient_public_data',
      reasons: ['insufficient_provider_count']
    });
  });

  it('blocks specialty pages with insufficient center count', () => {
    expectGateResult(validInput({ family: 'specialty', centerCount: 0 }), {
      status: 'insufficient_public_data',
      reasons: ['insufficient_center_count']
    });
  });

  it('blocks service area pages with insufficient exact combination count', () => {
    expectGateResult(
      validInput({
        family: 'service_area',
        exactCombinationCount: 1,
        providerCount: 2,
        centerCount: 1,
        hasUniqueVisibleIntro: true,
        hasLocalRelevance: true
      }),
      {
        status: 'insufficient_public_data',
        reasons: ['insufficient_exact_combination_count']
      }
    );
  });

  it('blocks pages missing a unique visible intro', () => {
    expectGateResult(validInput({ hasUniqueVisibleIntro: false }), {
      status: 'insufficient_public_data',
      reasons: ['missing_visible_intro']
    });
  });

  it('blocks local family pages missing local relevance', () => {
    expectGateResult(
      validInput({
        family: 'service_area',
        exactCombinationCount: 2,
        providerCount: 2,
        centerCount: 1,
        hasUniqueVisibleIntro: true,
        hasLocalRelevance: false
      }),
      {
        status: 'insufficient_public_data',
        reasons: ['missing_local_relevance']
      }
    );
  });

  it('allows a successful specialty gate only as indexable later', () => {
    expectGateResult(validInput(), {
      status: 'indexable_later_only',
      reasons: []
    });
  });

  it('allows a successful service area gate only as indexable later', () => {
    expectGateResult(
      validInput({
        family: 'service_area',
        exactCombinationCount: 2,
        providerCount: 2,
        centerCount: 1,
        hasUniqueVisibleIntro: true,
        hasLocalRelevance: true
      }),
      {
        status: 'indexable_later_only',
        reasons: []
      }
    );
  });

  it('prioritizes unsupported locale over unsupported country', () => {
    expectGateResult(validInput({ locale: 'fr', country: 'ae' }), {
      status: 'unsupported_locale',
      reasons: ['unsupported_locale']
    });
  });

  it('prioritizes unsupported country over forbidden route family', () => {
    expectGateResult(validInput({ country: 'ae', routeFamilyAllowed: false }), {
      status: 'unsupported_country',
      reasons: ['unsupported_country']
    });
  });

  it('prioritizes forbidden route family over private, canonical, and content gates', () => {
    expectGateResult(
      validInput({
        routeFamilyAllowed: false,
        privateDataExcluded: false,
        canonicalIsUnique: false,
        providerCount: 0
      }),
      {
        status: 'blocked',
        reasons: ['forbidden_route_family']
      }
    );
  });

  it('prioritizes private data risk over canonical conflict', () => {
    expectGateResult(validInput({ privateDataExcluded: false, canonicalIsUnique: false }), {
      status: 'blocked',
      reasons: ['private_data_risk']
    });
  });

  it('prioritizes missing medical review over insufficient public data', () => {
    expectGateResult(validInput({ medicalReviewStatus: 'missing', providerCount: 0, centerCount: 0 }), {
      status: 'medical_review_required',
      reasons: ['medical_review_missing']
    });
  });

  it('returns deterministic ordered insufficiency reasons', () => {
    expectGateResult(
      validInput({
        family: 'service_area',
        exactCombinationCount: 0,
        providerCount: 0,
        centerCount: 0,
        hasUniqueVisibleIntro: false,
        hasLocalRelevance: false
      }),
      {
        status: 'insufficient_public_data',
        reasons: [
          'insufficient_exact_combination_count',
          'insufficient_provider_count',
          'insufficient_center_count',
          'missing_visible_intro',
          'missing_local_relevance'
        ]
      }
    );
  });
});
