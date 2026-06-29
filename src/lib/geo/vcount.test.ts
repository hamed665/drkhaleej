import { expect, it } from 'vitest';

import { OMAN_LOCATION_THRESHOLD_POLICIES as policies } from '@/config/geo/location-threshold-policy';

import { getOmanLocationCandidateVerifiedCountState as getState } from './oman-location-candidate-verified-count';

it('keeps shell stable', () => {
  expect(policies).toHaveLength(9);

  for (const policy of policies) {
    const state = getState({ entity: policy.entity, dimension: policy.dimension, locationSlug: 'test' });

    expect(state.status).toBe('disabled');
    expect(state.verifiedCount).toBeNull();
    expect(state.runtimeCountingAllowed).toBe(false);
    expect(state.databaseAccessAllowed).toBe(false);
    expect(state.importAllowed).toBe(false);
    expect(state.routeCreationAllowed).toBe(false);
    expect(state.sitemapAllowed).toBe(false);
    expect(state.jsonLdAllowed).toBe(false);
    expect(state.indexPromotionAllowed).toBe(false);
    expect(state.internalSeoLinksAllowed).toBe(false);
    expect(state.blockedReasons).toContain('candidate-verified-count-contract-only');
    expect(state.blockedReasons).toContain('candidate-verified-count-runtime-disabled');
    expect(state.blockedReasons).toContain('candidate-verified-count-import-disabled');
  }
});
