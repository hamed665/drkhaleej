import { expect, it } from 'vitest';

import { OMAN_LOCATION_CANDIDATE_PROVIDER_SOURCE_PLAN_POLICIES as policies } from '@/config/geo/location-candidate-provider-source-plan-contract';

import { getOmanLocationCandidateCpPlanState as getState } from './oman-location-candidate-cp-plan';

it('keeps cp state closed', () => {
  expect(policies).toHaveLength(9);

  for (const policy of policies) {
    const state = getState({
      entity: policy.entity,
      dimension: policy.dimension,
      locationSlug: `${policy.entity}-${policy.dimension}`,
    });

    expect(state.status).toBe('disabled');
    expect(state.dataImportAllowed).toBe(false);
    expect(state.runtimeCollectionAllowed).toBe(false);
    expect(state.databaseAccessAllowed).toBe(false);
    expect(state.routeCreationAllowed).toBe(false);
    expect(state.sitemapAllowed).toBe(false);
    expect(state.jsonLdAllowed).toBe(false);
    expect(state.indexPromotionAllowed).toBe(false);
  }
});
