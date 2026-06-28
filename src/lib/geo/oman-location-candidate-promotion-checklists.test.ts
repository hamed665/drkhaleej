import { describe, expect, it } from 'vitest';

import { OMAN_LOCATION_CANDIDATE_PROMOTION_CHECKLIST_POLICIES } from '@/config/geo/location-candidate-promotion-checklist-contract';

import {
  getOmanLocationCandidatePromotionChecklistRuntimeContract,
  getOmanLocationCandidatePromotionChecklistState,
} from './oman-location-candidate-promotion-checklists';

describe('Oman location candidate promotion checklists', () => {
  it('keeps every promotion checklist policy blocked and non-promotable', () => {
    expect(OMAN_LOCATION_CANDIDATE_PROMOTION_CHECKLIST_POLICIES).toHaveLength(9);

    for (const policy of OMAN_LOCATION_CANDIDATE_PROMOTION_CHECKLIST_POLICIES) {
      const state = getOmanLocationCandidatePromotionChecklistState({
        entity: policy.entity,
        dimension: policy.dimension,
        slug: `${policy.entity}-${policy.dimension}`,
        locale: 'en',
        parentHierarchyResolved: true,
        candidatePath: '/en/om/locations/muscat/categories/example',
        locationSlug: 'muscat',
      });

      expect(state.policy).toBe(policy);
      expect(state.status).toBe('blocked');
      expect(state.reviewAllowed).toBe(false);
      expect(state.promotionAllowed).toBe(false);
      expect(state.canIndex).toBe(false);
      expect(state.canSitemap).toBe(false);
      expect(state.canEmitJsonLd).toBe(false);
      expect(state.canUseInternalSeoLinks).toBe(false);
      expect(state.snapshotState.status).toBe('disabled');
      expect(state.snapshotState.snapshotGenerationAllowed).toBe(false);
      expect(state.snapshotState.promotionAllowed).toBe(false);
      expect(state.blockedReasons).toContain('candidate-promotion-checklist-contract-only');
      expect(state.blockedReasons).toContain('candidate-promotion-review-disabled');
      expect(state.blockedReasons).toContain('candidate-promotion-runtime-disabled');
      expect(state.blockedReasons).toContain('candidate-evidence-snapshot-runtime-disabled');
      expect(state.blockedReasons).toContain('location-candidate-engine-disabled');
      expect(state.blockedReasons).not.toContain('parent-hierarchy-not-resolved');
    }
  });

  it('preserves parent hierarchy failures', () => {
    const state = getOmanLocationCandidatePromotionChecklistState({
      entity: 'area',
      dimension: 'category',
      slug: 'al-khoud',
      locale: 'ar',
      parentHierarchyResolved: false,
      candidatePath: '/ar/om/locations/muscat/al-seeb/al-khoud/categories/pharmacies',
      locationSlug: 'al-khoud',
    });

    expect(state.status).toBe('blocked');
    expect(state.reviewAllowed).toBe(false);
    expect(state.promotionAllowed).toBe(false);
    expect(state.canIndex).toBe(false);
    expect(state.blockedReasons).toContain('parent-hierarchy-not-resolved');
    expect(state.blockedReasons).toContain('candidate-promotion-runtime-disabled');
  });

  it('exposes a fail-closed runtime contract', () => {
    const contract = getOmanLocationCandidatePromotionChecklistRuntimeContract();

    expect(contract.status).toBe('contract-only');
    expect(contract.promotionAllowedByDefault).toBe(false);
    expect(contract.reviewAllowedByDefault).toBe(false);
    expect(contract.noindexRequiredByDefault).toBe(true);
    expect(contract.sitemapAllowedByDefault).toBe(false);
    expect(contract.jsonLdAllowedByDefault).toBe(false);
    expect(contract.internalLinksAllowedByDefault).toBe(false);
    expect(contract.databaseAccessAllowed).toBe(false);
    expect(contract.routeCreationAllowed).toBe(false);
    expect(contract.runtimePromotionAllowed).toBe(false);
  });
});
