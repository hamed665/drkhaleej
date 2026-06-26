import { createImportProcessingPlan, type ImportChunkingOptions, type ImportProcessingPlan } from '@/lib/import/chunking';
import {
  evaluatePublicProfilePublication,
  type PublicProfileEntityType,
  type PublicProfilePublicationDecision,
  type PublicProfilePublicationInput,
  type PublicProfileReadinessStatus,
  type PublicProfileReviewStatus
} from '@/lib/profiles/public-profile-guards';

export type GPImportSourceRow = {
  sourceId?: string | null;
  name?: string | null;
  category?: string | null;
  slug?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  area?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  services?: readonly string[] | null;
};

export type GPImportMappingWarningKey = 'unknown-category' | 'missing-display-name' | 'missing-slug' | 'unsafe-medical-claims';

export type GPImportMappingWarning = {
  key: GPImportMappingWarningKey;
  message: string;
};

export type GPProviderImportDraft = {
  source: 'gp';
  sourceId: string | null;
  entityType: PublicProfileEntityType;
  category: string | null;
  displayName: string | null;
  slug: string | null;
  description: string | null;
  services: readonly string[];
  contact: {
    phone: string | null;
    website: string | null;
  };
  location: {
    address: string | null;
    area: string | null;
    city: string | null;
    country: string | null;
  };
  reviewStatus: PublicProfileReviewStatus;
  readinessStatus: PublicProfileReadinessStatus;
  hasUnsafeMedicalClaims: boolean;
  publicationInput: PublicProfilePublicationInput;
  publicationDecision: PublicProfilePublicationDecision;
  warnings: readonly GPImportMappingWarning[];
};

type EntityTypeResolution = {
  entityType: PublicProfileEntityType;
  known: boolean;
};

const DRAFT_REVIEW_STATUS: PublicProfileReviewStatus = 'draft';

const entityTypeAliases: readonly { entityType: PublicProfileEntityType; aliases: readonly string[] }[] = [
  { entityType: 'doctor', aliases: ['doctor', 'physician', 'consultant', 'specialist'] },
  { entityType: 'hospital', aliases: ['hospital'] },
  { entityType: 'pharmacy', aliases: ['pharmacy', 'chemist'] },
  { entityType: 'lab', aliases: ['laboratory', 'lab', 'diagnostic'] },
  { entityType: 'beauty', aliases: ['beauty', 'salon', 'spa', 'aesthetic', 'cosmetic'] },
  { entityType: 'pet-clinic', aliases: ['pet clinic', 'veterinary', 'veterinarian', 'vet'] },
  { entityType: 'pet-shop', aliases: ['pet shop', 'pet store'] },
  { entityType: 'center', aliases: ['medical center', 'medical centre', 'clinic', 'dental', 'polyclinic'] }
];

const unsafeMedicalClaimPatterns: readonly RegExp[] = [
  /\bmoh\s*(approved|verified|licensed)\b/i,
  /\bministry of health\s*(approved|verified|licensed)\b/i,
  /\bapproved\s+by\s+moh\b/i,
  /\blicen[cs]e\s*verified\b/i,
  /\bverified\s+doctor\b/i,
  /\bguaranteed\s+(cure|result|treatment)\b/i,
  /\b100%\s*(cure|guarantee|success)\b/i,
  /\bdiagnosis\s+provided\b/i,
  /وزارة الصحة.*(معتمد|موثق|مرخص)/,
  /(معتمد|موثق|مرخص).*وزارة الصحة/,
  /شفاء مضمون/,
  /نتائج مضمونة/
];

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? '';

  return normalized.length > 0 ? normalized : null;
}

function normalizeSearchText(value: string | null | undefined): string {
  return normalizeText(value)?.toLowerCase().replace(/[\s_-]+/g, ' ') ?? '';
}

function normalizeServices(services: readonly string[] | null | undefined): string[] {
  return (services ?? [])
    .map((service) => normalizeText(service))
    .filter((service): service is string => service !== null);
}

function createSafeImportSlug(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const slug = normalized
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.length > 0 ? slug : null;
}

