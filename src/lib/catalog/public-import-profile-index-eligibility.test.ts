import { describe, expect, it } from 'vitest';

import { isPublicImportProfileIndexEligible, type PublicImportProfileIndexEligibilityInput } from './public-import-profile-index-eligibility';

const eligibleProfile: PublicImportProfileIndexEligibilityInput = {
  entityType: 'pharmacy',
  canonicalPath: '/en/om/pharmacies/al-khuwair-pharmacy',
  name: 'Al Khuwair Pharmacy',
  nameAr: 'صيدلية الخوير',
  area: 'Al Khuwair',
  wilayat: 'Bawshar',
  governorate: 'Muscat',
  primarySpecialty: null,
  services: ['Prescription support'],
  departments: ['Pharmacy'],
  languages: ['English', 'Arabic'],
  lastCheckedAt: '2026-06-30T10:00:00.000Z',
  sourceName: 'Reviewed import source',
  sourceUrl: null,
  phoneE164: '+96800000000',
  whatsappE164: null,
  email: null,
  websiteUrl: null,
  googleMapsUrl: null,
  directionUrl: null,
};

describe('public import profile index eligibility', () => {
  it('marks a reviewed imported profile with source, location, language, taxonomy, and contact signals as eligible', () => {
    expect(isPublicImportProfileIndexEligible(eligibleProfile)).toEqual({ eligible: true, reasons: [] });
  });

  it('blocks name-only imported profiles from index eligibility', () => {
    const result = isPublicImportProfileIndexEligible({
      ...eligibleProfile,
      canonicalPath: ' ',
      area: null,
      wilayat: null,
      governorate: null,
      services: [],
      departments: [],
      languages: [],
      lastCheckedAt: null,
      sourceName: null,
      sourceUrl: null,
      phoneE164: null,
      whatsappE164: null,
      email: null,
      websiteUrl: null,
      googleMapsUrl: null,
      directionUrl: null,
    });

    expect(result.eligible).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        'missing_canonical_path',
        'missing_location',
        'missing_source',
        'missing_last_checked',
        'missing_language',
        'missing_taxonomy_signal',
        'missing_contact_or_map',
      ]),
    );
  });

  it('requires a language signal before imported metadata stays indexable', () => {
    const result = isPublicImportProfileIndexEligible({ ...eligibleProfile, languages: [] });

    expect(result).toEqual({ eligible: false, reasons: ['missing_language'] });
  });

  it('accepts department or service taxonomy signals for imported hospitals and pharmacies', () => {
    const hospitalProfile = {
      ...eligibleProfile,
      entityType: 'hospital',
      primarySpecialty: null,
      services: [],
      departments: ['Emergency department'],
    } satisfies PublicImportProfileIndexEligibilityInput;

    expect(isPublicImportProfileIndexEligible(hospitalProfile).eligible).toBe(true);
  });
});
