import type { ReactNode } from 'react';
import { normalizePublicBrandCopy } from '@/lib/brand/public-brand-copy';
import type { PublicProfileEntityType } from '@/lib/profiles/public-profile-guards';
import type { InternalLinkDefinition } from '@/lib/seo/internal-linking';

type PublicAreaTemplateLocale = 'en' | 'ar';

type PublicAreaDirectoryLink = {
  key: string;
  href: string;
  label: string;
  entityType: PublicProfileEntityType;
  count?: number | null;
};

type PublicAreaFeaturedProvider = {
  id: string;
  href?: string | null;
  displayName: string;
  entityType: PublicProfileEntityType;
  categoryLabel?: string | null;
  summary?: string | null;
  isPublic?: boolean;
};

type PublicAreaProviderGroup = {
  key: string;
  title: string;
  entityType: PublicProfileEntityType;
  description?: string | null;
  providers?: readonly PublicAreaFeaturedProvider[];
};

export type PublicAreaPageTemplate2026Props = {
  locale: PublicAreaTemplateLocale;
  dir: 'ltr' | 'rtl';
  areaName: string;
  parentLabel?: string | null;
  countryLabel?: string | null;
  description?: string | null;
  directoryLinks?: readonly PublicAreaDirectoryLink[];
  providerGroups?: readonly PublicAreaProviderGroup[];
  internalLinks?: readonly InternalLinkDefinition[];
  children?: ReactNode;
  footer?: ReactNode;
};

const areaCopy: Record<
  PublicAreaTemplateLocale,
  {
    eyebrow: string;
    directories: string;
    featuredProviders: string;
    noPublicProviders: string;
    openDirectory: string;
    openProfile: string;
    safetyNote: string;
    safetyBody: string;
    draftHidden: string;
    providers: string;
    provider: string;
    relatedLinks: string;
  }
> = {
  en: {
    eyebrow: 'Area healthcare guide',
    directories: 'Local directories',
    featuredProviders: 'Featured public providers',
    noPublicProviders: 'No public provider profiles are ready for this area yet.',
    openDirectory: 'Open directory',
    openProfile: 'Open profile',
    safetyNote: 'Safety note',
    safetyBody: 'Area pages do not imply MOH verification, diagnosis, booking availability, insurance acceptance or medical advice.',
    draftHidden: 'Draft, unreviewed or blocked profiles stay hidden from public area pages.',
    providers: 'providers',
    provider: 'provider',
    relatedLinks: 'Related links'
  },
  ar: {
    eyebrow: 'دليل الرعاية الصحية في المنطقة',
    directories: 'الأدلة المحلية',
    featuredProviders: 'مقدمو خدمة عامون مميزون',
    noPublicProviders: 'لا توجد ملفات عامة جاهزة لهذه المنطقة حالياً.',
    openDirectory: 'فتح الدليل',
    openProfile: 'فتح الملف',
    safetyNote: 'ملاحظة أمان',
    safetyBody: 'صفحات المناطق لا تعني تحققاً من وزارة الصحة أو تشخيصاً أو توفر حجز أو قبول تأمين أو نصيحة طبية.',
    draftHidden: 'الملفات المسودة أو غير المراجعة أو المحظورة تبقى مخفية من صفحات المناطق العامة.',
    providers: 'مقدمو خدمة',
    provider: 'مقدم خدمة',
    relatedLinks: 'روابط ذات صلة'
  }
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function safeCount(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value));
}

function countLabel(locale: PublicAreaTemplateLocale, count: number | null | undefined, copy: (typeof areaCopy)[PublicAreaTemplateLocale]): string | null {
  const resolvedCount = safeCount(count);

  if (resolvedCount === null) {
    return null;
  }

  const noun = resolvedCount === 1 ? copy.provider : copy.providers;

  return `${resolvedCount.toLocaleString(locale === 'ar' ? 'ar-OM' : 'en-OM')} ${noun}`;
}

function visibleProviders(providers: readonly PublicAreaFeaturedProvider[] | undefined): PublicAreaFeaturedProvider[] {
  return (providers ?? []).filter((provider) => provider.isPublic !== false);
}

