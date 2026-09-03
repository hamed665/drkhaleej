import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

import {
  discoverSafeServerActionId,
  observeTailAndLoad,
  runRuntimeSmoke,
} from "./production-runtime-smoke.mjs";

const REQUIRED = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "PREVIEW_PROJECT_REF",
  "PRODUCTION_PROJECT_REF",
  "PRODUCTION_SUPABASE_ANON_KEY",
  "PRODUCTION_SUPABASE_SERVICE_ROLE_KEY",
];

for (const name of REQUIRED) {
  if (!process.env[name]) {
    console.error(`${name}=MISSING`);
    process.exit(2);
  }
  console.log(`${name}=PRESENT`);
}

const modeIndex = process.argv.indexOf("--mode");
const mode = modeIndex >= 0 ? process.argv[modeIndex + 1] : "stage";
if (!["stage", "cutover"].includes(mode)) throw new Error("MODE_INVALID");
if (process.env.PREVIEW_PROJECT_REF === process.env.PRODUCTION_PROJECT_REF) {
  throw new Error("SUPABASE_IDENTITY=INVALID_SAME_PREVIEW_AND_PRODUCTION");
}
if (mode === "cutover" && process.env.GITHUB_REF_NAME && process.env.GITHUB_REF_NAME !== "main") {
  throw new Error("CUTOVER_REF_INVALID_REQUIRES_MAIN");
}

const workerName = "drkhaleej-web-production";
const zoneName = "drkhaleej.com";
const apexHost = zoneName;
const canonicalHost = "www.drkhaleej.com";
const canonicalAppUrl = `https://${canonicalHost}`;
const baselineWwwCname = "99f83eafeb1926bc.vercel-dns-017.com";
const productionSupabaseUrl = `https://${process.env.PRODUCTION_PROJECT_REF}.supabase.co`;
const generatedWranglerConfig = "dist/server/wrangler.json";
const WEB_ROUTING_TYPES = new Set(["A", "AAAA", "CNAME"]);
const TARGET_HOSTS = new Set([apexHost, canonicalHost]);

const secrets = [
  process.env.CLOUDFLARE_API_TOKEN,
  process.env.CLOUDFLARE_ACCOUNT_ID,
  process.env.PREVIEW_PROJECT_REF,
  process.env.PRODUCTION_PROJECT_REF,
  process.env.PRODUCTION_SUPABASE_ANON_KEY,
  process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY,
].filter(Boolean);

function sanitize(value) {
  let text = String(value ?? "");
  for (const secret of secrets) text = text.split(secret).join("<redacted>");
  return text;
}

const childEnv = {
  ...process.env,
  NEXT_PUBLIC_APP_URL: canonicalAppUrl,
  NEXT_PUBLIC_SITE_NAME: "DrKhaleej",
  NEXT_PUBLIC_DEFAULT_LOCALE: "en",
  NEXT_PUBLIC_SUPPORTED_LOCALES: "en,ar",
  NEXT_PUBLIC_DEFAULT_COUNTRY: "om",
  NEXT_PUBLIC_ALLOWED_PUBLIC_LOCALES: "en,ar",
  NEXT_PUBLIC_ALLOWED_PUBLIC_COUNTRIES: "om",
  NEXT_PUBLIC_SUPABASE_URL: productionSupabaseUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.PRODUCTION_SUPABASE_ANON_KEY,
  DRMUSCAT_PUBLIC_FAQ_CMS_ENABLED: "false",
  APP_ENV: "production",
  AUTOMATION_EMERGENCY_ENABLED: "false",
  AUTOMATION_RUNTIME_PROBE_ENABLED: "false",
};

for (const name of [
  "SUPABASE_SERVICE_ROLE_KEY",
  "PRODUCTION_SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "SUPABASE_DB_URL",
  "PRODUCTION_DATABASE_URL",
  "AUTOMATION_INTERNAL_API_BASE_URL",
  "AUTOMATION_SERVICE_KEY_ID",
  "AUTOMATION_SERVICE_PRIVATE_KEY_PEM_BASE64",
  "AUTOMATION_SERVICE_PUBLIC_JWKS_JSON",
  "AUTOMATION_PREVIEW_PROJECT_REF",
  "AUTOMATION_PRODUCTION_PROJECT_REF",
  "IMPORT_PREVIEW_APPROVAL_TOKEN",
  "IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN",
]) {
  delete childEnv[name];
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
    console.error(sanitize((result.stdout ?? "").slice(-8_000)));
    console.error(sanitize((result.stderr ?? "").slice(-8_000)));
    throw new Error(`command failed with status ${result.status ?? 1}`);
  }
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

