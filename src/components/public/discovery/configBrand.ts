import { normalizePublicBrandCopy } from '@/lib/brand/public-brand-copy';

import type { PublicDiscoveryPageConfig } from './publicDiscoveryPageConfig';

function cleanValue(value: unknown): unknown {
  if (typeof value === 'string') return normalizePublicBrandCopy(value);
  if (Array.isArray(value)) return value.map((entry) => cleanValue(entry));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cleanValue(entry)]));
  }
  return value;
}

export function cleanConfigBrand<T extends PublicDiscoveryPageConfig>(config: T): T {
  return cleanValue(config) as T;
}
