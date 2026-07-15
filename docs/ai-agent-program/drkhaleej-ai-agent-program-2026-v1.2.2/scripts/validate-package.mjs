#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const VERSION = "1.2.2";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const checks = [];

function check(condition, message) {
  if (condition) checks.push(message);
  else errors.push(message);
}

async function exists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function runtimeInvariantErrors(schemaPath, data, context = {}) {
  const found = [];
  if (
    "policy_version" in data
    && context.allowedPolicyVersions
    && !context.allowedPolicyVersions.includes(data.policy_version)
  ) {
    found.push("unknown_policy_version");
  }
  if (schemaPath === "contracts/automation-job.schema.json") {
    if (data.attempt_count > data.max_attempts) found.push("attempt_count_exceeds_max_attempts");
    if (data.budget?.enforcement === "allowed") {
      if (data.budget.estimated > data.budget.reserved) found.push("estimated_exceeds_reserved");
      if (data.budget.reserved > data.budget.hard_limit) found.push("reserved_exceeds_hard_limit");
    }
  }
  if (schemaPath === "contracts/service-identity-claims.schema.json") {
    if (!(data.iat <= data.nbf && data.nbf < data.exp)) found.push("invalid_service_time_order");
    if (data.exp - data.iat > 300) found.push("service_ttl_exceeds_300_seconds");
    if (context.expectedJobId && data.job_id !== context.expectedJobId) found.push("service_job_binding_mismatch");
    if (context.currentLeaseEpoch && data.lease_epoch !== context.currentLeaseEpoch) found.push("stale_lease_epoch");
  }
  if (schemaPath === "contracts/source-policy.schema.json") {
    if (Date.parse(data.expires_at) <= Date.parse(data.reviewed_at)) found.push("policy_expiry_not_after_review");
  }
  if (schemaPath === "contracts/source-observation.schema.json") {
    if (Date.parse(data.expires_at) <= Date.parse(data.captured_at)) found.push("observation_expiry_not_after_capture");
  }
  if (schemaPath === "contracts/entity-draft.schema.json") {
    const paths = (data.fields ?? []).map((field) => field.path);
    if (new Set(paths).size !== paths.length) found.push("duplicate_entity_field_path");
  }
  if (schemaPath === "contracts/entity-review-decision.schema.json") {
    if (context.expectedDraftId && data.draft_id !== context.expectedDraftId) found.push("review_draft_id_mismatch");
    if (context.expectedDraftVersion && data.draft_version !== context.expectedDraftVersion) found.push("stale_draft_version");
    if (context.expectedDraftHash && data.draft_hash !== context.expectedDraftHash) found.push("stale_draft_hash");
  }
  if (schemaPath === "contracts/article-draft.schema.json") {
    const sourceIdList = (data.sources ?? []).map((source) => source.source_id);
    const claimIdList = (data.claims ?? []).map((claim) => claim.claim_id);
    if (new Set(sourceIdList).size !== sourceIdList.length) found.push("duplicate_article_source_id");
    if (new Set(claimIdList).size !== claimIdList.length) found.push("duplicate_article_claim_id");
    const sourceIds = new Set((data.sources ?? []).map((source) => source.source_id));
    const claimIds = new Set((data.claims ?? []).map((claim) => claim.claim_id));
    for (const claim of data.claims ?? []) {
      if (claim.source_ids.some((id) => !sourceIds.has(id))) found.push("claim_references_unknown_source");
    }
    for (const source of data.sources ?? []) {
      if (source.supported_claim_ids.some((id) => !claimIds.has(id))) found.push("source_references_unknown_claim");
    }
  }
  return [...new Set(found)];
}

function schemaErrorMatches(actual, expected) {
  if (expected.keyword && actual.keyword !== expected.keyword) return false;
  if (expected.instancePath !== undefined && actual.instancePath !== expected.instancePath) return false;
  if (expected.schemaPathIncludes && !actual.schemaPath.includes(expected.schemaPathIncludes)) return false;
  for (const [key, value] of Object.entries(expected.params ?? {})) {
    if (actual.params?.[key] !== value) return false;
  }
  return true;
}

