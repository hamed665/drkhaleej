import { describe, expect, it } from 'vitest';

import {
  buildPublicSearchQueryVariants,
  dedupePublicSearchItems,
  normalizePublicSearchQuery,
} from './public-search';

describe('public search helpers', () => {
  it('normalizes noisy public search input', () => {
    expect(normalizePublicSearchQuery('  Aster!!!\nClinic  ')).toBe('Aster Clinic');
  });

  it('keeps short normalized queries out of runtime search', () => {
    expect(buildPublicSearchQueryVariants('a')).toEqual([]);
  });

  it('adds conservative Aster and Astra variants', () => {
    expect(buildPublicSearchQueryVariants('Aster Hospital')).toEqual(['Aster Hospital', 'Astra Hospital']);
    expect(buildPublicSearchQueryVariants('Astra Hospital')).toEqual(['Astra Hospital', 'Aster Hospital']);
  });

  it('deduplicates merged public search items without exceeding the limit', () => {
    const items = [
      { id: 'center-1', name: 'Aster Hospital' },
      { id: 'center-2', name: 'Astra Clinic' },
      { id: 'center-1', name: 'Aster Hospital duplicate' },
      { id: 'center-3', name: 'Another Center' },
    ];

    expect(dedupePublicSearchItems(items, 2)).toEqual([
      { id: 'center-1', name: 'Aster Hospital' },
      { id: 'center-2', name: 'Astra Clinic' },
    ]);
  });
});
