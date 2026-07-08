export type PublicSitemapEligibilityCandidate = {
  pathname: string;
  entityType: string;
  canonicalPath: string | null;
  publicRouteEnabled: boolean;
  publicSafe: boolean;
  indexable: boolean;
  sitemapEligible: boolean;
  hreflangReady: boolean;
  minimumInternalLinksPassed: boolean;
  contentScorePassed: boolean;
  blockedByImportedHospitalRelease: boolean;
};

export type PublicSitemapEligibilityResult = {
  eligible: boolean;
  reason:
    | 'eligible'
    | 'missing_pathname'
    | 'missing_canonical'
    | 'canonical_mismatch'
    | 'route_disabled'
    | 'not_public_safe'
    | 'not_indexable'
    | 'not_sitemap_eligible'
    | 'hreflang_not_ready'
    | 'minimum_internal_links_missing'
    | 'content_score_missing'
    | 'blocked_by_imported_hospital_release';
};

function hasPath(value: string): boolean {
  return value.startsWith('/') && value.trim().length > 1;
}

export function decidePublicSitemapEligibility(
  candidate: PublicSitemapEligibilityCandidate,
): PublicSitemapEligibilityResult {
  if (!hasPath(candidate.pathname)) return { eligible: false, reason: 'missing_pathname' };
  if (candidate.canonicalPath === null || !hasPath(candidate.canonicalPath)) return { eligible: false, reason: 'missing_canonical' };
  if (candidate.pathname !== candidate.canonicalPath) return { eligible: false, reason: 'canonical_mismatch' };
  if (!candidate.publicRouteEnabled) return { eligible: false, reason: 'route_disabled' };
  if (!candidate.publicSafe) return { eligible: false, reason: 'not_public_safe' };
  if (!candidate.indexable) return { eligible: false, reason: 'not_indexable' };
  if (!candidate.sitemapEligible) return { eligible: false, reason: 'not_sitemap_eligible' };
  if (!candidate.hreflangReady) return { eligible: false, reason: 'hreflang_not_ready' };
  if (!candidate.minimumInternalLinksPassed) return { eligible: false, reason: 'minimum_internal_links_missing' };
  if (!candidate.contentScorePassed) return { eligible: false, reason: 'content_score_missing' };
  if (candidate.blockedByImportedHospitalRelease) {
    return { eligible: false, reason: 'blocked_by_imported_hospital_release' };
  }

  return { eligible: true, reason: 'eligible' };
}
