import type { ReactNode } from 'react';
import { normalizePublicBrandCopy } from '@/lib/brand/public-brand-copy';
import type { PublicProfileEntityType } from '@/lib/profiles/public-profile-guards';
import type { InternalLinkDefinition } from '@/lib/seo/internal-linking';

type PublicDirectoryTemplateLocale = 'en' | 'ar';

type PublicDirectoryFilter = {
  key: string;
  label: string;
  value?: string | null;
  href?: string | null;
  active?: boolean;
};

export type PublicDirectoryResultCard = {
  id: string;
  href?: string | null;
  entityType: PublicProfileEntityType;
  displayName: string;
  categoryLabel?: string | null;
  summary?: string | null;
  area?: string | null;
  city?: string | null;
  badges?: readonly string[];
  isSponsored?: boolean;
  isPublic?: boolean;
};

export type PublicDirectoryTemplate2026Props = {
  locale: PublicDirectoryTemplateLocale;
  dir: 'ltr' | 'rtl';
  entityType: PublicProfileEntityType;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  totalResults?: number | null;
  filters?: readonly PublicDirectoryFilter[];
  results?: readonly PublicDirectoryResultCard[];
  internalLinks?: readonly InternalLinkDefinition[];
  emptyState?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
};

const directoryCopy: Record<
  PublicDirectoryTemplateLocale,
  {
    results: string;
    result: string;
    filters: string;
    sponsored: string;
    draftHidden: string;
    noResults: string;
    safetyNote: string;
    safetyBody: string;
    openProfile: string;
    relatedLinks: string;
  }
