import { describe, expect, it } from 'vitest';

import { OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_REQUIREMENTS } from '@/config/geo/location-candidate-evidence-snapshot-contract';

import {
  getOmanLocationCandidateEvidenceSnapshotRuntimeContract,
  getOmanLocationCandidateEvidenceSnapshotState,
} from './oman-location-candidate-evidence-snapshots';

describe('Oman location candidate evidence snapshots', () => {
  it('keeps every snapshot requirement disabled', () => {
    expect(OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_REQUIREMENTS).toHaveLength(9);

    for (const requirement of OMAN_LOCATION_CANDIDATE_EVIDENCE_SNAPSHOT_REQUIREMENTS) {
      const state = getOmanLocationCandidateEvidenceSnapshotState({
        entity: requirement.entity,
        dimension: requirement.dimension,
        slug: `${requirement.entity}-${requirement.dimension}`,
        locale: 'en',
        parentHierarchyResolved: true,
        candidatePath: '/en/om/locations/muscat/categories/example',
        locationSlug: 'muscat',
      });

      expect(state.requirement).toBe(requirement);
      expect(state.status).toBe('disabled');
      expect(state.snapshotGenerationAllowed).toBe(false);
      expect(state.promotionAllowed).toBe(false);
      expect(state.snapshot).toBeNull();
      expect(state.candidateState.status).toBe('blocked');
      expect(state.candidateState.canIndex).toBe(false);
      expect(state.candidateState.canSitemap).toBe(false);
      expect(state.candidateState.canEmitJsonLd).toBe(false);
      expect(state.candidateState.canUseInternalSeoLinks).toBe(false);
      expect(state.blockedReasons).toContain('candidate-evidence-snapshot-contract-only');
      expect(state.blockedReasons).toContain('candidate-evidence-snapshot-runtime-disabled');
      expect(state.blockedReasons).toContain('location-candidate-engine-disabled');
      expect(state.blockedReasons).not.toContain('parent-hierarchy-not-resolved');
    }
  });

  it('keeps parent hierarchy failures visible', () => {
    const state = getOmanLocationCandidateEvidenceSnapshotState({
      entity: 'area',
      dimension: 'category',
      slug: 'al-khoud',
      locale: 'ar',
      parentHierarchyResolved: false,
      candidatePath: '/ar/om/locations/muscat/al-seeb/al-khoud/categories/pharmacies',
      locationSlug: 'al-khoud',
    });

    expect(state.status).toBe('disabled');
    expect(state.snapshotGenerationAllowed).toBe(false);
    expect(state.promotionAllowed).toBe(false);
    expect(state.snapshot).toBeNull();
    expect(state.blockedReasons).toContain('parent-hierarchy-not-resolved');
    expect(state.blockedReasons).toContain('candidate-evidence-snapshot-runtime-disabled');
  });

  it('exposes a disabled snapshot contract', () => {
    const contract = getOmanLocationCandidateEvidenceSnapshotRuntimeContract();

    expect(contract.status).toBe('contract-only');
    expect(contract.currentSnapshotsAvailable).toBe(false);
    expect(contract.runtimeSnapshotGenerationAllowed).toBe(false);
    expect(contract.databaseAccessAllowed).toBe(false);
    expect(contract.sitemapPromotionAllowed).toBe(false);
    expect(contract.jsonLdAllowed).toBe(false);
    expect(contract.indexPromotionAllowed).toBe(false);
  });
});
