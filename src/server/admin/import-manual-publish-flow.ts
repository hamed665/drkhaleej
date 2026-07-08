import "server-only";

import { getEntityReadiness, type ImportEntityReadiness, type ImportReadinessInput } from "./import-readiness-engine";
import { isImportPublicRenderPlanWithinBudget, type ImportPublicRenderPlan } from "./import-performance-guard";

export type ImportManualPublishStep =
  | "validate_readiness"
  | "generate_internal_links"
  | "generate_schema"
  | "check_sitemap_eligibility"
  | "check_public_render_budget"
  | "manual_approve"
  | "publish";

export type ImportManualPublishStepStatus = "pending" | "complete" | "blocked";

export type ImportManualPublishBlocker =
  | "readiness_blocked"
  | "internal_links_not_generated"
  | "schema_not_generated"
  | "sitemap_not_eligible"
  | "public_render_budget_failed"
  | "manual_approval_missing"
  | "publish_step_not_reached";

export type ImportManualPublishFlowInput = {
  readinessInput: ImportReadinessInput;
  publicRenderPlan: ImportPublicRenderPlan;
  internalLinksGenerated: boolean;
  schemaGenerated: boolean;
  manualApproved: boolean;
};

export type ImportManualPublishFlowStep = {
  step: ImportManualPublishStep;
  status: ImportManualPublishStepStatus;
  blockers: readonly ImportManualPublishBlocker[];
};

export type ImportManualPublishFlowResult = {
  readiness: ImportEntityReadiness;
  canPublish: boolean;
  steps: readonly ImportManualPublishFlowStep[];
  blockers: readonly ImportManualPublishBlocker[];
};

export const IMPORT_MANUAL_PUBLISH_ORDER: readonly ImportManualPublishStep[] = [
  "validate_readiness",
  "generate_internal_links",
  "generate_schema",
  "check_sitemap_eligibility",
  "check_public_render_budget",
  "manual_approve",
  "publish",
];

export function getManualPublishFlow(input: ImportManualPublishFlowInput): ImportManualPublishFlowResult {
  const readiness = getEntityReadiness(input.readinessInput);
  const publicRenderWithinBudget = isImportPublicRenderPlanWithinBudget(input.publicRenderPlan);
  const blockers: ImportManualPublishBlocker[] = [];

  if (!readiness.publishReady) blockers.push("readiness_blocked");
  if (!input.internalLinksGenerated) blockers.push("internal_links_not_generated");
  if (!input.schemaGenerated) blockers.push("schema_not_generated");
  if (!readiness.sitemapReady) blockers.push("sitemap_not_eligible");
  if (!publicRenderWithinBudget) blockers.push("public_render_budget_failed");
  if (!input.manualApproved) blockers.push("manual_approval_missing");

  const steps: ImportManualPublishFlowStep[] = [
    {
      step: "validate_readiness",
      status: readiness.publishReady ? "complete" : "blocked",
      blockers: readiness.publishReady ? [] : ["readiness_blocked"],
    },
    {
      step: "generate_internal_links",
      status: input.internalLinksGenerated ? "complete" : "blocked",
      blockers: input.internalLinksGenerated ? [] : ["internal_links_not_generated"],
    },
    {
      step: "generate_schema",
      status: input.schemaGenerated ? "complete" : "blocked",
      blockers: input.schemaGenerated ? [] : ["schema_not_generated"],
    },
    {
      step: "check_sitemap_eligibility",
      status: readiness.sitemapReady ? "complete" : "blocked",
      blockers: readiness.sitemapReady ? [] : ["sitemap_not_eligible"],
    },
    {
      step: "check_public_render_budget",
      status: publicRenderWithinBudget ? "complete" : "blocked",
      blockers: publicRenderWithinBudget ? [] : ["public_render_budget_failed"],
    },
    {
      step: "manual_approve",
      status: input.manualApproved ? "complete" : "blocked",
      blockers: input.manualApproved ? [] : ["manual_approval_missing"],
    },
    {
      step: "publish",
      status: blockers.length === 0 ? "complete" : "pending",
      blockers: blockers.length === 0 ? [] : ["publish_step_not_reached"],
    },
  ];

  return {
    readiness,
    canPublish: blockers.length === 0,
    steps,
    blockers: [...new Set(blockers)],
  };
}

export function canManualPublish(input: ImportManualPublishFlowInput): boolean {
  return getManualPublishFlow(input).canPublish;
}
