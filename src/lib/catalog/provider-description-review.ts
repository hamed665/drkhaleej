import type { PublicCatalogLocale } from './public-types';

export const providerDescriptionReviewStatuses = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
] as const;

export type ProviderDescriptionReviewStatus = (typeof providerDescriptionReviewStatuses)[number];
export type ProviderDescriptionSubjectKind = 'center' | 'doctor';

export type ProviderDescriptionReviewRecord = {
  id: string;
  subjectId: string;
  subjectKind: ProviderDescriptionSubjectKind;
  locale: PublicCatalogLocale;
  body: string;
  status: ProviderDescriptionReviewStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewerId: string | null;
  rejectionReason: string | null;
};

export type ProviderDescriptionPublicReadinessReason =
  | 'not_approved'
  | 'empty_body'
  | 'unsafe_claim';

export type ProviderDescriptionPublicReadiness = {
  public: boolean;
  reasons: ProviderDescriptionPublicReadinessReason[];
};

const unsafeProviderDescriptionClaimPhrases = [
  'top-rated',
  'best clinic',
  'best doctor',
  'guaranteed',
  'trusted by thousands',
  'insurance accepted',
  'moh approved',
  'verified by moh',
  '24/7',
  'emergency availability',
  'booking guarantee',
  'available now',
  'open now',
  'book now',
] as const;

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function normalizeText(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
}

export function hasUnsafeProviderDescriptionClaim(value: string): boolean {
  const normalized = normalizeText(value);
  return unsafeProviderDescriptionClaimPhrases.some((claim) => normalized.includes(claim));
}

export function buildProviderDescriptionPublicReadiness(
  record: ProviderDescriptionReviewRecord,
): ProviderDescriptionPublicReadiness {
  const reasons: ProviderDescriptionPublicReadinessReason[] = [];

  if (record.status !== 'approved') reasons.push('not_approved');
  if (!hasText(record.body)) reasons.push('empty_body');
  if (hasUnsafeProviderDescriptionClaim(record.body)) reasons.push('unsafe_claim');

  return {
    public: reasons.length === 0,
    reasons,
  };
}

export function getApprovedProviderDescriptionBody(record: ProviderDescriptionReviewRecord): string | null {
  const readiness = buildProviderDescriptionPublicReadiness(record);
  if (!readiness.public) return null;
  return record.body.trim();
}