async function fetchTimed(url, init = {}) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
}

async function cfRaw(method, path, body = undefined) {
  const response = await fetchTimed(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      accept: "application/json",
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

async function cf(method, path, body = undefined) {
  const { response, payload } = await cfRaw(method, path, body);
  if (!response.ok || payload?.success !== true) {
    const codes = Array.isArray(payload?.errors)
      ? payload.errors.map((error) => error?.code).filter(Boolean).join(",")
      : "unknown";
    throw new Error(`Cloudflare ${method} ${path} failed; status=${response.status}; codes=${codes}`);
  }
  return payload.result;
}

async function getZone() {
  const zones = await cf("GET", `/zones?name=${encodeURIComponent(zoneName)}&status=active`);
  if (!Array.isArray(zones) || zones.length !== 1) {
    throw new Error("CLOUDFLARE_ZONE=EXPECTED_ONE_ACTIVE");
  }
  if (zones[0].account?.id !== process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error("CLOUDFLARE_ZONE=ACCOUNT_MISMATCH");
  }
  return zones[0];
}

async function listDns(zoneId, hostname) {
  const records = await cf(
    "GET",
    `/zones/${zoneId}/dns_records?name=${encodeURIComponent(hostname)}&per_page=100`,
  );
  return Array.isArray(records) ? records.filter((record) => record.name === hostname) : [];
}

function webRoutingRecords(records) {
  return records.filter((record) => WEB_ROUTING_TYPES.has(record.type));
}

async function listDomains() {
  const domains = await cf(
    "GET",
    `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/domains`,
  );
  return Array.isArray(domains) ? domains : [];
}

function targetDomains(domains) {
  return domains.filter((domain) => TARGET_HOSTS.has(domain.hostname));
}

function assertTargetDomainsOwnedByWorker(domains, marker) {
  const targets = targetDomains(domains);
  const foreign = targets.filter((domain) => domain.service !== workerName);
  if (foreign.length) {
    throw new Error(
      `${marker}=TARGET_DOMAIN_SERVICE_DRIFT:${foreign
        .map((domain) => `${domain.hostname}:${domain.service}`)
        .join(",")}`,
    );
  }
  return targets;
}

function assertBothTargetDomainsAttached(domains, marker) {
  for (const hostname of [canonicalHost, apexHost]) {
    if (!domains.some((domain) => domain.hostname === hostname && domain.service === workerName)) {
      throw new Error(`${marker}=CUSTOM_DOMAIN_MISSING_${hostname}`);
    }
  }
}

async function listWorkerDeployments() {
  const result = await cf(
    "GET",
    `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${encodeURIComponent(workerName)}/deployments`,
  );
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.deployments)) return result.deployments;
  throw new Error("WORKER_DEPLOYMENTS=UNEXPECTED_RESPONSE_SHAPE");
}

function deploymentHasExactVersion(deployments, versionId) {
  const active = deployments[0];
  const versions = Array.isArray(active?.versions) ? active.versions : [];
  return (
    versions.length === 1 &&
    versions[0]?.version_id === versionId &&
    Number(versions[0]?.percentage) === 100
  );
}

async function getActiveSingleVersionId() {
  let last = "missing";
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const deployments = await listWorkerDeployments();
    const active = deployments[0];
    const versions = Array.isArray(active?.versions) ? active.versions : [];
    if (versions.length === 1) {
      const versionId = versions[0]?.version_id;
      const percentage = Number(versions[0]?.percentage);
      if (typeof versionId === "string" && versionId && percentage === 100) {
        console.log(`WORKER_ACTIVE_SINGLE_VERSION=CAPTURED_ATTEMPT_${attempt}`);
        return versionId;
      }
    }
    last = `deployments_${deployments.length}_versions_${versions.length}`;
    await sleep(1_000);
  }
  throw new Error(`WORKER_ACTIVE_SINGLE_VERSION=NOT_STABLE:${last}`);
}

