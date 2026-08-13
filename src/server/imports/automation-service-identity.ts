import "server-only";

import { createHash } from "node:crypto";

export const AUTOMATION_SERVICE_JWT_SCHEMA_VERSION = "drkhaleej.automation.serviceJwt.v1" as const;
export const AUTOMATION_SERVICE_AUDIENCE = "urn:drkhaleej:internal-automation:v1" as const;
export const AUTOMATION_WORKER_SUBJECT = "urn:drkhaleej:service:worker-preview" as const;
export const AUTOMATION_N8N_SUBJECT = "urn:drkhaleej:service:n8n-preview" as const;
export const AUTOMATION_JWT_ALGORITHM = "Ed25519" as const;
export const AUTOMATION_JWT_MAX_TTL_SECONDS = 300 as const;
export const AUTOMATION_JWT_MAX_CLOCK_SKEW_SECONDS = 30 as const;

export const AUTOMATION_WORKER_SCOPES = [
  "job:lease", "job:execute", "job:heartbeat", "job:complete",
  "draft:write", "evidence:write", "report:write",
] as const;
export const AUTOMATION_N8N_SCOPES = ["job:create", "job:read"] as const;
export const AUTOMATION_DENIED_SCOPES = [
  "publish", "rollback", "public_promote", "index_promote", "sitemap_promote",
] as const;

export type AutomationServiceScope = (typeof AUTOMATION_WORKER_SCOPES)[number] | (typeof AUTOMATION_N8N_SCOPES)[number];

export type AutomationPublicJwk = JsonWebKey & {
  kid: string;
  alg: typeof AUTOMATION_JWT_ALGORITHM;
  use: "sig";
  key_ops: ["verify"];
};

export type AutomationServiceIdentity = {
  issuer: typeof AUTOMATION_WORKER_SUBJECT | typeof AUTOMATION_N8N_SUBJECT;
  subject: typeof AUTOMATION_WORKER_SUBJECT | typeof AUTOMATION_N8N_SUBJECT;
  keyId: string;
  jti: string;
  jtiDigest: string;
  scope: AutomationServiceScope;
  requestHash: string;
  issuedAt: number;
  expiresAt: number;
  workerInstance: string | null;
  jobId: string | null;
  leaseEpoch: number | null;
};

export type AutomationServiceIdentityBlocker =
  | "authorization_missing"
  | "token_format_invalid"
  | "header_invalid"
  | "key_unknown"
  | "signature_invalid"
  | "claims_invalid"
  | "issuer_invalid"
  | "audience_invalid"
  | "scope_invalid"
  | "ttl_invalid"
  | "clock_invalid"
  | "request_binding_invalid"
  | "worker_binding_invalid";

export type VerifyAutomationServiceTokenInput = {
  authorization: string | null;
  publicJwks: readonly AutomationPublicJwk[];
  expectedScope: AutomationServiceScope;
  method: string;
  normalizedPath: string;
  requestBody: Uint8Array;
  nowSeconds?: number;
};

export type AutomationServiceIdentityResult = {
  accepted: boolean;
  identity: AutomationServiceIdentity | null;
  blockers: readonly AutomationServiceIdentityBlocker[];
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha256Pattern = /^[a-f0-9]{64}$/;
const keyIdPattern = /^(worker-preview|n8n-preview)-[0-9]{8}-[0-9]{2}$/;
const headerKeys = new Set(["alg", "kid", "typ"]);
const requiredClaimKeys = new Set([
  "schema_version", "iss", "sub", "aud", "iat", "exp", "jti", "scope", "method", "path", "req_sha256",
]);
const optionalClaimKeys = new Set(["worker_instance", "job_id", "lease_epoch"]);
const workerScopes = new Set<string>(AUTOMATION_WORKER_SCOPES);
const n8nScopes = new Set<string>(AUTOMATION_N8N_SCOPES);

function blocked(blocker: AutomationServiceIdentityBlocker): AutomationServiceIdentityResult {
  return { accepted: false, identity: null, blockers: [blocker] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid base64url");
  return new Uint8Array(Buffer.from(value, "base64url"));
}

function parseJsonPart(value: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(Buffer.from(decodeBase64Url(value)).toString("utf8"));
  if (!isRecord(parsed)) throw new Error("invalid object");
  return parsed;
}

function exactHeader(header: Record<string, unknown>): boolean {
  return Object.keys(header).length === headerKeys.size && Object.keys(header).every((key) => headerKeys.has(key));
}

function exactClaims(claims: Record<string, unknown>): boolean {
  const keys = Object.keys(claims);
  return [...requiredClaimKeys].every((key) => key in claims) &&
    keys.every((key) => requiredClaimKeys.has(key) || optionalClaimKeys.has(key));
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function bodyHash(body: Uint8Array): string {
  return createHash("sha256").update(body).digest("hex");
}

function normalizeMethod(method: string): string | null {
  const normalized = method.trim().toUpperCase();
  return /^(GET|POST)$/.test(normalized) ? normalized : null;
}

function validPath(path: string): boolean {
  return path.startsWith("/") && path.length <= 240 && !path.includes("?") && !path.includes("#") && !path.includes("//");
}

function scopeAllowed(subject: string, scope: string): scope is AutomationServiceScope {
  if (subject === AUTOMATION_WORKER_SUBJECT) return workerScopes.has(scope);
  if (subject === AUTOMATION_N8N_SUBJECT) return n8nScopes.has(scope);
  return false;
}

export function parseAutomationPublicJwks(value: string | undefined): readonly AutomationPublicJwk[] {
  if (!value || value.length > 32_000) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed) || !Array.isArray(parsed.keys) || parsed.keys.length === 0 || parsed.keys.length > 4) return [];
    const kids = new Set<string>();
    const keys: AutomationPublicJwk[] = [];
    for (const candidate of parsed.keys) {
      if (!isRecord(candidate) || candidate.kty !== "OKP" || candidate.crv !== "Ed25519" ||
        candidate.alg !== AUTOMATION_JWT_ALGORITHM || candidate.use !== "sig" ||
        !Array.isArray(candidate.key_ops) || candidate.key_ops.length !== 1 || candidate.key_ops[0] !== "verify" ||
        typeof candidate.x !== "string" || candidate.x.length !== 43 || typeof candidate.kid !== "string" ||
        !keyIdPattern.test(candidate.kid) || kids.has(candidate.kid)) return [];
      kids.add(candidate.kid);
      keys.push(candidate as unknown as AutomationPublicJwk);
    }
    return keys;
  } catch {
    return [];
  }
}

