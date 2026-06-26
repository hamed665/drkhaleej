import type {
  PublicProfileEntityType,
  PublicProfileReadinessStatus,
  PublicProfileReviewStatus
} from '@/lib/profiles/public-profile-guards';
import { evaluatePublicProfilePublication } from '@/lib/profiles/public-profile-guards';

export type PublicAreaProviderInput = {
  id: string;
  entityType: PublicProfileEntityType;
  isActive: boolean;
  reviewStatus: PublicProfileReviewStatus;
  readinessStatus: PublicProfileReadinessStatus;
  slug: string | null;
  displayName: string | null;
  hasUnsafeMedicalClaims: boolean;
  href?: string | null;
  categoryLabel?: string | null;
  summary?: string | null;
};

export type PublicAreaFeaturedProviderCard = {
  id: string;
  href?: string | null;
  displayName: string;
  entityType: PublicProfileEntityType;
  categoryLabel?: string | null;
  summary?: string | null;
  isPublic?: boolean;
};

export type PublicAreaProviderGroupInput = {
  key: string;
  title: string;
  entityType: PublicProfileEntityType;
  description?: string | null;
  providers?: readonly PublicAreaProviderInput[];
};

export type PublicAreaProviderGroupCard = {
  key: string;
  title: string;
  entityType: PublicProfileEntityType;
  description?: string | null;
  providers: readonly PublicAreaFeaturedProviderCard[];
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function cleanText(value: string | null | undefined): string | null {
  return hasText(value) ? value.trim() : null;
}

export function createPublicAreaFeaturedProviderCard(
  input: PublicAreaProviderInput
): PublicAreaFeaturedProviderCard | null {
  const displayName = cleanText(input.displayName);
  const slug = cleanText(input.slug);
  const publicationDecision = evaluatePublicProfilePublication({
    entityType: input.entityType,
    isActive: input.isActive,
    reviewStatus: input.reviewStatus,
    readinessStatus: input.readinessStatus,
    slug,
    displayName,
    hasUnsafeMedicalClaims: input.hasUnsafeMedicalClaims
  });

  if (!publicationDecision.isPublic || !displayName) {
    return null;
  }

  const card: PublicAreaFeaturedProviderCard = {
    id: slug ?? input.id,
    displayName,
    entityType: input.entityType,
    isPublic: true
  };

  const href = cleanText(input.href);
  const categoryLabel = cleanText(input.categoryLabel);
  const summary = cleanText(input.summary);

  if (href) {
    card.href = href;
  }

  if (categoryLabel) {
    card.categoryLabel = categoryLabel;
  }

  if (summary) {
    card.summary = summary;
  }

  return card;
}

export function createPublicAreaFeaturedProviderCards(
  inputs: readonly PublicAreaProviderInput[]
): PublicAreaFeaturedProviderCard[] {
  const cards: PublicAreaFeaturedProviderCard[] = [];

  for (const input of inputs) {
    const card = createPublicAreaFeaturedProviderCard(input);

    if (card) {
      cards.push(card);
    }
  }

  return cards;
}

export function createPublicAreaProviderGroupCard(
  input: PublicAreaProviderGroupInput
): PublicAreaProviderGroupCard | null {
  const title = cleanText(input.title);

  if (!title) {
    return null;
  }

  const providers = createPublicAreaFeaturedProviderCards(input.providers ?? []);
  const group: PublicAreaProviderGroupCard = {
    key: input.key,
    title,
    entityType: input.entityType,
    providers
  };

  const description = cleanText(input.description);

  if (description) {
    group.description = description;
  }

  return group;
}

export function createPublicAreaProviderGroupCards(
  inputs: readonly PublicAreaProviderGroupInput[]
): PublicAreaProviderGroupCard[] {
  const groups: PublicAreaProviderGroupCard[] = [];

  for (const input of inputs) {
    const group = createPublicAreaProviderGroupCard(input);

    if (group) {
      groups.push(group);
    }
  }

  return groups;
}
