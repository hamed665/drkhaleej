import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  acceptAutomationServiceRequest,
  automationOperationScope,
  executeAutomationControlPlaneOperation,
} from "@/server/imports/automation-control-plane";
import {
  parseAutomationPublicJwks,
  verifyAutomationServiceToken,
} from "@/server/imports/automation-service-identity";
import { resolveAutomationPreviewActivation } from "@/server/imports/automation-preview-activation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NORMALIZED_PATH = "/api/internal/automation";
const MAX_BODY_BYTES = 64 * 1024;

function denied(code: string, status: number) {
  return NextResponse.json({ ok: false, code }, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

async function readBoundedBody(request: Request): Promise<Uint8Array | null> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) {
    return null;
  }
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  if (size === 0) return null;
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function previewBoundary(request: Request) {
  const activation = resolveAutomationPreviewActivation(process.env, "vercel");
  const previewRef = process.env.AUTOMATION_PREVIEW_PROJECT_REF?.trim();
  const productionRef = process.env.AUTOMATION_PRODUCTION_PROJECT_REF?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!activation.enabled || new URL(request.url).hostname !== activation.previewHost ||
    !previewRef || !productionRef ||
    previewRef === productionRef || !supabaseUrl || !serviceRoleKey || !supabaseUrl.includes(previewRef) ||
    supabaseUrl.includes(productionRef)) return null;
  return { supabaseUrl, serviceRoleKey };
}

export async function POST(request: Request) {
  const boundary = previewBoundary(request);
  if (boundary === null) return denied("automation_preview_boundary_closed", 503);
  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return denied("automation_content_type_invalid", 415);
  }

  const bodyBuffer = await readBoundedBody(request);
  if (bodyBuffer === null) return denied("automation_request_size_invalid", 413);
  let body: unknown;
  try {
    body = JSON.parse(Buffer.from(bodyBuffer).toString("utf8"));
  } catch {
    return denied("automation_request_json_invalid", 400);
  }
  const expectedScope = automationOperationScope(body);
  if (expectedScope === null) return denied("automation_operation_not_enabled", 403);

  const identity = await verifyAutomationServiceToken({
    authorization: request.headers.get("authorization"),
    publicJwks: parseAutomationPublicJwks(process.env.AUTOMATION_SERVICE_PUBLIC_JWKS_JSON),
    expectedScope,
    method: "POST",
    normalizedPath: NORMALIZED_PATH,
    requestBody: bodyBuffer,
  });
  if (!identity.accepted || identity.identity === null) {
    return denied(identity.blockers[0] ?? "automation_identity_rejected", 401);
  }

  const supabase = createClient(boundary.supabaseUrl, boundary.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "X-DrKhaleej-Automation": "v1" } },
  });
  const port = {
    rpc: async (name: string, params: Record<string, unknown>) => {
      const response = await supabase.rpc(name, params);
      return { data: response.data, error: response.error ? { code: response.error.code } : null };
    },
  };

  const replay = await acceptAutomationServiceRequest(port, identity.identity, "POST", NORMALIZED_PATH);
  if (replay !== null) return denied(String(replay.body.code ?? "automation_request_rejected"), replay.status);
  const result = await executeAutomationControlPlaneOperation(body, identity.identity, port);
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