async function waitForExactWorkerVersion(versionId, marker) {
  let last = "missing";
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const deployments = await listWorkerDeployments();
    if (deploymentHasExactVersion(deployments, versionId)) {
      console.log(`${marker}=VERIFIED_ATTEMPT_${attempt}`);
      return;
    }
    const versions = Array.isArray(deployments[0]?.versions) ? deployments[0].versions : [];
    last = `deployments_${deployments.length}_versions_${versions.length}`;
    await sleep(1_000);
  }
  throw new Error(`${marker}=DID_NOT_CONVERGE:${last}`);
}

async function deploySingleWorkerVersion(versionId, message) {
  await cf(
    "POST",
    `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${encodeURIComponent(workerName)}/deployments`,
    {
      strategy: "percentage",
      versions: [{ percentage: 100, version_id: versionId }],
      annotations: { "workers/message": message },
    },
  );
  await waitForExactWorkerVersion(versionId, "WORKER_VERSION_ROLLBACK");
}

async function getWorkersAccountSubdomain() {
  const result = await cf(
    "GET",
    `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/subdomain`,
  );
  if (!result?.subdomain) throw new Error("WORKERS_DEV_ACCOUNT_SUBDOMAIN=MISSING");
  return result.subdomain;
}

async function getWorkerSubdomainState() {
  return cf(
    "GET",
    `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${encodeURIComponent(workerName)}/subdomain`,
  );
}

async function setWorkerSubdomainState({ enabled, previewsEnabled }) {
  const result = await cf(
    "POST",
    `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${encodeURIComponent(workerName)}/subdomain`,
    { enabled, previews_enabled: previewsEnabled },
  );
  if (result?.enabled !== enabled || result?.previews_enabled !== previewsEnabled) {
    throw new Error("WORKERS_DEV_STATE=POST_RESPONSE_MISMATCH");
  }
  const readBack = await getWorkerSubdomainState();
  if (readBack?.enabled !== enabled || readBack?.previews_enabled !== previewsEnabled) {
    throw new Error("WORKERS_DEV_STATE=READBACK_MISMATCH");
  }
  console.log(
    `WORKERS_DEV_STATE=${enabled ? "ENABLED" : "DISABLED"};PREVIEWS_${previewsEnabled ? "ENABLED" : "DISABLED"}`,
  );
}

function assertNoTargetDomains(domains, marker) {
  const matches = targetDomains(domains);
  if (matches.length) {
    throw new Error(
      `${marker}=TARGET_CUSTOM_DOMAIN_ALREADY_ATTACHED:${matches
        .map((domain) => `${domain.hostname}:${domain.service}`)
        .join(",")}`,
    );
  }
}

function assertVercelDnsBaseline(apexAll, wwwAll) {
  const apex = webRoutingRecords(apexAll);
  const www = webRoutingRecords(wwwAll);
  if (apex.length === 0) {
    throw new Error("DNS_BASELINE=APEX_WEB_ROUTING_RECORD_MISSING");
  }
  if (www.length !== 1 || www[0].type !== "CNAME") {
    throw new Error("DNS_BASELINE=WWW_EXPECTED_EXACTLY_ONE_WEB_CNAME");
  }
  if (String(www[0].content ?? "").replace(/\.$/, "") !== baselineWwwCname) {
    throw new Error("DNS_BASELINE=WWW_ORIGIN_DRIFT");
  }
  const preservedNonWeb = apexAll.length + wwwAll.length - apex.length - www.length;
  console.log(
    `DNS_WEB_ROUTING_BASELINE=APEX_${apex.length}_WWW_${www.length};NON_WEB_PRESERVED_${preservedNonWeb}`,
  );
  return { apex, www };
}

