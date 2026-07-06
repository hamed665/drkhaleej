import Link from 'next/link';

import type {
  PublicCatalogLocale,
  PublicCenterSummary,
  PublicDoctorSummary,
  PublicServiceSummary
} from '@/lib/catalog/public-types';

type PublicListingCardProps =
  | {
      locale: PublicCatalogLocale;
      variant: 'center';
      item: PublicCenterSummary;
    }
  | {
      locale: PublicCatalogLocale;
      variant: 'doctor';
      item: PublicDoctorSummary;
    }
  | {
      locale: PublicCatalogLocale;
      variant: 'service';
      item: PublicServiceSummary;
    };

function byLocale(locale: PublicCatalogLocale, en: string, ar: string): string {
  return locale === 'ar' ? ar : en;
}

function preferredText(locale: PublicCatalogLocale, en: string | null, ar: string | null): string | null {
  if (locale === 'ar') return ar ?? en;
  return en ?? ar;
}

function formatNeutralLabel(value: string): string {
  return value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
}

function listingHref(locale: PublicCatalogLocale, country: string, family: 'center' | 'doctor', slug: string): string {
  return `/${locale}/${country.toLowerCase()}/${family}/${slug}`;
}

function localizedPublicProfileHref(locale: PublicCatalogLocale, country: string, profilePath: string): string {
  const normalizedPath = profilePath.startsWith('/') ? profilePath : `/${profilePath}`;
  return `/${locale}/${country.toLowerCase()}${normalizedPath}`;
}

function centerListingHref(locale: PublicCatalogLocale, item: PublicCenterSummary): string {
  if (item.publicProfilePath) {
    return localizedPublicProfileHref(locale, item.defaultCountry, item.publicProfilePath);
  }

  return listingHref(locale, item.defaultCountry, 'center', item.slug);
}

function PublicListingMark({ label }: { label: string }) {
  return (
    <span className="dm2026-listing-card__mark" aria-hidden="true">
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}

function PublicListingCta({ href, locale }: { href: string; locale: PublicCatalogLocale }) {
  return (
    <Link href={href} className="dm2026-listing-card__cta">
      {byLocale(locale, 'View profile', 'عرض الملف')}
      <span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
    </Link>
  );
}

export function PublicListingCard(props: PublicListingCardProps) {
  if (props.variant === 'center') {
    const name = preferredText(props.locale, props.item.nameEn, props.item.nameAr) ?? props.item.nameEn;
    const description =
      preferredText(props.locale, props.item.shortDescriptionEn, props.item.shortDescriptionAr) ??
      preferredText(props.locale, props.item.descriptionEn, props.item.descriptionAr);
    const href = centerListingHref(props.locale, props.item);

    return (
      <article className="dm2026-listing-card dm2026-listing-card--center">
        <div className="dm2026-listing-card__header">
          <PublicListingMark label={name} />
          <p className="dm2026-listing-card__eyebrow">{formatNeutralLabel(props.item.centerType)}</p>
        </div>
        <h3 className="dm2026-listing-card__title">
          <Link href={href}>{name}</Link>
        </h3>
        {description ? <p className="dm2026-listing-card__description">{description}</p> : null}
        <div className="dm2026-listing-card__footer">
          <p>{byLocale(props.locale, 'Public profile', 'ملف عام')}</p>
          <PublicListingCta href={href} locale={props.locale} />
        </div>
      </article>
    );
  }

  if (props.variant === 'doctor') {
    const name = preferredText(props.locale, props.item.fullNameEn, props.item.fullNameAr) ?? props.item.fullNameEn;
    const href = listingHref(props.locale, props.item.defaultCountry, 'doctor', props.item.slug);

    return (
      <article className="dm2026-listing-card dm2026-listing-card--doctor">
        <div className="dm2026-listing-card__header">
          <PublicListingMark label={name} />
          <p className="dm2026-listing-card__eyebrow">{formatNeutralLabel(props.item.titleEn)}</p>
        </div>
        <h3 className="dm2026-listing-card__title">
          <Link href={href}>{name}</Link>
        </h3>
        <div className="dm2026-listing-card__footer">
          <p>{byLocale(props.locale, 'Doctor profile', 'ملف طبيب')}</p>
          <PublicListingCta href={href} locale={props.locale} />
        </div>
      </article>
    );
  }

  const serviceName = preferredText(props.locale, props.item.nameEn, props.item.nameAr) ?? props.item.nameEn;
  const serviceDescription = preferredText(props.locale, props.item.descriptionEn, props.item.descriptionAr);

  return (
    <article className="dm2026-listing-card dm2026-listing-card--service">
      <div className="dm2026-listing-card__header">
        <PublicListingMark label={serviceName} />
        <p className="dm2026-listing-card__eyebrow">{byLocale(props.locale, 'Service', 'خدمة')}</p>
      </div>
      <h3 className="dm2026-listing-card__title">{serviceName}</h3>
      {serviceDescription ? <p className="dm2026-listing-card__description">{serviceDescription}</p> : null}
      <p className="dm2026-listing-card__coming-soon">{byLocale(props.locale, 'Profile coming soon', 'الملف قريباً')}</p>
    </article>
  );
}
