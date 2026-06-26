import type { PublicDirectoryResultCard } from '@/components/directory/PublicDirectoryTemplate2026';
import type {
  PublicProfileEntityType,
  PublicProfileReadinessStatus,
  PublicProfileReviewStatus
} from '@/lib/profiles/public-profile-guards';
import { evaluatePublicProfilePublication } from '@/lib/profiles/public-profile-guards';

export type PublicDirectoryProviderInput = {
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
  area?: string | null;
  city?: string | null;
  badges?: readonly (string | null | undefined)[];
  isSponsored?: boolean;
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function cleanText(value: string | null | undefined): string | null {
  return hasText(value) ? value.trim() : null;
}

function cleanBadges(badges: readonly (string | null | undefined)[] | undefined): string[] {
  const uniqueBadges = new Set<string>();

  for (const badge of badges ?? []) {
    const cleaned = cleanText(badge);

    if (cleaned) {
      uniqueBadges.add(cleaned);
    }
  }

  return [...uniqueBadges];
}

export function createPublicDirectoryResultCard(input: PublicDirectoryProviderInput): PublicDirectoryResultCard | null {
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

  const badges = cleanBadges(input.badges);
  const card: PublicDirectoryResultCard = {
    id: slug ?? input.id,
    entityType: input.entityType,
    displayName,
    isPublic: true
  };

  const href = cleanText(input.href);
  const categoryLabel = cleanText(input.categoryLabel);
  const summary = cleanText(input.summary);
  const area = cleanText(input.area);
  const city = cleanText(input.city);

  if (href) {
    card.href = href;
  }

  if (categoryLabel) {
    card.categoryLabel = categoryLabel;
  }

  if (summary) {
    card.summary = summary;
  }

  if (area) {
    card.area = area;
  }

  if (city) {
    card.city = city;
  }

  if (badges.length > 0) {
    card.badges = badges;
  }

  if (input.isSponsored === true) {
    card.isSponsored = true;
  }

  return card;
}

export function createPublicDirectoryResultCards(inputs: readonly PublicDirectoryProviderInput[]): PublicDirectoryResultCard[] {
  const cards: PublicDirectoryResultCard[] = [];

  for (const input of inputs) {
    const card = createPublicDirectoryResultCard(input);

    if (card) {
      cards.push(card);
    }
  }

  return cards;
}

export function countPublicDirectoryResultCards(inputs: readonly PublicDirectoryProviderInput[]): number {
  return createPublicDirectoryResultCards(inputs).length;
}
