import "server-only";

export type ImportEntityDomain =
  | "human_healthcare"
  | "pet_healthcare"
  | "medical_beauty"
  | "non_medical_beauty"
  | "wellness"
  | "fitness";

export type ImportEntityType =
  | "doctor"
  | "hospital"
  | "clinic"
  | "pharmacy"
  | "lab"
  | "imaging_center"
  | "dental_clinic"
  | "dentist"
  | "dermatologist"
  | "gynecologist"
  | "fertility_clinic"
  | "ivf_center"
  | "reproductive_medicine_doctor"
  | "embryology_lab"
  | "andrology_lab"
  | "hair_transplant_clinic"
  | "hair_transplant_doctor"
  | "plastic_surgeon"
  | "aesthetic_doctor"
  | "medical_beauty_clinic"
  | "salon"
  | "spa"
  | "gym"
  | "fitness_center"
  | "personal_trainer"
  | "yoga_studio"
  | "pilates_studio"
  | "sports_medicine_doctor"
  | "physiotherapy"
  | "wellness_center"
  | "vet_doctor"
  | "pet_clinic"
  | "pet_pharmacy"
  | "pet_shop"
  | "pet_grooming"
  | "pet_boarding";

export type ImportDoctorSpecialty =
  | "cardiology"
  | "dermatology"
  | "gynecology"
  | "fertility_ivf"
  | "reproductive_medicine"
  | "embryology"
  | "andrology"
  | "dentistry"
  | "pediatrics"
  | "orthopedics"
  | "ent"
  | "ophthalmology"
  | "psychiatry"
  | "psychology"
  | "nutrition"
  | "physiotherapy"
  | "sports_medicine"
  | "plastic_surgery"
  | "hair_transplant"
  | "aesthetic_medicine";

export type ImportEntityDomainResolution = {
  entityType: ImportEntityType;
  domain: ImportEntityDomain;
};

export type ImportDomainSeparationViolation =
  | "human_to_pet_domain"
  | "pet_to_human_domain"
  | "medical_beauty_to_non_medical_beauty"
  | "non_medical_beauty_to_medical_beauty"
  | "fitness_to_healthcare_requires_explicit_rule"
  | "unsupported_source_domain"
  | "unsupported_target_domain";

export const IMPORT_ENTITY_DOMAIN_BY_TYPE = {
  doctor: "human_healthcare",
  hospital: "human_healthcare",
  clinic: "human_healthcare",
  pharmacy: "human_healthcare",
  lab: "human_healthcare",
  imaging_center: "human_healthcare",
  dental_clinic: "human_healthcare",
  dentist: "human_healthcare",
  dermatologist: "human_healthcare",
  gynecologist: "human_healthcare",
  fertility_clinic: "human_healthcare",
  ivf_center: "human_healthcare",
  reproductive_medicine_doctor: "human_healthcare",
  embryology_lab: "human_healthcare",
  andrology_lab: "human_healthcare",
  hair_transplant_clinic: "medical_beauty",
  hair_transplant_doctor: "medical_beauty",
  plastic_surgeon: "medical_beauty",
  aesthetic_doctor: "medical_beauty",
  medical_beauty_clinic: "medical_beauty",
  salon: "non_medical_beauty",
  spa: "non_medical_beauty",
  gym: "fitness",
  fitness_center: "fitness",
  personal_trainer: "fitness",
  yoga_studio: "fitness",
  pilates_studio: "fitness",
  sports_medicine_doctor: "human_healthcare",
  physiotherapy: "human_healthcare",
  wellness_center: "wellness",
  vet_doctor: "pet_healthcare",
  pet_clinic: "pet_healthcare",
  pet_pharmacy: "pet_healthcare",
  pet_shop: "pet_healthcare",
  pet_grooming: "pet_healthcare",
  pet_boarding: "pet_healthcare",
} as const satisfies Record<ImportEntityType, ImportEntityDomain>;

export const IMPORT_DOCTOR_SPECIALTIES = [
  "cardiology",
  "dermatology",
  "gynecology",
  "fertility_ivf",
  "reproductive_medicine",
  "embryology",
  "andrology",
  "dentistry",
  "pediatrics",
  "orthopedics",
  "ent",
  "ophthalmology",
  "psychiatry",
  "psychology",
  "nutrition",
  "physiotherapy",
  "sports_medicine",
  "plastic_surgery",
  "hair_transplant",
  "aesthetic_medicine",
] as const satisfies readonly ImportDoctorSpecialty[];

const supportedDomains = new Set<ImportEntityDomain>([
  "human_healthcare",
  "pet_healthcare",
  "medical_beauty",
  "non_medical_beauty",
  "wellness",
  "fitness",
]);

const supportedEntityTypes = new Set<ImportEntityType>(Object.keys(IMPORT_ENTITY_DOMAIN_BY_TYPE) as ImportEntityType[]);
const supportedDoctorSpecialties = new Set<ImportDoctorSpecialty>(IMPORT_DOCTOR_SPECIALTIES);

export function isImportEntityDomain(value: string | null | undefined): value is ImportEntityDomain {
  return supportedDomains.has(value as ImportEntityDomain);
}

export function isImportEntityType(value: string | null | undefined): value is ImportEntityType {
  return supportedEntityTypes.has(value as ImportEntityType);
}

export function isImportDoctorSpecialty(value: string | null | undefined): value is ImportDoctorSpecialty {
  return supportedDoctorSpecialties.has(value as ImportDoctorSpecialty);
}

export function resolveImportEntityDomain(entityType: string | null | undefined): ImportEntityDomainResolution | null {
  if (!isImportEntityType(entityType)) return null;

  return {
    entityType,
    domain: IMPORT_ENTITY_DOMAIN_BY_TYPE[entityType],
  };
}

export function getDomainSeparationViolations(
  sourceDomain: string | null | undefined,
  targetDomain: string | null | undefined,
): readonly ImportDomainSeparationViolation[] {
  const violations: ImportDomainSeparationViolation[] = [];

  if (!isImportEntityDomain(sourceDomain)) violations.push("unsupported_source_domain");
  if (!isImportEntityDomain(targetDomain)) violations.push("unsupported_target_domain");
  if (violations.length > 0) return violations;

  if (sourceDomain === "human_healthcare" && targetDomain === "pet_healthcare") {
    violations.push("human_to_pet_domain");
  }

  if (sourceDomain === "pet_healthcare" && targetDomain === "human_healthcare") {
    violations.push("pet_to_human_domain");
  }

  if (sourceDomain === "medical_beauty" && targetDomain === "non_medical_beauty") {
    violations.push("medical_beauty_to_non_medical_beauty");
  }

  if (sourceDomain === "non_medical_beauty" && targetDomain === "medical_beauty") {
    violations.push("non_medical_beauty_to_medical_beauty");
  }

  if (sourceDomain === "fitness" && targetDomain === "human_healthcare") {
    violations.push("fitness_to_healthcare_requires_explicit_rule");
  }

  return violations;
}

export function isCrossDomainBlockedByDefault(
  sourceDomain: string | null | undefined,
  targetDomain: string | null | undefined,
): boolean {
  return getDomainSeparationViolations(sourceDomain, targetDomain).length > 0;
}