const allFiles = await walk(root);
const contractFiles = allFiles
  .filter((path) => path.startsWith(join(root, "contracts")) && path.endsWith(".schema.json"))
  .sort();

const schemas = new Map();
for (const path of contractFiles) {
  const key = relative(root, path);
  try {
    schemas.set(key, JSON.parse(await readFile(path, "utf8")));
  } catch (error) {
    errors.push(`${key} is not valid JSON: ${error.message}`);
  }
}

check(contractFiles.length === 9, "exactly nine versioned contract schemas are present");

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const ids = new Set();
const validators = new Map();
for (const [path, schema] of schemas) {
  check(schema.$schema === "https://json-schema.org/draft/2020-12/schema", `${path} declares Draft 2020-12`);
  check(typeof schema.$id === "string" && schema.$id.endsWith(`:${VERSION}`), `${path} has a v${VERSION} $id`);
  check(schema.properties?.schema_version?.const === VERSION, `${path} pins schema_version ${VERSION}`);
  check(schema.additionalProperties === false, `${path} is closed at its root boundary`);
  check(!ids.has(schema.$id), `${path} has a unique $id`);
  ids.add(schema.$id);
  try {
    validators.set(path, ajv.compile(schema));
    checks.push(`${path} strict-compiles with Draft 2020-12`);
  } catch (error) {
    errors.push(`${path} failed strict AJV compile: ${error.message}`);
  }
}

const entity = schemas.get("contracts/entity-draft.schema.json");
check(Boolean(entity), "entity draft schema is present");
if (entity) {
  const rootProperties = entity.properties ?? {};
  check(!("review_decision" in rootProperties), "entity candidate cannot contain reviewer decision");
  check(!("review_approval" in rootProperties), "entity candidate cannot contain reviewer approval");
  const scalarBranches = entity.$defs?.boundedScalar?.oneOf ?? [];
  check(!scalarBranches.some((branch) => branch.type === "integer"), "bounded scalar has no overlapping integer branch");
}

const article = schemas.get("contracts/article-draft.schema.json");
check(!article?.$defs?.qualityGates?.properties?.editorial?.enum?.includes("pass"), "article candidate cannot assert editorial approval");
check(!article?.$defs?.qualityGates?.properties?.medical?.enum?.includes("pass"), "article candidate cannot assert medical approval");

const identity = schemas.get("contracts/service-identity-claims.schema.json");
check(!("alg" in (identity?.properties ?? {})) && !("kid" in (identity?.properties ?? {})), "JOSE alg and kid stay in the verified header, not service claims");
const expectedScopes = [
  "job:create", "job:read", "job:lease", "job:execute", "job:heartbeat",
  "job:complete", "draft:write", "evidence:write", "report:write",
];
check(JSON.stringify(identity?.properties?.scopes?.items?.enum) === JSON.stringify(expectedScopes), "service scope vocabulary is canonical");

