#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  migration: 'supabase/migrations/0095_import_automation_job_runtime.sql',
  runtime: 'src/server/imports/automation-job-runtime.ts',
  runtimeTests: 'src/server/imports/automation-job-runtime.test.ts',
  identity: 'src/server/imports/automation-service-identity.ts',
  identityTests: 'src/server/imports/automation-service-identity.test.ts',
  controlPlane: 'src/server/imports/automation-control-plane.ts',
  controlPlaneTests: 'src/server/imports/automation-control-plane.test.ts',
  route: 'src/app/api/internal/automation/route.ts',
  routeTests: 'src/app/api/internal/automation/route.test.ts',
  worker: 'scripts/automation/worker.mjs',
  render: 'render.yaml',
  env: '.env.example',
  docs: 'docs/import/AUTOMATION_JOB_RUNTIME.md',
  proof: 'scripts/import/run-automation-job-runtime-proof.mjs',
};

function read(file) { return readFileSync(path.join(root, file), 'utf8'); }
function requireTokens(file, source, tokens) {
  for (const token of tokens) if (!source.includes(token)) throw new Error(`${file}: missing required token ${token}`);
}
function forbid(file, source, pattern, message) {
  if (pattern.test(source)) throw new Error(`${file}: ${message}`);
}

const migration = read(files.migration);
const runtime = read(files.runtime);
const runtimeTests = read(files.runtimeTests);
const identity = read(files.identity);
const identityTests = read(files.identityTests);
const controlPlane = read(files.controlPlane);
const controlPlaneTests = read(files.controlPlaneTests);
const route = read(files.route);
const routeTests = read(files.routeTests);
const worker = read(files.worker);
const render = read(files.render);
const env = read(files.env);
const docs = read(files.docs);
const proof = read(files.proof);

requireTokens(files.migration, migration, [
  'AUTOMATION-JOB-RUNTIME',
  'create table if not exists public.import_automation_controls',
  'create table if not exists public.import_automation_service_identities',
  'create table if not exists public.import_automation_request_replays',
  'create table if not exists public.import_automation_jobs',
  'create table if not exists public.import_automation_job_artifacts',
  'create table if not exists public.import_automation_notification_outbox',
  'create table if not exists public.import_automation_audit_events',
  "('global', 'global', null, false)",
  "('family:pharmacy', 'family', 'pharmacy', false)",
  "'urn:drkhaleej:service:worker-preview'",
  "'urn:drkhaleej:service:n8n-preview'",
  'create or replace function public.import_automation_accept_service_request',
  'create or replace function public.import_automation_create_job',
  'create or replace function public.import_automation_claim_job',
  'for update skip locked',
  "interval '60 seconds'",
  'lease_epoch=lease_epoch+1',
  'create or replace function public.import_automation_lease_is_valid',
  'create or replace function public.import_automation_heartbeat_job',
  'create or replace function public.import_automation_write_job_artifact',
  'create or replace function public.import_automation_complete_job',
  'create or replace function public.import_automation_cancel_job',
  'create or replace function public.import_automation_set_control',
  'create or replace function public.import_automation_configure_service_identity',
  'service_request_replayed',
  'automation_lease_fenced',
  'automation_job_idempotency_mismatch',
  'automation_artifact_idempotency_mismatch',
  'import_automation_notification_outbox',
  'alter table public.import_automation_jobs enable row level security',
  'revoke all on table public.import_automation_jobs from public, anon, authenticated, service_role',
  "p_job_types is distinct from array['report']::text[]",
  'grant execute on function public.import_automation_claim_job(text,uuid,text[]) to service_role',
]);
forbid(files.migration, migration, /\bcreate\s+policy\b/i, 'must not create public policies');
forbid(files.migration, migration, /grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, 'must not expose RPCs to public roles');
forbid(files.migration, migration, /\b(insert|update|delete)\s+(into\s+)?public\.(centers|doctors|import_publish_queue|import_entity_review_decisions)\b/i,
  'must not mutate canonical, decision or publication authorities');
