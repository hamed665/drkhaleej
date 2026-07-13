import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const migrationPath = "supabase/migrations/0074_import_pharmacy_publish_authorizations.sql";
const storePath = "src/server/admin/import-pharmacy-publish-authorization-store.ts";
const actionPath = "src/app/admin/imports/readiness/actions.ts";
const panelPath = "src/components/admin/import-pharmacy-private-admin-control-panel.tsx";

const readText = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const [migration, store, action, panel] = await Promise.all([
  readText(migrationPath),
  readText(storePath),
  readText(actionPath),
  readText(panelPath),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  "create table if not exists public.import_pharmacy_publish_authorizations",
  "token_hash text not null unique",
  "nonce_hash text not null",
  "actor_profile_id uuid not null references public.profiles(id) on delete restrict",
  "entity_id uuid not null references public.centers(id) on delete restrict",
  "alter table public.import_pharmacy_publish_authorizations enable row level security",
  "create or replace function public.import_pharmacy_consume_publish_authorization",
  "and consumed_at is null",
  "and expires_at > p_consumed_at",
  "get diagnostics v_updated_count = row_count",
  "grant execute on function public.import_pharmacy_consume_publish_authorization",
]) assert(migration.toLowerCase().includes(token.toLowerCase()), `${migrationPath} must include ${token}`);

for (const forbidden of [
  "create policy",
  "to anon",
  "to authenticated",
  "visibility = 'public'",
  "is_active = true",
  "sitemap",
]) assert(!migration.toLowerCase().includes(forbidden), `${migrationPath} must not include ${forbidden}`);

for (const token of [
  "createPharmacyPublishAuthorizationStore",
  'from("import_pharmacy_publish_authorizations")',
  'rpc("import_pharmacy_consume_publish_authorization"',
  "response.data === true",
]) assert(store.includes(token), `${storePath} must include ${token}`);

for (const forbidden of [
  'IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = ["dry_run", "review", "private_publish"]',
  "Preview publish now",
]) {
  assert(!action.includes(forbidden), `${actionPath} must not include ${forbidden}`);
  assert(!panel.includes(forbidden), `${panelPath} must not include ${forbidden}`);
}

console.log("Pharmacy publish authorization persistence check passed.");