> = {
  en: {
    results: 'results',
    result: 'result',
    filters: 'Filters',
    sponsored: 'Sponsored',
    draftHidden: 'Draft or review-gated profiles are hidden from public indexing.',
    noResults: 'No public profiles are ready for this directory yet.',
    safetyNote: 'Safety note',
    safetyBody: 'Directory pages do not imply MOH verification, diagnosis, booking availability, insurance acceptance or medical advice.',
    openProfile: 'Open profile',
    relatedLinks: 'Related links'
  },
  ar: {
    results: 'نتائج',
    result: 'نتيجة',
    filters: 'الفلاتر',
    sponsored: 'مميز',
    draftHidden: 'الملفات المسودة أو التي تنتظر المراجعة لا تظهر في الفهرسة العامة.',
    noResults: 'لا توجد ملفات عامة جاهزة في هذا الدليل حالياً.',
    safetyNote: 'ملاحظة أمان',
    safetyBody: 'صفحات الدليل لا تعني تحققاً من وزارة الصحة أو تشخيصاً أو توفر حجز أو قبول تأمين أو نصيحة طبية.',
    openProfile: 'فتح الملف',
    relatedLinks: 'روابط ذات صلة'
  }
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function filteredTextList(values: readonly string[] | undefined): string[] {
  return (values ?? []).filter(hasText);
}

function resultCountLabel(locale: PublicDirectoryTemplateLocale, count: number | null | undefined): string | null {
  if (count === null || count === undefined || !Number.isFinite(count)) {
    return null;
  }

  const safeCount = Math.max(0, Math.floor(count));
  const copy = directoryCopy[locale];
  const noun = safeCount === 1 ? copy.result : copy.results;

  return `${safeCount.toLocaleString(locale === 'ar' ? 'ar-OM' : 'en-OM')} ${noun}`;
}

function placeLabel(result: PublicDirectoryResultCard): string | null {
  const parts = [result.area, result.city].filter(hasText);

  return parts.length > 0 ? parts.join(', ') : null;
}

function DirectoryResultCard({ result, copy }: { result: PublicDirectoryResultCard; copy: (typeof directoryCopy)[PublicDirectoryTemplateLocale] }) {
  const badges = filteredTextList(result.badges);
  const resolvedPlace = placeLabel(result);
  const cardState = result.isPublic === false ? 'review-gated' : 'public';
  const brandCopy = normalizePublicBrandCopy;
  const title = <h2>{brandCopy(result.displayName)}</h2>;

  return (
    <article className="dm2026-directory-card" data-entity-type={result.entityType} data-card-state={cardState}>
      <div className="dm2026-directory-card__body">
        <div className="dm2026-directory-card__heading">
          <span>{brandCopy(result.categoryLabel ?? result.entityType)}</span>
          {result.isSponsored ? <strong>{copy.sponsored}</strong> : null}
        </div>
        {hasText(result.href) ? <a href={result.href}>{title}</a> : title}
        {hasText(result.summary) ? <p>{brandCopy(result.summary)}</p> : null}
        {resolvedPlace ? <p className="dm2026-directory-card__place">{brandCopy(resolvedPlace)}</p> : null}
        {badges.length > 0 ? (
          <ul className="dm2026-directory-card__badges" aria-label="Profile badges">
            {badges.map((badge) => (
              <li key={badge}>{brandCopy(badge)}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {hasText(result.href) ? <a className="dm2026-directory-card__cta" href={result.href}>{copy.openProfile}</a> : null}
    </article>
  );
}

function DirectoryInternalLinks({
  links,
  copy
}: {
  links: readonly InternalLinkDefinition[];
  copy: (typeof directoryCopy)[PublicDirectoryTemplateLocale];
}) {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav className="dm2026-directory__internal-links" aria-label={copy.relatedLinks}>
      <strong>{copy.relatedLinks}</strong>
      <ul>
        {links.map((link) => (
          <li key={link.key} data-intent={link.intent} data-priority={link.priority}>
            <a href={link.href}>{normalizePublicBrandCopy(link.label)}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PublicDirectoryTemplate2026({
  locale,
  dir,
  entityType,
  eyebrow = null,
  title,
  description = null,
  totalResults = null,
  filters = [],
  results = [],
  internalLinks = [],
  emptyState,
  footer,
  children
}: PublicDirectoryTemplate2026Props) {
  const copy = directoryCopy[locale];
  const countLabel = resultCountLabel(locale, totalResults);
  const visibleResults = results.filter((result) => result.isPublic !== false);
  const brandCopy = normalizePublicBrandCopy;

  return (
    <main className="dm2026-directory" dir={dir} data-directory-entity-type={entityType}>
      <header className="dm2026-directory__hero">
        <div className="dm2026-directory__intro">
          {hasText(eyebrow) ? <span className="dm2026-directory__eyebrow">{brandCopy(eyebrow)}</span> : null}
          <h1>{brandCopy(title)}</h1>
          {hasText(description) ? <p>{brandCopy(description)}</p> : null}
        </div>
        {countLabel ? <p className="dm2026-directory__count">{countLabel}</p> : null}
      </header>

      <section className="dm2026-directory__safety" aria-label={copy.safetyNote}>
        <strong>{copy.safetyNote}</strong>
        <p>{copy.safetyBody}</p>
        <small>{copy.draftHidden}</small>
      </section>

      {filters.length > 0 ? (
        <nav className="dm2026-directory__filters" aria-label={copy.filters}>
          <strong>{copy.filters}</strong>
          <ul>
            {filters.map((filter) => {
              const key = `${filter.key}:${filter.value ?? 'all'}`;

              return (
                <li key={key} data-active={filter.active === true ? 'true' : 'false'}>
                  {hasText(filter.href) ? <a href={filter.href}>{brandCopy(filter.label)}</a> : <span>{brandCopy(filter.label)}</span>}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <DirectoryInternalLinks links={internalLinks} copy={copy} />

      {children}

      {visibleResults.length > 0 ? (
        <section className="dm2026-directory__results" aria-label={brandCopy(title)}>
          {visibleResults.map((result) => (
            <DirectoryResultCard key={result.id} result={result} copy={copy} />
          ))}
        </section>
      ) : (
        <section className="dm2026-directory__empty" aria-label={copy.noResults}>
          {emptyState ?? <p>{copy.noResults}</p>}
        </section>
      )}

      {footer ? <footer className="dm2026-directory__footer">{footer}</footer> : null}
    </main>
  );
}
