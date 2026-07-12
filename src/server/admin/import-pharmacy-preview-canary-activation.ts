import "server-only";

export type PharmacyPreviewCanaryActivationBlocker =
  | "activation_flag_disabled"
  | "environment_not_preview"
  | "actor_allowlist_must_have_exactly_one_entry"
  | "entity_allowlist_must_have_exactly_one_entry"
  | "approval_token_missing"
  | "approval_token_mismatch";

export type PharmacyPreviewCanaryActivation =
  | {
      enabled: true;
      actorId: string;
      entityId: string;
      approvalToken: string;
      blockers: readonly [];
    }
  | {
      enabled: false;
      actorId: null;
      entityId: null;
      approvalToken: null;
      blockers: readonly PharmacyPreviewCanaryActivationBlocker[];
    };

function parseSingle(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function resolvePharmacyPreviewCanaryActivation(
  environment: Record<string, string | undefined>,
): PharmacyPreviewCanaryActivation {
  const blockers: PharmacyPreviewCanaryActivationBlocker[] = [];
  const actorIds = parseSingle(environment.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS);
  const entityIds = parseSingle(environment.IMPORT_PREVIEW_CANARY_ENTITY_IDS);
  const approvalToken = environment.IMPORT_PREVIEW_APPROVAL_TOKEN?.trim() ?? "";
  const expectedApprovalToken = environment.IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN?.trim() ?? "";

  if (environment.IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED !== "true") {
    blockers.push("activation_flag_disabled");
  }
  if (environment.VERCEL_ENV !== "preview") blockers.push("environment_not_preview");
  if (actorIds.length !== 1) blockers.push("actor_allowlist_must_have_exactly_one_entry");
  if (entityIds.length !== 1) blockers.push("entity_allowlist_must_have_exactly_one_entry");
  if (!approvalToken || !expectedApprovalToken) blockers.push("approval_token_missing");
  if (approvalToken && expectedApprovalToken && approvalToken !== expectedApprovalToken) {
    blockers.push("approval_token_mismatch");
  }

  if (blockers.length > 0) {
    return {
      enabled: false,
      actorId: null,
      entityId: null,
      approvalToken: null,
      blockers: [...new Set(blockers)],
    };
  }

  return {
    enabled: true,
    actorId: actorIds[0]!,
    entityId: entityIds[0]!,
    approvalToken,
    blockers: [],
  };
}
