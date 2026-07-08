import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
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

const domainSource = await readText(domainPath);
const architectureSource = await readText(architecturePath);

for (const token of [
  'export type ImportEntityDomain',
  '| "human_healthcare"',
  '| "pet_healthcare"',
  '| "medical_beauty"',
  '| "non_medical_beauty"',
  '| "wellness"',
  '| "fitness"',
  'export type ImportEntityType',
  '| "doctor"',
  '| "hospital"',
  '| "pharmacy"',
  '| "lab"',
  '| "imaging_center"',
  '| "dental_clinic"',
  '| "dermatologist"',
  '| "gynecologist"',
  '| "fertility_clinic"',
  '| "ivf_center"',
  '| "reproductive_medicine_doctor"',
  '| "embryology_lab"',
  '| "andrology_lab"',
  '| "hair_transplant_clinic"',
  '| "hair_transplant_doctor"',
  '| "plastic_surgeon"',
  '| "aesthetic_doctor"',
  '| "medical_beauty_clinic"',
  '| "salon"',
  '| "gym"',
  '| "fitness_center"',
  '| "personal_trainer"',
  '| "yoga_studio"',
  '| "pilates_studio"',
  '| "sports_medicine_doctor"',
  '| "vet_doctor"',
  '| "pet_clinic"',
  '| "pet_pharmacy"',
  '| "pet_shop"',
  '| "pet_grooming"',
  '| "pet_boarding"',
  'export type ImportDoctorSpecialty',
  '| "fertility_ivf"',
  '| "reproductive_medicine"',
  '| "embryology"',
  '| "andrology"',
  '| "sports_medicine"',
  '| "plastic_surgery"',
  '| "hair_transplant"',
  '| "aesthetic_medicine"',
  'IMPORT_ENTITY_DOMAIN_BY_TYPE',
  'doctor: "human_healthcare"',
  'hospital: "human_healthcare"',
  'pharmacy: "human_healthcare"',
  'fertility_clinic: "human_healthcare"',
  'ivf_center: "human_healthcare"',
  'reproductive_medicine_doctor: "human_healthcare"',
  'embryology_lab: "human_healthcare"',
  'andrology_lab: "human_healthcare"',
  'hair_transplant_clinic: "medical_beauty"',
  'hair_transplant_doctor: "medical_beauty"',
  'plastic_surgeon: "medical_beauty"',
  'aesthetic_doctor: "medical_beauty"',
  'medical_beauty_clinic: "medical_beauty"',
  'salon: "non_medical_beauty"',
  'gym: "fitness"',
  'fitness_center: "fitness"',
  'personal_trainer: "fitness"',
  'yoga_studio: "fitness"',
  'pilates_studio: "fitness"',
  'sports_medicine_doctor: "human_healthcare"',
  'pet_clinic: "pet_healthcare"',
  'pet_shop: "pet_healthcare"',
  'IMPORT_DOCTOR_SPECIALTIES',
  'export function isImportEntityDomain',
  'export function isImportEntityType',
  'export function isImportDoctorSpecialty',
  'export function resolveImportEntityDomain',
  'export function getDomainSeparationViolations',
  'export function isCrossDomainBlockedByDefault',
  'human_to_pet_domain',
  'pet_to_human_domain',
  'medical_beauty_to_non_medical_beauty',
  'non_medical_beauty_to_medical_beauty',
  'fitness_to_healthcare_requires_explicit_rule',
]) {
  assertIncludes(domainSource, token, `${domainPath} must include ${token}`);
}

for (const forbiddenToken of [
  'doctor: "pet_healthcare"',
  'hospital: "pet_healthcare"',
  'pet_clinic: "human_healthcare"',
  'pet_shop: "human_healthcare"',
  'salon: "medical_beauty"',
  'hair_transplant_clinic: "non_medical_beauty"',
  'ivf_center: "medical_beauty"',
  'fitness_center: "human_healthcare"',
]) {
  assertNotIncludes(domainSource, forbiddenToken, `${domainPath} must not include unsafe domain mapping ${forbiddenToken}.`);
}

for (const token of [
  'PR 3: Domain + Entity Type Contract',
  'human_healthcare',
  'pet_healthcare',
  'medical_beauty',
  'non_medical_beauty',
  'wellness',
  'fitness',
  '`human_healthcare` must not link to `pet_healthcare` by default.',
  '`pet_healthcare` must not link to `human_healthcare` by default.',
  '`medical_beauty` and `non_medical_beauty` must be distinct.',
]) {
  assertIncludes(architectureSource, token, `${architecturePath} must include PR 3 contract token ${token}`);
}

console.log('import domain entity contract check passed.');
