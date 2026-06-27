import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { normalizePublicBrandReactNode } from './public-brand-react';

type TestElementProps = Record<string, unknown> & {
  children?: ReactNode;
};

function collectText(node: ReactNode): string[] {
  if (typeof node === 'string' || typeof node === 'number') {
    return [String(node)];
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => collectText(child));
  }

  if (!isValidElement(node)) {
    return [];
  }

  const props = (node as ReactElement<TestElementProps>).props;
  const propText = ['aria-label', 'title', 'alt', 'placeholder'].flatMap((propName) => {
    const value = props[propName];
    return typeof value === 'string' ? [value] : [];
  });

  return [...propText, ...collectText(props.children)];
}

describe('normalizePublicBrandReactNode', () => {
  it('normalizes string text nodes', () => {
    expect(normalizePublicBrandReactNode('DrMuscat public discovery')).toBe('DrKhaleej public discovery');
  });

  it('normalizes nested element children and public text props', () => {
    const node = createElement(
      'section',
      { 'aria-label': 'DrMuscat onboarding area', title: 'Doctor Muscat provider page' },
      createElement('h1', null, 'Prepare your public DrMuscat profile'),
      createElement('img', { alt: 'دكتور مسقط provider preview' }),
      createElement('input', { placeholder: 'Search Dr Muscat providers' })
    );

    const normalized = normalizePublicBrandReactNode(node);
    const publicText = collectText(normalized).join(' ');

    expect(publicText).toContain('DrKhaleej');
    expect(publicText).not.toContain('DrMuscat');
    expect(publicText).not.toContain('Doctor Muscat');
    expect(publicText).not.toContain('Dr Muscat');
    expect(publicText).not.toContain('دكتور مسقط');
  });
});
