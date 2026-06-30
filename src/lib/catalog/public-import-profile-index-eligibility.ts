import type { PublicImportProfileSummaryInput } from './public-import-profile-summary';

export type PublicImportProfileIndexEligibilityReason =
  | 'missing_name'
  | 'missing_canonical_path'
  | 'missing_location'
  | 'missing_source'
  | 'missing_last_checked'
  | 'missing_language'
  | 'missing_taxonomy_signal'
  | 'missing_contact_or_map';

export type PublicImportProfileIndexEligibilityResult = {
  eligible: boolean;
  reasons: PublicImportProfileIndexEligibilityReason[];
};

export type PublicImportProfileIndexEligibilityInput = PublicImportProfileSummaryInput & {
  canonicalPath: string;
  sourceName: string | null;
  sourceUrl: string | null;
  phoneE164: string | null;
  whatsappE164: string | null;
  email: string | null;
  websiteUrl: string | null;
  googleMapsUrl: string | null;
  directionUrl: string | null;
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasAnyText(values: Array<string | null | undefined>): boolean {
  return values.some(hasText);
}

function hasAnyListValue(values: string[]): boolean {
  return values.some((value) => value.trim().length > 0);
}

export function isPublicImportProfileIndexEligible(
  profile: PublicImportProfileIndexEligibilityInput,
): PublicImportProfileIndexEligibilityResult {
  const reasons: PublicImportProfileIndexEligibilityReason[] = [];

  if (!hasText(profile.name)) reasons.push('missing_name');
  if (!hasText(profile.canonicalPath)) reasons.push('missing_canonical_path');
  if (!hasAnyText([profile.area, profile.wilayat, profile.governorate])) reasons.push('missing_location');
  if (!hasAnyText([profile.sourceName, profile.sourceUrl])) reasons.push('missing_source');
  if (!hasText(profile.lastCheckedAt)) reasons.push('missing_last_checked');
  if (!hasAnyListValue(profile.languages)) reasons.push('missing_language');
  if (!hasAnyText([profile.primarySpecialty]) && !hasAnyListValue(profile.services) && !hasAnyListValue(profile.departments)) {
    reasons.push('missing_taxonomy_signal');
  }
  if (!hasAnyText([
    profile.phoneE164,
    profile.whatsappE164,
    profile.email,
    profile.websiteUrl,
    profile.googleMapsUrl,
    profile.directionUrl,
  ])) {
    reasons.push('missing_contact_or_map');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
