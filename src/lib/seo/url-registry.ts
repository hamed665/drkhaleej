import { sitemapMarketCountries } from '@/lib/market/public-market';
import { localizedPathname, localizedRootPath, siteConfig, type SiteCountry, type SiteLocale } from '@/lib/seo/site';

export type PublicUrlFamily = 'home' | 'directory' | 'profile' | 'search' | 'geo_area' | 'geo_specialty' | 'geo_specialty_area' | 'service' | 'service_area' | 'provider_onboarding' | 'policy';
export type PublicUrlIndexPolicy = 'index' | 'noindex_follow' | 'blocked' | 'promotion_required';
export type PublicUrlSitemapPolicy = 'included' | 'excluded' | 'eligible_after_gate';
export type PublicUrlSchemaPolicy = 'site_identity' | 'breadcrumb_allowed' | 'disabled_until_evidence' | 'disabled';
export type PublicUrlLaunchStatus = 'launch_ready' | 'noindex_preview' | 'blocked' | 'future_gate_required';
export type PublicUrlInternalLinkRequirement = 'root_entry' | 'nav_or_contextual_parent' | 'directory_parent_required' | 'promotion_gate_required';
export type PublicUrlRequiredGuard = 'market-root' | 'trust-directory' | 'provider-onboarding' | 'policy-noindex' | 'search-utility-noindex' | 'money-page-needs-real-data' | 'offers-engine-not-public' | 'legacy-non-core-needs-reapproval' | 'parent-internal-link-contract' | 'schema-evidence-contract';
export type PublicUrlChangeFrequency = 'daily' | 'weekly' | 'monthly';

export type PublicUrlRegistryEntry = {
  readonly id: string;
  readonly route: string;
  readonly locale: SiteLocale;
  readonly country: SiteCountry;
  readonly family: PublicUrlFamily;
  readonly canonicalPath: string;
  readonly indexPolicy: PublicUrlIndexPolicy;
  readonly sitemapPolicy: PublicUrlSitemapPolicy;
  readonly parentRoute: string | null;
  readonly parentCanonicalPath: string | null;
  readonly requiredGuards: readonly PublicUrlRequiredGuard[];
  readonly internalLinkRequirement: PublicUrlInternalLinkRequirement;
  readonly schemaPolicy: PublicUrlSchemaPolicy;
  readonly launchStatus: PublicUrlLaunchStatus;
  readonly priority: number;
  readonly changeFrequency: PublicUrlChangeFrequency;
  readonly launchGateReason: PublicUrlRequiredGuard;
};

type StaticPublicUrlDefinition = Omit<PublicUrlRegistryEntry, 'id' | 'locale' | 'country' | 'canonicalPath' | 'parentCanonicalPath'>;

type StaticRouteInput = {
  readonly route: string;
  readonly family: StaticPublicUrlDefinition['family'];
  readonly indexPolicy: PublicUrlIndexPolicy;
  readonly sitemapPolicy: PublicUrlSitemapPolicy;
  readonly requiredGuards: readonly PublicUrlRequiredGuard[];
  readonly internalLinkRequirement: PublicUrlInternalLinkRequirement;
  readonly schemaPolicy: PublicUrlSchemaPolicy;
  readonly launchStatus: PublicUrlLaunchStatus;
  readonly priority: number;
  readonly changeFrequency: PublicUrlChangeFrequency;
  readonly launchGateReason: PublicUrlRequiredGuard;
};

const indexDirectoryGuards = ['trust-directory', 'parent-internal-link-contract'] as const;
const promotionGuards = ['money-page-needs-real-data', 'parent-internal-link-contract'] as const;

function staticRoute(input: StaticRouteInput): StaticPublicUrlDefinition {
  return { ...input, parentRoute: '/' };
}

function indexDirectory(route: string, priority: number): StaticPublicUrlDefinition {
  return staticRoute({ route, family: 'directory', indexPolicy: 'index', sitemapPolicy: 'included', requiredGuards: indexDirectoryGuards, internalLinkRequirement: 'nav_or_contextual_parent', schemaPolicy: 'breadcrumb_allowed', launchStatus: 'launch_ready', priority, changeFrequency: 'weekly', launchGateReason: 'trust-directory' });
}

function promotionDirectory(route: string, priority: number): StaticPublicUrlDefinition {
  return staticRoute({ route, family: 'directory', indexPolicy: 'promotion_required', sitemapPolicy: 'eligible_after_gate', requiredGuards: promotionGuards, internalLinkRequirement: 'promotion_gate_required', schemaPolicy: 'disabled_until_evidence', launchStatus: 'future_gate_required', priority, changeFrequency: 'weekly', launchGateReason: 'money-page-needs-real-data' });
}

function blockedDirectory(route: string, priority: number, launchGateReason: PublicUrlRequiredGuard, changeFrequency: PublicUrlChangeFrequency): StaticPublicUrlDefinition {
  return staticRoute({ route, family: 'directory', indexPolicy: 'blocked', sitemapPolicy: 'excluded', requiredGuards: [launchGateReason], internalLinkRequirement: 'promotion_gate_required', schemaPolicy: 'disabled', launchStatus: 'blocked', priority, changeFrequency, launchGateReason });
}

