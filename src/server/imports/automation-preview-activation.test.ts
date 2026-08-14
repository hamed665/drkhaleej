import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { resolveAutomationPreviewActivation } from "./automation-preview-activation";

const sourceCommit = "a".repeat(40);
const commonEnvironment = {
  AUTOMATION_PREVIEW_ACTIVATION_ENABLED: "true",
  AUTOMATION_PREVIEW_ACTIVATION_SHA: sourceCommit,
  AUTOMATION_EMERGENCY_ENABLED: "true",
  AUTOMATION_RUNTIME_PROBE_ENABLED: "true",
  AUTOMATION_PREVIEW_PROJECT_REF: "previewref1234567890",
  AUTOMATION_PRODUCTION_PROJECT_REF: "productionref1234567",
  AUTOMATION_VERCEL_PREVIEW_HOST: "drkhaleej-preview-a1b2c3.vercel.app",
  APP_ENV: "preview",
};

describe("resolveAutomationPreviewActivation", () => {
  it("admits only the exact Vercel Preview commit", () => {
    expect(resolveAutomationPreviewActivation({
      ...commonEnvironment,
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_SHA: sourceCommit,
    }, "vercel")).toEqual({
      enabled: true,
      runtime: "vercel",
      sourceCommit,
      previewProjectRef: "previewref1234567890",
      previewHost: "drkhaleej-preview-a1b2c3.vercel.app",
      blockers: [],
    });
  });

  it("admits only one manual Render instance from the reviewed repository commit", () => {
    expect(resolveAutomationPreviewActivation({
      ...commonEnvironment,
      RENDER: "true",
      RENDER_GIT_COMMIT: sourceCommit,
      RENDER_GIT_REPO_SLUG: "hamed665/drkhaleej",
      IS_PULL_REQUEST: "false",
    }, "render").enabled).toBe(true);
  });

  it("stays closed when activation or either runtime switch is absent", () => {
    const result = resolveAutomationPreviewActivation({
      ...commonEnvironment,
      AUTOMATION_PREVIEW_ACTIVATION_ENABLED: "false",
      AUTOMATION_EMERGENCY_ENABLED: "false",
      AUTOMATION_RUNTIME_PROBE_ENABLED: "false",
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_SHA: sourceCommit,
    }, "vercel");
    expect(result.enabled).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "activation_disabled",
      "emergency_switch_disabled",
      "runtime_probe_disabled",
    ]));
  });

  it("rejects cross-SHA Vercel/Render drift and Production identity reuse", () => {
    const result = resolveAutomationPreviewActivation({
      ...commonEnvironment,
      AUTOMATION_PRODUCTION_PROJECT_REF: "previewref1234567890",
      RENDER: "true",
      RENDER_GIT_COMMIT: "b".repeat(40),
      RENDER_GIT_REPO_SLUG: "other/repository",
      IS_PULL_REQUEST: "true",
    }, "render");
    expect(result.enabled).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "source_commit_mismatch",
      "production_identity_present",
      "render_runtime_invalid",
    ]));
  });

  it("rejects an unbounded or non-Vercel activation host", () => {
    const result = resolveAutomationPreviewActivation({
      ...commonEnvironment,
      AUTOMATION_VERCEL_PREVIEW_HOST: "production.example.com",
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_SHA: sourceCommit,
    }, "vercel");
    expect(result.enabled).toBe(false);
    expect(result.blockers).toContain("preview_host_invalid");
  });
});
