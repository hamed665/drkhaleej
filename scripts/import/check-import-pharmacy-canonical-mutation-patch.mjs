import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const canonicalPath = "src/server/admin/import-pharmacy-canonical-mutation-patch.ts";
const writerPath = "src/server/admin/import-supabase-pharmacy-private-mutation-writer.ts";
const actionPath = "src/app/admin/imports/readiness/actions.ts";
const readStatePath = "src/server/admin/import-pharmacy-admin-bounded-read-state.ts";

const readText = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const [canonical, writer, action, readState] = await Promise.all([
  readText(canonicalPath),
  readText(writerPath),
  readText(actionPath),
  readText(readStatePath),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  "buildPharmacyCanonicalMutationPatch",
  "projectPharmacyCanonicalMutationPatchForReview",
  "projectPharmacyRollbackSnapshotForMutationReview",
  "metadata_patch",
  "metadata_source_evidence",
]) assert(canonical.includes(token), `${canonicalPath} must include ${token}`);

for (const forbidden of ["default_locale:", "default_country:", "canonicalGeo:", "projectionVersion:"]) {
  assert(!canonical.includes(forbidden), `${canonicalPath} must not mutate protected field ${forbidden}`);
}

assert(
  writer.includes("p_patch: buildPharmacyCanonicalMutationPatch(payload.draft)"),
  `${writerPath} must use the canonical mutation patch builder`,
);
assert(!writer.includes("function buildPatch("), `${writerPath} must not keep a parallel patch builder`);

for (const token of [
  "projectPharmacyRollbackSnapshotForMutationReview",
  "projectPharmacyCanonicalMutationPatchForReview",
  "context.context.mutationRequest.draft",
]) assert(action.includes(token), `${actionPath} must include ${token}`);

assert(
  readState.includes("...PHARMACY_CANONICAL_MUTATION_REVIEW_FIELDS"),
  `${readStatePath} must expose every canonical mutation field in exact diff`,
);
assert(
  readState.includes('schemaVersion: "pharmacy_admin_read_state_v2"'),
  `${readStatePath} must version the expanded exact review contract`,
);

console.log("Pharmacy canonical mutation patch check passed.");
