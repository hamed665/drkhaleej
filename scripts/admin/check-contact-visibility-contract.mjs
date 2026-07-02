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

function assertNotIncludes(content, token, label) {
  if (content.includes(token)) {
    throw new Error(`${label} contains forbidden token: ${token}`);
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
  'Public email rendering is now allowed only through the public-contact rendering contract',
  '`mailto:` links require `public_email_visible = true`',
  'Center website rendering is allowed only when `contact_review_status = approved`',
  'Location-level website rendering remains out of scope',
  'safe `http` or `https` website links',
  'external public contact links must use `noopener`, `noreferrer`, and `nofollow`',
  'public listing cards must not render contact actions',
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

assertNotIncludes(
  contractContent,
  'public email rendering or `mailto:` links require a later public-contact rendering contract',
  contractPath,
);

const publicContactPath = 'src/lib/catalog/public-contact.ts';
const publicContact = readFile(publicContactPath);
for (const token of [
  "export type PublicContactActionKind = 'call' | 'whatsapp' | 'email' | 'website'",
  'publicEmailVisible?: boolean | null',
  'websiteUrl?: string | null',
  'normalizePublicEmailHref',
  'normalizePublicWebsiteHref',
  "createPublicContactAction('email'",
  "createPublicContactAction('website'",
  'if (!isApprovedPublicContact(contactReviewStatus)) return null',
  'const hasAllowedScheme = /^https?:\\/\\//i.test(trimmedValue)',
  'const hasAnyScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmedValue)',
  'if (hasAnyScheme && !hasAllowedScheme) return null',
  "if (url.protocol !== 'https:' && url.protocol !== 'http:') return null",
  'if (url.username || url.password) return null',
  "buildPublicEmailAction(source.email, source.publicEmailVisible, source.contactReviewStatus, labels)",
  'buildPublicWebsiteAction(source.websiteUrl, source.contactReviewStatus, labels)',
]) {
  assertIncludes(publicContact, token, publicContactPath);
}

const publicQueriesPath = 'src/lib/catalog/public-queries.ts';
const publicQueries = readFile(publicQueriesPath);
for (const token of [
  'PUBLIC_CENTER_DETAIL_SELECT',
  'PUBLIC_CENTER_LOCATION_SELECT',
  'email,website_url',
  'public_email_visible',
  'email: row.email',
  'websiteUrl: row.website_url',
  'email: location.email',
  'publicEmailVisible: location.public_email_visible',
  'publicEmailVisible: center.public_email_visible',
]) {
  assertIncludes(publicQueries, token, publicQueriesPath);
}

const publicContactActionsPath = 'src/components/public/public-contact-actions.tsx';
const publicContactActions = readFile(publicContactActionsPath);
for (const token of [
  'EXTERNAL_CONTACT_REL',
  "['noopener', 'noreferrer', 'nofollow'].join(' ')",
  "action.kind === 'whatsapp' || action.kind === 'website'",
  "target={isExternalAction ? '_blank' : undefined}",
  'rel={isExternalAction ? EXTERNAL_CONTACT_REL : undefined}',
]) {
  assertIncludes(publicContactActions, token, publicContactActionsPath);
}

const listingCardPath = 'src/components/public/public-listing-card.tsx';
const listingCard = readFile(listingCardPath);
for (const token of [
  'PublicContactActions',
  'contactActions',
  ['mail', 'to:'].join(''),
  ['wa', '.me'].join(''),
]) {
  assertNotIncludes(listingCard, token, listingCardPath);
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
