import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  AUTOMATION_SERVICE_AUDIENCE,
  AUTOMATION_SERVICE_JWT_SCHEMA_VERSION,
  AUTOMATION_WORKER_SUBJECT,
  parseAutomationPublicJwks,
  verifyAutomationServiceToken,
} from "./automation-service-identity";

const kid = "worker-preview-20260812-01";
const body = new TextEncoder().encode('{"operation":"claim_job"}');
const path = "/api/internal/automation";

function base64url(value: string | Uint8Array): string {
  return Buffer.from(value).toString("base64url");
}

function fixture(overrides: Record<string, unknown> = {}, headerOverrides: Record<string, unknown> = {}) {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const now = 1_786_561_200;
  const header = { alg: "Ed25519", kid, typ: "JWT", ...headerOverrides };
  const claims = {
    schema_version: AUTOMATION_SERVICE_JWT_SCHEMA_VERSION,
    iss: AUTOMATION_WORKER_SUBJECT,
    sub: AUTOMATION_WORKER_SUBJECT,
    aud: AUTOMATION_SERVICE_AUDIENCE,
    iat: now,
    exp: now + 300,
    jti: "11111111-1111-4111-8111-111111111111",
    scope: "job:lease",
    method: "POST",
    path,
    req_sha256: createHash("sha256").update(body).digest("hex"),
    worker_instance: "22222222-2222-4222-8222-222222222222",
    ...overrides,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const token = `${signingInput}.${base64url(sign(null, Buffer.from(signingInput), privateKey))}`;
  const exported = publicKey.export({ format: "jwk" });
  const jwks = parseAutomationPublicJwks(JSON.stringify({
    keys: [{ ...exported, kid, alg: "Ed25519", use: "sig", key_ops: ["verify"] }],
  }));
  return { token, jwks, now };
}

describe("automation service identity", () => {
  it("accepts an exact Ed25519 Worker request binding", async () => {
    const { token, jwks, now } = fixture();
    const result = await verifyAutomationServiceToken({
      authorization: `Bearer ${token}`,
      publicJwks: jwks,
      expectedScope: "job:lease",
      method: "POST",
      normalizedPath: path,
      requestBody: body,
      nowSeconds: now,
    });
    expect(result).toMatchObject({
      accepted: true,
      identity: {
        subject: AUTOMATION_WORKER_SUBJECT,
        scope: "job:lease",
        workerInstance: "22222222-2222-4222-8222-222222222222",
      },
    });
    expect(result.identity?.jtiDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects algorithm substitution, unknown keys and signature tampering", async () => {
    const wrongAlgorithm = fixture({}, { alg: "EdDSA" });
    expect((await verifyAutomationServiceToken({
      authorization: `Bearer ${wrongAlgorithm.token}`,
      publicJwks: wrongAlgorithm.jwks,
      expectedScope: "job:lease",
      method: "POST",
      normalizedPath: path,
      requestBody: body,
      nowSeconds: wrongAlgorithm.now,
    })).blockers).toEqual(["header_invalid"]);

    const valid = fixture();
    expect((await verifyAutomationServiceToken({
      authorization: `Bearer ${valid.token}`,
      publicJwks: [],
      expectedScope: "job:lease",
      method: "POST",
      normalizedPath: path,
      requestBody: body,
      nowSeconds: valid.now,
    })).blockers).toEqual(["key_unknown"]);
    const tamperedParts = valid.token.split(".");
    const [tamperedHeader, tamperedClaims, tamperedPart] = tamperedParts;
    if (!tamperedHeader || !tamperedClaims || !tamperedPart) throw new Error("invalid test token");
    const tamperedSignature = Buffer.from(tamperedPart, "base64url");
    tamperedSignature[0] = (tamperedSignature[0] ?? 0) ^ 1;
    const tampered = `${tamperedHeader}.${tamperedClaims}.${tamperedSignature.toString("base64url")}`;
    expect((await verifyAutomationServiceToken({
      authorization: `Bearer ${tampered}`,
      publicJwks: valid.jwks,
      expectedScope: "job:lease",
      method: "POST",
      normalizedPath: path,
      requestBody: body,
      nowSeconds: valid.now,
    })).blockers).toEqual(["signature_invalid"]);
  });

  it("rejects wrong audience, scope, TTL, clock and request body", async () => {
    for (const [overrides, expected] of [
      [{ aud: "wrong" }, "audience_invalid"],
      [{ scope: "publish" }, "scope_invalid"],
      [{ exp: 1_786_561_501 }, "ttl_invalid"],
      [{ iat: 1_786_561_300, exp: 1_786_561_400 }, "clock_invalid"],
    ] as const) {
      const current = fixture(overrides);
      const result = await verifyAutomationServiceToken({
        authorization: `Bearer ${current.token}`,
        publicJwks: current.jwks,
        expectedScope: "job:lease",
        method: "POST",
        normalizedPath: path,
        requestBody: body,
        nowSeconds: current.now,
      });
      expect(result.blockers).toEqual([expected]);
    }
    const current = fixture();
    const result = await verifyAutomationServiceToken({
      authorization: `Bearer ${current.token}`,
      publicJwks: current.jwks,
      expectedScope: "job:lease",
      method: "POST",
      normalizedPath: path,
      requestBody: new TextEncoder().encode("{}"),
      nowSeconds: current.now,
    });
    expect(result.blockers).toEqual(["request_binding_invalid"]);
  });

  it("requires job and lease binding for every protected Worker write", async () => {
    const unbound = fixture({ scope: "job:complete" });
    expect((await verifyAutomationServiceToken({
      authorization: `Bearer ${unbound.token}`,
      publicJwks: unbound.jwks,
      expectedScope: "job:complete",
      method: "POST",
      normalizedPath: path,
      requestBody: body,
      nowSeconds: unbound.now,
    })).blockers).toEqual(["worker_binding_invalid"]);
  });
});