const vectors = [
  { schemaPath: "contracts/entity-draft.schema.json", vectorPath: "examples/contracts/entity-draft.valid.json", expectedValid: true },
  { schemaPath: "contracts/entity-draft.schema.json", vectorPath: "examples/contracts/entity-integer-scalar.valid.json", expectedValid: true },
  {
    schemaPath: "contracts/entity-draft.schema.json",
    vectorPath: "examples/contracts/entity-draft.agent-approval.invalid.json",
    expectedSchemaErrors: [{ keyword: "additionalProperties", instancePath: "", params: { additionalProperty: "review_decision" } }],
  },
  {
    schemaPath: "contracts/entity-draft.schema.json",
    vectorPath: "examples/contracts/entity-duplicate-field-path.invalid.json",
    expectedInvariantErrors: ["duplicate_entity_field_path"],
  },
  {
    schemaPath: "contracts/entity-draft.schema.json",
    vectorPath: "examples/contracts/entity-unsupported-family.invalid.json",
    expectedSchemaErrors: [{ keyword: "enum", instancePath: "/entity_family" }],
  },
  {
    schemaPath: "contracts/entity-draft.schema.json",
    vectorPath: "examples/contracts/entity-resolved-conflict.invalid.json",
    expectedSchemaErrors: [{ keyword: "enum", instancePath: "/fields/0/conflicts/0/status" }],
  },
  {
    schemaPath: "contracts/entity-draft.schema.json",
    vectorPath: "examples/contracts/entity-oversized-string.invalid.json",
    expectedSchemaErrors: [{ keyword: "maxLength", instancePath: "/policy_version" }],
  },
  {
    schemaPath: "contracts/entity-draft.schema.json",
    vectorPath: "examples/contracts/entity-oversized-object.invalid.json",
    expectedSchemaErrors: [{ keyword: "maxProperties", instancePath: "/fields/0/value" }],
  },
  {
    schemaPath: "contracts/entity-draft.schema.json",
    vectorPath: "examples/contracts/entity-unknown-schema-version.invalid.json",
    expectedSchemaErrors: [{ keyword: "const", instancePath: "/schema_version" }],
  },
  {
    schemaPath: "contracts/entity-draft.schema.json",
    vectorPath: "examples/contracts/entity-unknown-policy-version.invalid.json",
    context: { allowedPolicyVersions: ["entity-policy-2026-01"] },
    expectedInvariantErrors: ["unknown_policy_version"],
  },
  { schemaPath: "contracts/entity-review-decision.schema.json", vectorPath: "examples/contracts/entity-review-decision.valid.json", expectedValid: true },
  {
    schemaPath: "contracts/entity-review-decision.schema.json",
    vectorPath: "examples/contracts/entity-review-missing-evidence.invalid.json",
    expectedSchemaErrors: [{ keyword: "minItems", instancePath: "/evidence_ids" }],
  },
  {
    schemaPath: "contracts/entity-review-decision.schema.json",
    vectorPath: "examples/contracts/entity-review-stale-binding.invalid.json",
    context: {
      expectedDraftId: "11111111-1111-4111-8111-111111111111",
      expectedDraftVersion: 2,
      expectedDraftHash: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    },
    expectedInvariantErrors: ["stale_draft_hash", "stale_draft_version"],
  },
  { schemaPath: "contracts/article-draft.schema.json", vectorPath: "examples/contracts/article-draft.valid.json", expectedValid: true },
  {
    schemaPath: "contracts/article-draft.schema.json",
    vectorPath: "examples/contracts/article-medical-editorial.invalid.json",
    expectedSchemaErrors: [{ keyword: "const", instancePath: "/claims/0/review_requirement" }],
  },
  {
    schemaPath: "contracts/article-draft.schema.json",
    vectorPath: "examples/contracts/article-agent-human-gates.invalid.json",
    expectedSchemaErrors: [
      { keyword: "enum", instancePath: "/quality_gates/editorial" },
      { keyword: "enum", instancePath: "/quality_gates/medical" },
    ],
  },
  {
    schemaPath: "contracts/article-draft.schema.json",
    vectorPath: "examples/contracts/article-duplicate-source-id.invalid.json",
    expectedInvariantErrors: ["duplicate_article_source_id"],
  },
  {
    schemaPath: "contracts/article-draft.schema.json",
    vectorPath: "examples/contracts/article-unsupported-locale.invalid.json",
    expectedSchemaErrors: [{ keyword: "enum", instancePath: "/locale" }],
  },
  {
    schemaPath: "contracts/article-draft.schema.json",
    vectorPath: "examples/contracts/article-oversized-array.invalid.json",
    expectedSchemaErrors: [{ keyword: "maxItems", instancePath: "/secondary_keywords" }],
  },
  { schemaPath: "contracts/article-review-decision.schema.json", vectorPath: "examples/contracts/article-review-decision.valid.json", expectedValid: true },
  {
    schemaPath: "contracts/article-review-decision.schema.json",
    vectorPath: "examples/contracts/article-medical-reviewer-role.invalid.json",
    expectedSchemaErrors: [{ keyword: "const", instancePath: "/reviewer/role" }],
  },
  { schemaPath: "contracts/automation-job.schema.json", vectorPath: "examples/contracts/automation-job.valid.json", expectedValid: true },
  {
    schemaPath: "contracts/automation-job.schema.json",
    vectorPath: "examples/contracts/automation-running-without-lease.invalid.json",
    expectedSchemaErrors: [{ keyword: "required", instancePath: "", params: { missingProperty: "lease" } }],
  },
  {
    schemaPath: "contracts/automation-job.schema.json",
    vectorPath: "examples/contracts/automation-budget-relationship.invalid.json",
    expectedInvariantErrors: ["attempt_count_exceeds_max_attempts", "estimated_exceeds_reserved"],
  },
  { schemaPath: "contracts/service-identity-claims.schema.json", vectorPath: "examples/contracts/service-identity.valid.json", expectedValid: true },
  {
    schemaPath: "contracts/service-identity-claims.schema.json",
    vectorPath: "examples/contracts/service-execute-without-fencing.invalid.json",
    expectedSchemaErrors: [
      { keyword: "required", instancePath: "", params: { missingProperty: "job_id" } },
      { keyword: "required", instancePath: "", params: { missingProperty: "lease_epoch" } },
    ],
  },
  {
    schemaPath: "contracts/service-identity-claims.schema.json",
    vectorPath: "examples/contracts/service-identity-ttl-too-long.invalid.json",
    expectedInvariantErrors: ["service_ttl_exceeds_300_seconds"],
  },
  {
    schemaPath: "contracts/service-identity-claims.schema.json",
    vectorPath: "examples/contracts/service-identity-stale-lease.invalid.json",
    context: {
      expectedJobId: "77777777-7777-4777-8777-777777777777",
      currentLeaseEpoch: 2,
    },
    expectedInvariantErrors: ["stale_lease_epoch"],
  },
  { schemaPath: "contracts/source-policy.schema.json", vectorPath: "examples/contracts/source-policy.valid.json", expectedValid: true },
  {
    schemaPath: "contracts/source-policy.schema.json",
    vectorPath: "examples/contracts/source-policy-approved-blocked.invalid.json",
    expectedSchemaErrors: [{ keyword: "const", instancePath: "/terms_status" }],
  },
  { schemaPath: "contracts/source-observation.schema.json", vectorPath: "examples/contracts/source-observation.valid.json", expectedValid: true },
  {
    schemaPath: "contracts/source-observation.schema.json",
    vectorPath: "examples/contracts/source-observation-denied-raw.invalid.json",
    expectedSchemaErrors: [{ keyword: "const", instancePath: "/raw_storage_class" }],
  },
  {
    schemaPath: "contracts/source-observation.schema.json",
    vectorPath: "examples/contracts/source-observation-http-scheme.invalid.json",
    expectedSchemaErrors: [
      { keyword: "pattern", instancePath: "/source_url" },
      { keyword: "pattern", instancePath: "/final_url" },
    ],
  },
  { schemaPath: "contracts/persian-report.schema.json", vectorPath: "examples/contracts/persian-report.valid.json", expectedValid: true },
];

