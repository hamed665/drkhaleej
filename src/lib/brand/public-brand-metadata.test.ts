import type { Metadata } from 'next';
import { describe, expect, it } from 'vitest';

import { normalizePublicBrandMetadata } from './public-brand-metadata';

describe('normalizePublicBrandMetadata', () => {
  it('normalizes legacy brand copy across public metadata fields', () => {
    const metadata: Metadata = {
      title: 'DrMuscat provider onboarding',
      description: 'Doctor Muscat and دكتور مسقط discovery copy.',
      openGraph: {
        title: 'Dr Muscat public profile',
        description: 'د. مسقط public discovery',
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'دکتر مسقط profile card',
        description: 'DrMuscat social preview'
      }
    };

    const normalized = normalizePublicBrandMetadata(metadata);

    expect(normalized.title).toBe('DrKhaleej provider onboarding');
    expect(normalized.description).toBe('DrKhaleej and DrKhaleej discovery copy.');
    expect(normalized.openGraph?.title).toBe('DrKhaleej public profile');
    expect(normalized.openGraph?.description).toBe('DrKhaleej public discovery');
    expect(normalized.twitter?.title).toBe('DrKhaleej profile card');
    expect(normalized.twitter?.description).toBe('DrKhaleej social preview');
  });
});
