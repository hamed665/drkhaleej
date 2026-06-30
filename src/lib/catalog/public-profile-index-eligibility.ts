import {
  buildPublicCenterProfileSummary,
  buildPublicDoctorProfileSummary,
} from './public-profile-summary';
import type {
  PublicCatalogLocale,
  PublicCenterDetail,
  PublicDoctorDetail,
} from './public-types';

export type PublicProfileIndexEligibilityReason =
  | 'missing_profile'
  | 'missing_name'
  | 'missing_slug'
  | 'missing_country'
  | 'missing_entity_type'
  | 'missing_summary'
  | 'missing_relation_signal'
  | 'missing_safety_copy'
  | 'unsafe_claim'
  | 'deleted_or_inactive'
  | 'not_from_public_eligible_query';

export type PublicProfileIndexEligibilityResult = {
  eligible: boolean;
  reasons: PublicProfileIndexEligibilityReason[];
};

export type PublicProfileIndexEligibilityKind = 'center' | 'doctor';

export type PublicProfileIndexEligibilityContext = {
  kind: PublicProfileIndexEligibilityKind;
  locale?: PublicCatalogLocale;
  fromPublicEligibleQuery?: boolean;
  deletedOrInactive?: boolean;
};

export type PublicProfileIndexEligibilityProfile = PublicCenterDetail | PublicDoctorDetail;

const forbiddenClaimPhrases = [
  'top-rated',
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

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function firstNonEmptyText(values: Array<string | null | undefined>): string | null {
  return values.find(hasText) ?? null;
}

function normalizeText(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
}

function hasSafetyCopy(summary: string): boolean {
  const normalizedSummary = normalizeText(summary);
  return (
    normalizedSummary.includes('confirmed directly with the provider') ||
    normalizedSummary.includes('current details should be confirmed directly with the provider') ||
    normalizedSummary.includes('تأكيد التفاصيل الحالية مباشرة مع مقدم الخدمة')
  );
}

function containsUnsafeClaim(values: Array<string | null | undefined>): boolean {
  const searchableText = values.filter(hasText).map(normalizeText).join(' ');
  if (!searchableText) return false;

  return forbiddenClaimPhrases.some((claim) => searchableText.includes(claim));
}

function centerDisplayName(center: PublicCenterDetail): string | null {
  return firstNonEmptyText([center.nameEn, center.nameAr]);
}

function doctorDisplayName(doctor: PublicDoctorDetail): string | null {
  return firstNonEmptyText([doctor.displayNameEn, doctor.displayNameAr, doctor.fullNameEn, doctor.fullNameAr]);
}

function centerHasRelationSignal(center: PublicCenterDetail): boolean {
  return center.location !== null || center.locations.length > 0 || center.services.length > 0 || center.doctors.length > 0;
}

function doctorHasRelationSignal(doctor: PublicDoctorDetail): boolean {
  return doctor.primarySpecialty !== null || doctor.services.length > 0 || doctor.practiceLocations.length > 0;
}

function centerPublicClaimTexts(center: PublicCenterDetail, summary: string): Array<string | null | undefined> {
  return [
    summary,
    center.descriptionEn,
    center.descriptionAr,
    center.shortDescriptionEn,
    center.shortDescriptionAr,
    ...center.services.flatMap((service) => [service.nameEn, service.nameAr, service.descriptionEn, service.descriptionAr]),
  ];
}

function doctorPublicClaimTexts(doctor: PublicDoctorDetail, summary: string): Array<string | null | undefined> {
  return [
    summary,
    doctor.bioEn,
    doctor.bioAr,
    doctor.primarySpecialty?.descriptionEn,
    doctor.primarySpecialty?.descriptionAr,
    ...doctor.services.flatMap((service) => [service.nameEn, service.nameAr, service.descriptionEn, service.descriptionAr]),
    ...doctor.practiceLocations.flatMap((practiceLocation) => [
      practiceLocation.center.shortDescriptionEn,
      practiceLocation.center.shortDescriptionAr,
    ]),
  ];
}

function resultFromReasons(reasons: Set<PublicProfileIndexEligibilityReason>): PublicProfileIndexEligibilityResult {
  return {
    eligible: reasons.size === 0,
    reasons: Array.from(reasons),
  };
}

export function isPublicProfileIndexEligible(
  profile: PublicProfileIndexEligibilityProfile | null,
  context: PublicProfileIndexEligibilityContext,
): PublicProfileIndexEligibilityResult {
  const reasons = new Set<PublicProfileIndexEligibilityReason>();
  const locale = context.locale ?? 'en';

  if (!context.fromPublicEligibleQuery) reasons.add('not_from_public_eligible_query');
  if (context.deletedOrInactive) reasons.add('deleted_or_inactive');

  if (!profile) {
    reasons.add('missing_profile');
    return resultFromReasons(reasons);
  }

  if (context.kind === 'center') {
    const center = profile as PublicCenterDetail;
    const summary = buildPublicCenterProfileSummary(locale, center);

    if (!hasText(centerDisplayName(center))) reasons.add('missing_name');
    if (!hasText(center.slug)) reasons.add('missing_slug');
    if (!hasText(center.defaultCountry)) reasons.add('missing_country');
    if (!hasText(center.centerType)) reasons.add('missing_entity_type');
    if (!hasText(summary)) reasons.add('missing_summary');
    if (!centerHasRelationSignal(center)) reasons.add('missing_relation_signal');
    if (!hasSafetyCopy(summary)) reasons.add('missing_safety_copy');
    if (containsUnsafeClaim(centerPublicClaimTexts(center, summary))) reasons.add('unsafe_claim');

    return resultFromReasons(reasons);
  }

  const doctor = profile as PublicDoctorDetail;
  const summary = buildPublicDoctorProfileSummary(locale, doctor);

  if (!hasText(doctorDisplayName(doctor))) reasons.add('missing_name');
  if (!hasText(doctor.slug)) reasons.add('missing_slug');
  if (!hasText(doctor.defaultCountry)) reasons.add('missing_country');
  if (!hasText(doctor.titleEn)) reasons.add('missing_entity_type');
  if (!hasText(summary)) reasons.add('missing_summary');
  if (!doctorHasRelationSignal(doctor)) reasons.add('missing_relation_signal');
  if (!hasSafetyCopy(summary)) reasons.add('missing_safety_copy');
  if (containsUnsafeClaim(doctorPublicClaimTexts(doctor, summary))) reasons.add('unsafe_claim');

  return resultFromReasons(reasons);
}
