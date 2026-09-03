const required = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "PRODUCTION_PROJECT_REF",
  "PREVIEW_PROJECT_REF",
];

for (const name of required) {
  if (!process.env[name]) {
    console.error(`${name}=MISSING`);
    process.exit(2);
  }
  console.log(`${name}=PRESENT`);
}

if (process.env.PRODUCTION_PROJECT_REF === process.env.PREVIEW_PROJECT_REF) {
  console.error("SUPABASE_IDENTITY=INVALID_SAME_PREVIEW_AND_PRODUCTION");
  process.exit(3);
}
console.log("SUPABASE_IDENTITY=DISTINCT");

const zoneName = "drkhaleej.com";
const canonicalHost = "www.drkhaleej.com";
const baselineWwwCname = "99f83eafeb1926bc.vercel-dns-017.com";
const productionSupabaseUrl = `https://${process.env.PRODUCTION_PROJECT_REF}.supabase.co`;
const timeoutMs = 20_000;

function uniqueCandidates(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    if (!entry.value || seen.has(entry.value)) return false;
    seen.add(entry.value);
    return true;
  });
}

async function fetchWithTimeout(url, init = {}) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function cloudflareRaw(path) {
  const response = await fetchWithTimeout(`https://api.cloudflare.com/client/v4${path}`, {
    headers: {
      authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      accept: "application/json",
    },
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

async function cloudflare(path) {
  const { response, payload } = await cloudflareRaw(path);
  if (!response.ok || payload?.success !== true) {
    const codes = Array.isArray(payload?.errors)
      ? payload.errors.map((error) => error?.code).filter(Boolean).join(",")
      : "unknown";
    throw new Error(`Cloudflare read failed for ${path}; status=${response.status}; codes=${codes}`);
  }
  return payload.result;
}

function policyAllows(token, permissionNames, resourceMarkers) {
  const allowedNames = new Set(permissionNames.map((name) => name.toLowerCase()));
  return (token?.policies ?? []).some((policy) => {
    if (policy?.effect !== "allow") return false;
    const permissionMatch = (policy.permission_groups ?? []).some((permission) =>
      allowedNames.has(String(permission?.name ?? "").toLowerCase()),
    );
    if (!permissionMatch) return false;
    const resources = JSON.stringify(policy.resources ?? {});
    return resourceMarkers.some((marker) => resources.includes(marker));
  });
}

async function inspectCloudflareTokenPermissions(zone) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const candidates = [
    {
      kind: "ACCOUNT_OWNED",
      verifyPath: `/accounts/${accountId}/tokens/verify`,
      detailPath: (id) => `/accounts/${accountId}/tokens/${id}`,
    },
    {
      kind: "USER",
      verifyPath: "/user/tokens/verify",
      detailPath: (id) => `/user/tokens/${id}`,
    },
  ];

  for (const candidate of candidates) {
    const verified = await cloudflareRaw(candidate.verifyPath);
    if (!verified.response.ok || verified.payload?.success !== true) continue;
    const tokenId = verified.payload?.result?.id;
    const status = verified.payload?.result?.status;
    if (!tokenId || status !== "active") {
      throw new Error(`CLOUDFLARE_TOKEN=${candidate.kind}_NOT_ACTIVE`);
    }
    console.log(`CLOUDFLARE_TOKEN=${candidate.kind}_ACTIVE`);

    const details = await cloudflareRaw(candidate.detailPath(tokenId));
    if (!details.response.ok || details.payload?.success !== true) {
      console.log("CLOUDFLARE_TOKEN_PERMISSION_INTROSPECTION=UNAVAILABLE_MANUAL_CONFIRMATION_REQUIRED");
      return;
    }

    const token = details.payload.result;
    const dnsWrite = policyAllows(
      token,
      ["DNS Write", "DNS Edit"],
      [zone.id, "com.cloudflare.api.account.zone.*", "\"*\""],
    );
    const workersScriptsWrite = policyAllows(
      token,
      ["Workers Scripts Write", "Workers Scripts Edit"],
      [accountId, "com.cloudflare.api.account.*", "\"*\""],
    );

    if (!dnsWrite) throw new Error("CLOUDFLARE_TOKEN_PERMISSION=DNS_WRITE_MISSING_OR_OUT_OF_SCOPE");
    if (!workersScriptsWrite) {
      throw new Error("CLOUDFLARE_TOKEN_PERMISSION=WORKERS_SCRIPTS_WRITE_MISSING_OR_OUT_OF_SCOPE");
    }
    console.log("CLOUDFLARE_TOKEN_PERMISSION=DNS_WRITE_CONFIRMED");
    console.log("CLOUDFLARE_TOKEN_PERMISSION=WORKERS_SCRIPTS_WRITE_CONFIRMED");
    console.log("CLOUDFLARE_TOKEN_PERMISSION_INTROSPECTION=GREEN");
    return;
  }

  throw new Error("CLOUDFLARE_TOKEN=VERIFY_FAILED");
}

async function validateSupabaseKey(key, path) {
  try {
    const response = await fetchWithTimeout(`${productionSupabaseUrl}${path}`, {
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        accept: "application/json",
      },
    });
    await response.body?.cancel().catch(() => {});
    return response.ok;
  } catch {
    return false;
  }
}

const zones = await cloudflare(`/zones?name=${encodeURIComponent(zoneName)}&status=active`);
if (!Array.isArray(zones) || zones.length !== 1) {
  throw new Error(`CLOUDFLARE_ZONE=EXPECTED_ONE_ACTIVE_FOUND_${Array.isArray(zones) ? zones.length : 0}`);
}
const zone = zones[0];
if (zone.account?.id !== process.env.CLOUDFLARE_ACCOUNT_ID) {
  throw new Error("CLOUDFLARE_ZONE=ACCOUNT_MISMATCH");
}
console.log("CLOUDFLARE_ZONE=ACTIVE_ACCOUNT_MATCH");

await inspectCloudflareTokenPermissions(zone);

const apexRecords = await cloudflare(
  `/zones/${zone.id}/dns_records?name=${encodeURIComponent(zoneName)}&per_page=100`,
);
const wwwRecords = await cloudflare(
  `/zones/${zone.id}/dns_records?name=${encodeURIComponent(canonicalHost)}&per_page=100`,
);

if (!Array.isArray(apexRecords) || apexRecords.length === 0) {
  throw new Error("DNS_BASELINE=APEX_RECORDS_MISSING");
}
if (!Array.isArray(wwwRecords) || wwwRecords.length === 0) {
  throw new Error("DNS_BASELINE=WWW_RECORDS_MISSING");
}

const wwwCname = wwwRecords.find((record) => record.type === "CNAME");
if (!wwwCname || String(wwwCname.content).replace(/\.$/, "") !== baselineWwwCname) {
  throw new Error("DNS_BASELINE=WWW_ORIGIN_DRIFT");
}
console.log(`DNS_BASELINE=VERCEL_CONFIRMED;APEX_RECORD_COUNT=${apexRecords.length};WWW_RECORD_COUNT=${wwwRecords.length}`);

const publicCandidates = uniqueCandidates([
  { name: "PRODUCTION_SUPABASE_ANON_KEY", value: process.env.PRODUCTION_SUPABASE_ANON_KEY },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  { name: "SUPABASE_ANON_KEY", value: process.env.SUPABASE_ANON_KEY },
]);
let validPublic = null;
for (const candidate of publicCandidates) {
  if (await validateSupabaseKey(candidate.value, "/rest/v1/")) {
    validPublic = candidate.name;
    break;
  }
}
if (!validPublic) {
  throw new Error("PRODUCTION_PUBLIC_SUPABASE_KEY=MISSING_OR_PROJECT_MISMATCH");
}
console.log(`PRODUCTION_PUBLIC_SUPABASE_KEY=VALID_FROM_${validPublic}`);

const serviceCandidates = uniqueCandidates([
  { name: "PRODUCTION_SUPABASE_SERVICE_ROLE_KEY", value: process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY },
  { name: "SUPABASE_SERVICE_ROLE_KEY", value: process.env.SUPABASE_SERVICE_ROLE_KEY },
]);
let validService = null;
for (const candidate of serviceCandidates) {
  if (
    await validateSupabaseKey(
      candidate.value,
      "/rest/v1/import_publish_queue?select=target_entity_type&limit=1",
    )
  ) {
    validService = candidate.name;
    break;
  }
}
if (!validService) {
  throw new Error("PRODUCTION_SERVICE_ROLE_KEY=MISSING_OR_PROJECT_MISMATCH");
}
console.log(`PRODUCTION_SERVICE_ROLE_KEY=VALID_FROM_${validService}`);
console.log("PRODUCTION_SERVICE_ROLE_READ=OK_NON_MUTATING");
console.log("CLOUDFLARE_PRODUCTION_PREFLIGHT=GREEN");
