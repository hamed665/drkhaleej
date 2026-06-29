import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function assertIncludes(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} is missing required token: ${token}`);
  }
}

const contractPath = 'docs/admin/contact-visibility-contract.md';
const contractContent = readFile(contractPath);

const requiredContractTokens = [
  'Contact Visibility Contract',
  'centers',
  'center_locations',
  'contact_review_status',
  'contact_reviewed_at',
  'public_primary_phone_visible',
  'public_whatsapp_phone_visible',
  'public_email_visible',
  '`public_secondary_phone_visible` remains out of scope',
  'Non-contact workflows may reset contact visibility flags to `false` for safety',
  'must not set any contact visibility flag to `true`',
  'must not set `contact_review_status` to `approved`',
  'Only the contact visibility workflow may set a v1 visibility flag to `true`',
  'draft` or `pending_review`',
  'internally active for the admin quality workflow',
  'Prepared contact visibility does not make a provider public',
  'public email rendering or `mailto:` links require a later public-contact rendering contract',
  'must not publish a provider',
  'verify a center',
  'claim a center',
  'change billing',
  'change sponsorship',
  'must not revalidate public routes',
  'must not revalidate sitemap',
  'admin draft center detail page only',
  'Every successful contact visibility change must write an admin audit event',
  'provider or center is public eligible',
  'contact visibility flag is `true`',
  '`contact_review_status` is `approved`',
];

for (const token of requiredContractTokens) {
  assertIncludes(contractContent, token, contractPath);
}

const packagePath = 'package.json';
const packageContent = readFile(packagePath);

for (const token of [
  '"admin:contact-visibility-contract:validate": "node scripts/admin/check-contact-visibility-contract.mjs"',
  'pnpm admin:contact-visibility-contract:validate',
]) {
  assertIncludes(packageContent, token, packagePath);
}

console.log('Contact visibility contract checks passed.');
