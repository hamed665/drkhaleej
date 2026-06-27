import type { Metadata } from 'next';
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

import { normalizePublicBrandCopy } from '@/lib/brand/public-brand-copy';

import buildForProvidersPage, { generateMetadata as buildForProvidersMetadata } from './page-content';

type Params = { locale: string; country: string };

const normalizableTextPropNames = ['aria-label', 'title', 'alt', 'placeholder'] as const;

function normalizeMetadataField<T>(value: T): T {
  return typeof value === 'string' ? (normalizePublicBrandCopy(value) as T) : value;
}

function normalizeRenderedNode(node: ReactNode): ReactNode {
  if (typeof node === 'string') {
    return normalizePublicBrandCopy(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => normalizeRenderedNode(child));
  }

  if (!isValidElement(node)) {
    return node;
  }

  const props = node.props as Record<string, unknown>;
  const nextProps: Record<string, unknown> = {};
  let hasChanges = false;

  if ('children' in props) {
    nextProps.children = normalizeRenderedNode(props.children as ReactNode);
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

function normalizeForProvidersMetadata(metadata: Metadata): Metadata {
  return {
    ...metadata,
    title: normalizeMetadataField(metadata.title),
    description: normalizeMetadataField(metadata.description),
    openGraph: metadata.openGraph
      ? {
          ...metadata.openGraph,
          title: normalizeMetadataField(metadata.openGraph.title),
          description: normalizeMetadataField(metadata.openGraph.description)
        }
      : metadata.openGraph,
    twitter: metadata.twitter
      ? {
          ...metadata.twitter,
          title: normalizeMetadataField(metadata.twitter.title),
          description: normalizeMetadataField(metadata.twitter.description)
        }
      : metadata.twitter
  };
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  return normalizeForProvidersMetadata(await buildForProvidersMetadata(props));
}

export default async function ForProvidersPage(props: { params: Promise<Params> }) {
  return normalizeRenderedNode(await buildForProvidersPage(props));
}
