import { describe, expect, it } from 'vitest';

import { buildLocalizedMetadata } from './metadata';

describe('buildLocalizedMetadata', () => {
  it('normalizes legacy brand copy across metadata outputs', () => {
    const metadata = buildLocalizedMetadata({
      locale: 'en',
      country: 'om',
      pathname: '/for-providers',
      title: 'List your business with DrMuscat',
      description: 'Doctor Muscat and دكتور مسقط provider discovery copy.'
    });

    expect(metadata.title).toBe('List your business with DrKhaleej');
    expect(metadata.description).toBe('DrKhaleej and DrKhaleej provider discovery copy.');
    expect(metadata.openGraph?.title).toBe('List your business with DrKhaleej');
    expect(metadata.openGraph?.description).toBe('DrKhaleej and DrKhaleej provider discovery copy.');
    expect(metadata.twitter?.title).toBe('List your business with DrKhaleej');
    expect(metadata.twitter?.description).toBe('DrKhaleej and DrKhaleej provider discovery copy.');
  });
});
