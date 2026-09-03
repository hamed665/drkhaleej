import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const REQUIRED = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "PREVIEW_PROJECT_REF",
  "PREVIEW_SUPABASE_ANON_KEY",
];

for (const name of REQUIRED) {
  if (!process.env[name]) {
    console.error(`${name}=MISSING`);
    process.exit(2);
  }
  console.log(`${name}=PRESENT`);
}

const candidateName = "drkhaleej-web-candidate";
const canonicalAppUrl = "https://www.drkhaleej.com";
const previewProjectRef = process.env.PREVIEW_PROJECT_REF;
const previewSupabaseUrl = `https://${previewProjectRef}.supabase.co`;

const childEnv = {
  ...process.env,
  NEXT_PUBLIC_APP_URL: canonicalAppUrl,
  NEXT_PUBLIC_SITE_NAME: "DrKhaleej",
  NEXT_PUBLIC_DEFAULT_LOCALE: "en",
  NEXT_PUBLIC_SUPPORTED_LOCALES: "en,ar",
  NEXT_PUBLIC_DEFAULT_COUNTRY: "om",
  NEXT_PUBLIC_ALLOWED_PUBLIC_LOCALES: "en,ar",
  NEXT_PUBLIC_ALLOWED_PUBLIC_COUNTRIES: "om",
  NEXT_PUBLIC_ENABLE_INDEXING: "false",
  NEXT_PUBLIC_SUPABASE_URL: previewSupabaseUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.PREVIEW_SUPABASE_ANON_KEY,
  DRMUSCAT_PUBLIC_FAQ_CMS_ENABLED: "false",
};

function sanitize(text) {
  let result = String(text ?? "");
  for (const secret of [
    process.env.CLOUDFLARE_API_TOKEN,
    process.env.CLOUDFLARE_ACCOUNT_ID,
    process.env.PREVIEW_PROJECT_REF,
    process.env.PREVIEW_SUPABASE_ANON_KEY,
  ]) {
    if (secret) result = result.split(secret).join("<redacted>");
  }
  return result;
}

function boundedTail(text, maxChars = 12_000) {
  const safe = sanitize(text);
  if (safe.length <= maxChars) return safe;
  return `[earlier output omitted; showing final ${maxChars} characters]\n${safe.slice(-maxChars)}`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: childEnv,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    ...options,
  });

  if (result.status !== 0) {
    console.error(`COMMAND_FAILED=${sanitize([command, ...args].join(" "))}`);
    console.error("STDOUT_TAIL_BEGIN");
    console.error(boundedTail(result.stdout));
    console.error("STDOUT_TAIL_END");
    console.error("STDERR_TAIL_BEGIN");
    console.error(boundedTail(result.stderr));
    console.error("STDERR_TAIL_END");
    process.exit(result.status ?? 1);
  }

  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

console.log("Building Vinext candidate with Preview public environment only...");
run("pnpm", ["build:vinext"]);

const generatedPath = "dist/server/wrangler.json";
const candidatePath = "dist/server/wrangler.candidate.json";
const config = JSON.parse(readFileSync(generatedPath, "utf8"));

config.name = candidateName;
config.workers_dev = true;
config.preview_urls = true;
delete config.route;
delete config.routes;

config.vars = {
  ...(config.vars ?? {}),
  NEXT_PUBLIC_APP_URL: canonicalAppUrl,
  NEXT_PUBLIC_SITE_NAME: "DrKhaleej",
  NEXT_PUBLIC_DEFAULT_LOCALE: "en",
  NEXT_PUBLIC_SUPPORTED_LOCALES: "en,ar",
  NEXT_PUBLIC_DEFAULT_COUNTRY: "om",
  NEXT_PUBLIC_ALLOWED_PUBLIC_LOCALES: "en,ar",
  NEXT_PUBLIC_ALLOWED_PUBLIC_COUNTRIES: "om",
  NEXT_PUBLIC_ENABLE_INDEXING: "false",
  NEXT_PUBLIC_SUPABASE_URL: previewSupabaseUrl,
  DRMUSCAT_PUBLIC_FAQ_CMS_ENABLED: "false",
};

