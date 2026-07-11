import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..', '..');
const migrationPath = path.join(root, 'supabase/migrations/0069_import_publish_transaction_rpcs.sql');
const docsPath = path.join(root, 'docs/platform/DRKHALEEJ_DATABASE_TRANSACTION_RPC_MIGRATION.md');
const dbValidatorPath = path.join(root, 'scripts/db/check-import-publish-transaction-rpcs.mjs');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(migrationPath), 'Publish transaction RPC migration is missing.');
assert(existsSync(docsPath), 'Publish transaction RPC migration docs are missing.');
assert(existsSync(dbValidatorPath), 'Publish transaction RPC static validator is missing.');

const migration = readFileSync(migrationPath, 'utf8');
const docs = readFileSync(docsPath, 'utf8');

for (const token of [
  'import_publish_reserve_snapshot_audit',
  'import_publish_persist_terminal_result',
  'SECURITY INVOKER',
  'SET search_path = pg_catalog, public',
  'TO service_role',
]) assert(migration.includes(token), `RPC migration must include ${token}.`);

for (const token of [
  'does not publish an entity',
  'SECURITY INVOKER',
  'service_role',
  'application RPC caller',
  'publish executor',
  'Admin action or button',
  'bulk publishing',
]) assert(docs.includes(token), `RPC migration docs must include ${token}.`);

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  'server action',
  'publishEntity',
  'sitemap.xml',
]) assert(!migration.includes(forbidden), `RPC migration must not include application/runtime token ${forbidden}.`);

execFileSync(process.execPath, [dbValidatorPath], {
  cwd: root,
  stdio: 'inherit',
});

console.log('import publish RPC migration check passed.');
