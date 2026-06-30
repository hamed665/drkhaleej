import { describe, expect, it } from 'vitest';

import {
  buildPublicCenterProfileSummary,
  buildPublicDoctorProfileSummary,
  buildPublicProfileMetaDescription,
} from './public-profile-summary';
import type {
  PublicCenterDetail,
  PublicDoctorDetail,
  PublicProviderLocationSummary,
} from './public-types';

const forbiddenClaims = [
  'best',
  'top-rated',
  'guaranteed',
  'trusted by thousands',
  'insurance accepted',
  'MOH approved',
  '24/7',
];

function expectNoForbiddenClaims(value: string) {
  for (const claim of forbiddenClaims) {
    expect(value.toLowerCase()).not.toContain(claim.toLowerCase());
  }
}

const alKhuwairLocation: PublicProviderLocationSummary = {
  id: 'loc_1',
  locationNameEn: 'Main branch',
  locationNameAr: 'الفرع الرئيسي',
  areaNameEn: 'Al Khuwair',
  areaNameAr: 'الخوير',
  cityNameEn: 'Muscat',
  cityNameAr: 'مسقط',
  countryNameEn: 'Oman',
  countryNameAr: 'عُمان',
  mapUrl: null,
  isPrimary: true,
  sortOrder: 1,
  contactActions: [],
};

const sampleCenter: PublicCenterDetail = {
  id: 'center_1',
  slug: 'al-khuwair-pharmacy',
  nameEn: 'Al Khuwair Pharmacy',
  nameAr: 'صيدلية الخوير',
  centerType: 'pharmacy',
  descriptionEn: null,
  descriptionAr: null,
  shortDescriptionEn: null,
  shortDescriptionAr: null,
  defaultCountry: 'om',
  verificationStatus: 'verified',
  licenseInfo: null,
  location: alKhuwairLocation,
  locations: [alKhuwairLocation],
  services: [
    {
      id: 'service_1',
      slug: 'prescription-refills',
      nameEn: 'Prescription refills',
      nameAr: 'إعادة صرف الوصفات',
      descriptionEn: null,
      descriptionAr: null,
      requiresMedicalDisclaimer: true,
    },
  ],
  doctors: [
    {
      id: 'doctor_1',
      slug: 'sara-ahmed',
      fullNameEn: 'Dr. Sara Ahmed',
      fullNameAr: 'د. سارة أحمد',
      titleEn: 'specialist',
      titleAr: 'specialist',
      gender: 'female',
      defaultCountry: 'om',
    },
  ],
  contactActions: [],
  galleryImages: [],
  logoImage: null,
  coverImage: null,
};

const sampleDoctor: PublicDoctorDetail = {
  id: 'doctor_1',
  slug: 'sara-ahmed',
  fullNameEn: 'Dr. Sara Ahmed',
  fullNameAr: 'د. سارة أحمد',
  titleEn: 'consultant',
  titleAr: 'consultant',
  gender: 'female',
  defaultCountry: 'om',
  displayNameEn: 'Dr. Sara Ahmed',
  displayNameAr: 'د. سارة أحمد',
  licenseInfo: null,
  bioEn: null,
  bioAr: null,
  profileImageUrl: null,
  profileImage: null,
  yearsExperience: 12,
  verificationStatus: 'verified',
  primarySpecialty: {
    id: 'specialty_1',
    nameEn: 'Dermatology',
    nameAr: 'الأمراض الجلدية',
    descriptionEn: null,
    descriptionAr: null,
  },
  services: [
    {
      id: 'service_2',
      slug: 'skin-consultation',
      nameEn: 'Skin consultation',
      nameAr: 'استشارة جلدية',
      descriptionEn: null,
      descriptionAr: null,
      requiresMedicalDisclaimer: true,
    },
  ],
  practiceLocations: [
    {
      id: 'practice_1',
      center: {
        id: 'center_2',
        slug: 'muscat-skin-clinic',
        nameEn: 'Muscat Skin Clinic',
        nameAr: 'عيادة مسقط الجلدية',
        centerType: 'clinic',
        shortDescriptionEn: null,
        shortDescriptionAr: null,
        defaultCountry: 'om',
        verificationStatus: 'verified',
      },
      primarySpecialty: null,
      location: alKhuwairLocation,
      contactActions: [],
    },
  ],
};

describe('public profile summaries', () => {
  it('builds a fact-based center summary from profile data', () => {
    const summary = buildPublicCenterProfileSummary('en', sampleCenter);

    expect(summary).toContain('Al Khuwair Pharmacy');
    expect(summary).toContain('public pharmacy profile');
    expect(summary).toContain('Al Khuwair');
    expect(summary).toContain('Muscat');
    expect(summary).toContain('Prescription refills');
    expect(summary).toContain('Dr. Sara Ahmed');
    expect(summary).toContain('confirmed directly with the provider');
    expectNoForbiddenClaims(summary);
  });

  it('builds a fact-based doctor summary from specialty and practice data', () => {
    const summary = buildPublicDoctorProfileSummary('en', sampleDoctor);

    expect(summary).toContain('Dr. Sara Ahmed');
    expect(summary).toContain('public doctor profile in Oman');
    expect(summary).toContain('consultant doctor');
    expect(summary).toContain('Dermatology');
    expect(summary).toContain('Skin consultation');
    expect(summary).toContain('Muscat Skin Clinic');
    expect(summary).toContain('confirmed directly with the provider');
    expectNoForbiddenClaims(summary);
  });

  it('builds localized Arabic summaries from the same approved data', () => {
    const centerSummary = buildPublicCenterProfileSummary('ar', sampleCenter);
    const doctorSummary = buildPublicDoctorProfileSummary('ar', sampleDoctor);

    expect(centerSummary).toContain('صيدلية الخوير');
    expect(centerSummary).toContain('صيدلية');
    expect(centerSummary).toContain('الخوير');
    expect(centerSummary).toContain('إعادة صرف الوصفات');
    expect(doctorSummary).toContain('د. سارة أحمد');
    expect(doctorSummary).toContain('الأمراض الجلدية');
    expect(doctorSummary).toContain('عيادة مسقط الجلدية');
    expectNoForbiddenClaims(centerSummary);
    expectNoForbiddenClaims(doctorSummary);
  });

  it('builds metadata descriptions that stay within snippet length', () => {
    const summary = buildPublicDoctorProfileSummary('en', sampleDoctor);
    const metadataDescription = buildPublicProfileMetaDescription(summary);

    expect(metadataDescription.length).toBeLessThanOrEqual(155);
    expect(metadataDescription).toContain('Dr. Sara Ahmed');
    expectNoForbiddenClaims(metadataDescription);
  });
});
