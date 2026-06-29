import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const panelPath = 'src/components/admin/draft-center-location-panel.tsx';
const absolutePath = path.join(repoRoot, panelPath);

if (!fs.existsSync(absolutePath)) {
  throw new Error(`Missing required file: ${panelPath}`);
}

const content = fs.readFileSync(absolutePath, 'utf8');

const requiredTokens = [
  'markDraftCenterLocationReadyForReview',
  'type DraftCenterLocationReviewState',
  'const reviewInitialState: DraftCenterLocationReviewState',
  'function LocationReviewForm',
  'useActionState(',
  'if (location.isActive) return null;',
  'Quality gate step',
  'Marks this candidate internally active for admin quality checks only. Public contact visibility stays locked.',
  'Mark ready for quality review',
  'Candidate edits, selection, and quality readiness stay private. Public visibility and promotion require a separate workflow.',
  'bg-gradient-to-br from-amber-50 via-white to-cyan-50/50',
  'bg-slate-950',
  'hover:bg-cyan-800',
  'uppercase tracking-[0.16em]',
];

for (const token of requiredTokens) {
  if (!content.includes(token)) {
    throw new Error(`${panelPath} is missing required token: ${token}`);
  }
}

const forbiddenTokens = [
  'public_primary_phone_visible: true',
  'public_whatsapp_phone_visible: true',
  'verificationStatus',
  'subscriptionStatus',
  'claimable',
  'sitemap',
];

for (const token of forbiddenTokens) {
  if (content.includes(token)) {
    throw new Error(`${panelPath} contains forbidden review UI token: ${token}`);
  }
}

console.log('Draft location review UI checks passed.');
