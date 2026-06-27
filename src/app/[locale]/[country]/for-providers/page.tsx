import type { Metadata } from 'next';

import { normalizePublicBrandMetadata } from '@/lib/brand/public-brand-metadata';
import { normalizePublicBrandReactNode } from '@/lib/brand/public-brand-react';

import buildForProvidersPage, { generateMetadata as buildForProvidersMetadata } from './page-content';

type Params = { locale: string; country: string };

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  return normalizePublicBrandMetadata(await buildForProvidersMetadata(props));
}

export default async function ForProvidersPage(props: { params: Promise<Params> }) {
  return normalizePublicBrandReactNode(await buildForProvidersPage(props));
}
