import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const generatorPath = 'src/server/admin/import-schema-generator.ts';
const validationPath = 'src/server/admin/import-schema-validation.ts';
const domainPath = 'src/server/admin/import-entity-domain.ts';
const architecturePath = 'docs/platform/DRMUSCAT_IMPORT_READINESS_CONTROLLED_PUBLISHING_ARCHITECTURE_V1.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

function assertNotIncludes(source, token, message) {
  assert(!source.includes(token), message);
}

const generatorSource = await readText(generatorPath);
const validationSource = await readText(validationPath);
const domainSource = await readText(domainPath);
const architectureSource = await readText(architecturePath);

for (const token of [
  'export type ImportSchemaType',
  '"Hospital"',
  '"MedicalOrganization"',
  '"Physician"',
  '"Person"',
  '"Pharmacy"',
  '"MedicalLaboratory"',
  '"MedicalBusiness"',
  '"Dentist"',
  '"VeterinaryCare"',
  '"PetStore"',
  '"SportsActivityLocation"',
  '"HealthAndBeautyBusiness"',
  '"BreadcrumbList"',
  '"FAQPage"',
  'export type ImportSchemaEntityInput',
  'export type ImportGeneratedSchema',
  'IMPORT_SCHEMA_TYPES_BY_ENTITY_TYPE',
  'hospital: ["Hospital", "MedicalOrganization", "LocalBusiness"]',
  'doctor: ["Physician", "Person", "MedicalBusiness"]',
  'pharmacy: ["Pharmacy", "LocalBusiness"]',
  'lab: ["MedicalLaboratory", "MedicalBusiness"]',
  'ivf_center: ["MedicalBusiness", "LocalBusiness"]',
  'hair_transplant_clinic: ["HealthAndBeautyBusiness", "MedicalBusiness"]',
  'pet_clinic: ["VeterinaryCare", "LocalBusiness"]',
  'pet_shop: ["PetStore", "LocalBusiness"]',
  'gym: ["SportsActivityLocation", "LocalBusiness"]',
  'export function getImportSchemaTypesForEntityType',
  'export function generateEntitySchema',
  'buildBreadcrumb',
  'buildFaq',
]) {
  assertIncludes(generatorSource, token, `${generatorPath} must include ${token}`);
}

for (const token of [
  'export type ImportSchemaValidationBlocker',
  'schema_missing',
  'schema_context_invalid',
  'schema_type_missing',
  'schema_type_invalid',
  'schema_domain_mismatch',
  'schema_name_missing',
  'schema_url_missing',
  'schema_address_missing',
  'schema_geo_missing',
  'schema_telephone_missing',
  'schema_breadcrumb_missing',
  'export type ImportSchemaValidationInput',
  'humanMedicalTypes',
  'petTypes',
  'fitnessTypes',
  'beautyTypes',
  'hasSchemaDomainMismatch',
  'export function getSchemaBlockers',
  'export function validateGeneratedSchema',
  'export function isSchemaReady',
]) {
  assertIncludes(validationSource, token, `${validationPath} must include ${token}`);
}

for (const forbiddenToken of [
  'pet_clinic: ["Hospital"',
  'pet_clinic: ["Physician"',
  'hospital: ["VeterinaryCare"',
  'return true;',
]) {
  assertNotIncludes(generatorSource + validationSource, forbiddenToken, `Schema files must not include unsafe shortcut ${forbiddenToken}.`);
}

for (const token of [
  'ivf_center',
  'fertility_clinic',
  'hair_transplant_clinic',
  'sports_medicine_doctor',
  'fitness_center',
  'ImportEntityDomain',
  'ImportEntityType',
]) {
  assertIncludes(domainSource, token, `${domainPath} must include taxonomy token ${token}`);
}

for (const token of [
  'PR 9: Schema Generator + Schema Validation',
  'Pet pages must not receive human medical schema.',
  'Human healthcare pages must not receive pet schema.',
  'Schema validation failure blocks publish and sitemap eligibility.',
  'Generated schema should be precomputed or stored in a lightweight projection for public rendering.',
  'Hospital',
  'MedicalOrganization',
  'Physician',
  'Person',
  'Pharmacy',
  'VeterinaryCare',
]) {
  assertIncludes(architectureSource, token, `${architecturePath} must include schema contract token ${token}`);
}

console.log('import schema generator check passed.');
