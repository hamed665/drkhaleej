import fs from 'node:fs';

const auditPath = 'src/config/roadmap/drmuscat-full-implementation-audit.ts';
const packagePath = 'package.json';
const docsPath = 'docs/DRMUSCAT_FULL_IMPLEMENTATION_AUDIT_MATRIX_V1.md';

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const auditSource = readFile(auditPath);
const packageSource = readFile(packagePath);
const docsSource = readFile(docsPath);

assert(auditSource.includes('DRMUSCAT_FULL_IMPLEMENTATION_AUDIT_VERSION'), 'Missing audit version export.');
assert(auditSource.includes('DRMUSCAT_ORIGINAL_ROADMAP_AUDIT'), 'Missing original roadmap audit export.');
assert(auditSource.includes('DRMUSCAT_RECOMMENDED_NEXT_PROMPTS'), 'Missing recommended next prompts export.');
assert(auditSource.includes('DRMUSCAT_FULL_IMPLEMENTATION_AUDIT_SUMMARY'), 'Missing audit summary export.');
assert(auditSource.includes("recommendedCompletionMode: 'multi-country-seo-llm-complete'"), 'Audit must target full multi-country SEO/LLM completion.');
assert(auditSource.includes("nextPrompt: 33"), 'Audit must identify prompt 33 as current prompt.');
assert(auditSource.includes("prompt: 34, title: 'Country Adapter Foundation'"), 'Missing country adapter foundation next step.');
assert(auditSource.includes("prompt: 38, title: 'Doctor Specialty Subspecialty Contract'"), 'Missing doctor specialty model next step.');
assert(auditSource.includes("prompt: 48, title: 'Public-safe Publish Workflow'"), 'Missing public-safe publish next step.');
assert(auditSource.includes("prompt: 54, title: 'Internal Linking Engine'"), 'Missing internal linking engine next step.');
assert(auditSource.includes("prompt: 59, title: 'Schema Mapping'"), 'Missing schema mapping next step.');
assert(auditSource.includes("prompt: 60, title: 'Robots and llms.txt'"), 'Missing robots and llms.txt next step.');
assert(auditSource.includes("prompt: 64, title: 'Launch Readiness Final Gate'"), 'Missing launch readiness final gate.');

for (let prompt = 1; prompt <= 30; prompt += 1) {
  assert(auditSource.includes(`prompt: ${prompt},`), `Missing original roadmap prompt ${prompt}.`);
}

for (let prompt = 33; prompt <= 64; prompt += 1) {
  assert(auditSource.includes(`prompt: ${prompt},`), `Missing recommended next prompt ${prompt}.`);
}

const requiredWeaknesses = [
  'core-data-models',
  'import-pipeline',
  'public-profiles',
  'internal-linking-engine',
  'schema-mapping',
  'llm-surfaces',
  'multi-country-adapter',
];

for (const weakness of requiredWeaknesses) {
  assert(auditSource.includes(`'${weakness}'`), `Missing current weakness: ${weakness}.`);
}

assert(docsSource.includes('Full Implementation Audit Matrix'), 'Docs must describe full implementation audit matrix.');
assert(docsSource.includes('Multi-country SEO and LLM completion'), 'Docs must describe multi-country SEO/LLM target.');
assert(docsSource.includes('Prompt 34'), 'Docs must call out country adapter foundation.');
assert(docsSource.includes('Prompt 64'), 'Docs must call out final launch gate.');
assert(docsSource.includes('Not complete yet'), 'Docs must clearly state project is not complete yet.');

assert(packageSource.includes('roadmap:audit:validate'), 'package.json must include roadmap audit validation script.');
assert(packageSource.includes('pnpm roadmap:audit:validate'), 'CI-facing script chain must include roadmap audit validation.');

console.log('DrMuscat implementation audit roadmap validated.');
console.log({
  originalPromptCount: 30,
  recommendedNextPromptCount: 32,
  completionMode: 'multi-country-seo-llm-complete',
  nextPrompt: 33,
});
