import type { Metadata } from 'next';

import { normalizePublicBrandCopy } from '@/lib/brand/public-brand-copy';
import { normalizePublicBrandReactNode } from '@/lib/brand/public-brand-react';

import buildForProvidersPage, { generateMetadata as buildForProvidersMetadata } from './page-content';

type Params = { locale: string; country: string };

function normalizeMetadataField<T>(value: T): T {
  return typeof value === 'string' ? (normalizePublicBrandCopy(value) as T) : value;
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
  return normalizePublicBrandReactNode(await buildForProvidersPage(props));
}
