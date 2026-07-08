import "server-only";

import { type ImportEntityDomain, type ImportEntityType } from "./import-entity-domain";

export type ImportSchemaType =
  | "Hospital"
  | "MedicalOrganization"
  | "Physician"
  | "Person"
  | "Pharmacy"
  | "MedicalLaboratory"
  | "MedicalBusiness"
  | "Dentist"
  | "VeterinaryCare"
  | "PetStore"
  | "LocalBusiness"
  | "SportsActivityLocation"
  | "HealthAndBeautyBusiness"
  | "BreadcrumbList"
  | "FAQPage";

export type ImportSchemaAddress = {
  streetAddress: string | null;
  addressLocality: string | null;
  addressRegion: string | null;
  addressCountry: "OM";
};

export type ImportSchemaGeo = {
  latitude: number | null;
  longitude: number | null;
};

export type ImportSchemaEntityInput = {
  entity_id: string;
  entity_type: ImportEntityType;
  entity_domain: ImportEntityDomain;
  name: string | null;
  url: string | null;
  telephone: string | null;
  address: ImportSchemaAddress;
  geo: ImportSchemaGeo;
  opening_hours: readonly string[];
  same_as: readonly string[];
  breadcrumb_items: readonly { name: string; item: string }[];
  faq_items?: readonly { question: string; answer: string }[];
};

export type ImportGeneratedSchema = {
  "@context": "https://schema.org";
  "@type": readonly ImportSchemaType[];
  "@id": string;
  name: string | null;
  url: string | null;
  telephone: string | null;
  address: ImportSchemaAddress;
  geo: ImportSchemaGeo;
  openingHours?: readonly string[];
  sameAs?: readonly string[];
  breadcrumb?: {
    "@type": "BreadcrumbList";
    itemListElement: readonly { "@type": "ListItem"; position: number; name: string; item: string }[];
  };
  faq?: {
    "@type": "FAQPage";
    mainEntity: readonly { "@type": "Question"; name: string; acceptedAnswer: { "@type": "Answer"; text: string } }[];
  };
};

export const IMPORT_SCHEMA_TYPES_BY_ENTITY_TYPE = {
  hospital: ["Hospital", "MedicalOrganization", "LocalBusiness"],
  doctor: ["Physician", "Person", "MedicalBusiness"],
  clinic: ["MedicalBusiness", "LocalBusiness"],
  pharmacy: ["Pharmacy", "LocalBusiness"],
  lab: ["MedicalLaboratory", "MedicalBusiness"],
  imaging_center: ["MedicalBusiness", "LocalBusiness"],
  dental_clinic: ["Dentist", "MedicalBusiness"],
  dentist: ["Dentist", "Person"],
  dermatologist: ["Physician", "Person", "MedicalBusiness"],
  gynecologist: ["Physician", "Person", "MedicalBusiness"],
  fertility_clinic: ["MedicalBusiness", "LocalBusiness"],
  ivf_center: ["MedicalBusiness", "LocalBusiness"],
  reproductive_medicine_doctor: ["Physician", "Person", "MedicalBusiness"],
  embryology_lab: ["MedicalLaboratory", "MedicalBusiness"],
  andrology_lab: ["MedicalLaboratory", "MedicalBusiness"],
  hair_transplant_clinic: ["HealthAndBeautyBusiness", "MedicalBusiness"],
  hair_transplant_doctor: ["Physician", "Person", "MedicalBusiness"],
  plastic_surgeon: ["Physician", "Person", "MedicalBusiness"],
  aesthetic_doctor: ["Physician", "Person", "MedicalBusiness"],
  medical_beauty_clinic: ["HealthAndBeautyBusiness", "MedicalBusiness"],
  salon: ["HealthAndBeautyBusiness", "LocalBusiness"],
  spa: ["HealthAndBeautyBusiness", "LocalBusiness"],
  gym: ["SportsActivityLocation", "LocalBusiness"],
  fitness_center: ["SportsActivityLocation", "LocalBusiness"],
  personal_trainer: ["SportsActivityLocation", "LocalBusiness"],
  yoga_studio: ["SportsActivityLocation", "LocalBusiness"],
  pilates_studio: ["SportsActivityLocation", "LocalBusiness"],
  sports_medicine_doctor: ["Physician", "Person", "MedicalBusiness"],
  physiotherapy: ["MedicalBusiness", "LocalBusiness"],
  wellness_center: ["HealthAndBeautyBusiness", "LocalBusiness"],
  vet_doctor: ["VeterinaryCare", "Person"],
  pet_clinic: ["VeterinaryCare", "LocalBusiness"],
  pet_pharmacy: ["VeterinaryCare", "LocalBusiness"],
  pet_shop: ["PetStore", "LocalBusiness"],
  pet_grooming: ["PetStore", "LocalBusiness"],
  pet_boarding: ["PetStore", "LocalBusiness"],
} as const satisfies Record<ImportEntityType, readonly ImportSchemaType[]>;

export function getImportSchemaTypesForEntityType(entityType: ImportEntityType): readonly ImportSchemaType[] {
  return IMPORT_SCHEMA_TYPES_BY_ENTITY_TYPE[entityType];
}

function buildBreadcrumb(items: ImportSchemaEntityInput["breadcrumb_items"]): NonNullable<ImportGeneratedSchema["breadcrumb"]> | null {
  if (items.length === 0) return null;

  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function buildFaq(items: NonNullable<ImportSchemaEntityInput["faq_items"]>): NonNullable<ImportGeneratedSchema["faq"]> | null {
  if (items.length === 0) return null;

  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function generateEntitySchema(entity: ImportSchemaEntityInput): ImportGeneratedSchema {
  const schema: ImportGeneratedSchema = {
    "@context": "https://schema.org",
    "@type": getImportSchemaTypesForEntityType(entity.entity_type),
    "@id": `${entity.url ?? entity.entity_id}#schema`,
    name: entity.name,
    url: entity.url,
    telephone: entity.telephone,
    address: entity.address,
    geo: entity.geo,
  };

  if (entity.opening_hours.length > 0) {
    schema.openingHours = entity.opening_hours;
  }

  if (entity.same_as.length > 0) {
    schema.sameAs = entity.same_as;
  }

  const breadcrumb = buildBreadcrumb(entity.breadcrumb_items);
  if (breadcrumb !== null) {
    schema.breadcrumb = breadcrumb;
  }

  const faq = buildFaq(entity.faq_items ?? []);
  if (faq !== null) {
    schema.faq = faq;
  }

  return schema;
}
