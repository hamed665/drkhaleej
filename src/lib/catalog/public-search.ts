const MAX_PUBLIC_SEARCH_QUERY_LENGTH = 64;

export const PUBLIC_SEARCH_MIN_QUERY_LENGTH = 2;

const PUBLIC_SEARCH_ALIAS_GROUPS: readonly (readonly string[])[] = [
  ['Aster', 'Astra'],
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizePublicSearchQuery(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_PUBLIC_SEARCH_QUERY_LENGTH);
}

export function buildPublicSearchQueryVariants(input: string): string[] {
  const normalizedQuery = normalizePublicSearchQuery(input);

  if (normalizedQuery.length < PUBLIC_SEARCH_MIN_QUERY_LENGTH) {
    return [];
  }

  const variants = new Set<string>([normalizedQuery]);

  for (const aliasGroup of PUBLIC_SEARCH_ALIAS_GROUPS) {
    for (const alias of aliasGroup) {
      const aliasPattern = new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'gi');

      if (!aliasPattern.test(normalizedQuery)) continue;

      for (const replacement of aliasGroup) {
        variants.add(normalizedQuery.replace(aliasPattern, replacement));
      }
    }
  }

  return Array.from(variants).slice(0, 4);
}

export function dedupePublicSearchItems<T extends { id: string }>(items: readonly T[], limit: number): T[] {
  const seenIds = new Set<string>();
  const dedupedItems: T[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    dedupedItems.push(item);

    if (dedupedItems.length >= limit) break;
  }

  return dedupedItems;
}
