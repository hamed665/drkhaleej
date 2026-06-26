export type PublicProfileEntityType =
  | 'doctor'
  | 'center'
  | 'hospital'
  | 'pharmacy'
  | 'lab'
  | 'beauty'
  | 'pet-clinic'
  | 'pet-shop'
  | 'service';

export type PublicProfileReviewStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export type PublicProfileReadinessStatus = 'ready' | 'needs_content' | 'blocked';

export type PublicProfilePublicationBlockerKey =
  | 'profile-not-active'
  | 'profile-not-reviewed'
  | 'profile-not-ready'
  | 'missing-slug'
  | 'missing-display-name'
  | 'unsafe-medical-claims';

export type PublicProfilePublicationBlocker = {
  key: PublicProfilePublicationBlockerKey;
  message: string;
};

export type PublicProfilePublicationInput = {
  entityType: PublicProfileEntityType;
  isActive: boolean;
  reviewStatus: PublicProfileReviewStatus;
  readinessStatus: PublicProfileReadinessStatus;
  slug: string | null;
  displayName: string | null;
  hasUnsafeMedicalClaims: boolean;
};

export type PublicProfilePublicationDecision = {
  entityType: PublicProfileEntityType;
  isPublic: boolean;
  indexable: boolean;
  sitemapEligible: boolean;
  blockers: readonly PublicProfilePublicationBlocker[];
};

const blockerMessages: Record<PublicProfilePublicationBlockerKey, string> = {
  'profile-not-active': 'Profile must be active before it can be public.',
  'profile-not-reviewed': 'Profile must pass editorial review before it can be public.',
  'profile-not-ready': 'Profile content readiness must be complete before it can be public.',
  'missing-slug': 'Profile must have a stable public slug before it can be public.',
  'missing-display-name': 'Profile must have a display name before it can be public.',
  'unsafe-medical-claims': 'Profile must not contain unsafe medical, diagnosis, approval or verification claims.'
};

function hasText(value: string | null): boolean {
  return value !== null && value.trim().length > 0;
}

function createBlocker(key: PublicProfilePublicationBlockerKey): PublicProfilePublicationBlocker {
  return {
    key,
    message: blockerMessages[key]
  };
}

export function getPublicProfilePublicationBlockers(input: PublicProfilePublicationInput): PublicProfilePublicationBlocker[] {
  const blockers: PublicProfilePublicationBlocker[] = [];

  if (!input.isActive) {
    blockers.push(createBlocker('profile-not-active'));
  }

  if (input.reviewStatus !== 'approved') {
    blockers.push(createBlocker('profile-not-reviewed'));
  }

  if (input.readinessStatus !== 'ready') {
    blockers.push(createBlocker('profile-not-ready'));
  }

  if (!hasText(input.slug)) {
    blockers.push(createBlocker('missing-slug'));
  }

  if (!hasText(input.displayName)) {
    blockers.push(createBlocker('missing-display-name'));
  }

  if (input.hasUnsafeMedicalClaims) {
    blockers.push(createBlocker('unsafe-medical-claims'));
  }

  return blockers;
}

export function evaluatePublicProfilePublication(input: PublicProfilePublicationInput): PublicProfilePublicationDecision {
  const blockers = getPublicProfilePublicationBlockers(input);
  const isPublic = blockers.length === 0;

  return {
    entityType: input.entityType,
    isPublic,
    indexable: isPublic,
    sitemapEligible: isPublic,
    blockers
  };
}

export function isPublicProfilePublishable(input: PublicProfilePublicationInput): boolean {
  return evaluatePublicProfilePublication(input).isPublic;
}
