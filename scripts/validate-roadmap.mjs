import fs from 'node:fs';

const roadmapPath = 'src/config/roadmap/drmuscat-full-implementation-audit.ts';
const docsPath = 'docs/DRMUSCAT_ROADMAP_AUDIT_V1.md';

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const roadmap = readFile(roadmapPath);
const docs = readFile(docsPath);

assert(roadmap.includes('DRMUSCAT_ORIGINAL_ROADMAP_AUDIT'), 'Missing original roadmap list.');
assert(roadmap.includes('DRMUSCAT_RECOMMENDED_NEXT_PROMPTS'), 'Missing next roadmap list.');
assert(roadmap.includes('DRMUSCAT_FULL_IMPLEMENTATION_AUDIT_SUMMARY'), 'Missing roadmap summary.');
assert(roadmap.includes('multi-country-seo-llm-complete'), 'Missing completion target.');
assert(roadmap.includes('Country Adapter Foundation'), 'Missing country adapter item.');
assert(roadmap.includes('Doctor Specialty Subspecialty Contract'), 'Missing doctor model item.');
assert(roadmap.includes('Internal Linking Engine'), 'Missing linking item.');
assert(roadmap.includes('Schema Mapping'), 'Missing schema item.');
assert(roadmap.includes('Robots and llms.txt'), 'Missing robots and llms item.');
assert(roadmap.includes('Launch Readiness Final Gate'), 'Missing final gate item.');

for (let prompt = 1; prompt <= 30; prompt += 1) {
  assert(roadmap.includes(`prompt: ${prompt},`), `Missing original prompt ${prompt}.`);
}

for (let prompt = 33; prompt <= 64; prompt += 1) {
  assert(roadmap.includes(`prompt: ${prompt},`), `Missing next prompt ${prompt}.`);
}

assert(docs.includes('DrMuscat Roadmap Audit V1'), 'Missing roadmap docs title.');
assert(docs.includes('Not complete yet'), 'Docs must state current incomplete status.');
assert(docs.includes('Prompt 34'), 'Docs must mention next prompt.');
assert(docs.includes('Prompt 64'), 'Docs must mention final prompt.');

console.log('DrMuscat roadmap validated.');
console.log({ originalPrompts: 30, nextPrompts: 32, nextPrompt: 33 });
