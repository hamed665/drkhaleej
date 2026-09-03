import { spawn } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CANONICAL_APP_URL = "https://www.drkhaleej.com";
const APEX_HOST = "drkhaleej.com";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readBuiltJavaScript(directory) {
  let output = "";
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output += readBuiltJavaScript(path);
    else if (entry.name.endsWith(".js")) output += readFileSync(path, "utf8");
  }
  return output;
}

export function discoverSafeServerActionId() {
  const source = readBuiltJavaScript("dist/server");
  const exportName = "verifyCloudflareServerActionRuntimeBoundary";
  const escaped = exportName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(
    new RegExp("[\"'`]([0-9a-f]{12})[\"'`]\\s*,\\s*[\"'`]" + escaped + "[\"'`]"),
  );
  if (!match) throw new Error(`Missing built action id for ${exportName}`);
  console.log("server_action_probe_id=DISCOVERED_NON_MUTATING");
  return `${match[1]}#${exportName}`;
}

async function fetchTimed(url, init = {}) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
}

async function request(baseUrl, label, path, init = {}, statuses = null) {
  const response = await fetchTimed(`${baseUrl}${path}`, {
    redirect: "manual",
    ...init,
  });
  const text = await response.text();
  console.log(`${label}: HTTP ${response.status}`);
  if (statuses ? !statuses.includes(response.status) : response.status >= 500) {
    throw new Error(`${label} returned unexpected status ${response.status}`);
  }
  return { response, text };
}

function linkAttribute(html, rel, attribute) {
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const relValue = tag.match(/\brel=["']([^"']+)["']/i)?.[1];
    if (!relValue?.split(/\s+/).includes(rel)) continue;
    const value = tag.match(new RegExp(`\\b${attribute}=["']([^"']+)["']`, "i"))?.[1];
    if (value) return value;
  }
  return null;
}

function alternates(html) {
  const result = new Map();
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "";
    if (!rel.split(/\s+/).includes("alternate")) continue;
    const lang = tag.match(/\bhreflang=["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (lang && href) result.set(lang, href);
  }
  return result;
}

function assertSeo(html, locale) {
  const expectedCanonical = `${CANONICAL_APP_URL}/${locale}/om`;
  if (linkAttribute(html, "canonical", "href") !== expectedCanonical) {
    throw new Error(`${locale} canonical drift detected`);
  }
  if (html.includes("workers.dev")) {
    throw new Error(`${locale} leaked workers.dev into SEO output`);
  }
  const expected = {
    "en-om": `${CANONICAL_APP_URL}/en/om`,
    "ar-om": `${CANONICAL_APP_URL}/ar/om`,
    en: `${CANONICAL_APP_URL}/en/om`,
    ar: `${CANONICAL_APP_URL}/ar/om`,
    "x-default": `${CANONICAL_APP_URL}/en/om`,
  };
  const actual = alternates(html);
  for (const [lang, href] of Object.entries(expected)) {
    if (actual.get(lang) !== href) throw new Error(`${locale} hreflang ${lang} drift detected`);
  }
}

function assertRobots(text) {
  const lines = new Set(
    text.split(/\r?\n/).map((line) => line.trim().toLowerCase()).filter(Boolean),
  );
  for (const line of [
    "user-agent: *",
    "allow: /",
    "disallow: /api/",
    "disallow: /admin/",
    "disallow: /dashboard/",
    "disallow: /import/",
    "disallow: /preview/",
    "disallow: /demo/",
    "disallow: /en/om/demo/",
    "disallow: /ar/om/demo/",
    `sitemap: ${CANONICAL_APP_URL}/sitemap.xml`,
  ]) {
    if (!lines.has(line.toLowerCase())) throw new Error(`robots contract missing: ${line}`);
  }
}

function assertSitemap(text) {
  const locs = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/gi), (match) => match[1].trim());
  if (!locs.length) throw new Error("sitemap returned no loc entries");
  if (locs.some((loc) => !loc.startsWith(`${CANONICAL_APP_URL}/`))) {
    throw new Error("sitemap contains a non-canonical-domain URL");
  }
  for (const loc of [
    `${CANONICAL_APP_URL}/en/om`,
    `${CANONICAL_APP_URL}/ar/om`,
    `${CANONICAL_APP_URL}/en/om/doctors`,
    `${CANONICAL_APP_URL}/ar/om/doctors`,
  ]) {
    if (!locs.includes(loc)) throw new Error(`sitemap missing ${loc}`);
  }
}

async function assertServerAction(baseUrl, actionId) {
  const response = await fetchTimed(`${baseUrl}/admin/center-subscriptions`, {
    method: "POST",
    redirect: "manual",
    headers: {
      accept: "text/x-component",
      "content-type": "text/plain;charset=UTF-8",
      "next-action": actionId,
      origin: baseUrl,
    },
    body: "[]",
  });
  await response.body?.cancel().catch(() => {});
  if (response.headers.get("x-nextjs-action-not-found") === "1") {
    throw new Error("Non-mutating Server Action was not recognized");
  }
  if (response.status !== 303 || response.headers.get("x-action-redirect") !== "/admin/login") {
    throw new Error("Non-mutating Server Action auth boundary drift detected");
  }
  console.log("server_action_unauthenticated=AUTH_REDIRECT_OK");
}