forbid(files.migration, migration, /SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|storage\.objects/i,
  'migration must not embed runtime credentials or open direct Storage access');
const cancelBody = migration.match(/create or replace function public\.import_automation_cancel_job\([\s\S]*?\n\$\$;/)?.[0] ?? '';
const controlBody = migration.match(/create or replace function public\.import_automation_set_control\([\s\S]*?\n\$\$;/)?.[0] ?? '';
const identityBody = migration.match(/create or replace function public\.import_automation_configure_service_identity\([\s\S]*?\n\$\$;/)?.[0] ?? '';
requireTokens(files.migration, cancelBody, ['p_actor_profile_id', 'p_job_id', 'p_reason']);
forbid(files.migration, cancelBody, /\bp_(enabled|active|active_key_ids)\b/,
  'cancel RPC must not reference parameters from another function');
requireTokens(files.migration, controlBody, ['p_enabled is null']);
forbid(files.migration, controlBody, /\bp_(active|active_key_ids)\b/,
  'control RPC must not reference identity parameters');
requireTokens(files.migration, identityBody, ['p_active is null', 'p_active_key_ids is null']);
forbid(files.migration, identityBody, /\bp_enabled\b/,
  'identity RPC must not reference control parameters');

requireTokens(files.runtime, runtime, [
  'drkhaleej.import.automationJobRuntime.v1',
  'AUTOMATION_LEASE_SECONDS = 60',
  'AUTOMATION_HEARTBEAT_SECONDS = 20',
  'AUTOMATION_MAX_ATTEMPTS = 3',
  'family: typeof AUTOMATION_FAMILY',
  'publishAllowed: false',
  'rollbackAllowed: false',
  'publicPromotionAllowed: false',
  'indexPromotionAllowed: false',
  'sitemapPromotionAllowed: false',
  'aiAllowed: false',
  'productionAllowed: false',
]);
forbid(files.runtime, runtime, /content_(opportunity|research|draft|monitor)|publish\"|rollback\"|createClient\(|fetch\(/,
  'runtime contract must not open Content/downstream/network/database authority');
requireTokens(files.runtimeTests, runtimeTests, [
  'rejects Content jobs, future families, hidden fields and missing source policy',
  'requires a 256-bit lease token, boot-unique Worker UUID and monotonic epoch',
  'stores only bounded artifact hashes, never raw payloads',
]);

requireTokens(files.identity, identity, [
  'drkhaleej.automation.serviceJwt.v1',
  'urn:drkhaleej:internal-automation:v1',
  'AUTOMATION_JWT_ALGORITHM = "Ed25519"',
  'AUTOMATION_JWT_MAX_TTL_SECONDS = 300',
  'AUTOMATION_JWT_MAX_CLOCK_SKEW_SECONDS = 30',
  'jtiDigest',
  'req_sha256',
  'worker_instance',
  'job_id',
  'lease_epoch',
  'crypto.subtle.verify',
  'scope.includes(" ")',
]);
requireTokens(files.identity, identity, ['"publish", "rollback", "public_promote", "index_promote", "sitemap_promote"']);
requireTokens(files.identityTests, identityTests, [
  'accepts an exact Ed25519 Worker request binding',
  'rejects algorithm substitution, unknown keys and signature tampering',
  'rejects wrong audience, scope, TTL, clock and request body',
  'requires job and lease binding for every protected Worker write',
]);

requireTokens(files.controlPlane, controlPlane, [
  'import_automation_accept_service_request',
  'import_automation_create_job',
  'import_automation_claim_job',
  'import_automation_start_job',
  'import_automation_heartbeat_job',
  'import_automation_write_job_artifact',
  'import_automation_complete_job',
  'automation_identity_binding_invalid',
  'automation_operation_not_enabled',
]);
forbid(files.controlPlane, controlPlane, /publish_job|rollback_job|promote_job/, 'control plane must not expose downstream operations');
requireTokens(files.controlPlaneTests, controlPlaneTests, [
  'maps artifact writes to the narrow exact scope',
  'rejects identity/body drift before any RPC',
  'does not expose publish, rollback, promotion or arbitrary operations',
]);

requireTokens(files.route, route, [
  'export const runtime = "nodejs"',
  'AUTOMATION_EMERGENCY_ENABLED',
  'APP_ENV',
  'AUTOMATION_PREVIEW_PROJECT_REF',
  'AUTOMATION_PRODUCTION_PROJECT_REF',
  'parseAutomationPublicJwks',
  'verifyAutomationServiceToken',
  'Cache-Control',
  'no-store',
  'readBoundedBody',
  'automation_content_type_invalid',
]);
forbid(files.route, route, /export\s+async\s+function\s+(GET|PUT|PATCH|DELETE)/, 'only the signed bounded POST surface may exist');
requireTokens(files.routeTests, routeTests, [
  'fails closed before reading a request outside isolated Preview',
  'rejects non-JSON and declared oversized bodies before identity work',
  'passes the exact bounded request bytes into signed identity verification',
]);

requireTokens(files.worker, worker, [
  "const SUBJECT = 'urn:drkhaleej:service:worker-preview'",
  "const AUDIENCE = 'urn:drkhaleej:internal-automation:v1'",
  "schema_version: 'drkhaleej.automation.serviceJwt.v1'",
  "alg: 'Ed25519'",
  'randomUUID()',
  "AUTOMATION_EMERGENCY_ENABLED",
  "AUTOMATION_RUNTIME_PROBE_ENABLED",
  "result: 'waiting_review'",
  "redirect: 'error'",
]);
forbid(files.worker, worker, /SUPABASE|DATABASE_URL|STORAGE|service[_-]?role|publish|rollback|public_promote|index_promote|sitemap_promote/i,
  'Worker must hold no DB/Storage/downstream authority');

requireTokens(files.render, render, [
  'type: worker',
  'name: drkhaleej-automation-worker-preview',
  'runtime: node',
  'region: frankfurt',
  'plan: starter',
  'numInstances: 1',
  'autoDeployTrigger: off',
  'startCommand: pnpm automation:worker',
  'AUTOMATION_EMERGENCY_ENABLED',
  'value: "false"',
  'AUTOMATION_RUNTIME_PROBE_ENABLED',
  'sync: false',
]);
forbid(files.render, render, /type:\s*(web|pserv)|disk:|databases:|autoDeployTrigger:\s*(commit|checksPass)/,
  'Render declaration must remain one manual background Worker with no endpoint/disk/datastore');

requireTokens(files.env, env, [
  'AUTOMATION_EMERGENCY_ENABLED=false',
  'AUTOMATION_RUNTIME_PROBE_ENABLED=false',
  'AUTOMATION_SERVICE_PUBLIC_JWKS_JSON={"keys":[]}',
]);
forbid(files.env, env, /BEGIN (RSA|EC|OPENSSH|PRIVATE) PRIVATE KEY|eyJ[a-zA-Z0-9_-]+\./,
  'environment example must not contain a credential');

requireTokens(files.docs, docs, [
  '# Automation Job Runtime',
  '`AUTOMATION-JOB-RUNTIME`',
  '`0095_import_automation_job_runtime.sql`',
  'all controls and identities default disabled',
  'Production remains disconnected',
  'Render provisioning is not performed by this PR',
]);
requireTokens(files.proof, proof, [
  'AUTOMATION_JOB_RUNTIME_PREVIEW_DATABASE_URL',
  'AUTOMATION_JOB_RUNTIME_PRODUCTION_PROJECT_REF',
  "where version::text = '0095'",
  'automation_lease_fenced',
  'service_request_replayed',
  'for update skip locked',
  'Rollback cleanup left AUTOMATION-JOB-RUNTIME fixture rows.',
]);
forbid(files.proof, proof, /PRODUCTION_DATABASE_URL|SUPABASE_SERVICE_ROLE_KEY/, 'proof must not accept Production/API credentials');

console.log('automation job runtime static contract passed.');
