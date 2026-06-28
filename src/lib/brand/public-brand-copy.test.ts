import { describe, expect, it } from 'vitest';

import { normalizePublicBrandCopy } from './public-brand-copy';

describe('normalizePublicBrandCopy', () => {
  it('leaves DrKhaleej public copy unchanged', () => {
    expect(normalizePublicBrandCopy('DrKhaleej public profile')).toBe('DrKhaleej public profile');
    expect(normalizePublicBrandCopy('DrKhaleej provider onboarding')).toBe('DrKhaleej provider onboarding');
  });
});
