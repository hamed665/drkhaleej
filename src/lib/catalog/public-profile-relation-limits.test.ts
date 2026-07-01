import { describe, expect, it } from 'vitest';

import {
  hiddenPublicProfileRelationCount,
  limitPublicProfileRelations,
  PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT,
  PUBLIC_CENTER_PROFILE_LOCATION_LIMIT,
  PUBLIC_CENTER_PROFILE_SERVICE_LIMIT,
  PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT,
  PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT,
} from './public-profile-relation-limits';

describe('public profile relation limits', () => {
  it('caps relation arrays without random ordering', () => {
    const items = Array.from({ length: 20 }, (_, index) => `item-${index + 1}`);

    expect(limitPublicProfileRelations(items, 3)).toEqual(['item-1', 'item-2', 'item-3']);
    expect(hiddenPublicProfileRelationCount(items, 3)).toBe(17);
  });

  it('keeps negative limits safe', () => {
    const items = ['a', 'b'];

    expect(limitPublicProfileRelations(items, -1)).toEqual([]);
    expect(hiddenPublicProfileRelationCount(items, -1)).toBe(2);
  });

  it('documents explicit center and doctor profile caps', () => {
    expect(PUBLIC_CENTER_PROFILE_LOCATION_LIMIT).toBe(6);
    expect(PUBLIC_CENTER_PROFILE_SERVICE_LIMIT).toBe(12);
    expect(PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT).toBe(12);
    expect(PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT).toBe(12);
    expect(PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT).toBe(8);
  });
});