writeFileSync(candidatePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

console.log("Deploying isolated workers.dev candidate; no custom domain or route is configured...");
const deployOutput = run("pnpm", [
  "exec",
  "wrangler",
  "deploy",
  "--config",
  candidatePath,
  "--name",
  candidateName,
]);

console.log("Attaching Preview publishable key as a Worker secret binding...");
run(
  "pnpm",
  [
    "exec",
    "wrangler",
    "secret",
    "put",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "--config",
    candidatePath,
    "--name",
    candidateName,
  ],
  { input: `${process.env.PREVIEW_SUPABASE_ANON_KEY}\n` },
);

const workerUrls = deployOutput.match(/https:\/\/[A-Za-z0-9.-]+\.workers\.dev(?:\/[^\s]*)?/g) ?? [];
const baseUrl = workerUrls.at(-1)?.replace(/[),.;]+$/, "").replace(/\/$/, "");
if (!baseUrl) {
  console.error("Candidate deployed but workers.dev URL could not be extracted from Wrangler output.");
  process.exit(3);
}

console.log(`Candidate URL: ${baseUrl}`);

async function request(label, path, init = {}, allowedStatuses = null) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
    ...init,
  });
  const text = await response.text();
  console.log(`${label}: HTTP ${response.status}`);

  const explicitlyAllowed = allowedStatuses?.includes(response.status) ?? false;
  if (allowedStatuses && !explicitlyAllowed) {
    if (response.status >= 500) {
      console.error(`${label}: unexplained 5xx diagnostics`);
      console.error(`content-type=${response.headers.get("content-type") ?? "<none>"}`);
      console.error(`server=${response.headers.get("server") ?? "<none>"}`);
      console.error(`cf-ray=${response.headers.get("cf-ray") ?? "<none>"}`);
      console.error("BODY_TAIL_BEGIN");
      console.error(boundedTail(text, 8_000));
      console.error("BODY_TAIL_END");
    }
    throw new Error(`${label} returned unexpected status ${response.status}`);
  }
  if (!allowedStatuses && response.status >= 500) {
    throw new Error(`${label} returned ${response.status}`);
  }
  return { response, text };
}

console.log("Running non-mutating candidate smoke...");

await request("root", "/", {}, [301, 302, 307, 308]);
const en = await request("public_en", "/en/om", {}, [200]);
const ar = await request("public_ar", "/ar/om", {}, [200]);
await request("admin_login", "/admin/login", {}, [200]);
await request("auth_callback_no_code", "/auth/callback?next=%2Fadmin", {}, [301, 302, 303, 307, 308]);
await request("robots", "/robots.txt", {}, [200]);

const automation = await request(
  "automation_fail_closed",
  "/api/internal/automation",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  },
  [400, 401, 403, 503],
);
if (automation.response.status === 503 && !automation.text.includes("automation_preview_boundary_closed")) {
  throw new Error("automation fail-closed 503 did not carry the expected preview-boundary code");
}

await request(
  "callback_invalid",
  "/api/callback-requests",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  },
  [400, 422],
);

await request(
  "provider_onboarding_invalid",
  "/api/provider-onboarding-leads",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  },
  [400, 422],
);

for (const [label, html] of [
  ["public_en", en.text],
  ["public_ar", ar.text],
]) {
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
  if (!canonical || !canonical.startsWith(`${canonicalAppUrl}/`)) {
    throw new Error(`${label} canonical drift detected`);
  }
  console.log(`${label}: canonical preserved`);
}

const loadRequests = Array.from({ length: 20 }, () =>
  fetch(`${baseUrl}/en/om`, { signal: AbortSignal.timeout(20_000) })
    .then((response) => response.status),
);
const loadStatuses = await Promise.all(loadRequests);
const load5xx = loadStatuses.filter((status) => status >= 500);
if (load5xx.length) {
  throw new Error(`controlled load produced ${load5xx.length} 5xx responses`);
}
console.log(`controlled_load: ${loadStatuses.length} requests, zero 5xx`);

console.log("CANDIDATE_GATE=GREEN");
console.log("No Production DNS, custom-domain route, service-role key, automation Production authority, publish, rollback, index or sitemap authority was enabled by this runner.");
