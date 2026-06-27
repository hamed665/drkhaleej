import { describe, expect, it } from 'vitest';

import { createBreadcrumbListJsonLd, createFaqPageJsonLd, createJsonLd, serializeJsonLd } from './jsonld';

const legacyPublicBrandNames = ['DrMuscat', 'Dr Muscat', 'Doctor Muscat', 'دکتر مسقط', 'دكتور مسقط', 'د. مسقط'] as const;

function expectNoLegacyBrandCopy(value: string): void {
  for (const legacyBrandName of legacyPublicBrandNames) {
    expect(value).not.toContain(legacyBrandName);
  }
}

describe('JSON-LD public brand normalization', () => {
  it('normalizes legacy brand copy in FAQPage schema output', () => {
    const schema = createFaqPageJsonLd([
      {
        question: 'Is DrMuscat a booking platform?',
        answer: 'Doctor Muscat and دكتور مسقط are legacy public brand names.'
      },
      {
        question: 'هل دکتر مسقط يقدم نصيحة طبية؟',
        answer: 'لا. د. مسقط هنا اسم قديم فقط.'
      }
    ]);
    const serialized = serializeJsonLd(schema);

    expect(serialized).toContain('DrKhaleej');
    expectNoLegacyBrandCopy(serialized);
  });

  it('normalizes legacy brand copy in breadcrumb schema output', () => {
    const schema = createBreadcrumbListJsonLd([
      { name: 'Dr Muscat home', item: 'https://www.drkhaleej.com/en/om' },
      { name: 'دكتور مسقط doctors', item: 'https://www.drkhaleej.com/en/om/doctors' }
    ]);
    const serialized = serializeJsonLd(schema);

    expect(serialized).toContain('DrKhaleej home');
    expect(serialized).toContain('DrKhaleej doctors');
    expectNoLegacyBrandCopy(serialized);
  });

  it('normalizes nested supported schema string fields', () => {
    const schema = createJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Doctor Muscat',
      description: 'دکتر مسقط public discovery platform',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'DrMuscat public office',
        addressCountry: 'OM'
      }
    });
    const serialized = serializeJsonLd(schema);

    expect(serialized).toContain('DrKhaleej');
    expectNoLegacyBrandCopy(serialized);
  });
});
