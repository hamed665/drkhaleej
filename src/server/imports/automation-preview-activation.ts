import "server-only";

export const AUTOMATION_PREVIEW_ACTIVATION_SCHEMA_VERSION =
  "drkhaleej.import.automationPreviewActivation.v1" as const;

export type AutomationPreviewRuntime = "vercel" | "render";

export type AutomationPreviewActivationBlocker =
  | "activation_disabled"
  | "environment_not_preview"
  | "emergency_switch_disabled"
  | "runtime_probe_disabled"
  | "source_commit_invalid"
  | "source_commit_mismatch"
  | "preview_identity_invalid"
  | "production_identity_present"
  | "vercel_runtime_invalid"
  | "render_runtime_invalid"
  | "preview_host_invalid";

export type AutomationPreviewActivation =
  | {
      enabled: true;
      runtime: AutomationPreviewRuntime;
      sourceCommit: string;
      previewProjectRef: string;
      previewHost: string;
      blockers: readonly [];
    }
  | {
      enabled: false;
      runtime: AutomationPreviewRuntime;
      sourceCommit: null;
      previewProjectRef: null;
      previewHost: null;
      blockers: readonly AutomationPreviewActivationBlocker[];
    };

const gitShaPattern = /^[a-f0-9]{40}$/;
const projectRefPattern = /^[a-z0-9]{8,40}$/;
const vercelHostPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/;

function bounded(value: string | undefined, maximum: number): string {
  const normalized = value?.trim() ?? "";
  return normalized.length <= maximum ? normalized : "";
}

export function resolveAutomationPreviewActivation(
  environment: Record<string, string | undefined>,
  runtime: AutomationPreviewRuntime,
): AutomationPreviewActivation {
  const blockers: AutomationPreviewActivationBlocker[] = [];
  const activationCommit = bounded(environment.AUTOMATION_PREVIEW_ACTIVATION_SHA, 40);
  const runtimeCommit = bounded(
    runtime === "vercel" ? environment.VERCEL_GIT_COMMIT_SHA : environment.RENDER_GIT_COMMIT,
    40,
  );
  const previewProjectRef = bounded(environment.AUTOMATION_PREVIEW_PROJECT_REF, 40);
  const productionProjectRef = bounded(environment.AUTOMATION_PRODUCTION_PROJECT_REF, 40);
  const previewHost = bounded(environment.AUTOMATION_VERCEL_PREVIEW_HOST, 253).toLowerCase();

  if (environment.AUTOMATION_PREVIEW_ACTIVATION_ENABLED !== "true") blockers.push("activation_disabled");
  if (environment.APP_ENV !== "preview") blockers.push("environment_not_preview");
  if (environment.AUTOMATION_EMERGENCY_ENABLED !== "true") blockers.push("emergency_switch_disabled");
  if (environment.AUTOMATION_RUNTIME_PROBE_ENABLED !== "true") blockers.push("runtime_probe_disabled");
  if (!gitShaPattern.test(activationCommit) || !gitShaPattern.test(runtimeCommit)) {
    blockers.push("source_commit_invalid");
  } else if (activationCommit !== runtimeCommit) {
    blockers.push("source_commit_mismatch");
  }
  if (!projectRefPattern.test(previewProjectRef)) blockers.push("preview_identity_invalid");
  if (!projectRefPattern.test(productionProjectRef) || previewProjectRef === productionProjectRef) {
    blockers.push("production_identity_present");
  }
  if (!vercelHostPattern.test(previewHost)) blockers.push("preview_host_invalid");

  if (runtime === "vercel") {
    if (environment.VERCEL_ENV !== "preview") blockers.push("vercel_runtime_invalid");
  } else if (
    environment.RENDER !== "true" ||
    environment.RENDER_GIT_REPO_SLUG !== "hamed665/drkhaleej" ||
    environment.IS_PULL_REQUEST !== "false"
  ) {
    blockers.push("render_runtime_invalid");
  }

  if (blockers.length > 0) {
    return {
      enabled: false,
      runtime,
      sourceCommit: null,
      previewProjectRef: null,
      previewHost: null,
      blockers: [...new Set(blockers)],
    };
  }

  return {
    enabled: true,
    runtime,
    sourceCommit: activationCommit,
    previewProjectRef,
    previewHost,
    blockers: [],
  };
}
