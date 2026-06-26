import type { Metadata } from 'next';

export type NoindexMetadataInput = {
  title: string;
  description: string;
};

export const noindexNofollowRobots: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false
};

export function createNoindexMetadata({ title, description }: NoindexMetadataInput): Metadata {
  return {
    title,
    description,
    robots: noindexNofollowRobots
  };
}
