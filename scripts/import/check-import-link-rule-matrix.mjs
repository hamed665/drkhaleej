import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const rulePath = 'src/server/admin/import-link-rule-matrix.ts';
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

const ruleSource = await readText(rulePath);
const domainSource = await readText(domainPath);
const architectureSource = await readText(architecturePath);

for (const token of [
  'export type ImportLinkRuleDecision = "allowed" | "blocked";',
  'export type ImportEntityLinkRule',
  'source_type: ImportEntityType',
  'target_type: ImportEntityType',
  'source_domain: ImportEntityDomain',
  'target_domain: ImportEntityDomain',
  'allowed: boolean',
  'priority: number',
  'max_links: number',
  'max_distance_km: number | null',
  'same_city_required: boolean',
  'same_area_boost: boolean',
  'same_specialty_required: boolean',
  'min_quality_score: number',
  'export type ImportLinkRuleBlocker',
  'blocked_by_explicit_rule',
  'blocked_by_domain_separation',
  'missing_allow_rule',
  'export const IMPORT_ENTITY_LINK_RULES',
  'source_type: "hospital"',
  'target_type: "doctor"',
  'target_type: "pharmacy"',
  'target_type: "lab"',
  'target_type: "imaging_center"',
  'target_type: "pet_shop"',
  'source_type: "ivf_center"',
  'target_type: "gynecologist"',
  'source_type: "fertility_clinic"',
  'target_type: "reproductive_medicine_doctor"',
  'target_type: "embryology_lab"',
  'target_type: "andrology_lab"',
  'source_type: "hair_transplant_clinic"',
  'target_type: "hair_transplant_doctor"',
  'target_type: "dermatologist"',
  'target_type: "salon"',
  'source_type: "gym"',
  'source_type: "fitness_center"',
  'source_type: "personal_trainer"',
  'target_type: "sports_medicine_doctor"',
  'target_type: "physiotherapy"',
  'source_type: "pet_clinic"',
  'target_type: "pet_pharmacy"',
  'target_type: "human_pharmacy" as ImportEntityType',
  'source_type: "medical_beauty_clinic"',
  'source_type: "dental_clinic"',
  'target_type: "dentist"',
  'allowed: false',
  'priority: 1000',
  'max_links: 0',
  'getDomainSeparationViolations',
  'domainViolations.length > 0 && rule?.allowed !== true',
  'export function findImportEntityLinkRule',
  'export function getImportLinkRuleDecision',
  'export function isImportEntityLinkAllowed',
]) {
  assertIncludes(ruleSource, token, `${rulePath} must include ${token}`);
}

for (const forbiddenToken of [
  'hospital -> pet_shop = allowed',
  'pet_clinic -> human_pharmacy = allowed',
  'hair_transplant_clinic -> salon = allowed',
  'return { decision: "allowed", rule: null',
]) {
  assertNotIncludes(ruleSource, forbiddenToken, `${rulePath} must not include unsafe shortcut ${forbiddenToken}.`);
}

for (const token of [
  'human_healthcare',
  'pet_healthcare',
  'medical_beauty',
  'non_medical_beauty',
  'fitness',
  'getDomainSeparationViolations',
  'isCrossDomainBlockedByDefault',
]) {
  assertIncludes(domainSource, token, `${domainPath} must still include ${token}`);
}

for (const token of [
  'PR 6: Link Rule Matrix',
  'entity_link_rules',
  'source_type',
  'target_type',
  'source_domain',
  'target_domain',
  'allowed',
  'priority',
  'max_links',
  'max_distance_km',
  'same_city_required',
  'same_area_boost',
  'same_specialty_required',
  'min_quality_score',
  'hospital -> doctor = allowed',
  'hospital -> pharmacy = allowed',
  'hospital -> lab = allowed',
  'hospital -> imaging_center = allowed',
  'hospital -> pet_shop = blocked',
  'pet_clinic -> pet_shop = allowed',
  'pet_clinic -> pet_pharmacy = allowed',
  'pet_clinic -> human_pharmacy = blocked',
  'medical_beauty_clinic -> dermatologist = allowed',
  'dental_clinic -> dentist = allowed',
]) {
  assertIncludes(architectureSource, token, `${architecturePath} must include PR 6 contract token ${token}`);
}

console.log('import link rule matrix check passed.');
