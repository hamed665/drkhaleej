import "server-only";

export type ImportPublicPageDataSource =
  | "public_indexable_entities"
  | "entity_internal_links_cache"
  | "schema_projection"
  | "canonical_geo_projection"
  | "public_content_projection"
  | "public_seo_projection"
  | "public_nearby_entities_projection"
  | "public_llm_answer_projection";

export type ImportPublicRenderOperation =
  | "read_public_entity_projection"
  | "read_internal_links_cache"
  | "read_schema_projection"
  | "read_canonical_geo_projection"
  | "read_public_content_projection"
  | "read_public_seo_projection"
  | "read_public_nearby_entities_projection"
  | "read_public_llm_answer_projection"
  | "generate_internal_links"
  | "generate_schema"
  | "generate_seo_metadata"
  | "generate_llm_answer_block"
  | "calculate_geo_distance"
  | "scan_raw_import_tables"
  | "write_publish_state"
  | "load_uncached_images"
  | "load_unoptimized_fonts"
  | "load_large_client_bundle";

export type ImportPerformanceBudget = {
  maxPublicRenderQueries: number;
  maxPublicRenderTtfbMs: number;
  targetPublicRenderTtfbMs: number;
  maxPublicRenderPayloadKb: number;
  maxHtmlPayloadKb: number;
  maxRouteJsPayloadKb: number;
  maxAboveFoldImageCount: number;
  maxLargestContentfulPaintMs: number;
  maxInteractionToNextPaintMs: number;
  maxCumulativeLayoutShift: number;
  requireCachedInternalLinks: boolean;
  requirePrecomputedSchema: boolean;
  requireCanonicalGeoProjection: boolean;
  requireSeoProjection: boolean;
  requireNearbyEntitiesProjection: boolean;
  requireLlmAnswerProjection: boolean;
  requireStaticOrIsr: boolean;
  requireOptimizedImages: boolean;
  requireOptimizedFonts: boolean;
};

export type ImportPublicRenderPlan = {
  routeId: string;
  operations: readonly ImportPublicRenderOperation[];
  dataSources: readonly ImportPublicPageDataSource[];
  queryCount: number;
  estimatedPayloadKb: number;
  estimatedHtmlPayloadKb: number;
  estimatedRouteJsPayloadKb: number;
  aboveFoldImageCount: number;
  estimatedLargestContentfulPaintMs: number | null;
  estimatedInteractionToNextPaintMs: number | null;
  estimatedCumulativeLayoutShift: number | null;
  usesIsrOrStaticGeneration: boolean;
  usesOptimizedImages: boolean;
  usesOptimizedFonts: boolean;
};

export type ImportPerformanceBlocker =
  | "too_many_public_render_queries"
  | "public_render_ttfb_over_budget"
  | "largest_contentful_paint_over_budget"
  | "interaction_to_next_paint_over_budget"
  | "cumulative_layout_shift_over_budget"
  | "public_render_payload_too_large"
  | "html_payload_too_large"
  | "route_js_payload_too_large"
  | "too_many_above_fold_images"
  | "missing_isr_or_static_generation"
  | "internal_links_not_cached"
  | "schema_not_precomputed"
  | "canonical_geo_not_projected"
  | "seo_projection_missing"
  | "nearby_entities_projection_missing"
  | "llm_answer_projection_missing"
  | "images_not_optimized"
  | "fonts_not_optimized"
  | "raw_import_table_read_in_public_render"
  | "runtime_internal_link_generation"
  | "runtime_schema_generation"
  | "runtime_seo_metadata_generation"
  | "runtime_llm_answer_generation"
  | "runtime_geo_distance_calculation"
  | "runtime_publish_state_write"
  | "uncached_image_loading"
  | "unoptimized_font_loading"
  | "large_client_bundle_loading";

export const IMPORT_PUBLIC_PERFORMANCE_BUDGET: ImportPerformanceBudget = {
  maxPublicRenderQueries: 5,
  maxPublicRenderTtfbMs: 2000,
  targetPublicRenderTtfbMs: 800,
  maxPublicRenderPayloadKb: 256,
  maxHtmlPayloadKb: 120,
  maxRouteJsPayloadKb: 180,
  maxAboveFoldImageCount: 1,
  maxLargestContentfulPaintMs: 2500,
  maxInteractionToNextPaintMs: 200,
  maxCumulativeLayoutShift: 0.1,
  requireCachedInternalLinks: true,
  requirePrecomputedSchema: true,
  requireCanonicalGeoProjection: true,
  requireSeoProjection: true,
  requireNearbyEntitiesProjection: true,
  requireLlmAnswerProjection: true,
  requireStaticOrIsr: true,
  requireOptimizedImages: true,
  requireOptimizedFonts: true,
};

