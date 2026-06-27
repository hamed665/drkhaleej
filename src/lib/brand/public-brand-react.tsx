import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

import { normalizePublicBrandCopy } from './public-brand-copy';

const normalizableTextPropNames = ['aria-label', 'title', 'alt', 'placeholder'] as const;

export function normalizePublicBrandReactNode(node: ReactNode): ReactNode {
  if (typeof node === 'string') {
    return normalizePublicBrandCopy(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => normalizePublicBrandReactNode(child));
  }

  if (!isValidElement(node)) {
    return node;
  }

  const props = node.props as Record<string, unknown>;
  const nextProps: Record<string, unknown> = {};
  let hasChanges = false;

  if ('children' in props) {
    nextProps.children = normalizePublicBrandReactNode(props.children as ReactNode);
    hasChanges = true;
  }

  for (const propName of normalizableTextPropNames) {
    const propValue = props[propName];

    if (typeof propValue === 'string') {
      nextProps[propName] = normalizePublicBrandCopy(propValue);
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    return node;
  }

  return cloneElement(node as ReactElement<Record<string, unknown>>, nextProps);
}