export function resolveGPImportEntityType(category: string | null | undefined): EntityTypeResolution {
  const normalizedCategory = normalizeSearchText(category);

  if (!normalizedCategory) {
    return { entityType: 'service', known: false };
  }

  const match = entityTypeAliases.find(({ aliases }) => aliases.some((alias) => normalizedCategory.includes(alias)));

  return match ? { entityType: match.entityType, known: true } : { entityType: 'service', known: false };
}

export function detectUnsafeMedicalClaims(row: GPImportSourceRow): boolean {
  const textParts = [row.name, row.category, row.description, ...normalizeServices(row.services)]
    .map((value) => normalizeText(value))
    .filter((value): value is string => value !== null);
  const searchableText = textParts.join(' ');

  return unsafeMedicalClaimPatterns.some((pattern) => pattern.test(searchableText));
}

function resolveReadinessStatus(input: {
  displayName: string | null;
  slug: string | null;
  hasUnsafeMedicalClaims: boolean;
}): PublicProfileReadinessStatus {
  if (input.hasUnsafeMedicalClaims) {
    return 'blocked';
  }

  if (!input.displayName || !input.slug) {
    return 'needs_content';
  }

  return 'ready';
}

function createMappingWarnings(input: {
  categoryKnown: boolean;
  displayName: string | null;
  slug: string | null;
  hasUnsafeMedicalClaims: boolean;
}): GPImportMappingWarning[] {
  const warnings: GPImportMappingWarning[] = [];

  if (!input.categoryKnown) {
    warnings.push({ key: 'unknown-category', message: 'Import category could not be mapped to a known public profile entity type.' });
  }

  if (!input.displayName) {
    warnings.push({ key: 'missing-display-name', message: 'Imported provider is missing a display name.' });
  }

  if (!input.slug) {
    warnings.push({ key: 'missing-slug', message: 'Imported provider needs a stable slug before publication.' });
  }

  if (input.hasUnsafeMedicalClaims) {
    warnings.push({ key: 'unsafe-medical-claims', message: 'Imported provider contains unsafe medical or verification claims.' });
  }

  return warnings;
}

export function mapGPImportRowToProviderDraft(row: GPImportSourceRow): GPProviderImportDraft {
  const displayName = normalizeText(row.name);
  const slug = createSafeImportSlug(row.slug) ?? createSafeImportSlug(displayName);
  const category = normalizeText(row.category);
  const { entityType, known } = resolveGPImportEntityType(category);
  const services = normalizeServices(row.services);
  const hasUnsafeMedicalClaims = detectUnsafeMedicalClaims(row);
  const readinessStatus = resolveReadinessStatus({ displayName, slug, hasUnsafeMedicalClaims });
  const publicationInput: PublicProfilePublicationInput = {
    entityType,
    isActive: false,
    reviewStatus: DRAFT_REVIEW_STATUS,
    readinessStatus,
    slug,
    displayName,
    hasUnsafeMedicalClaims
  };

  return {
    source: 'gp',
    sourceId: normalizeText(row.sourceId),
    entityType,
    category,
    displayName,
    slug,
    description: normalizeText(row.description),
    services,
    contact: {
      phone: normalizeText(row.phone),
      website: normalizeText(row.website)
    },
    location: {
      address: normalizeText(row.address),
      area: normalizeText(row.area),
      city: normalizeText(row.city),
      country: normalizeText(row.country)
    },
    reviewStatus: DRAFT_REVIEW_STATUS,
    readinessStatus,
    hasUnsafeMedicalClaims,
    publicationInput,
    publicationDecision: evaluatePublicProfilePublication(publicationInput),
    warnings: createMappingWarnings({ categoryKnown: known, displayName, slug, hasUnsafeMedicalClaims })
  };
}

export function createGPImportProviderDrafts(rows: readonly GPImportSourceRow[]): GPProviderImportDraft[] {
  return rows.map((row) => mapGPImportRowToProviderDraft(row));
}

export function createGPImportMappingPlan(
  rows: readonly GPImportSourceRow[],
  options: ImportChunkingOptions = {}
): ImportProcessingPlan<GPProviderImportDraft> {
  return createImportProcessingPlan(createGPImportProviderDrafts(rows), options);
}
