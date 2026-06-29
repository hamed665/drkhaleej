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

const serverPath = 'src/server/admin/draft-center-quality.ts';
const serverContent = readFile(serverPath);

for (const token of [
  'function internallyActiveLocationCount',
  'Internal location readiness',
  'internally active location candidate',
  'admin quality checks only',
  'Internal quality readiness is not public activation.',
  'Ready for the next internal admin review step, still not public',
  'publicActivationBlocked: true',
]) {
  assertIncludes(serverContent, token, serverPath);
}

const panelPath = 'src/components/admin/draft-center-quality-panel.tsx';
const panelContent = readFile(panelPath);

for (const token of [
  'Draft center internal quality gate',
  'internal readiness only',
  'does not publish, verify, activate publicly, claim, bill, sponsor, expose contact details, or touch sitemap eligibility',
  'Public activation: still blocked by design',
  'bg-gradient-to-br from-white via-cyan-50/30 to-white',
  'border border-amber-200 bg-amber-50',
  'uppercase tracking-[0.18em]',
]) {
  assertIncludes(panelContent, token, panelPath);
}

for (const forbiddenToken of [
  'Ready for publish',
  'Ready to publish',
  'Public activation: ready',
  'publicActivationBlocked: false',
]) {
  if (serverContent.includes(forbiddenToken) || panelContent.includes(forbiddenToken)) {
    throw new Error(`Quality gate contains forbidden public readiness token: ${forbiddenToken}`);
  }
}

console.log('Draft center quality internal gate checks passed.');
