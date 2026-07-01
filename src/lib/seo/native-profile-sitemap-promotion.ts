import type { PublicProfileIndexEligibilityResult } from '@/lib/catalog/public-profile-index-eligibility';

export type NativeProfileSitemapPromotionEntity = 'center' | 'doctor';

export type NativeProfileSitemapPromotionReason =
  | 'not_index_eligible'
  | 'completeness_not_accepted'
  | 'missing_reviewed_promotion_evidence'
  | 'imported_preview'
  | 'unsafe_canonical_path'
  | 'family_cap_exceeded'
  | 'missing_deterministic_order_key';

export type NativeProfileSitemapPromotionInput = {
  entity: NativeProfileSitemapPromotionEntity;
  canonicalPath: string | null | undefined;
  indexEligibility: PublicProfileIndexEligibilityResult;
  completenessAccepted: boolean;
  reviewedPromotionEvidence: boolean;
  importedPreview: boolean;
  familyCapAllowed: boolean;
  deterministicOrderKey: string | null | undefined;
};

export type NativeProfileSitemapPromotionDecision = {
  eligible: boolean;
  reasons: NativeProfileSitemapPromotionReason[];
};

function canonicalPathPatternForEntity(entity: NativeProfileSitemapPromotionEntity): RegExp {
  const segment = entity === 'center' ? 'center' : 'doctor';
  return new RegExp(`^/(en|ar)/om/${segment}/[a-z0-9]+(?:-[a-z0-9]+)*$`);
}

function isSafeNativeProfileCanonicalPath(
  entity: NativeProfileSitemapPromotionEntity,
  canonicalPath: string | null | undefined,
): boolean {
  if (typeof canonicalPath !== 'string') return false;
  if (!canonicalPathPatternForEntity(entity).test(canonicalPath)) return false;

  return ![
    '?',
    '#',
    '/admin/',
    '/preview/',
    '/provider-dashboard/',
    '/booking/',
    '/insurance/',
    '/rating/',
    '/reviews/',
  ].some((token) => canonicalPath.includes(token));
}

function hasDeterministicOrderKey(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function buildNativeProfileSitemapPromotionDecision(
  input: NativeProfileSitemapPromotionInput,
): NativeProfileSitemapPromotionDecision {
  const reasons = new Set<NativeProfileSitemapPromotionReason>();

  if (!input.indexEligibility.eligible) reasons.add('not_index_eligible');
  if (!input.completenessAccepted) reasons.add('completeness_not_accepted');
  if (!input.reviewedPromotionEvidence) reasons.add('missing_reviewed_promotion_evidence');
  if (input.importedPreview) reasons.add('imported_preview');
  if (!isSafeNativeProfileCanonicalPath(input.entity, input.canonicalPath)) reasons.add('unsafe_canonical_path');
  if (!input.familyCapAllowed) reasons.add('family_cap_exceeded');
  if (!hasDeterministicOrderKey(input.deterministicOrderKey)) reasons.add('missing_deterministic_order_key');

  return {
    eligible: reasons.size === 0,
    reasons: Array.from(reasons),
  };
}