const blockedPublicRenderOperations = new Map<ImportPublicRenderOperation, ImportPerformanceBlocker>([
  ["generate_internal_links", "runtime_internal_link_generation"],
  ["generate_schema", "runtime_schema_generation"],
  ["generate_seo_metadata", "runtime_seo_metadata_generation"],
  ["generate_llm_answer_block", "runtime_llm_answer_generation"],
  ["calculate_geo_distance", "runtime_geo_distance_calculation"],
  ["scan_raw_import_tables", "raw_import_table_read_in_public_render"],
  ["write_publish_state", "runtime_publish_state_write"],
  ["load_uncached_images", "uncached_image_loading"],
  ["load_unoptimized_fonts", "unoptimized_font_loading"],
  ["load_large_client_bundle", "large_client_bundle_loading"],
]);

function isMetricOverBudget(value: number | null, max: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > max;
}

export function getImportPerformanceBlockers(
  plan: ImportPublicRenderPlan,
  budget: ImportPerformanceBudget = IMPORT_PUBLIC_PERFORMANCE_BUDGET,
): readonly ImportPerformanceBlocker[] {
  const blockers: ImportPerformanceBlocker[] = [];

  if (plan.queryCount > budget.maxPublicRenderQueries) blockers.push("too_many_public_render_queries");
  if (isMetricOverBudget(plan.estimatedLargestContentfulPaintMs, budget.maxLargestContentfulPaintMs)) {
    blockers.push("largest_contentful_paint_over_budget");
  }
  if (isMetricOverBudget(plan.estimatedInteractionToNextPaintMs, budget.maxInteractionToNextPaintMs)) {
    blockers.push("interaction_to_next_paint_over_budget");
  }
  if (isMetricOverBudget(plan.estimatedCumulativeLayoutShift, budget.maxCumulativeLayoutShift)) {
    blockers.push("cumulative_layout_shift_over_budget");
  }
  if (plan.estimatedPayloadKb > budget.maxPublicRenderPayloadKb) blockers.push("public_render_payload_too_large");
  if (plan.estimatedHtmlPayloadKb > budget.maxHtmlPayloadKb) blockers.push("html_payload_too_large");
  if (plan.estimatedRouteJsPayloadKb > budget.maxRouteJsPayloadKb) blockers.push("route_js_payload_too_large");
  if (plan.aboveFoldImageCount > budget.maxAboveFoldImageCount) blockers.push("too_many_above_fold_images");
  if (budget.requireStaticOrIsr && !plan.usesIsrOrStaticGeneration) blockers.push("missing_isr_or_static_generation");
  if (budget.requireOptimizedImages && !plan.usesOptimizedImages) blockers.push("images_not_optimized");
  if (budget.requireOptimizedFonts && !plan.usesOptimizedFonts) blockers.push("fonts_not_optimized");

  if (budget.requireCachedInternalLinks && !plan.dataSources.includes("entity_internal_links_cache")) {
    blockers.push("internal_links_not_cached");
  }

  if (budget.requirePrecomputedSchema && !plan.dataSources.includes("schema_projection")) {
    blockers.push("schema_not_precomputed");
  }

  if (budget.requireCanonicalGeoProjection && !plan.dataSources.includes("canonical_geo_projection")) {
    blockers.push("canonical_geo_not_projected");
  }

  if (budget.requireSeoProjection && !plan.dataSources.includes("public_seo_projection")) {
    blockers.push("seo_projection_missing");
  }

  if (budget.requireNearbyEntitiesProjection && !plan.dataSources.includes("public_nearby_entities_projection")) {
    blockers.push("nearby_entities_projection_missing");
  }

  if (budget.requireLlmAnswerProjection && !plan.dataSources.includes("public_llm_answer_projection")) {
    blockers.push("llm_answer_projection_missing");
  }

  for (const operation of plan.operations) {
    const blocker = blockedPublicRenderOperations.get(operation);
    if (blocker) blockers.push(blocker);
  }

  return [...new Set(blockers)];
}

export function isImportPublicRenderPlanWithinBudget(
  plan: ImportPublicRenderPlan,
  budget: ImportPerformanceBudget = IMPORT_PUBLIC_PERFORMANCE_BUDGET,
): boolean {
  return getImportPerformanceBlockers(plan, budget).length === 0;
}

export function isImportPublicRenderPlanFastEnoughForTarget(
  plan: ImportPublicRenderPlan,
  budget: ImportPerformanceBudget = IMPORT_PUBLIC_PERFORMANCE_BUDGET,
): boolean {
  return plan.estimatedLargestContentfulPaintMs !== null && plan.estimatedLargestContentfulPaintMs <= budget.maxLargestContentfulPaintMs;
}
