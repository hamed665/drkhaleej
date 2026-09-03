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

async function cloudflare(path) {
  const response = await fetchWithTimeout(`https://api.cloudflare.com/client/v4${path}`, {
    headers: {
      authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      accept: "application/json",
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true) {
    const codes = Array.isArray(payload?.errors)
      ? payload.errors.map((error) => error?.code).filter(Boolean).join(",")
      : "unknown";
    throw new Error(`Cloudflare read failed for ${path}; status=${response.status}; codes=${codes}`);
  }
  return payload.result;
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
