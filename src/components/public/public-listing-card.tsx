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

const cardClassName =
  'h-full rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md';

const titleLinkClassName = 'text-base font-semibold leading-7 text-slate-950 underline-offset-4 hover:text-emerald-800 hover:underline';

const tagClassName =
  'mt-3 inline-flex w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800';

const descriptionClassName = 'mt-4 text-sm leading-6 text-slate-600';

const comingSoonClassName = 'mt-5 text-xs font-medium text-slate-500';

const profileLinkClassName = 'mt-5 inline-flex text-xs font-semibold text-emerald-800 underline-offset-4 hover:underline';

export function PublicListingCard(props: PublicListingCardProps) {
  if (props.variant === 'center') {
    const name = preferredText(props.locale, props.item.nameEn, props.item.nameAr) ?? props.item.nameEn;
    const description =
      preferredText(props.locale, props.item.shortDescriptionEn, props.item.shortDescriptionAr) ??
      preferredText(props.locale, props.item.descriptionEn, props.item.descriptionAr);
    const href = listingHref(props.locale, props.item.defaultCountry, 'center', props.item.slug);

    return (
      <article className={cardClassName}>
        <h3>
          <Link href={href} className={titleLinkClassName}>
            {name}
          </Link>
        </h3>
        <p className={tagClassName}>{formatNeutralLabel(props.item.centerType)}</p>
        {description ? <p className={descriptionClassName}>{description}</p> : null}
        <Link href={href} className={profileLinkClassName}>
          {byLocale(props.locale, 'View profile', 'عرض الملف')}
        </Link>
      </article>
    );
  }

  if (props.variant === 'doctor') {
    const name = preferredText(props.locale, props.item.fullNameEn, props.item.fullNameAr) ?? props.item.fullNameEn;
    const href = listingHref(props.locale, props.item.defaultCountry, 'doctor', props.item.slug);

    return (
      <article className={cardClassName}>
        <h3>
          <Link href={href} className={titleLinkClassName}>
            {name}
          </Link>
        </h3>
        <p className={tagClassName}>{formatNeutralLabel(props.item.titleEn)}</p>
        <Link href={href} className={profileLinkClassName}>
          {byLocale(props.locale, 'View profile', 'عرض الملف')}
        </Link>
      </article>
    );
  }

  const serviceName = preferredText(props.locale, props.item.nameEn, props.item.nameAr) ?? props.item.nameEn;
  const serviceDescription = preferredText(props.locale, props.item.descriptionEn, props.item.descriptionAr);

  return (
    <article className={cardClassName}>
      <h3 className="text-base font-semibold leading-7 text-slate-950">{serviceName}</h3>
      {serviceDescription ? <p className={descriptionClassName}>{serviceDescription}</p> : null}
      <p className={comingSoonClassName}>{byLocale(props.locale, 'Profile coming soon', 'الملف قريباً')}</p>
    </article>
  );
}
