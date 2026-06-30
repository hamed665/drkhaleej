import { describe, expect, it } from 'vitest';

import {
  buildProviderDescriptionPublicReadiness,
  getApprovedProviderDescriptionBody,
  hasUnsafeProviderDescriptionClaim,
  type ProviderDescriptionReviewRecord,
} from './provider-description-review';

const approvedDescription: ProviderDescriptionReviewRecord = {
  id: 'description_1',
  subjectId: 'center_1',
  subjectKind: 'center',
  locale: 'en',
  body: 'Family medicine clinic in Muscat with public directory information for discovery.',
  status: 'approved',
  submittedAt: '2026-06-30T10:00:00.000Z',
  reviewedAt: '2026-06-30T11:00:00.000Z',
  reviewerId: 'admin_1',
  rejectionReason: null,
};

describe('provider description review contract', () => {
  it('allows approved clean provider copy to become public body text', () => {
    expect(buildProviderDescriptionPublicReadiness(approvedDescription)).toEqual({
      public: true,
      reasons: [],
    });
    expect(getApprovedProviderDescriptionBody(approvedDescription)).toBe(approvedDescription.body);
  });

  it('keeps draft and pending provider copy out of public rendering', () => {
    const draftDescription = { ...approvedDescription, status: 'draft' as const };
    const pendingDescription = { ...approvedDescription, status: 'pending_review' as const };

    expect(buildProviderDescriptionPublicReadiness(draftDescription)).toEqual({
      public: false,
      reasons: ['not_approved'],
    });
    expect(getApprovedProviderDescriptionBody(pendingDescription)).toBeNull();
  });

  it('keeps rejected provider copy out of public rendering', () => {
    const rejectedDescription = {
      ...approvedDescription,
      status: 'rejected' as const,
      rejectionReason: 'Needs factual support.',
    };

    expect(buildProviderDescriptionPublicReadiness(rejectedDescription).reasons).toContain('not_approved');
    expect(getApprovedProviderDescriptionBody(rejectedDescription)).toBeNull();
  });

  it('blocks empty approved copy instead of treating approval as enough', () => {
    const emptyDescription = { ...approvedDescription, body: '   ' };

    expect(buildProviderDescriptionPublicReadiness(emptyDescription)).toEqual({
      public: false,
      reasons: ['empty_body'],
    });
  });

  it('blocks unsafe claim wording even if the status is approved', () => {
    const blockedPhrase = ['best ', 'clinic'].join('');
    const unsafeDescription = {
      ...approvedDescription,
      body: `${blockedPhrase} for fast care`,
    };

    expect(hasUnsafeProviderDescriptionClaim(unsafeDescription.body)).toBe(true);
    expect(buildProviderDescriptionPublicReadiness(unsafeDescription)).toEqual({
      public: false,
      reasons: ['unsafe_claim'],
    });
    expect(getApprovedProviderDescriptionBody(unsafeDescription)).toBeNull();
  });
});
