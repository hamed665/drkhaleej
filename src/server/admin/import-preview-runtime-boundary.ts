import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { ImportSupabaseRpcClient } from "./import-supabase-publish-persistence-adapter";

export const IMPORT_PREVIEW_RUNTIME_EXECUTION_ENABLED = false as const;

const REQUIRED_ENVIRONMENT = "preview" as const;
const DEFAULT_SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
const DEFAULT_SERVICE_ROLE_KEY_ENV = "SUPABASE_SERVICE_ROLE_KEY";
const DEFAULT_ACTOR_ALLOWLIST_ENV = "IMPORT_PREVIEW_ALLOWED_ACTOR_IDS";
const DEFAULT_ENTITY_ALLOWLIST_ENV = "IMPORT_PREVIEW_CANARY_ENTITY_IDS";

export type ImportPreviewRuntimeBoundaryBlocker =
  | "environment_not_preview"
  | "supabase_url_missing"
  | "supabase_url_invalid"
  | "service_role_key_missing"
  | "actor_allowlist_missing"
  | "entity_allowlist_missing"
  | "runtime_execution_disabled";

export type ImportPreviewRuntimeBoundaryInput = {
  environment: string | undefined;
  supabaseUrl: string | undefined;
  serviceRoleKey: string | undefined;
  allowedActorIds: string | undefined;
  allowedEntityIds: string | undefined;
};

export type ImportPreviewRuntimeBoundaryResult = {
  mode: "preview_runtime_disabled";
  boundaryReady: boolean;
  clientConstructed: boolean;
  rpcClient: ImportSupabaseRpcClient | null;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
  executionReady: false;
  rpcExecutionAllowed: false;
  entityMutationAllowed: false;
  terminalPersistenceAllowed: false;
  bulkAllowed: false;
  blockers: readonly ImportPreviewRuntimeBoundaryBlocker[];
};

type RuntimeEnvironment = Record<string, string | undefined>;

type SupabaseClientFactory = (url: string, serviceRoleKey: string) => SupabaseClient;

function parseAllowlist(value: string | undefined): string[] {
  if (!value) return [];

  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function defaultClientFactory(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function readImportPreviewRuntimeBoundaryInput(
  environment: RuntimeEnvironment = process.env,
): ImportPreviewRuntimeBoundaryInput {
  return {
    environment: environment.VERCEL_ENV,
    supabaseUrl: environment[DEFAULT_SUPABASE_URL_ENV],
    serviceRoleKey: environment[DEFAULT_SERVICE_ROLE_KEY_ENV],
    allowedActorIds: environment[DEFAULT_ACTOR_ALLOWLIST_ENV],
    allowedEntityIds: environment[DEFAULT_ENTITY_ALLOWLIST_ENV],
  };
}

export function createImportPreviewRuntimeBoundary(
  input: ImportPreviewRuntimeBoundaryInput,
  createSupabaseClient: SupabaseClientFactory = defaultClientFactory,
): ImportPreviewRuntimeBoundaryResult {
  const blockers: ImportPreviewRuntimeBoundaryBlocker[] = [];
  const allowedActorIds = parseAllowlist(input.allowedActorIds);
  const allowedEntityIds = parseAllowlist(input.allowedEntityIds);
  const supabaseUrl = input.supabaseUrl?.trim() ?? "";
  const serviceRoleKey = input.serviceRoleKey?.trim() ?? "";

  if (input.environment !== REQUIRED_ENVIRONMENT) blockers.push("environment_not_preview");
  if (!supabaseUrl) blockers.push("supabase_url_missing");
  else if (!isValidHttpsUrl(supabaseUrl)) blockers.push("supabase_url_invalid");
  if (!serviceRoleKey) blockers.push("service_role_key_missing");
  if (allowedActorIds.length === 0) blockers.push("actor_allowlist_missing");
  if (allowedEntityIds.length === 0) blockers.push("entity_allowlist_missing");
  if (!IMPORT_PREVIEW_RUNTIME_EXECUTION_ENABLED) blockers.push("runtime_execution_disabled");

  const uniqueBlockers = [...new Set(blockers)];
  const boundaryReady = uniqueBlockers.every((blocker) => blocker === "runtime_execution_disabled");

  if (!boundaryReady) {
    return {
      mode: "preview_runtime_disabled",
      boundaryReady: false,
      clientConstructed: false,
      rpcClient: null,
      allowedActorIds,
      allowedEntityIds,
      executionReady: false,
      rpcExecutionAllowed: false,
      entityMutationAllowed: false,
      terminalPersistenceAllowed: false,
      bulkAllowed: false,
      blockers: uniqueBlockers,
    };
  }

  const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
  const rpcClient: ImportSupabaseRpcClient = {
    rpc: async (name, params) => {
      if (!IMPORT_PREVIEW_RUNTIME_EXECUTION_ENABLED) {
        return {
          data: null,
          error: { code: "preview_runtime_disabled", message: "Preview RPC execution is disabled." },
        };
      }

      const response = await supabase.rpc(name, params);
      return { data: response.data, error: response.error };
    },
  };

  return {
    mode: "preview_runtime_disabled",
    boundaryReady: true,
    clientConstructed: true,
    rpcClient,
    allowedActorIds,
    allowedEntityIds,
    executionReady: false,
    rpcExecutionAllowed: false,
    entityMutationAllowed: false,
    terminalPersistenceAllowed: false,
    bulkAllowed: false,
    blockers: uniqueBlockers,
  };
}
