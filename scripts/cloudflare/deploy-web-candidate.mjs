import { spawn, spawnSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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

for (const forbidden of [
  "SUPABASE_SERVICE_ROLE_KEY",
  "PRODUCTION_SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "SUPABASE_DB_URL",
  "PRODUCTION_DATABASE_URL",
  "IMPORT_PREVIEW_APPROVAL_TOKEN",
  "IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN",
]) {
  delete childEnv[forbidden];
}

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

function readBuiltJavaScript(directory) {
  let output = "";
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output += readBuiltJavaScript(path);
    else if (entry.name.endsWith(".js")) output += readFileSync(path, "utf8");
  }
  return output;
}

function findActionId(source, exportName) {
  const escapedExportName = exportName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    "[\"'`]([0-9a-f]{12})[\"'`]\\s*,\\s*[\"'`]" + escapedExportName + "[\"'`]",
  );
  const match = source.match(pattern);
  if (!match) throw new Error(`Missing built action id for ${exportName}`);
  return `${match[1]}#${exportName}`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("Building Vinext candidate with Preview public environment only...");
run("pnpm", ["build:vinext"]);

const builtSource = readBuiltJavaScript("dist/server");
const safeAuthActionId = findActionId(
  builtSource,
  "verifyCloudflareServerActionRuntimeBoundary",
);
console.log("server_action_probe_id=DISCOVERED_NON_MUTATING");

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

function htmlAttribute(html, rel, attribute) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const relValue = tag.match(/\brel=["']([^"']+)["']/i)?.[1];
    if (relValue?.split(/\s+/).includes(rel)) {
      const value = tag.match(new RegExp(`\\b${attribute}=["']([^"']+)["']`, "i"))?.[1];
      if (value) return value;
    }
  }
  return null;
}

function alternateLinks(html) {
  const links = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "";
    if (!rel.split(/\s+/).includes("alternate")) continue;
    const hreflang = tag.match(/\bhreflang=["']([^"']+)["']/i)?.[1];
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (hreflang && href) links.push({ hreflang, href });
  }
  return links;
}

console.log("Running non-mutating candidate smoke...");

await request("root", "/", {}, [301, 302, 307, 308]);
const en = await request("public_en", "/en/om", {}, [200]);
const ar = await request("public_ar", "/ar/om", {}, [200]);
await request("admin_login", "/admin/login", {}, [200]);
await request("auth_callback_no_code", "/auth/callback?next=%2Fadmin", {}, [301, 302, 303, 307, 308]);
const robots = await request("robots", "/robots.txt", {}, [200]);
const sitemap = await request("sitemap", "/sitemap.xml", {}, [200]);

const automation = await request(
  "automation_fail_closed",
  "/api/internal/automation",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  },
  [503],
);
if (!automation.text.includes("automation_preview_boundary_closed")) {
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

const hospitalApi = await request(
  "pages_api_hospital_not_found",
  "/api/_drk/public-hospital-profile/en/om/cloudflare-migration-nonexistent-hospital",
  {},
  [404],
);
if ((hospitalApi.response.headers.get("cache-control") ?? "").toLowerCase() !== "no-store, private") {
  throw new Error("Pages API hospital 404 cache contract drift detected");
}

const actionResponse = await fetch(`${baseUrl}/admin/center-subscriptions`, {
  method: "POST",
  redirect: "manual",
  signal: AbortSignal.timeout(20_000),
  headers: {
    accept: "text/x-component",
    "content-type": "text/plain;charset=UTF-8",
    "next-action": safeAuthActionId,
    origin: baseUrl,
  },
  body: "[]",
});
const actionBody = await actionResponse.text();
console.log(`server_action_unauthenticated: HTTP ${actionResponse.status}`);
if (actionResponse.headers.get("x-nextjs-action-not-found") === "1") {
  throw new Error("Non-mutating Server Action probe was not recognized by the deployed Vinext runtime");
}
if (actionResponse.status !== 303 || actionResponse.headers.get("x-action-redirect") !== "/admin/login") {
  console.error(`server_action_redirect=${actionResponse.headers.get("x-action-redirect") ?? "<none>"}`);
  console.error(`server_action_body=${boundedTail(actionBody, 2_000)}`);
  throw new Error("Non-mutating Server Action auth/session gate did not redirect unauthenticated execution to /admin/login");
}
console.log("server_action_unauthenticated: non-mutating action recognized and blocked by admin auth gate");

const expectedSeo = {
  public_en: {
    canonical: `${canonicalAppUrl}/en/om`,
    alternates: {
      "en-om": `${canonicalAppUrl}/en/om`,
      "ar-om": `${canonicalAppUrl}/ar/om`,
      en: `${canonicalAppUrl}/en/om`,
      ar: `${canonicalAppUrl}/ar/om`,
      "x-default": `${canonicalAppUrl}/en/om`,
    },
  },
  public_ar: {
    canonical: `${canonicalAppUrl}/ar/om`,
    alternates: {
      "en-om": `${canonicalAppUrl}/en/om`,
      "ar-om": `${canonicalAppUrl}/ar/om`,
      en: `${canonicalAppUrl}/en/om`,
      ar: `${canonicalAppUrl}/ar/om`,
      "x-default": `${canonicalAppUrl}/en/om`,
    },
  },
};

for (const [label, html] of [
  ["public_en", en.text],
  ["public_ar", ar.text],
]) {
  const expected = expectedSeo[label];
  const canonical = htmlAttribute(html, "canonical", "href");
  if (canonical !== expected.canonical) {
    throw new Error(`${label} canonical drift detected`);
  }
  if (html.includes("workers.dev")) {
    throw new Error(`${label} leaked the candidate hostname into rendered SEO output`);
  }
  console.log(`${label}: canonical preserved`);

  const alternates = new Map(
    alternateLinks(html).map((entry) => [entry.hreflang.toLowerCase(), entry.href]),
  );
  for (const [hreflang, expectedHref] of Object.entries(expected.alternates)) {
    if (alternates.get(hreflang) !== expectedHref) {
      throw new Error(`${label} hreflang ${hreflang} drift detected`);
    }
  }
  console.log(`${label}: hreflang en-OM/ar-OM/en/ar/x-default preserved`);
}

const requiredRobotsLines = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /api/",
  "Disallow: /admin/",
  "Disallow: /dashboard/",
  "Disallow: /import/",
  "Disallow: /preview/",
  "Disallow: /demo/",
  "Disallow: /en/om/demo/",
  "Disallow: /ar/om/demo/",
  `Sitemap: ${canonicalAppUrl}/sitemap.xml`,
];
for (const required of requiredRobotsLines) {
  if (!robots.text.includes(required)) {
    throw new Error(`robots contract missing: ${required}`);
  }
}
if (robots.text.includes("workers.dev")) {
  throw new Error("robots leaked candidate hostname");
}
console.log("robots: full sensitive-path block contract and canonical sitemap preserved");

