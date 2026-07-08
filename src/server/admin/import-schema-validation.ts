import "server-only";

import { type ImportEntityDomain } from "./import-entity-domain";
import { type ImportGeneratedSchema, type ImportSchemaType } from "./import-schema-generator";

export type ImportSchemaValidationBlocker =
  | "schema_missing"
  | "schema_context_invalid"
  | "schema_type_missing"
  | "schema_type_invalid"
  | "schema_domain_mismatch"
  | "schema_name_missing"
  | "schema_url_missing"
  | "schema_address_missing"
  | "schema_geo_missing"
  | "schema_telephone_missing"
  | "schema_breadcrumb_missing";

export type ImportSchemaValidationInput = {
  entity_domain: ImportEntityDomain;
  schema: ImportGeneratedSchema | null;
  require_telephone: boolean;
  require_breadcrumb: boolean;
};

const humanMedicalTypes = new Set<ImportSchemaType>([
  "Hospital",
  "MedicalOrganization",
  "Physician",
  "Person",
  "Pharmacy",
  "MedicalLaboratory",
  "MedicalBusiness",
  "Dentist",
]);

const petTypes = new Set<ImportSchemaType>(["VeterinaryCare", "PetStore"]);
const fitnessTypes = new Set<ImportSchemaType>(["SportsActivityLocation"]);
const beautyTypes = new Set<ImportSchemaType>(["HealthAndBeautyBusiness"]);

function hasAnySchemaType(schemaTypes: readonly ImportSchemaType[], allowedTypes: ReadonlySet<ImportSchemaType>): boolean {
  return schemaTypes.some((schemaType) => allowedTypes.has(schemaType));
}

function hasSchemaDomainMismatch(entityDomain: ImportEntityDomain, schemaTypes: readonly ImportSchemaType[]): boolean {
  if (entityDomain === "pet_healthcare") return hasAnySchemaType(schemaTypes, humanMedicalTypes) && !hasAnySchemaType(schemaTypes, petTypes);
  if (entityDomain === "human_healthcare") return hasAnySchemaType(schemaTypes, petTypes);
  if (entityDomain === "fitness") return hasAnySchemaType(schemaTypes, petTypes) || hasAnySchemaType(schemaTypes, humanMedicalTypes);
  if (entityDomain === "medical_beauty") return hasAnySchemaType(schemaTypes, petTypes);
  if (entityDomain === "non_medical_beauty") return hasAnySchemaType(schemaTypes, petTypes) || hasAnySchemaType(schemaTypes, humanMedicalTypes);
  return entityDomain === "wellness" && hasAnySchemaType(schemaTypes, petTypes);
}

function hasAddress(schema: ImportGeneratedSchema): boolean {
  return Boolean(schema.address.addressLocality && schema.address.addressRegion && schema.address.addressCountry);
}

function hasGeo(schema: ImportGeneratedSchema): boolean {
  return typeof schema.geo.latitude === "number" && typeof schema.geo.longitude === "number";
}

export function getSchemaBlockers(input: ImportSchemaValidationInput): readonly ImportSchemaValidationBlocker[] {
  const blockers: ImportSchemaValidationBlocker[] = [];
  const schema = input.schema;

  if (schema === null) return ["schema_missing"];
  if (schema["@context"] !== "https://schema.org") blockers.push("schema_context_invalid");
  if (schema["@type"].length === 0) blockers.push("schema_type_missing");
  if (schema["@type"].some((schemaType) => typeof schemaType !== "string")) blockers.push("schema_type_invalid");
  if (hasSchemaDomainMismatch(input.entity_domain, schema["@type"])) blockers.push("schema_domain_mismatch");
  if (!schema.name || schema.name.trim().length === 0) blockers.push("schema_name_missing");
  if (!schema.url || schema.url.trim().length === 0) blockers.push("schema_url_missing");
  if (!hasAddress(schema)) blockers.push("schema_address_missing");
  if (!hasGeo(schema)) blockers.push("schema_geo_missing");
  if (input.require_telephone && (!schema.telephone || schema.telephone.trim().length === 0)) blockers.push("schema_telephone_missing");
  if (input.require_breadcrumb && !schema.breadcrumb) blockers.push("schema_breadcrumb_missing");

  return [...new Set(blockers)];
}

export function validateGeneratedSchema(input: ImportSchemaValidationInput): boolean {
  return getSchemaBlockers(input).length === 0;
}

export function isSchemaReady(input: ImportSchemaValidationInput): boolean {
  return validateGeneratedSchema(input);
}