async function inspectVercelResponse(url) {
  const response = await fetchTimed(url, {
    redirect: "manual",
    headers: {
      accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      "user-agent": "DrKhaleej-Cloudflare-Cutover/1.0",
    },
  });
  const status = response.status;
  const headerEvidence =
    (response.headers.get("server") ?? "").toLowerCase().includes("vercel") ||
    response.headers.has("x-vercel-id") ||
    response.headers.has("x-vercel-cache");
  const deploymentDisabled = status === 402 && headerEvidence;
  await response.body?.cancel().catch(() => {});
  return {
    status,
    location: response.headers.get("location") ?? "",
    isVercel: headerEvidence,
    deploymentDisabled,
  };
}

function assertRecognizedVercelResponse(result, marker) {
  if (!result.isVercel) {
    throw new Error(`${marker}=ORIGIN_NOT_VERCEL_STATUS_${result.status}`);
  }
  if (result.status === 402 && !result.deploymentDisabled) {
    throw new Error(`${marker}=UNRECOGNIZED_402`);
  }
  if (result.status >= 500) {
    throw new Error(`${marker}=VERCEL_5XX_STATUS_${result.status}`);
  }
}

async function assertPublicVercelBaseline() {
  const www = await inspectVercelResponse(`${canonicalAppUrl}/en/om`);
  assertRecognizedVercelResponse(www, "PUBLIC_BASELINE_WWW");
  if (www.status !== 200 && !(www.status === 402 && www.deploymentDisabled)) {
    throw new Error(`PUBLIC_BASELINE_WWW=UNEXPECTED_VERCEL_STATUS_${www.status}`);
  }

  const apex = await inspectVercelResponse(`https://${apexHost}/`);
  const apexRedirectOk =
    [301, 302, 307, 308].includes(apex.status) && apex.location.startsWith(canonicalAppUrl);
  const apexDisabledOk = apex.status === 402 && apex.deploymentDisabled && apex.isVercel;
  if (!apexRedirectOk && !apexDisabledOk) {
    throw new Error(`PUBLIC_BASELINE_APEX=REDIRECT_DRIFT_STATUS_${apex.status}`);
  }

  const deploymentDisabled = www.deploymentDisabled || apex.deploymentDisabled;
  console.log(
    `PUBLIC_BASELINE=VERCEL_ORIGIN_CONFIRMED;WWW_STATUS_${www.status};APEX_STATUS_${apex.status};DEPLOYMENT_${deploymentDisabled ? "DISABLED" : "SERVING"}`,
  );
  return { deploymentDisabled };
}

function snapshotRecord(record) {
  const body = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: record.ttl,
    proxied: record.proxied,
  };
  if (typeof record.priority === "number") body.priority = record.priority;
  if (record.data && Object.keys(record.data).length) body.data = record.data;
  if (record.settings && Object.keys(record.settings).length) body.settings = record.settings;
  if (record.comment) body.comment = record.comment;
  if (Array.isArray(record.tags) && record.tags.length) body.tags = record.tags;
  return { id: record.id, body };
}

async function deleteRecords(zoneId, records) {
  for (const record of records) {
    await cf("DELETE", `/zones/${zoneId}/dns_records/${record.id}`);
  }
}

async function removeWebRoutingForHost(zoneId, hostname) {
  const records = webRoutingRecords(await listDns(zoneId, hostname));
  if (!records.length) return 0;
  await deleteRecords(zoneId, records);
  console.log(`RECOVERY_WEB_ROUTING_REMOVED=${hostname}:${records.length}`);
  return records.length;
}

async function restoreSnapshot(zoneId, snapshot) {
  for (const hostname of [apexHost, canonicalHost]) {
    const currentWebRouting = webRoutingRecords(await listDns(zoneId, hostname));
    await deleteRecords(zoneId, currentWebRouting);
  }
  for (const record of snapshot) {
    await cf("POST", `/zones/${zoneId}/dns_records`, record.body);
  }
}

async function attachDomain(zone, hostname) {
  return cf(
    "PUT",
    `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/domains`,
    {
      hostname,
      service: workerName,
      zone_id: zone.id,
      zone_name: zoneName,
    },
  );
}

