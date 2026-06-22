export type TaxonomyScope = 'core' | 'adjacent' | 'deferred' | 'excluded';
export type TopicalRiskLevel = 'low' | 'medium' | 'high';
export type MedicalRiskLevel = 'none' | 'low' | 'medium' | 'high' | 'ymyl_high';
export type LicenseRequirementLevel =
  | 'not_required'
  | 'recommended'
  | 'required'
  | 'required_verified_before_public_claim';
export type MedicalReviewRequirement =
  | 'not_required'
  | 'recommended'
  | 'required'
  | 'required_before_index';
export type PublicLaunchPhase = 1 | 2 | 3 | 'deferred' | 'excluded';
export type SchemaHintSlug =
  | 'person'
  | 'physician'
  | 'dentist'
  | 'hospital'
  | 'medical-clinic'
  | 'medical-organization'
  | 'pharmacy'
  | 'diagnostic-lab'
  | 'medical-test'
  | 'local-business'
  | 'beauty-salon'
  | 'health-and-beauty-business'
  | 'health-club'
  | 'veterinary-care'
  | 'pet-store'
  | 'breadcrumb-list'
  | 'faq-page';

export type TaxonomyRegistryItemBase = {
  readonly slug: string;
  readonly labelEn: string;
  readonly labelAr: string;
  readonly scope: TaxonomyScope;
  readonly publicLaunchPhase: PublicLaunchPhase;
  readonly descriptionEn: string;
  readonly descriptionAr: string;
};
