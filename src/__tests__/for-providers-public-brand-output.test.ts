import { describe, expect, it } from 'vitest';
import { isValidElement, type ReactElement, type ReactNode } from 'react';

import ForProvidersPage, { generateMetadata } from '../app/[locale]/[country]/for-providers/page';

const legacyPublicBrandNames = ['DrMuscat', 'Dr Muscat', 'Doctor Muscat', 'دکتر مسقط', 'دكتور مسقط', 'د. مسقط'] as const;
const publicTextPropNames = ['aria-label', 'title', 'alt', 'placeholder'] as const;

type PublicElementProps = Record<string, unknown> & {
  children?: ReactNode;
};

function collectPublicText(node: ReactNode): string[] {
  if (typeof node === 'string' || typeof node === 'number') {
    return [String(node)];
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => collectPublicText(child));
  }

  if (!isValidElement(node)) {
    return [];
  }

  const props = (node as ReactElement<PublicElementProps>).props;
  const propText = publicTextPropNames.flatMap((propName) => {
    const value = props[propName];
    return typeof value === 'string' ? [value] : [];
  });

  return [...propText, ...collectPublicText(props.children)];
}

function expectNoLegacyBrandCopy(value: string): void {
  for (const legacyBrandName of legacyPublicBrandNames) {
    expect(value).not.toContain(legacyBrandName);
  }
}

describe('for-providers public brand output', () => {
  it('normalizes metadata output', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en', country: 'om' }) });
    const metadataText = [
      metadata.title,
      metadata.description,
      metadata.openGraph?.title,
      metadata.openGraph?.description,
      metadata.twitter?.title,
      metadata.twitter?.description
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' ');

    expect(metadataText).toContain('DrKhaleej');
    expectNoLegacyBrandCopy(metadataText);
  });

  it('normalizes rendered visible copy', async () => {
    const page = await ForProvidersPage({ params: Promise.resolve({ locale: 'en', country: 'om' }) });
    const publicText = collectPublicText(page).join(' ');

    expect(publicText).toContain('DrKhaleej');
    expectNoLegacyBrandCopy(publicText);
  });
});
