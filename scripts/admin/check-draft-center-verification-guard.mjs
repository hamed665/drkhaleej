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

const formPath = 'src/components/admin/draft-center-edit-form.tsx';
const formContent = readFile(formPath);

assertIncludes(formContent, 'updateDraftCenterDetailsPreservingVerification', formPath);
assertIncludes(formContent, '@/server/admin/draft-center-safe-actions', formPath);
assertIncludes(formContent, 'Verification changes require a separate evidence-based workflow.', formPath);
assertNotIncludes(formContent, 'const verificationStatuses =', formPath);
assertNotIncludes(formContent, 'verificationStatuses.map', formPath);
assertNotIncludes(formContent, 'defaultValue={center.verificationStatus}\n                disabled={isPending}\n                className={inputClassName()}\n                required', formPath);

const safeActionPath = 'src/server/admin/draft-center-safe-actions.ts';
const safeActionContent = readFile(safeActionPath);

assertIncludes(safeActionContent, 'export async function updateDraftCenterDetailsPreservingVerification', safeActionPath);
assertIncludes(safeActionContent, 'cloneFormDataWithoutReviewState', safeActionPath);
assertIncludes(safeActionContent, 'if (key === "verificationStatus") continue;', safeActionPath);
assertIncludes(safeActionContent, '.select("verification_status")', safeActionPath);
assertIncludes(safeActionContent, 'safeFormData.append("verificationStatus", currentVerificationStatus)', safeActionPath);
assertIncludes(safeActionContent, 'return updateDraftCenterDetails(previousState, safeFormData);', safeActionPath);

console.log('Draft center verification guard checks passed.');
