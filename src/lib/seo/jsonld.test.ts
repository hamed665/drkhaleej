import { describe, expect, it } from 'vitest';

import { createBreadcrumbListJsonLd, createFaqPageJsonLd, createJsonLd, serializeJsonLd } from './jsonld';

describe('JSON-LD public brand contract', () => {
  it('keeps DrKhaleej copy in FAQPage schema output', () => {
    const schema = createFaqPageJsonLd([
      {
        question: 'Is DrKhaleej a booking platform?',
        answer: 'DrKhaleej is a public healthcare discovery directory.'
      },
      {
        question: 'Does DrKhaleej provide medical advice?',
        answer: 'No. DrKhaleej is for public discovery only.'
      }
    ]);
    const serialized = serializeJsonLd(schema);

    expect(serialized).toContain('DrKhaleej');
  });

  it('keeps DrKhaleej copy in breadcrumb schema output', () => {
    const schema = createBreadcrumbListJsonLd([
      { name: 'DrKhaleej home', item: 'https://www.drkhaleej.com/en/om' },
      { name: 'DrKhaleej doctors', item: 'https://www.drkhaleej.com/en/om/doctors' }
    ]);
    const serialized = serializeJsonLd(schema);

    expect(serialized).toContain('DrKhaleej home');
    expect(serialized).toContain('DrKhaleej doctors');
  });

  it('keeps nested supported schema string fields unchanged', () => {
    const schema = createJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'DrKhaleej',
      description: 'DrKhaleej public discovery platform',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'DrKhaleej public office',
        addressCountry: 'OM'
      }
    });
    const serialized = serializeJsonLd(schema);

    expect(serialized).toContain('DrKhaleej');
  });
});