const invalidVectorsWithoutReason = vectors.filter(
  (vector) => vector.expectedValid !== true && !vector.expectedSchemaErrors && !vector.expectedInvariantErrors,
);
check(invalidVectorsWithoutReason.length === 0, "every invalid vector declares its exact rejection reason");
check(new Set(vectors.map((vector) => vector.vectorPath)).size === vectors.length, "every vector path is unique");

for (const vector of vectors) {
  const { schemaPath, vectorPath, context = {} } = vector;
  const validator = validators.get(schemaPath);
  if (!validator) {
    errors.push(`${vectorPath} cannot run because ${schemaPath} did not compile`);
    continue;
  }
  let data;
  try {
    data = JSON.parse(await readFile(join(root, vectorPath), "utf8"));
  } catch (error) {
    errors.push(`${vectorPath} is not valid JSON: ${error.message}`);
    continue;
  }
  const schemaValid = validator(data);
  const schemaErrors = validator.errors ?? [];
  const invariantFailures = schemaValid ? runtimeInvariantErrors(schemaPath, data, context).sort() : [];
  if (vector.expectedValid) {
    check(schemaValid, `${vectorPath} is accepted by its schema`);
    check(invariantFailures.length === 0, `${vectorPath} passes all declared runtime invariants`);
    continue;
  }
  if (vector.expectedSchemaErrors) {
    check(!schemaValid, `${vectorPath} is rejected by its schema`);
    for (const expected of vector.expectedSchemaErrors) {
      check(
        schemaErrors.some((actual) => schemaErrorMatches(actual, expected)),
        `${vectorPath} rejects for ${expected.instancePath || "/"} ${expected.keyword}`,
      );
    }
    continue;
  }
  check(schemaValid, `${vectorPath} remains schema-valid before runtime checks`);
  check(
    JSON.stringify(invariantFailures) === JSON.stringify([...vector.expectedInvariantErrors].sort()),
    `${vectorPath} rejects for exact runtime invariants: ${vector.expectedInvariantErrors.join(", ")}`,
  );
}

