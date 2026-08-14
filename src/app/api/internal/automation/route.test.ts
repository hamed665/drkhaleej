import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));
vi.mock("@/server/imports/automation-control-plane", () => ({
  acceptAutomationServiceRequest: vi.fn(),
  automationOperationScope: vi.fn(() => "job:lease"),
  executeAutomationControlPlaneOperation: vi.fn(),
}));
vi.mock("@/server/imports/automation-service-identity", () => ({
  parseAutomationPublicJwks: vi.fn(() => []),
  verifyAutomationServiceToken: vi.fn(async () => ({
    accepted: false,
    identity: null,
    blockers: ["authorization_missing"],
  })),
}));

import { verifyAutomationServiceToken } from "@/server/imports/automation-service-identity";
import { POST } from "./route";

function openPreviewBoundary() {
  const sourceCommit = "a".repeat(40);
  vi.stubEnv("APP_ENV", "preview");
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("VERCEL_GIT_COMMIT_SHA", sourceCommit);
  vi.stubEnv("AUTOMATION_PREVIEW_ACTIVATION_ENABLED", "true");
  vi.stubEnv("AUTOMATION_PREVIEW_ACTIVATION_SHA", sourceCommit);
  vi.stubEnv("AUTOMATION_EMERGENCY_ENABLED", "true");
  vi.stubEnv("AUTOMATION_RUNTIME_PROBE_ENABLED", "true");
  vi.stubEnv("AUTOMATION_PREVIEW_PROJECT_REF", "previewref1234567890");
  vi.stubEnv("AUTOMATION_PRODUCTION_PROJECT_REF", "productionref1234567");
  vi.stubEnv("AUTOMATION_VERCEL_PREVIEW_HOST", "drkhaleej-preview-a1b2c3.vercel.app");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://previewref1234567890.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-only-service-key");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("internal automation route boundary", () => {
  it("fails closed before reading a request outside isolated Preview", async () => {
    const request = new Request("https://preview.example/api/internal/automation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "claim_job", jobTypes: ["report"] }),
    });
    const response = await POST(request);
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ code: "automation_preview_boundary_closed" });
    expect(verifyAutomationServiceToken).not.toHaveBeenCalled();
  });

  it("rejects non-JSON and declared oversized bodies before identity work", async () => {
    openPreviewBoundary();
    const nonJson = await POST(new Request("https://drkhaleej-preview-a1b2c3.vercel.app/api/internal/automation", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "{}",
    }));
    expect(nonJson.status).toBe(415);

    const oversized = await POST(new Request("https://drkhaleej-preview-a1b2c3.vercel.app/api/internal/automation", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": "65537" },
      body: "{}",
    }));
    expect(oversized.status).toBe(413);
    expect(verifyAutomationServiceToken).not.toHaveBeenCalled();
  });

  it("passes the exact bounded request bytes into signed identity verification", async () => {
    openPreviewBoundary();
    const body = JSON.stringify({ operation: "claim_job", jobTypes: ["report"] });
    const response = await POST(new Request("https://drkhaleej-preview-a1b2c3.vercel.app/api/internal/automation", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer invalid" },
      body,
    }));
    expect(response.status).toBe(401);
    expect(verifyAutomationServiceToken).toHaveBeenCalledWith(expect.objectContaining({
      method: "POST",
      normalizedPath: "/api/internal/automation",
      requestBody: new TextEncoder().encode(body),
    }));
  });

  it("rejects a different Vercel host before identity work", async () => {
    openPreviewBoundary();
    const response = await POST(new Request("https://production.example.com/api/internal/automation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "claim_job", jobTypes: ["report"] }),
    }));
    expect(response.status).toBe(503);
    expect(verifyAutomationServiceToken).not.toHaveBeenCalled();
  });
});