export async function verifyAutomationServiceToken(
  input: VerifyAutomationServiceTokenInput,
): Promise<AutomationServiceIdentityResult> {
  if (!input.authorization?.startsWith("Bearer ")) return blocked("authorization_missing");
  const token = input.authorization.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => part.length === 0 || part.length > 12_000)) return blocked("token_format_invalid");
  const headerPart = parts[0];
  const claimsPart = parts[1];
  const signaturePart = parts[2];
  if (!headerPart || !claimsPart || !signaturePart) return blocked("token_format_invalid");

  let header: Record<string, unknown>;
  let claims: Record<string, unknown>;
  let signature: Uint8Array;
  try {
    header = parseJsonPart(headerPart);
    claims = parseJsonPart(claimsPart);
    signature = decodeBase64Url(signaturePart);
  } catch {
    return blocked("token_format_invalid");
  }
  if (!exactHeader(header) || header.alg !== AUTOMATION_JWT_ALGORITHM || header.typ !== "JWT" ||
    typeof header.kid !== "string" || !keyIdPattern.test(header.kid)) return blocked("header_invalid");
  const jwk = input.publicJwks.find((key) => key.kid === header.kid);
  if (!jwk) return blocked("key_unknown");

  try {
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "Ed25519" }, false, ["verify"]);
    const signatureBytes = Uint8Array.from(signature);
    const signingBytes = Uint8Array.from(new TextEncoder().encode(`${headerPart}.${claimsPart}`));
    const valid = await crypto.subtle.verify(
      { name: "Ed25519" },
      key,
      signatureBytes.buffer,
      signingBytes.buffer,
    );
    if (!valid) return blocked("signature_invalid");
  } catch {
    return blocked("signature_invalid");
  }

  if (!exactClaims(claims) || claims.schema_version !== AUTOMATION_SERVICE_JWT_SCHEMA_VERSION ||
    !isUuid(claims.jti) || typeof claims.iat !== "number" || !Number.isSafeInteger(claims.iat) ||
    typeof claims.exp !== "number" || !Number.isSafeInteger(claims.exp) ||
    typeof claims.scope !== "string" || claims.scope.includes(" ") ||
    typeof claims.req_sha256 !== "string" || !sha256Pattern.test(claims.req_sha256)) return blocked("claims_invalid");
  if (claims.iss !== claims.sub || (claims.sub !== AUTOMATION_WORKER_SUBJECT && claims.sub !== AUTOMATION_N8N_SUBJECT)) {
    return blocked("issuer_invalid");
  }
  if (claims.aud !== AUTOMATION_SERVICE_AUDIENCE) return blocked("audience_invalid");
  if (!scopeAllowed(claims.sub, claims.scope) || claims.scope !== input.expectedScope) return blocked("scope_invalid");
  if (claims.exp <= claims.iat || claims.exp - claims.iat > AUTOMATION_JWT_MAX_TTL_SECONDS) return blocked("ttl_invalid");
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1_000);
  if (claims.iat > now + AUTOMATION_JWT_MAX_CLOCK_SKEW_SECONDS ||
    claims.exp < now - AUTOMATION_JWT_MAX_CLOCK_SKEW_SECONDS) return blocked("clock_invalid");

  const method = normalizeMethod(input.method);
  if (!method || claims.method !== method || typeof claims.path !== "string" ||
    !validPath(claims.path) || claims.path !== input.normalizedPath || claims.req_sha256 !== bodyHash(input.requestBody)) {
    return blocked("request_binding_invalid");
  }

  const worker = claims.sub === AUTOMATION_WORKER_SUBJECT;
  const jobBound = ["job:execute", "job:heartbeat", "job:complete", "draft:write", "evidence:write", "report:write"]
    .includes(claims.scope);
  if ((worker && !isUuid(claims.worker_instance)) || (!worker && "worker_instance" in claims) ||
    (jobBound && (!isUuid(claims.job_id) || !Number.isSafeInteger(claims.lease_epoch) || Number(claims.lease_epoch) < 1)) ||
    (!jobBound && ("job_id" in claims || "lease_epoch" in claims))) return blocked("worker_binding_invalid");

  return {
    accepted: true,
    blockers: [],
    identity: {
      issuer: claims.iss as AutomationServiceIdentity["issuer"],
      subject: claims.sub as AutomationServiceIdentity["subject"],
      keyId: header.kid,
      jti: claims.jti,
      jtiDigest: createHash("sha256").update(`${claims.iss}:${claims.jti}`).digest("hex"),
      scope: claims.scope,
      requestHash: claims.req_sha256,
      issuedAt: claims.iat,
      expiresAt: claims.exp,
      workerInstance: worker ? claims.worker_instance as string : null,
      jobId: jobBound ? claims.job_id as string : null,
      leaseEpoch: jobBound ? Number(claims.lease_epoch) : null,
    },
  };
}