const sitemapLocs = Array.from(
  sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/gi),
  (match) => match[1].trim(),
);
if (sitemapLocs.length === 0) {
  throw new Error("sitemap returned no loc entries");
}
for (const loc of sitemapLocs) {
  if (!loc.startsWith(`${canonicalAppUrl}/`)) {
    throw new Error(`sitemap contains non-canonical-domain URL: ${loc}`);
  }
}
for (const requiredUrl of [
  `${canonicalAppUrl}/en/om`,
  `${canonicalAppUrl}/ar/om`,
  `${canonicalAppUrl}/en/om/doctors`,
  `${canonicalAppUrl}/ar/om/doctors`,
]) {
  if (!sitemapLocs.includes(requiredUrl)) {
    throw new Error(`sitemap missing required static URL ${requiredUrl}`);
  }
}
console.log("sitemap: canonical-domain purity and representative EN/AR static entries preserved");

const staticAssetPath = en.text.match(/["'](\/_next\/static\/[^"']+\.(?:js|css))["']/i)?.[1];
if (!staticAssetPath) {
  throw new Error("could not discover a rendered Next static asset for candidate smoke");
}
const staticAsset = await request("static_asset", staticAssetPath, {}, [200]);
const staticAssetContentType = (staticAsset.response.headers.get("content-type") ?? "").toLowerCase();
if (staticAssetPath.toLowerCase().endsWith(".js")) {
  if (!staticAssetContentType.includes("javascript") && !staticAssetContentType.includes("ecmascript")) {
    throw new Error(`JavaScript static asset returned unexpected content-type ${staticAssetContentType || "<none>"}`);
  }
} else if (!staticAssetContentType.includes("text/css")) {
  throw new Error(`CSS static asset returned unexpected content-type ${staticAssetContentType || "<none>"}`);
}
console.log(`static_asset: content-type ${staticAssetContentType}`);

console.log("Starting Worker Tail error-only observation...");
const tail = spawn(
  "pnpm",
  [
    "exec",
    "wrangler",
    "tail",
    candidateName,
    "--config",
    candidatePath,
    "--format",
    "json",
    "--status",
    "error",
    "--sampling-rate",
    "0.99",
  ],
  { cwd: process.cwd(), env: childEnv, stdio: ["ignore", "pipe", "pipe"] },
);
let tailStdout = "";
let tailStderr = "";
tail.stdout.setEncoding("utf8");
tail.stderr.setEncoding("utf8");
tail.stdout.on("data", (chunk) => { tailStdout = (tailStdout + chunk).slice(-100_000); });
tail.stderr.on("data", (chunk) => { tailStderr = (tailStderr + chunk).slice(-50_000); });

await sleep(2_500);
if (tail.exitCode !== null) {
  throw new Error(`Worker Tail exited before observation: ${boundedTail(tailStderr, 4_000)}`);
}

const loadRequests = Array.from({ length: 20 }, () =>
  fetch(`${baseUrl}/en/om`, { signal: AbortSignal.timeout(20_000) })
    .then((response) => response.status),
);
const loadStatuses = await Promise.all(loadRequests);
const load5xx = loadStatuses.filter((status) => status >= 500);
if (load5xx.length) {
  tail.kill("SIGINT");
  throw new Error(`controlled load produced ${load5xx.length} 5xx responses`);
}
await sleep(2_000);
tail.kill("SIGINT");
await Promise.race([
  new Promise((resolve) => tail.once("close", resolve)),
  sleep(3_000),
]);

const tailEvents = tailStdout
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("{") && line.endsWith("}"));
if (tailEvents.length > 0) {
  console.error(`TAIL_ERROR_EVENTS=${tailEvents.length}`);
  console.error(boundedTail(tailStdout, 8_000));
  throw new Error("Worker Tail observed invocation errors during controlled load");
}
console.log(`controlled_load: ${loadStatuses.length} requests, zero 5xx`);
console.log("worker_tail: error-only observation recorded zero invocation errors");

console.log("CANDIDATE_GATE=GREEN");
console.log("No Production DNS, custom-domain route, service-role key, automation Production authority, publish, rollback, index or sitemap authority was enabled by this runner.");
