import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const projectRoot = process.cwd();
const scannedRoots = ['src', 'scripts', 'public'];
const scannedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.txt']);

const allowedReferenceFiles = new Set([
  'src/lib/geo/oman-location-candidate-evidence-snapshots.ts',
  'src/lib/geo/oman-location-candidate-evidence-snapshots.test.ts',
  'src/lib/geo/oman-location-candidate-promotion-checklists.ts',
  'src/config/geo/location-candidate-evidence-snapshot-contract.ts',
  'scripts/seo/check-location-candidate-evidence-snapshot-contract.mjs',
  'scripts/seo/check-location-candidate-evidence-snapshot-runtime-accessor.mjs',
  'scripts/seo/check-location-candidate-evidence-snapshot-integration.mjs',
  'scripts/seo/check-location-candidate-promotion-checklist-runtime-accessor.mjs',
]);

const forbiddenUsageTokens = [
  'oman-location-candidate-evidence-snapshots',
  'getOmanLocationCandidateEvidenceSnapshotState',
  'getOmanLocationCandidateEvidenceSnapshotRequirement',
  'getOmanLocationCandidateEvidenceSnapshotRuntimeContract',
  'location-candidate-evidence-snapshot-contract',
  'OmanLocationCandidateEvidenceSnapshotShape',
];

function extensionOf(filePath) {
  const dotIndex = filePath.lastIndexOf('.');
  return dotIndex === -1 ? '' : filePath.slice(dotIndex);
}

function collectFiles(rootPath) {
  const absoluteRoot = resolve(projectRoot, rootPath);

  if (!existsSync(absoluteRoot)) {
    return [];
  }

  const files = [];

  for (const entry of readdirSync(absoluteRoot)) {
    const absolutePath = join(absoluteRoot, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectFiles(relative(projectRoot, absolutePath)));
      continue;
    }

    if (stats.isFile() && scannedExtensions.has(extensionOf(absolutePath))) {
      files.push(relative(projectRoot, absolutePath));
    }
  }

  return files;
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required snapshot integration guard tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const violations = [];

for (const root of scannedRoots) {
  for (const relativePath of collectFiles(root)) {
    if (allowedReferenceFiles.has(relativePath)) {
      continue;
    }

    const source = readFileSync(resolve(projectRoot, relativePath), 'utf8');
    const matchedToken = forbiddenUsageTokens.find((token) => source.includes(token));

    if (matchedToken) {
      violations.push(`${relativePath} references ${matchedToken}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Candidate evidence snapshot runtime must not be integrated into routes, sitemap, registry, UI, database, or public surfaces yet.');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

const packageJson = readFileSync(resolve(projectRoot, 'package.json'), 'utf8');
requireTokens('package.json', packageJson, [
  'seo:location-candidate-evidence-integration:validate',
  'check-location-candidate-evidence-snapshot-integration.mjs',
]);

console.log('Location candidate evidence snapshot integration guard passed.');
