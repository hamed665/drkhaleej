import { describe, expect, it } from 'vitest';

import type { PublicProfileIndexEligibilityResult } from '@/lib/catalog/public-profile-index-eligibility';
import { buildNativeProfileSitemapPromotionDecision } from './native-profile-sitemap-promotion';

const eligibleIndex: PublicProfileIndexEligibilityResult = { eligible: true, reasons: [] };

function baseInput() {
  return {
    entity: 'center' as const,
    canonicalPath: '/en/om/center/muscat-heart-clinic',
    indexEligibility: eligibleIndex,
    completenessAccepted: true,
    reviewedPromotionEvidence: true,
    importedPreview: false,
    familyCapAllowed: true,
    deterministicOrderKey: 'center:muscat-heart-clinic',
  };
}

describe('native profile sitemap promotion contract', () => {
  it('returns eligible for a reviewed native center profile', () => {
    expect(buildNativeProfileSitemapPromotionDecision(baseInput())).toEqual({ eligible: true, reasons: [] });
  });

  it('requires public profile index eligibility', () => {
    const decision = buildNativeProfileSitemapPromotionDecision({
      ...baseInput(),
      indexEligibility: { eligible: false, reasons: ['missing_relation_signal'] },
    });

    expect(decision.eligible).toBe(false);
    expect(decision.reasons).toContain('not_index_eligible');
  });

  it('requires completeness and reviewed evidence', () => {
    const decision = buildNativeProfileSitemapPromotionDecision({
      ...baseInput(),
      completenessAccepted: false,
      reviewedPromotionEvidence: false,
    });

    expect(decision.reasons).toContain('completeness_not_accepted');
    expect(decision.reasons).toContain('missing_reviewed_promotion_evidence');
  });

  it('requires native profile path and native source', () => {
    const decision = buildNativeProfileSitemapPromotionDecision({
      ...baseInput(),
      importedPreview: true,
      canonicalPath: '/en/om/center/muscat-heart-clinic-preview',
    });

    expect(decision.reasons).toContain('imported_preview');
  });

  it('requires family cap allowance and deterministic ordering', () => {
    const decision = buildNativeProfileSitemapPromotionDecision({
      ...baseInput(),
      familyCapAllowed: false,
      deterministicOrderKey: '',
    });

    expect(decision.reasons).toContain('family_cap_exceeded');
    expect(decision.reasons).toContain('missing_deterministic_order_key');
  });

  it('supports doctor profile canonical paths', () => {
    const decision = buildNativeProfileSitemapPromotionDecision({
      ...baseInput(),
      entity: 'doctor',
      canonicalPath: '/ar/om/doctor/dr-sara-ahmed',
      deterministicOrderKey: 'doctor:dr-sara-ahmed',
    });

    expect(decision.eligible).toBe(true);
  });
});
