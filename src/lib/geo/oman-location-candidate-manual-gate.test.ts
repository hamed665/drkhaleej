import { describe, expect, it } from 'vitest';

import { OMAN_LOCATION_CANDIDATE_MANUAL_GATE_POLICIES } from '@/config/geo/location-candidate-manual-gate-contract';

import {
  getOmanLocationCandidateManualGateRuntimeContract,
  getOmanLocationCandidateManualGateState,
} from './oman-location-candidate-manual-gate';

describe('Oman location candidate manual gate', () => {
  it('keeps every manual gate policy disabled', () => {
    expect(OMAN_LOCATION_CANDIDATE_MANUAL_GATE_POLICIES).toHaveLength(9);

    for (const policy of OMAN_LOCATION_CANDIDATE_MANUAL_GATE_POLICIES) {
      const state = getOmanLocationCandidateManualGateState({
        entity: policy.entity,
        dimension: policy.dimension,
        locationSlug: `${policy.entity}-${policy.dimension}`,
      });

      expect(state.policy).toBe(policy);
      expect(state.status).toBe('disabled');
      expect(state.runtimeAllowed).toBe(false);
      expect(state.databaseAccessAllowed).toBe(false);
      expect(state.routeCreationAllowed).toBe(false);
      expect(state.sitemapAllowed).toBe(false);
      expect(state.jsonLdAllowed).toBe(false);
      expect(state.indexPromotionAllowed).toBe(false);
      expect(state.blockedReasons).toContain('candidate-manual-gate-contract-only');
      expect(state.blockedReasons).toContain('candidate-manual-gate-runtime-disabled');
    }
  });

  it('exposes the fail-closed manual gate contract', () => {
    const contract = getOmanLocationCandidateManualGateRuntimeContract();

    expect(contract.status).toBe('contract-only');
    expect(contract.runtimeAllowed).toBe(false);
    expect(contract.databaseAccessAllowed).toBe(false);
    expect(contract.routeCreationAllowed).toBe(false);
    expect(contract.sitemapAllowed).toBe(false);
    expect(contract.jsonLdAllowed).toBe(false);
    expect(contract.indexPromotionAllowed).toBe(false);
  });
});
