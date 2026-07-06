import './check-import-upload-workspace.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'docs/import/drkhaleej-template-import-contract-v1.json';
const docsPath = 'docs/import/DRKHALEEJ_TEMPLATE_IMPORT_CONTRACT_V1.md';
const normalizerPath = 'src/server/admin/import-row-normalizer.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message);
}

function flattenMappings(contract) {
  return contract.templates.flatMap((template) =>
    template.mappings.map((mapping) => ({ template, mapping })),
  );
}

const contractSource = await readText(contractPath);
const docsSource = await readText(docsPath);
const normalizerSource = await readText(normalizerPath);
const packageSource = await readText('package.json');
const contract = JSON.parse(contractSource);

assert(contract.schemaVersion === 'template-import-contract-v1', 'Template import contract schema version must be template-import-contract-v1.');
assert(contract.nextPr === 'SEO-IMPORT-B import-header-alias-coverage-v1', 'Template import contract must point to the alias coverage follow-up PR.');
assert(Array.isArray(contract.templates) && contract.templates.length === 3, 'Template import contract must define exactly three uploaded template contracts.');
assert(Array.isArray(contract.statusValues) && contract.statusValues.length >= 4, 'Template import contract must declare allowed status values.');

const templateIds = contract.templates.map((template) => template.id).sort();
assert(JSON.stringify(templateIds) === JSON.stringify(['complete_profile', 'hospital', 'pharmacy']), 'Template import contract must cover complete_profile, hospital, and pharmacy templates.');

const allowedStatuses = new Set(contract.statusValues);
const mappings = flattenMappings(contract);
assert(mappings.length >= 20, 'Template import contract must map launch-critical fields, not just name the files.');

for (const template of contract.templates) {
  assert(typeof template.fileName === 'string' && template.fileName.endsWith('.xlsx'), `${template.id} must declare an .xlsx source file.`);
  assertIncludes(docsSource, template.fileName, `Docs must mention source template ${template.fileName}.`);
  assert(Number.isInteger(template.headerRow) && template.headerRow >= 1, `${template.id} must declare a valid header row.`);
  assert(Array.isArray(template.launchCriticalSheets) && template.launchCriticalSheets.length >= 8, `${template.id} must list launch-critical sheets.`);
  assert(Array.isArray(template.supportOnlySheets) && template.supportOnlySheets.length >= 3, `${template.id} must list support-only sheets.`);
  assert(Array.isArray(template.mappings) && template.mappings.length >= 6, `${template.id} must define field mappings.`);

  for (const sheet of template.launchCriticalSheets) {
    assertIncludes(docsSource, `\`${sheet}\``, `Docs must mention launch-critical sheet ${sheet}.`);
  }
}

for (const { template, mapping } of mappings) {
  assert(typeof mapping.target === 'string' && mapping.target.includes('.'), `${template.id} mapping must have a dotted target.`);
  assert(Array.isArray(mapping.sheets) && mapping.sheets.length >= 1, `${template.id}:${mapping.target} must list source sheets.`);
  assert(Array.isArray(mapping.headers) && mapping.headers.length >= 1, `${template.id}:${mapping.target} must list source headers.`);
  assert(allowedStatuses.has(mapping.status), `${template.id}:${mapping.target} uses an unknown status ${mapping.status}.`);

  if (mapping.status === 'needs_alias') {
    assert(mapping.nextPr === contract.nextPr, `${template.id}:${mapping.target} needs_alias mapping must point to ${contract.nextPr}.`);
  }
}

for (const alias of contract.coveredNormalizerAliases) {
  assertIncludes(normalizerSource, `"${alias}"`, `Current normalizer must still include covered alias ${alias}.`);
}

for (const aliasGap of contract.requiredAliasGaps) {
  assertIncludes(contractSource, `"${aliasGap}"`, `Contract must document alias gap ${aliasGap}.`);
  assertIncludes(docsSource, `\`${aliasGap}\``, `Docs must mention alias gap ${aliasGap}.`);
}

for (const requiredGate of [
  'row_type=example',
  'row_type=ignore',
  'source and last checked date',
  'contact or map/direction signal',
  'Pharmacy and hospital profile routes stay blocked',
  '/admin/imports/upload',
  'imports.upload',
  'staging only',
]) {
  assertIncludes(docsSource, requiredGate, `Docs must include launch rule: ${requiredGate}`);
}

for (const packageToken of [
  'import:templates:validate',
  'scripts/import/check-template-import-contract.mjs',
  'pnpm import:templates:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('template import contract check passed.');