const manifest = await readFile(join(root, "MANIFEST.md"), "utf8");
const manifestPaths = [...manifest.matchAll(/`([^`]+\.(?:md|json|mjs|example|sha256))`/g)].map((match) => match[1]);
for (const path of new Set(manifestPaths)) {
  check(await exists(join(root, path)), `manifest entry exists: ${path}`);
}
const expectedManifestPaths = allFiles
  .map((path) => relative(root, path))
  .filter((path) => !path.startsWith("node_modules/"))
  .sort();
const actualManifestPaths = [...new Set(manifestPaths)].sort();
check(JSON.stringify(actualManifestPaths) === JSON.stringify(expectedManifestPaths), "manifest covers every packaged file exactly");

const checksumText = await readFile(join(root, "CHECKSUMS.sha256"), "utf8");
const checksumEntries = checksumText.trim().split("\n").filter(Boolean).map((line) => {
  const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
  return match ? { expected: match[1], path: match[2] } : null;
});
check(checksumEntries.every(Boolean), "checksum file syntax is valid");
const expectedChecksumPaths = allFiles
  .map((path) => relative(root, path))
  .filter((path) => path !== "CHECKSUMS.sha256" && !path.startsWith("node_modules/"))
  .sort();
const actualChecksumPaths = checksumEntries.filter(Boolean).map((entry) => entry.path.replace(/^\.\//, "")).sort();
check(JSON.stringify(actualChecksumPaths) === JSON.stringify(expectedChecksumPaths), "checksum coverage matches every packaged file exactly");
for (const entry of checksumEntries.filter(Boolean)) {
  const path = entry.path.replace(/^\.\//, "");
  if (!(await exists(join(root, path)))) continue;
  const contents = await readFile(join(root, path));
  check(sha256(contents) === entry.expected, `checksum matches: ${path}`);
}

const staleRefs = [];
const historicalVersionFiles = new Set([
  "CHANGELOG.md",
  "VERSION.md",
  "16_PROBLEM_RESOLUTION_REGISTER.md",
  "package-lock.json",
]);
const previousPackageVersions = [
  ["1", "0", "0"],
  ["1", "1", "0"],
  ["1", "2", "0"],
  ["1", "2", "1"],
].map((parts) => parts.join("."));
for (const path of allFiles.filter((item) => /\.(?:md|json|mjs|example)$/.test(item))) {
  const rel = relative(root, path);
  if (historicalVersionFiles.has(rel)) continue;
  const contents = await readFile(path, "utf8");
  if (previousPackageVersions.some((version) => new RegExp(`\\bv?${version.replaceAll(".", "[.]")}\\b`).test(contents))) {
    staleRefs.push(rel);
  }
}
check(staleRefs.length === 0, `no stale package-version references outside explicit history${staleRefs.length ? `: ${staleRefs.join(", ")}` : ""}`);

if (errors.length) {
  console.error(`FAILED: ${errors.length} of ${checks.length + errors.length} checks failed`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`PASS: ${checks.length} reproducible checks`);
console.log(`Files: ${allFiles.length}; schemas: ${schemas.size}; vectors: ${vectors.length}; manifest entries: ${new Set(manifestPaths).size}`);
