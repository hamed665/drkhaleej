import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

function readFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing required file: ${file}`);
  return fs.readFileSync(full, 'utf8');
}

function mustHave(text, token, label) {
  if (!text.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

const docPath = 'docs/admin/readiness-bundle.md';
const doc = readFile(docPath);

for (const token of [
  'Readiness Bundle',
  'draft center list',
  'draft center detail',
  'publication readiness panel',
  'active centers read-only view',
  'audit log read-only route',
  'publication contract',
  'readiness helper',
  'gated server action',
  'post-activation verifier',
  'final route sanity guard',
  'public catalog eligibility wrapper',
  'guarded public center detail route',
  'public launch-safe UI guard',
  'sitemap and import family validators',
  'soft launch operator checklist',
  'first provider rehearsal document',
  'bulk provider rollout',
  'live active-provider editing',
  'manual sitemap insertion',
]) {
  mustHave(doc, token, docPath);
}

const requiredScripts = [
  'admin:provider-publication-contract:validate',
  'admin:final-chain:validate',
  'admin:launch-checklist:validate',
  'admin:post-activation:validate',
  'admin:provider-view-contract:validate',
  'admin:active-centers-readonly:validate',
  'admin:audit-log-readonly:validate',
  'admin:final-launch-recap:validate',
  'admin:final-route-sanity:validate',
  'admin:soft-launch-checklist:validate',
  'admin:r1:validate',
  'admin:readiness-bundle:validate',
  'seo:public-catalog-eligibility:validate',
  'seo:public-listing-card-safety:validate',
  'seo:public-launch-safe-ui:validate',
  'import:publish-readiness-audit:validate',
  'import:sitemap-family-caps:validate',
  'import:profile-smoke:validate',
];

for (const token of requiredScripts) {
  mustHave(doc, token, docPath);
}

for (const file of [
  'docs/admin/final-launch-chain-recap.md',
  'docs/admin/soft-launch-operator-checklist.md',
  'docs/admin/first-provider-rehearsal.md',
  'src/app/admin/draft-centers/page.tsx',
  'src/app/admin/active-centers/page.tsx',
  'src/app/admin/audit-log/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'src/server/admin/draft-center-publication-readiness.ts',
  'src/server/admin/draft-center-public-activation-actions.ts',
]) {
  readFile(file);
}

const pkg = readFile('package.json');
for (const token of [
  '"admin:readiness-bundle:validate": "node scripts/admin/check-readiness-bundle.mjs"',
  'pnpm admin:readiness-bundle:validate',
  ...requiredScripts.filter((script) => script !== 'admin:readiness-bundle:validate').map((script) => `pnpm ${script}`),
]) {
  mustHave(pkg, token, 'package.json');
}

console.log('Readiness bundle checks passed.');
