import "server-only";

export type ImportPharmacyPrivatePublicExposureEvidence = {
  publicProfileResolved: boolean;
  routeStatus: number;
  robotsIndex: boolean | null;
  canonicalHref: string | null;
  hreflangCount: number;
  jsonLdCount: number;
  queryCount: number;
  listedInSearch: boolean;
  listedInSitemap: boolean;
  htmlBytes: number;
};

export type ImportPharmacyPrivatePublicExposureBlocker =
  | "public_profile_resolved"
  | "route_not_not_found"
  | "robots_index_enabled"
  | "canonical_exposed"
  | "hreflang_exposed"
  | "json_ld_exposed"
  | "query_budget_exceeded"
  | "search_leak"
  | "sitemap_leak"
  | "html_budget_exceeded";

export type ImportPharmacyPrivatePublicExposureVerification = {
  verified: boolean;
  blockers: readonly ImportPharmacyPrivatePublicExposureBlocker[];
  budgets: {
    maximumQueries: 2;
    maximumHtmlBytes: 120000;
  };
};

const MAXIMUM_PRIVATE_ROUTE_QUERIES = 2 as const;
const MAXIMUM_PRIVATE_ROUTE_HTML_BYTES = 120000 as const;

export function verifyImportPharmacyPrivatePublicExposure(
  evidence: ImportPharmacyPrivatePublicExposureEvidence,
): ImportPharmacyPrivatePublicExposureVerification {
  const blockers: ImportPharmacyPrivatePublicExposureBlocker[] = [];

  if (evidence.publicProfileResolved) blockers.push("public_profile_resolved");
  if (evidence.routeStatus !== 404) blockers.push("route_not_not_found");
  if (evidence.robotsIndex === true) blockers.push("robots_index_enabled");
  if (evidence.canonicalHref !== null) blockers.push("canonical_exposed");
  if (evidence.hreflangCount !== 0) blockers.push("hreflang_exposed");
  if (evidence.jsonLdCount !== 0) blockers.push("json_ld_exposed");
  if (evidence.queryCount > MAXIMUM_PRIVATE_ROUTE_QUERIES) blockers.push("query_budget_exceeded");
  if (evidence.listedInSearch) blockers.push("search_leak");
  if (evidence.listedInSitemap) blockers.push("sitemap_leak");
  if (evidence.htmlBytes > MAXIMUM_PRIVATE_ROUTE_HTML_BYTES) blockers.push("html_budget_exceeded");

  return {
    verified: blockers.length === 0,
    blockers,
    budgets: {
      maximumQueries: MAXIMUM_PRIVATE_ROUTE_QUERIES,
      maximumHtmlBytes: MAXIMUM_PRIVATE_ROUTE_HTML_BYTES,
    },
  };
}
