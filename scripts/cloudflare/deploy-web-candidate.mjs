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

const hospitalApi = await request(
  "pages_api_hospital_not_found",
  "/api/_drk/public-hospital-profile/en/om/cloudflare-migration-nonexistent-hospital",
  {},
  [404],
);
if ((hospitalApi.response.headers.get("cache-control") ?? "").toLowerCase() !== "no-store, private") {
  throw new Error("Pages API hospital 404 cache contract drift detected");
}

for (const [label, html] of [
  ["public_en", en.text],
  ["public_ar", ar.text],
]) {
  const canonical = htmlAttribute(html, "canonical", "href");
  if (!canonical || !canonical.startsWith(`${canonicalAppUrl}/`)) {
    throw new Error(`${label} canonical drift detected`);
  }
  if (html.includes("workers.dev")) {
    throw new Error(`${label} leaked the candidate hostname into rendered SEO output`);
  }
  console.log(`${label}: canonical preserved`);

  const alternates = alternateLinks(html);
  for (const locale of ["en", "ar"]) {
    const alternate = alternates.find((entry) => entry.hreflang.toLowerCase() === locale);
    if (!alternate || !alternate.href.startsWith(`${canonicalAppUrl}/${locale}/om`)) {
      throw new Error(`${label} hreflang ${locale} drift detected`);
    }
  }
  console.log(`${label}: hreflang en/ar preserved`);
}

for (const required of ["Disallow: /api/", "Disallow: /admin/", `Sitemap: ${canonicalAppUrl}/sitemap.xml`]) {
  if (!robots.text.includes(required)) {
    throw new Error(`robots contract missing: ${required}`);
  }
}
if (robots.text.includes("workers.dev")) {
  throw new Error("robots leaked candidate hostname");
}
console.log("robots: admin/api blocks and canonical sitemap preserved");

for (const requiredUrl of [`${canonicalAppUrl}/en/om`, `${canonicalAppUrl}/ar/om`]) {
  if (!sitemap.text.includes(requiredUrl)) {
    throw new Error(`sitemap missing required market root ${requiredUrl}`);
  }
}
if (sitemap.text.includes("workers.dev")) {
  throw new Error("sitemap leaked candidate hostname");
}
console.log("sitemap: EN/AR market roots and canonical domain preserved");

const staticAssetPath = en.text.match(/["'](\/_next\/static\/[^"']+\.(?:js|css))["']/i)?.[1];
if (!staticAssetPath) {
  throw new Error("could not discover a rendered Next static asset for candidate smoke");
}
const staticAsset = await request("static_asset", staticAssetPath, {}, [200]);
if ((staticAsset.response.headers.get("content-type") ?? "").toLowerCase().includes("text/html")) {
  throw new Error("static asset unexpectedly returned HTML");
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
