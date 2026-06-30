import type { Metadata } from 'next';
import type { PublicProfileIndexEligibilityResult } from '@/lib/catalog/public-profile-index-eligibility';

export function buildProfileNoindexMetadata(metadata: Metadata): Metadata {
  return {
    ...metadata,
    robots: { index: false, follow: true },
  };
}

export function applyProfileMetadataIndexGate(
  metadata: Metadata,
  eligibility: PublicProfileIndexEligibilityResult,
): Metadata {
  if (eligibility.eligible) return metadata;
  return buildProfileNoindexMetadata(metadata);
}
