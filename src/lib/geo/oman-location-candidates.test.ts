import { describe, expect, it } from 'vitest';

import { OMAN_LOCATION_THRESHOLD_POLICIES } from '@/config/geo/location-threshold-policy';

import { getOmanLocationCandidateState, getOmanLocationThresholdPolicy } from './oman-location-candidates';

describe('Oman location candidate runtime accessor', () => {
  it('keeps every threshold policy pair blocked and non-publishable', () => {
    expect(OMAN_LOCATION_THRESHOLD_POLICIES).toHaveLength(9);

    for (const policy of OMAN_LOCATION_THRESHOLD_POLICIES) {
      const state = getOmanLocationCandidateState({
        entity: policy.entity,
        dimension: policy.dimension,
        slug: `${policy.entity}-${policy.dimension}`,
        locale: 'en',
        parentHierarchyResolved: true,
      });

      expect(state.policy).toBe(policy);
      expect(state.status).toBe('blocked');
      expect(state.providerThresholdMet).toBe(false);
      expect(state.approvedEvidenceComplete).toBe(false);
      expect(state.readinessGatesComplete).toBe(false);
      expect(state.humanReviewComplete).toBe(false);
      expect(state.promotionPrApproved).toBe(false);
      expect(state.canRenderPreview).toBe(false);
      expect(state.canIndex).toBe(false);
      expect(state.canSitemap).toBe(false);
      expect(state.canEmitJsonLd).toBe(false);
      expect(state.canUseInternalSeoLinks).toBe(false);
      expect(state.blockedReasons).toContain('provider-threshold-not-met');
      expect(state.blockedReasons).toContain('approved-evidence-incomplete');
      expect(state.blockedReasons).toContain('readiness-gates-incomplete');
      expect(state.blockedReasons).toContain('human-review-incomplete');
      expect(state.blockedReasons).toContain('promotion-pr-approval-missing');
      expect(state.blockedReasons).toContain('location-candidate-engine-disabled');
      expect(state.blockedReasons).not.toContain('parent-hierarchy-not-resolved');
      expect(state.blockedReasons).not.toContain('missing-location-threshold-policy');
    }
  });

  it('blocks candidates when the parent hierarchy is not resolved', () => {
    const state = getOmanLocationCandidateState({
      entity: 'area',
      dimension: 'category',
      slug: 'al-khoud',
      locale: 'ar',
      parentHierarchyResolved: false,
    });

    expect(state.status).toBe('blocked');
    expect(state.parentHierarchyResolved).toBe(false);
    expect(state.canRenderPreview).toBe(false);
    expect(state.canIndex).toBe(false);
    expect(state.canSitemap).toBe(false);
    expect(state.canEmitJsonLd).toBe(false);
    expect(state.canUseInternalSeoLinks).toBe(false);
    expect(state.blockedReasons).toContain('parent-hierarchy-not-resolved');
    expect(state.blockedReasons).toContain('location-candidate-engine-disabled');
  });

  it('returns null for an unsupported entity and dimension pair', () => {
    expect(
      getOmanLocationThresholdPolicy({
        entity: 'area',
        dimension: 'unsupported' as Parameters<typeof getOmanLocationThresholdPolicy>[0]['dimension'],
      })
    ).toBeNull();
  });
});
