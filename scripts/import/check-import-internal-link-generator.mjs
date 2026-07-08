import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const generatorPath = 'src/server/admin/import-internal-link-generator.ts';
const rulePath = 'src/server/admin/import-link-rule-matrix.ts';
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
const ruleSource = await readText(rulePath);
const architectureSource = await readText(architecturePath);

for (const token of [
  'export type ImportInternalLinkCandidate',
  'export type ImportInternalLinkSource',
  'export type ImportGeneratedInternalLink',
  'export type ImportInternalLinkGenerationInput',
  'entity_id: string',
  'entity_type: ImportEntityType',
  'entity_domain: ImportEntityDomain',
  'quality_score: number',
  'distance_km: number | null',
  'same_city: boolean',
  'same_area: boolean',
  'same_specialty: boolean',
  'anchor_text_en: string',
  'anchor_text_ar: string',
  'source_entity_id: string',
  'target_entity_id: string',
  'link_group: string',
  'score: number',
  'priority: number',
  'generated_reason: string',
  'rule_version: string',
  'generator_version: string',
  'IMPORT_INTERNAL_LINK_GENERATOR_VERSION',
  'IMPORT_INTERNAL_LINK_RULE_VERSION',
  'candidatePassesRule',
  'scoreCandidate',
  'ruleKey',
  'export function generateImportInternalLinks',
  'getImportLinkRuleDecision',
  'decision.decision !== "allowed"',
  'decision.rule === null',
  'rule.min_quality_score',
  'rule.same_city_required',
  'rule.same_specialty_required',
  'rule.max_distance_km',
  'rule.max_links',
  'allowed_rule_geo_quality_specialty_filter',
  'generatedLinksByRule',
  'maxLinksByRule',
]) {
  assertIncludes(generatorSource, token, `${generatorPath} must include ${token}`);
}

for (const forbiddenToken of [
  'return true;',
  'Number.POSITIVE_INFINITY',
  'generateImportInternalLinksForRuleLimit',
  'decision.decision === "blocked" && false',
]) {
  assertNotIncludes(generatorSource, forbiddenToken, `${generatorPath} must not include unsafe shortcut ${forbiddenToken}.`);
}

for (const token of [
  'ImportEntityLinkRule',
  'IMPORT_ENTITY_LINK_RULES',
  'getImportLinkRuleDecision',
  'isImportEntityLinkAllowed',
  'blocked_by_explicit_rule',
  'blocked_by_domain_separation',
  'missing_allow_rule',
]) {
  assertIncludes(ruleSource, token, `${rulePath} must still include ${token}`);
}

for (const token of [
  'PR 7: Internal Link Generator + Versioned Cache',
  'Generator must only use allowed link rules.',
  'Generator must respect domain separation.',
  'Generator must respect geo constraints and quality thresholds.',
  'Cache rows must include rule and generator versions so old links can be invalidated safely.',
  'rule_version',
  'generator_version',
  'generated_reason',
]) {
  assertIncludes(architectureSource, token, `${architecturePath} must include PR 7 contract token ${token}`);
}

console.log('import internal link generator check passed.');
