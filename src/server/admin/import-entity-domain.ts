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
  | "medical_beauty_clinic"
  | "salon"
  | "spa"
  | "gym"
  | "physiotherapy"
  | "wellness_center"
  | "vet_doctor"
  | "pet_clinic"
  | "pet_pharmacy"
  | "pet_shop"
  | "pet_grooming"
  | "pet_boarding";

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
  medical_beauty_clinic: "medical_beauty",
  salon: "non_medical_beauty",
  spa: "non_medical_beauty",
  gym: "fitness",
  physiotherapy: "human_healthcare",
  wellness_center: "wellness",
  vet_doctor: "pet_healthcare",
  pet_clinic: "pet_healthcare",
  pet_pharmacy: "pet_healthcare",
  pet_shop: "pet_healthcare",
  pet_grooming: "pet_healthcare",
  pet_boarding: "pet_healthcare",
} as const satisfies Record<ImportEntityType, ImportEntityDomain>;

const supportedDomains = new Set<ImportEntityDomain>([
  "human_healthcare",
  "pet_healthcare",
  "medical_beauty",
  "non_medical_beauty",
  "wellness",
  "fitness",
]);

const supportedEntityTypes = new Set<ImportEntityType>(Object.keys(IMPORT_ENTITY_DOMAIN_BY_TYPE) as ImportEntityType[]);

export function isImportEntityDomain(value: string | null | undefined): value is ImportEntityDomain {
  return supportedDomains.has(value as ImportEntityDomain);
}

export function isImportEntityType(value: string | null | undefined): value is ImportEntityType {
  return supportedEntityTypes.has(value as ImportEntityType);
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