export async function runRuntimeSmoke(baseUrl, actionId, { productionDomain = false } = {}) {
  const root = await request(baseUrl, "root", "/", {}, [301, 302, 307, 308]);
  const en = await request(baseUrl, "public_en", "/en/om", {}, [200]);
  const ar = await request(baseUrl, "public_ar", "/ar/om", {}, [200]);
  await request(baseUrl, "admin_login", "/admin/login", {}, [200]);
  await request(
    baseUrl,
    "auth_callback_no_code",
    "/auth/callback?next=%2Fadmin",
    {},
    [301, 302, 303, 307, 308],
  );
  const robots = await request(baseUrl, "robots", "/robots.txt", {}, [200]);
  const sitemap = await request(baseUrl, "sitemap", "/sitemap.xml", {}, [200]);

  const automation = await request(
    baseUrl,
    "automation_fail_closed",
    "/api/internal/automation",
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
    [503],
  );
  if (!automation.text.includes("automation_preview_boundary_closed")) {
    throw new Error("automation fail-closed boundary code drift detected");
  }

  await request(
    baseUrl,
    "callback_invalid",
    "/api/callback-requests",
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
    [400, 422],
  );
  await request(
    baseUrl,
    "provider_onboarding_invalid",
    "/api/provider-onboarding-leads",
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
    [400, 422],
  );

  const hospital = await request(
    baseUrl,
    "pages_api_hospital_not_found",
    "/api/_drk/public-hospital-profile/en/om/cloudflare-migration-nonexistent-hospital",
    {},
    [404],
  );
  if ((hospital.response.headers.get("cache-control") ?? "").toLowerCase() !== "no-store, private") {
    throw new Error("Pages API hospital 404 cache contract drift detected");
  }

  await assertServerAction(baseUrl, actionId);
  assertSeo(en.text, "en");
  assertSeo(ar.text, "ar");
  assertRobots(robots.text);
  assertSitemap(sitemap.text);

  const assetPath = en.text.match(/["'](\/_next\/static\/[^"']+\.(?:js|css))["']/i)?.[1];
  if (!assetPath) throw new Error("could not discover a rendered static asset");
  const asset = await request(baseUrl, "static_asset", assetPath, {}, [200]);
  const type = (asset.response.headers.get("content-type") ?? "").toLowerCase();
  if (
    (assetPath.endsWith(".js") && !type.includes("javascript") && !type.includes("ecmascript")) ||
    (assetPath.endsWith(".css") && !type.includes("text/css"))
  ) {
    throw new Error(`static asset MIME drift: ${type || "<none>"}`);
  }

  if (productionDomain) {
    const apex = await fetchTimed(
      `https://${APEX_HOST}/ar/om/doctors?specialty=cardiology`,
      { redirect: "manual" },
    );
    await apex.body?.cancel().catch(() => {});
    if (
      apex.status !== 308 ||
      apex.headers.get("location") !==
        `${CANONICAL_APP_URL}/ar/om/doctors?specialty=cardiology`
    ) {
      throw new Error("apex -> www 308 contract drift detected");
    }

    for (const response of [root.response, en.response, ar.response]) {
      if (
        (response.headers.get("server") ?? "").toLowerCase().includes("vercel") ||
        response.headers.has("x-vercel-id")
      ) {
        throw new Error("post-cutover response still identifies Vercel");
      }
    }

    const metaRobots = en.text.match(
      /<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["']([^"']+)["'])[^>]*>/i,
    )?.[1] ?? "";
    if (
      metaRobots.toLowerCase().includes("noindex") ||
      (en.response.headers.get("x-robots-tag") ?? "").toLowerCase().includes("noindex")
    ) {
      throw new Error("Production indexing is still disabled");
    }
  }

  console.log(productionDomain ? "PRODUCTION_DOMAIN_SMOKE=GREEN" : "PRODUCTION_STAGE_SMOKE=GREEN");
}

export async function observeTailAndLoad({
  baseUrl,
  workerName,
  configPath,
  env,
  sanitize = (value) => String(value ?? ""),
}) {
  const tail = spawn(
    "pnpm",
    [
      "exec",
      "wrangler",
      "tail",
      workerName,
      "--config",
      configPath,
      "--format",
      "json",
      "--status",
      "error",
      "--sampling-rate",
      "0.99",
    ],
    { cwd: process.cwd(), env, stdio: ["ignore", "pipe", "pipe"] },
  );
  let stdout = "";
  let stderr = "";
  tail.stdout.setEncoding("utf8");
  tail.stderr.setEncoding("utf8");
  tail.stdout.on("data", (chunk) => { stdout = (stdout + chunk).slice(-100_000); });
  tail.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-50_000); });

  await sleep(2_500);
  if (tail.exitCode !== null) {
    throw new Error(`Worker Tail exited early: ${sanitize(stderr.slice(-4_000))}`);
  }

  try {
    const statuses = await Promise.all(
      Array.from({ length: 20 }, async () => {
        const response = await fetchTimed(`${baseUrl}/en/om`);
        await response.body?.cancel().catch(() => {});
        return response.status;
      }),
    );
    if (statuses.some((status) => status >= 500)) {
      throw new Error("controlled load produced unexplained 5xx");
    }
    await sleep(2_000);
    console.log("controlled_load=20_REQUESTS_ZERO_5XX");
  } finally {
    tail.kill("SIGINT");
    await Promise.race([
      new Promise((resolve) => tail.once("close", resolve)),
      sleep(3_000),
    ]);
  }

  const events = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("{") && line.endsWith("}"));
  if (events.length) throw new Error(`Worker Tail observed ${events.length} error event(s)`);
  console.log("worker_tail=ZERO_INVOCATION_ERRORS");
}