async function detachDomainVerified(domain) {
  const path = `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/domains/${domain.id}`;
  const { response, payload } = await cfRaw("DELETE", path);
  if (!response.ok) {
    const codes = Array.isArray(payload?.errors)
      ? payload.errors.map((error) => error?.code).filter(Boolean).join(",")
      : "unknown";
    throw new Error(`Cloudflare DELETE ${path} failed; status=${response.status}; codes=${codes}`);
  }

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const remaining = await listDomains();
    const stillAttached = remaining.some(
      (candidate) =>
        candidate.hostname === domain.hostname &&
        candidate.service === workerName &&
        (!domain.id || candidate.id === domain.id),
    );
    if (!stillAttached) {
      console.log(
        `CUSTOM_DOMAIN_DETACH=VERIFIED_${domain.hostname}_ATTEMPT_${attempt};API_SUCCESS_${payload?.success === true ? "TRUE" : "UNRELIABLE"}`,
      );
      return;
    }
    await sleep(1_000);
  }
  throw new Error(`CUSTOM_DOMAIN_DETACH=NOT_CONFIRMED_${domain.hostname}_STATUS_${response.status}`);
}

async function detachOurDomains() {
  for (const domain of await listDomains()) {
    if (TARGET_HOSTS.has(domain.hostname) && domain.service === workerName && domain.id) {
      await detachDomainVerified(domain);
    }
  }
}

function writeConfig({ indexing, workersDev, suffix }) {
  const config = JSON.parse(readFileSync(generatedWranglerConfig, "utf8"));
  config.name = workerName;
  config.workers_dev = workersDev;
  config.preview_urls = workersDev;
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
    NEXT_PUBLIC_ENABLE_INDEXING: indexing ? "true" : "false",
    NEXT_PUBLIC_SUPABASE_URL: productionSupabaseUrl,
    DRMUSCAT_PUBLIC_FAQ_CMS_ENABLED: "false",
    APP_ENV: "production",
    AUTOMATION_EMERGENCY_ENABLED: "false",
    AUTOMATION_RUNTIME_PROBE_ENABLED: "false",
  };
  const path = `dist/server/wrangler.production-${suffix}.json`;
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return path;
}

function putSecret(configPath, name, value) {
  run(
    "pnpm",
    ["exec", "wrangler", "secret", "put", name, "--config", configPath, "--name", workerName],
    { input: `${value}\n` },
  );
}

function deploy({ indexing, workersDev, suffix }) {
  childEnv.NEXT_PUBLIC_ENABLE_INDEXING = indexing ? "true" : "false";
  run("pnpm", ["build:vinext"]);
  const actionId = discoverSafeServerActionId();
  const configPath = writeConfig({ indexing, workersDev, suffix });
  run(
    "pnpm",
    ["exec", "wrangler", "deploy", "--config", configPath, "--name", workerName],
  );
  putSecret(configPath, "NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.PRODUCTION_SUPABASE_ANON_KEY);
  putSecret(
    configPath,
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY,
  );
  console.log("WORKER_SECRETS=ATTACHED_WITHOUT_VALUE_OUTPUT");
  return { actionId, configPath };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForWorkersDev(baseUrl) {
  let last = "unknown";
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      const response = await fetchTimed(`${baseUrl}/`, { redirect: "manual" });
      last = `status_${response.status}`;
      await response.body?.cancel().catch(() => {});
      if (response.status === 308) {
        console.log(`WORKERS_DEV_READY=ATTEMPT_${attempt}`);
        return;
      }
    } catch (error) {
      last = sanitize(error?.message ?? error);
    }
    await sleep(2_000);
  }
  throw new Error(`WORKERS_DEV_NOT_READY:${last}`);
}

async function waitForProduction(maxWaitMs = 120_000) {
  const intervalMs = 5_000;
  const attempts = Math.max(24, Math.ceil(maxWaitMs / intervalMs));
  let last = "unknown";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchTimed(`${canonicalAppUrl}/en/om`, { redirect: "manual" });
      last = `status_${response.status}`;
      await response.body?.cancel().catch(() => {});
      if (response.status === 200) {
        console.log(`PRODUCTION_DOMAIN_READY=ATTEMPT_${attempt}`);
        return;
      }
      console.log(`PRODUCTION_READINESS_ATTEMPT_${attempt}=STATUS_${response.status}`);
    } catch (error) {
      last = sanitize(error?.message ?? error);
      console.log(`PRODUCTION_READINESS_ATTEMPT_${attempt}=ERROR`);
    }
    await sleep(intervalMs);
  }
  throw new Error(`PRODUCTION_DOMAIN_NOT_READY:${last}`);
}

