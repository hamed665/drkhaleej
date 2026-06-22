export type LicenseRequirement = 'none' | 'recommended' | 'required';
export type MedicalReviewRequirement = 'none' | 'recommended' | 'required_before_index';
export type MedicalRiskLevel = 'none' | 'low' | 'medium' | 'high';
export type RegistryScope = 'core' | 'adjacent' | 'deferred' | 'excluded';

export type TaxonomyRecord = {
  slug: string;
  labelEn: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
};

export type Vertical = TaxonomyRecord & { scope: RegistryScope; isCore: boolean; isAdjacent: boolean };
export type EntityType = TaxonomyRecord & {
  primaryVerticalSlug: string;
  secondaryVerticalSlugs: string[];
  requiresLicense: LicenseRequirement;
  requiresMedicalReview: MedicalReviewRequirement;
  medicalRiskLevel: MedicalRiskLevel;
  isHumanHealthcare: boolean;
};
export type DoctorLevel = TaxonomyRecord & { rank: number };
export type Specialty = TaxonomyRecord & {
  verticalSlugs: string[];
  relatedEntityTypeSlugs: string[];
  isMentalHealth: boolean;
};
export type Service = TaxonomyRecord & {
  family: string;
  verticalSlugs: string[];
  relatedSpecialtySlugs: string[];
  relatedEntityTypeSlugs: string[];
  schemaHintSlug: string;
};
export type SchemaHint = TaxonomyRecord & { schemaType: string };
