import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const workflowPath = 'src/server/admin/import-pharmacy-private-admin-workflow.ts';
const testPath = 'src/server/admin/import-pharmacy-private-admin-workflow.test.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const workflow = await readText(workflowPath);
const tests = await readText(testPath);

for (const token of [
  '"dry_run" | "review" | "reserve_private_publish" | "private_publish" | "rollback"',
  'entityIds: readonly string[]',
  'input.entityIds.length !== 1',
  'input.family !== "pharmacy"',
  'input.environment !== "preview"',
  'input.confirmation !== `EXECUTE PRIVATE PUBLISH ${entityId}`',
  'input.confirmation !== `ROLLBACK PRIVATE PUBLISH ${entityId}`',
  'review_required',
  'audit_unavailable',
  'publicVisibility: "private" as const',
  'indexEligible: false as const',
  'sitemapEligible: false as const',
  'routeEnabled: false as const',
  'ports.reservePrivatePublish',
  'ports.privatePublish',
  'ports.rollback({ actorId: input.actorId, entityId })',
  'ports.audit',
]) {
  assert(workflow.includes(token), `${workflowPath} must include ${token}`);
}

for (const forbidden of [
  'createSupabase',
  '.from(',
  '.insert(',
  '.update(',
  '.delete(',
  'is_active: true',
  'indexEligible: true',
  'sitemapEligible: true',
  'routeEnabled: true',
  'Promise.all(input.entityIds',
  'publishReference:',
  'publish_reference_required',
  '"PUBLISH PRIVATE PHARMACY"',
  '"ROLLBACK PRIVATE PHARMACY"',
]) {
  assert(!workflow.includes(forbidden), `${workflowPath} must not include ${forbidden}`);
}

for (const token of [
  'blocks bulk, wrong-family, unreviewed, unconfirmed, and production publish requests',
  'dispatches one reviewed Preview reservation without mutation',
  'executes exactly one private publish and preserves zero public exposure',
  'requires the exact entity-bound rollback confirmation',
  'runs rollback only in preview without receiving a raw reference',
  'fails honestly when the audit cannot be persisted',
]) {
  assert(tests.includes(token), `${testPath} must cover ${token}`);
}

assert(!tests.includes('publishReference: "publish-1"'), `${testPath} must not restore the raw rollback-reference contract.`);

console.log('import pharmacy private admin workflow check passed.');