function productionReadinessWindowMs(records) {
  const maxTtl = records.reduce((current, record) => {
    const ttl = Number(record?.body?.ttl);
    return Number.isFinite(ttl) && ttl > 1 ? Math.max(current, ttl) : current;
  }, 0);
  const seconds = Math.max(120, Math.min(600, maxTtl + 60));
  console.log(`PRODUCTION_READINESS_WINDOW_SECONDS=${seconds};BASELINE_MAX_TTL_${maxTtl}`);
  return seconds * 1_000;
}

async function verifyRollback(zoneId) {
  let last = "unknown";
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const apexRecords = await listDns(zoneId, apexHost);
      const wwwRecords = await listDns(zoneId, canonicalHost);
      assertVercelDnsBaseline(apexRecords, wwwRecords);
      const publicBaseline = await assertPublicVercelBaseline();
      console.log(
        `ROLLBACK_VERIFY=VERCEL_ORIGIN_RESTORED_ATTEMPT_${attempt};DEPLOYMENT_${publicBaseline.deploymentDisabled ? "DISABLED" : "SERVING"}`,
      );
      return publicBaseline;
    } catch (error) {
      last = sanitize(error?.message ?? error);
    }
    await sleep(5_000);
  }
  throw new Error(`ROLLBACK_PUBLIC_VERIFY_DID_NOT_CONVERGE:${last}`);
}

async function recoverFailedCutover(zone, existingTargets) {
  console.log(
    `CLOUDFLARE_CUTOVER_RECOVERY=START;ATTACHED_TARGET_DOMAINS_${existingTargets.length}`,
  );
  const rollbackVersionId = await getActiveSingleVersionId();
  console.log("CLOUDFLARE_RECOVERY_ROLLBACK_VERSION=CAPTURED");

  let production = null;
  try {
    production = deploy({ indexing: true, workersDev: false, suffix: "recovery" });
    await setWorkerSubdomainState({ enabled: false, previewsEnabled: false });
    console.log("PRODUCTION_WORKER=INDEXING_ON_WORKERS_DEV_OFF_VERIFIED");

    let currentDomains = await listDomains();
    assertTargetDomainsOwnedByWorker(currentDomains, "RECOVERY_PRE_ATTACH");
    for (const hostname of [canonicalHost, apexHost]) {
      if (!currentDomains.some((domain) => domain.hostname === hostname && domain.service === workerName)) {
        await removeWebRoutingForHost(zone.id, hostname);
        await attachDomain(zone, hostname);
        console.log(`RECOVERY_CUSTOM_DOMAIN=ATTACHED_${hostname}`);
        currentDomains = await listDomains();
      }
    }

    assertBothTargetDomainsAttached(await listDomains(), "RECOVERY_POST_ATTACH");
    await waitForProduction();
    await runRuntimeSmoke(canonicalAppUrl, production.actionId, { productionDomain: true });
    await observeTailAndLoad({
      baseUrl: canonicalAppUrl,
      workerName,
      configPath: production.configPath,
      env: childEnv,
      sanitize,
    });
    assertBothTargetDomainsAttached(await listDomains(), "RECOVERY_POST_SMOKE");

    console.log("CLOUDFLARE_CUTOVER_RECOVERY=GREEN");
    console.log("CLOUDFLARE_PRODUCTION_CUTOVER=GREEN");
    console.log("VERCEL_ORIGIN=RETAINED_FOR_STABILIZATION_ROLLBACK");
  } catch (error) {
    console.error(`RECOVERY_FAILURE=${sanitize(error?.message ?? error)}`);
    console.error("ROLLBACK_CLOUDFLARE_RECOVERY_VERSION=STARTING");
    try {
      await deploySingleWorkerVersion(
        rollbackVersionId,
        "Automatic rollback to exact pre-recovery DrKhaleej Worker version",
      );
      assertBothTargetDomainsAttached(await listDomains(), "ROLLBACK_CLOUDFLARE_RECOVERY");
      await waitForProduction();
      if (production) {
        await runRuntimeSmoke(canonicalAppUrl, production.actionId);
        await observeTailAndLoad({
          baseUrl: canonicalAppUrl,
          workerName,
          configPath: production.configPath,
          env: childEnv,
          sanitize,
        });
      }
      console.error("ROLLBACK_CLOUDFLARE_RECOVERY_VERSION=GREEN;INDEXING_STATE_PRE_RECOVERY_RESTORED");
    } catch (rollbackError) {
      console.error(
        `ROLLBACK_CLOUDFLARE_RECOVERY_FAILURE=${sanitize(rollbackError?.message ?? rollbackError)}`,
      );
      throw new AggregateError(
        [error, rollbackError],
        "Failed-cutover recovery failed and exact Worker-version rollback also failed",
      );
    }
    throw error;
  }
}