function AreaDirectoryCard({
  link,
  locale,
  copy
}: {
  link: PublicAreaDirectoryLink;
  locale: PublicAreaTemplateLocale;
  copy: (typeof areaCopy)[PublicAreaTemplateLocale];
}) {
  const resolvedCount = countLabel(locale, link.count, copy);

  return (
    <a className="dm2026-area-template__directory-card" href={link.href} data-entity-type={link.entityType}>
      <span>{normalizePublicBrandCopy(link.label)}</span>
      {resolvedCount ? <small>{resolvedCount}</small> : null}
      <strong>{copy.openDirectory}</strong>
    </a>
  );
}

function AreaProviderCard({ provider, copy }: { provider: PublicAreaFeaturedProvider; copy: (typeof areaCopy)[PublicAreaTemplateLocale] }) {
  const brandCopy = normalizePublicBrandCopy;
  const heading = <h3>{brandCopy(provider.displayName)}</h3>;

  return (
    <article className="dm2026-area-template__provider-card" data-entity-type={provider.entityType}>
      <span>{brandCopy(provider.categoryLabel ?? provider.entityType)}</span>
      {hasText(provider.href) ? <a href={provider.href}>{heading}</a> : heading}
      {hasText(provider.summary) ? <p>{brandCopy(provider.summary)}</p> : null}
      {hasText(provider.href) ? <a href={provider.href}>{copy.openProfile}</a> : null}
    </article>
  );
}

function AreaInternalLinks({
  links,
  copy
}: {
  links: readonly InternalLinkDefinition[];
  copy: (typeof areaCopy)[PublicAreaTemplateLocale];
}) {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav className="dm2026-area-template__internal-links" aria-label={copy.relatedLinks}>
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

export function PublicAreaPageTemplate2026({
  locale,
  dir,
  areaName,
  parentLabel = null,
  countryLabel = null,
  description = null,
  directoryLinks = [],
  providerGroups = [],
  internalLinks = [],
  children,
  footer
}: PublicAreaPageTemplate2026Props) {
  const copy = areaCopy[locale];
  const brandCopy = normalizePublicBrandCopy;
  const locationParts = [parentLabel, countryLabel].filter(hasText).map(brandCopy);
  const locationLabel = locationParts.length > 0 ? locationParts.join(' · ') : null;
  const safeAreaName = brandCopy(areaName);

  return (
    <main className="dm2026-area-template" dir={dir} data-area-name={safeAreaName}>
      <header className="dm2026-area-template__hero">
        <span className="dm2026-area-template__eyebrow">{copy.eyebrow}</span>
        <h1>{safeAreaName}</h1>
        {locationLabel ? <p>{locationLabel}</p> : null}
        {hasText(description) ? <p>{brandCopy(description)}</p> : null}
      </header>

      <section className="dm2026-area-template__safety" aria-label={copy.safetyNote}>
        <strong>{copy.safetyNote}</strong>
        <p>{copy.safetyBody}</p>
        <small>{copy.draftHidden}</small>
      </section>

      {directoryLinks.length > 0 ? (
        <section className="dm2026-area-template__directories" aria-label={copy.directories}>
          <h2>{copy.directories}</h2>
          <div>
            {directoryLinks.map((link) => (
              <AreaDirectoryCard key={link.key} link={link} locale={locale} copy={copy} />
            ))}
          </div>
        </section>
      ) : null}

      <AreaInternalLinks links={internalLinks} copy={copy} />

      {children}

      {providerGroups.length > 0 ? (
        <section className="dm2026-area-template__provider-groups" aria-label={copy.featuredProviders}>
          <h2>{copy.featuredProviders}</h2>
          {providerGroups.map((group) => {
            const providers = visibleProviders(group.providers);

            return (
              <section key={group.key} className="dm2026-area-template__provider-group" data-entity-type={group.entityType}>
                <header>
                  <h3>{brandCopy(group.title)}</h3>
                  {hasText(group.description) ? <p>{brandCopy(group.description)}</p> : null}
                </header>
                {providers.length > 0 ? (
                  <div>
                    {providers.map((provider) => (
                      <AreaProviderCard key={provider.id} provider={provider} copy={copy} />
                    ))}
                  </div>
                ) : (
                  <p>{copy.noPublicProviders}</p>
                )}
              </section>
            );
          })}
        </section>
      ) : null}

      {footer ? <footer className="dm2026-area-template__footer">{footer}</footer> : null}
    </main>
  );
}
