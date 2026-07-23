#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const runner = readFileSync(path.join(repoRoot, 'src/server/admin/import-pharmacy-real-preview-canary.ts'), 'utf8');
const adapter = readFileSync(path.join(repoRoot, 'src/server/admin/import-supabase-pharmacy-real-preview-canary-readback.ts'), 'utf8');

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) {
    console.error(`ERROR: IMPORT-PUBLISH-AF: ${message}`);
    process.exit(1);
  }
}

for (const [pattern, message] of [
  [/activation\.enabled/, 'runner must require the activation gate.'],
  [/EXECUTE PRIVATE PUBLISH/, 'runner must use the exact entity-bound private publish confirmation.'],
  [/reservationCount\s*!==\s*1/, 'runner must require exactly one reservation.'],
  [/rollbackSnapshotCount\s*!==\s*1/, 'runner must require exactly one rollback snapshot.'],
  [/executionStartedAuditCount\s*!==\s*1/, 'runner must require exactly one execution_started audit.'],
  [/terminalSuccessAuditCount\s*!==\s*1/, 'runner must require exactly one terminal success audit.'],
  [/duplicateExecutionCount\s*!==\s*0/, 'runner must reject duplicate execution.'],
  [/status\s*!==\s*"draft"/, 'runner must keep the entity draft/private.'],
  [/indexEligible:\s*false/, 'runner must remain noindex.'],
  [/sitemapEligible:\s*false/, 'runner must stay out of sitemap.'],
]) requirePattern(runner, pattern, message);

for (const [pattern, message] of [
  [/import_pharmacy_publish_references/, 'adapter must resolve the durable publish reference.'],
  [/import_publish_idempotency_records/, 'adapter must read reservation persistence.'],
  [/import_publish_rollback_snapshots/, 'adapter must read rollback persistence.'],
  [/import_publish_audit_events/, 'adapter must read audit persistence.'],
  [/execution_started/, 'adapter must verify execution_started.'],
  [/execution_succeeded/, 'adapter must verify terminal success.'],
  [/\.from\("centers"\)/, 'adapter must read the Pharmacy entity state.'],
]) requirePattern(adapter, pattern, message);

console.log('real Preview Pharmacy canary contract passed.');