const zone = await getZone();
console.log("CLOUDFLARE_ZONE=ACTIVE_ACCOUNT_MATCH");
const initialDomains = await listDomains();
const existingTargets = assertTargetDomainsOwnedByWorker(initialDomains, "PRE_STAGE");

if (existingTargets.length) {
  if (mode !== "cutover") {
    throw new Error("PRE_STAGE=TARGET_CUSTOM_DOMAIN_ALREADY_ATTACHED_REQUIRES_CUTOVER_RECOVERY");
  }
  await recoverFailedCutover(zone, existingTargets);
  process.exit(0);
}

assertNoTargetDomains(initialDomains, "PRE_STAGE");
console.log("PRE_STAGE_TARGET_CUSTOM_DOMAINS=ABSENT");

const stage = deploy({ indexing: false, workersDev: true, suffix: "stage" });
await setWorkerSubdomainState({ enabled: true, previewsEnabled: false });
const accountSubdomain = await getWorkersAccountSubdomain();
const stageBaseUrl = `https://${workerName}.${accountSubdomain}.workers.dev`;
await waitForWorkersDev(stageBaseUrl);
await runRuntimeSmoke(stageBaseUrl, stage.actionId);
await observeTailAndLoad({
  baseUrl: stageBaseUrl,
  workerName,
  configPath: stage.configPath,
  env: childEnv,
  sanitize,
});
assertNoTargetDomains(await listDomains(), "POST_STAGE");
console.log("POST_STAGE_TARGET_CUSTOM_DOMAINS=ABSENT");

const stageApexRecords = await listDns(zone.id, apexHost);
const stageWwwRecords = await listDns(zone.id, canonicalHost);
assertVercelDnsBaseline(stageApexRecords, stageWwwRecords);
const stagePublicBaseline = await assertPublicVercelBaseline();
console.log(
  `STAGE_READ_ONLY_VERCEL_BASELINE=GREEN;DEPLOYMENT_${stagePublicBaseline.deploymentDisabled ? "DISABLED" : "SERVING"}`,
);
const stageRollbackVersionId = await getActiveSingleVersionId();
console.log("CLOUDFLARE_STAGE_ROLLBACK_VERSION=CAPTURED");

if (mode === "stage") {
  console.log("CLOUDFLARE_PRODUCTION_STAGE=GREEN");
  console.log("PRODUCTION_DNS_MUTATION=NONE");
  process.exit(0);
}

const production = deploy({ indexing: true, workersDev: false, suffix: "cutover" });
await setWorkerSubdomainState({ enabled: false, previewsEnabled: false });
console.log("PRODUCTION_WORKER=INDEXING_ON_WORKERS_DEV_OFF_VERIFIED");

const apexRecords = await listDns(zone.id, apexHost);
const wwwRecords = await listDns(zone.id, canonicalHost);
const webBaseline = assertVercelDnsBaseline(apexRecords, wwwRecords);
await assertPublicVercelBaseline();
const snapshot = [...webBaseline.apex, ...webBaseline.www].map(snapshotRecord);
const readinessWindowMs = productionReadinessWindowMs(snapshot);
console.log(`DNS_SNAPSHOT=CAPTURED_${snapshot.length}_WEB_ROUTING_RECORDS`);
assertNoTargetDomains(await listDomains(), "IMMEDIATE_PRE_CUTOVER");
console.log("IMMEDIATE_PRE_CUTOVER=GREEN");

