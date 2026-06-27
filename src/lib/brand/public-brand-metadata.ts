import type { Metadata } from 'next';

import { normalizePublicBrandCopy } from './public-brand-copy';

const metadataTitleTemplateFields = ['default', 'template', 'absolute'] as const;

function normalizeMetadataField<T>(value: T): T {
  if (typeof value === 'string') {
    return normalizePublicBrandCopy(value) as T;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  const metadataTitleTemplate = value as Record<string, unknown>;
  const normalizedTitleTemplate: Record<string, unknown> = { ...metadataTitleTemplate };
  let hasChanges = false;

  for (const field of metadataTitleTemplateFields) {
    const fieldValue = metadataTitleTemplate[field];

    if (typeof fieldValue === 'string') {
      normalizedTitleTemplate[field] = normalizePublicBrandCopy(fieldValue);
      hasChanges = true;
    }
  }

  return hasChanges ? (normalizedTitleTemplate as T) : value;
}

export function normalizePublicBrandMetadata(metadata: Metadata): Metadata {
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