const publicStaticUrlDefinitions = [
  indexDirectory('/doctors', 0.8),
  promotionDirectory('/dental', 0.6),
  indexDirectory('/centers', 0.8),
  indexDirectory('/labs', 0.8),
  indexDirectory('/pharmacies', 0.85),
  indexDirectory('/hospitals', 0.85),
  blockedDirectory('/offers', 0.4, 'offers-engine-not-public', 'weekly'),
  promotionDirectory('/beauty', 0.5),
  blockedDirectory('/pet-clinics', 0.3, 'legacy-non-core-needs-reapproval', 'monthly'),
  blockedDirectory('/pet-shops', 0.3, 'legacy-non-core-needs-reapproval', 'monthly'),
  indexDirectory('/services', 0.75),
  staticRoute({ route: '/search', family: 'search', indexPolicy: 'noindex_follow', sitemapPolicy: 'excluded', requiredGuards: ['search-utility-noindex'], internalLinkRequirement: 'nav_or_contextual_parent', schemaPolicy: 'disabled', launchStatus: 'noindex_preview', priority: 0.4, changeFrequency: 'monthly', launchGateReason: 'search-utility-noindex' }),
  staticRoute({ route: '/for-providers', family: 'provider_onboarding', indexPolicy: 'index', sitemapPolicy: 'included', requiredGuards: ['provider-onboarding', 'parent-internal-link-contract'], internalLinkRequirement: 'nav_or_contextual_parent', schemaPolicy: 'breadcrumb_allowed', launchStatus: 'launch_ready', priority: 0.7, changeFrequency: 'weekly', launchGateReason: 'provider-onboarding' }),
  staticRoute({ route: '/source-policy', family: 'policy', indexPolicy: 'noindex_follow', sitemapPolicy: 'excluded', requiredGuards: ['policy-noindex'], internalLinkRequirement: 'promotion_gate_required', schemaPolicy: 'disabled', launchStatus: 'noindex_preview', priority: 0.25, changeFrequency: 'monthly', launchGateReason: 'policy-noindex' }),
] as const satisfies readonly StaticPublicUrlDefinition[];

function routeId(locale: SiteLocale, country: SiteCountry, route: string): string {
  return `${locale}_${country}_${route === '/' ? 'root' : route.replace(/^\//, '').replace(/\//g, '_')}`;
}

function normalizeRoute(route: string): string {
  const withLeadingSlash = route.startsWith('/') ? route : `/${route}`;
  const trimmed = withLeadingSlash.replace(/\/+$/g, '');
  return trimmed.length === 0 ? '/' : trimmed;
}

function canonicalPathForRoute(locale: SiteLocale, country: SiteCountry, route: string): string {
  return route === '/' ? localizedRootPath(locale, country) : localizedPathname(route, locale, country);
}

function countryRootUrlEntry(locale: SiteLocale, country: SiteCountry): PublicUrlRegistryEntry {
  return { id: routeId(locale, country, '/'), route: '/', locale, country, family: 'home', canonicalPath: localizedRootPath(locale, country), indexPolicy: 'index', sitemapPolicy: 'included', parentRoute: null, parentCanonicalPath: null, requiredGuards: ['market-root', 'schema-evidence-contract'], internalLinkRequirement: 'root_entry', schemaPolicy: 'site_identity', launchStatus: 'launch_ready', priority: 1, changeFrequency: 'weekly', launchGateReason: 'market-root' };
}

function localizedStaticUrlEntry(locale: SiteLocale, country: SiteCountry, definition: StaticPublicUrlDefinition): PublicUrlRegistryEntry {
  const route = normalizeRoute(definition.route);
  const parentRoute = definition.parentRoute === null ? null : normalizeRoute(definition.parentRoute);
  return { ...definition, id: routeId(locale, country, route), route, locale, country, canonicalPath: canonicalPathForRoute(locale, country, route), parentRoute, parentCanonicalPath: parentRoute === null ? null : canonicalPathForRoute(locale, country, parentRoute) };
}

export function listPublicUrlRegistryEntries(): PublicUrlRegistryEntry[] {
  return sitemapMarketCountries.flatMap((country) => siteConfig.locales.flatMap((locale) => [countryRootUrlEntry(locale, country), ...publicStaticUrlDefinitions.map((definition) => localizedStaticUrlEntry(locale, country, definition))]));
}

export function getPublicUrlRegistryEntry(input: { route: string; locale?: SiteLocale; country?: SiteCountry }): PublicUrlRegistryEntry | null {
  const locale = input.locale ?? siteConfig.defaultLocale;
  const country = input.country ?? siteConfig.defaultCountry;
  const canonicalPath = canonicalPathForRoute(locale, country, normalizeRoute(input.route));
  return listPublicUrlRegistryEntries().find((entry) => entry.canonicalPath === canonicalPath) ?? null;
}

export function isIndexablePublicUrlEntry(entry: PublicUrlRegistryEntry): boolean {
  return entry.indexPolicy === 'index' && entry.launchStatus === 'launch_ready';
}

export function isSitemapIncludedPublicUrlEntry(entry: PublicUrlRegistryEntry): boolean {
  return isIndexablePublicUrlEntry(entry) && entry.sitemapPolicy === 'included';
}

export function listSitemapIncludedPublicUrlEntries(): PublicUrlRegistryEntry[] {
  return listPublicUrlRegistryEntries().filter(isSitemapIncludedPublicUrlEntry);
}

export function hasRequiredInternalLinkContract(entry: PublicUrlRegistryEntry): boolean {
  if (entry.family === 'home') return entry.internalLinkRequirement === 'root_entry' && entry.parentRoute === null;
  if (!isIndexablePublicUrlEntry(entry)) return true;
  return entry.parentRoute !== null && entry.internalLinkRequirement !== 'root_entry';
}