let mutationStarted = false;
try {
  mutationStarted = true;
  await deleteRecords(zone.id, [...webBaseline.apex, ...webBaseline.www]);
  console.log("VERCEL_WEB_DNS=REMOVED_AFTER_SNAPSHOT;NON_WEB_DNS=PRESERVED");

  await attachDomain(zone, canonicalHost);
  console.log("CUSTOM_DOMAIN_WWW=ATTACHED");
  await attachDomain(zone, apexHost);
  console.log("CUSTOM_DOMAIN_APEX=ATTACHED");

  await waitForProduction(readinessWindowMs);
  await runRuntimeSmoke(canonicalAppUrl, production.actionId, { productionDomain: true });
  await observeTailAndLoad({
    baseUrl: canonicalAppUrl,
    workerName,
    configPath: production.configPath,
    env: childEnv,
    sanitize,
  });

  assertBothTargetDomainsAttached(await listDomains(), "POST_CUTOVER");

  console.log("CLOUDFLARE_PRODUCTION_CUTOVER=GREEN");
  console.log("VERCEL_ORIGIN=RETAINED_FOR_STABILIZATION_ROLLBACK");
} catch (error) {
  console.error(`CUTOVER_FAILURE=${sanitize(error?.message ?? error)}`);
  if (mutationStarted) {
    console.error("ROLLBACK_CLOUDFLARE_STAGE=STARTING");
    let cloudflareStageRollbackGreen = false;
    try {
      await deploySingleWorkerVersion(
        stageRollbackVersionId,
        "Automatic rollback to last verified DrKhaleej pre-cutover stage",
      );
      assertBothTargetDomainsAttached(await listDomains(), "ROLLBACK_CLOUDFLARE_STAGE");
      await waitForProduction();
      await runRuntimeSmoke(canonicalAppUrl, stage.actionId);
      await observeTailAndLoad({
        baseUrl: canonicalAppUrl,
        workerName,
        configPath: stage.configPath,
        env: childEnv,
        sanitize,
      });
      cloudflareStageRollbackGreen = true;
      console.error("ROLLBACK_CLOUDFLARE_STAGE=GREEN;INDEXING_DISABLED");
    } catch (cloudflareRollbackError) {
      console.error(
        `ROLLBACK_CLOUDFLARE_STAGE_FAILURE=${sanitize(cloudflareRollbackError?.message ?? cloudflareRollbackError)}`,
      );
    }

    if (cloudflareStageRollbackGreen) {
      console.error("ROLLBACK=GREEN_CLOUDFLARE_STAGE");
      throw error;
    }

    console.error("ROLLBACK_VERCEL_FALLBACK=STARTING");
    try {
      await detachOurDomains();
      console.error("ROLLBACK_CUSTOM_DOMAINS=DETACHED");
      await restoreSnapshot(zone.id, snapshot);
      console.error("ROLLBACK_DNS=WEB_SNAPSHOT_RESTORED_NON_WEB_PRESERVED");
      const publicBaseline = await verifyRollback(zone.id);
      console.error(
        `ROLLBACK_VERCEL_DNS=RESTORED;DEPLOYMENT_${publicBaseline.deploymentDisabled ? "DISABLED" : "SERVING"}`,
      );
      if (publicBaseline.deploymentDisabled) {
        console.error("ROLLBACK_VERCEL_SERVICE=DEGRADED_402");
      } else {
        console.error("ROLLBACK_VERCEL_SERVICE=SERVING");
      }
      console.error("ROLLBACK=GREEN_VERCEL_FALLBACK");
    } catch (rollbackError) {
      console.error(`ROLLBACK_FAILURE=${sanitize(rollbackError?.message ?? rollbackError)}`);
      throw new AggregateError(
        [error, rollbackError],
        "Cutover failed and both Cloudflare-stage and Vercel-DNS rollback paths failed",
      );
    }
  }
  throw error;
}
