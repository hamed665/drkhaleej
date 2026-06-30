import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const helperPath = 'src/server/admin/active-center-public-state-readiness.ts';
const contractPath = 'docs/admin/public-profile-removal-contract.md';

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing file: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function mustHave(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include: ${token}`);
}

function mustNotHave(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} must not include: ${token}`);
}

const helper = read(helperPath);
const contract = read(contractPath);

for (const token of [
  'getAdminActiveCenterPublicStateReadiness',
  'requireAdminPermission("active_centers.public_state.update")',
  'isUuid(centerId)',
  '.from<ActiveCenterStateRow>("centers")',
  '.select("id,slug,status,default_country,is_active,is_claimable,deleted_at")',
  'center.status !== "active"',
  'center.is_active !== true',
  'center.deleted_at !== null',
  'publicPathAr',
  'publicPathEn',
  'sitemapRevalidationRequired: true',
  'auditRequired: true',
  'contactVisibilityUnchanged: true',
  'commercialStateUnchanged: true',
  'futureMutationRequired: true',
]) {
  mustHave(helper, token, helperPath);
}

for (const token of [
  '.update(',
  '.delete(',
  'revalidatePath(',
  'redirect(',
  'insertAuditEvent',
]) {
  mustNotHave(helper, token, helperPath);
}

for (const token of [
  'server-side readiness helper',
  'sitemap/public path revalidation',
  'audit event coverage',
]) {
  mustHave(contract, token, contractPath);
}

console.log('Active center public state readiness checks passed.');
