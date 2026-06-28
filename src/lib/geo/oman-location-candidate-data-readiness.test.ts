import { describe, expect, it } from 'vitest';

import { OMAN_LOCATION_CANDIDATE_DATA_READINESS_POLICIES } from '@/config/geo/location-candidate-data-readiness-contract';

import {
  getOmanLocationCandidateDataReadinessRuntimeContract,
  getOmanLocationCandidateDataReadinessState,
} from './oman-location-candidate-data-readiness';

describe('Oman location candidate data readiness', () => {
  it('keeps every data-readiness policy disabled', () => {
    expect(OMAN_LOCATION_CANDIDATE_DATA_READINESS_POLICIES).toHaveLength(9);

    for (const policy of OMAN_LOCATION_CANDIDATE_DATA_READINESS_POLICIES) {
      const state = getOmanLocationCandidateDataReadinessState({
        entity: policy.entity,
        dimension: policy.dimension,
        locationSlug: `${policy.entity}-${policy.dimension}`,
      });

      expect(state.policy).toBe(policy);
      expect(state.status).toBe('disabled');
      expect(state.dataImportAllowed).toBe(false);
      expect(state.runtimeGenerationAllowed).toBe(false);
      expect(state.databaseAccessAllowed).toBe(false);
      expect(state.routeCreationAllowed).toBe(false);
      expect(state.sitemapAllowed).toBe(false);
      expect(state.jsonLdAllowed).toBe(false);
      expect(state.indexPromotionAllowed).toBe(false);
      expect(state.internalSeoLinksAllowed).toBe(false);
      expect(state.blockedReasons).toContain('candidate-data-readiness-contract-only');
      expect(state.blockedReasons).toContain('candidate-data-import-disabled');
      expect(state.blockedReasons).toContain('candidate-data-runtime-generation-disabled');
      expect(state.blockedReasons).toContain('candidate-data-readiness-runtime-disabled');
    }
  });

  it('keeps unsupported pairs blocked without a policy', () => {
    const state = getOmanLocationCandidateDataReadinessState({
      entity: 'area',
      dimension: 'category',
      locationSlug: 'missing-example',
    });

    expect(state.policy).not.toBeNull();
    expect(state.status).toBe('disabled');
    expect(state.dataImportAllowed).toBe(false);
    expect(state.databaseAccessAllowed).toBe(false);
  });

  it('exposes the fail-closed data-readiness contract', () => {
    const contract = getOmanLocationCandidateDataReadinessRuntimeContract();

    expect(contract.status).toBe('contract-only');
    expect(contract.dataImportAllowedByDefault).toBe(false);
    expect(contract.runtimeGenerationAllowedByDefault).toBe(false);
    expect(contract.databaseAccessAllowed).toBe(false);
    expect(contract.routeCreationAllowed).toBe(false);
    expect(contract.sitemapAllowed).toBe(false);
    expect(contract.jsonLdAllowed).toBe(false);
    expect(contract.indexPromotionAllowed).toBe(false);
    expect(contract.internalSeoLinksAllowed).toBe(false);
  });
});
