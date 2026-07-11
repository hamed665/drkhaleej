import "server-only";

import {
  IMPORT_OMAN_GEO_EXPECTED_GOVERNORATES,
  IMPORT_OMAN_GEO_EXPECTED_MUSCAT_AREAS,
  IMPORT_OMAN_GEO_EXPECTED_WILAYATS,
} from "./import-oman-geo-seed-validation";
import { IMPORT_PUBLIC_PERFORMANCE_BUDGET } from "./import-performance-guard";

export type ImportAdminGeoPerformanceReadOnlyModel = {
  mode: "read_only";
  geo: {
    countryCode: "om";
    expectedGovernorates: number;
    expectedWilayats: number;
    expectedMuscatAreas: number;
    databaseWriteReady: false;
    publicGeoReady: false;
  };
  performance: {
    maxPublicRenderQueries: number;
    maxPublicRenderTtfbMs: number;
    targetPublicRenderTtfbMs: number;
    maxHtmlPayloadKb: number;
    maxRouteJsPayloadKb: number;
    maxLargestContentfulPaintMs: number;
    maxInteractionToNextPaintMs: number;
    maxCumulativeLayoutShift: number;
    requiresStaticOrIsr: boolean;
    requiresOptimizedImages: boolean;
    requiresOptimizedFonts: boolean;
  };
  allowedActions: readonly [];
};

export function getImportAdminGeoPerformanceReadOnlyModel(): ImportAdminGeoPerformanceReadOnlyModel {
  return {
    mode: "read_only",
    geo: {
      countryCode: "om",
      expectedGovernorates: IMPORT_OMAN_GEO_EXPECTED_GOVERNORATES,
      expectedWilayats: IMPORT_OMAN_GEO_EXPECTED_WILAYATS,
      expectedMuscatAreas: IMPORT_OMAN_GEO_EXPECTED_MUSCAT_AREAS,
      databaseWriteReady: false,
      publicGeoReady: false,
    },
    performance: {
      maxPublicRenderQueries: IMPORT_PUBLIC_PERFORMANCE_BUDGET.maxPublicRenderQueries,
      maxPublicRenderTtfbMs: IMPORT_PUBLIC_PERFORMANCE_BUDGET.maxPublicRenderTtfbMs,
      targetPublicRenderTtfbMs: IMPORT_PUBLIC_PERFORMANCE_BUDGET.targetPublicRenderTtfbMs,
      maxHtmlPayloadKb: IMPORT_PUBLIC_PERFORMANCE_BUDGET.maxHtmlPayloadKb,
      maxRouteJsPayloadKb: IMPORT_PUBLIC_PERFORMANCE_BUDGET.maxRouteJsPayloadKb,
      maxLargestContentfulPaintMs: IMPORT_PUBLIC_PERFORMANCE_BUDGET.maxLargestContentfulPaintMs,
      maxInteractionToNextPaintMs: IMPORT_PUBLIC_PERFORMANCE_BUDGET.maxInteractionToNextPaintMs,
      maxCumulativeLayoutShift: IMPORT_PUBLIC_PERFORMANCE_BUDGET.maxCumulativeLayoutShift,
      requiresStaticOrIsr: IMPORT_PUBLIC_PERFORMANCE_BUDGET.requireStaticOrIsr,
      requiresOptimizedImages: IMPORT_PUBLIC_PERFORMANCE_BUDGET.requireOptimizedImages,
      requiresOptimizedFonts: IMPORT_PUBLIC_PERFORMANCE_BUDGET.requireOptimizedFonts,
    },
    allowedActions: [],
  };
}
