import type {
  PublicProviderDiscoveryEntry,
  PublicProviderEntityType,
  PublicProviderFamily,
} from "./public-provider-projection";

export type PublicProviderListOptions = {
  country?: "om";
  family?: PublicProviderFamily;
  entityType?: PublicProviderEntityType;
  limit?: number;
  includeImported?: boolean;
};

const DEFAULT_PROVIDER_LIMIT = 20;
const MAX_PROVIDER_LIMIT = 50;

function clampProviderLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || Number.isNaN(limit)) return DEFAULT_PROVIDER_LIMIT;
  if (limit < 1) return 1;
  return Math.min(limit, MAX_PROVIDER_LIMIT);
}

function providerKey(entry: PublicProviderDiscoveryEntry): string {
  return `${entry.country}:${entry.family}:${entry.slug}`.toLocaleLowerCase();
}

function matchesProviderOptions(entry: PublicProviderDiscoveryEntry, options: PublicProviderListOptions): boolean {
  if (options.country && entry.country !== options.country) return false;
  if (options.family && entry.family !== options.family) return false;
  if (options.entityType && entry.entityType !== options.entityType) return false;
  return true;
}

export function mergePublicProviderDiscoveryEntries(
  manualEntries: readonly PublicProviderDiscoveryEntry[],
  importedEntries: readonly PublicProviderDiscoveryEntry[],
  options: PublicProviderListOptions = {},
): PublicProviderDiscoveryEntry[] {
  const limit = clampProviderLimit(options.limit);
  const includeImported = options.includeImported ?? true;
  const merged: PublicProviderDiscoveryEntry[] = [];
  const seen = new Set<string>();

  for (const entry of manualEntries) {
    if (!matchesProviderOptions(entry, options)) continue;
    if (!entry.publicDiscoveryEligible) continue;

    seen.add(providerKey(entry));
    merged.push(entry);
  }

  if (includeImported) {
    for (const entry of importedEntries) {
      if (!matchesProviderOptions(entry, options)) continue;
      if (!entry.publicDiscoveryEligible) continue;

      const key = providerKey(entry);
      if (seen.has(key)) continue;

      seen.add(key);
      merged.push(entry);
    }
  }

  return merged.slice(0, limit);
}

export function publicProviderSitemapEntries(
  entries: readonly PublicProviderDiscoveryEntry[],
  options: PublicProviderListOptions = {},
): PublicProviderDiscoveryEntry[] {
  const limit = clampProviderLimit(options.limit);

  return entries
    .filter((entry) => matchesProviderOptions(entry, options))
    .filter((entry) => entry.publicDiscoveryEligible && entry.publicSitemapEligible)
    .slice(0, limit);
}
