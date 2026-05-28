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

const cardClassName =
  'h-full rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md';

const titleClassName = 'text-base font-semibold leading-7 text-slate-950';

const tagClassName =
  'mt-3 inline-flex w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800';

const descriptionClassName = 'mt-4 text-sm leading-6 text-slate-600';

const comingSoonClassName = 'mt-5 text-xs font-medium text-slate-500';

export function PublicListingCard(props: PublicListingCardProps) {
  if (props.variant === 'center') {
    const name = preferredText(props.locale, props.item.nameEn, props.item.nameAr) ?? props.item.nameEn;
    const description =
      preferredText(props.locale, props.item.shortDescriptionEn, props.item.shortDescriptionAr) ??
      preferredText(props.locale, props.item.descriptionEn, props.item.descriptionAr);

    return (
      <article className={cardClassName}>
        <h3 className={titleClassName}>{name}</h3>
        <p className={tagClassName}>{formatNeutralLabel(props.item.centerType)}</p>
        {description ? <p className={descriptionClassName}>{description}</p> : null}
        <p className={comingSoonClassName}>{byLocale(props.locale, 'Profile coming soon', 'الملف قريباً')}</p>
      </article>
    );
  }

  if (props.variant === 'doctor') {
    const name = preferredText(props.locale, props.item.fullNameEn, props.item.fullNameAr) ?? props.item.fullNameEn;

    return (
      <article className={cardClassName}>
        <h3 className={titleClassName}>{name}</h3>
        <p className={tagClassName}>{formatNeutralLabel(props.item.titleEn)}</p>
        <p className={comingSoonClassName}>{byLocale(props.locale, 'Profile coming soon', 'الملف قريباً')}</p>
      </article>
    );
  }

  const serviceName = preferredText(props.locale, props.item.nameEn, props.item.nameAr) ?? props.item.nameEn;
  const serviceDescription = preferredText(props.locale, props.item.descriptionEn, props.item.descriptionAr);

  return (
    <article className={cardClassName}>
      <h3 className={titleClassName}>{serviceName}</h3>
      {serviceDescription ? <p className={descriptionClassName}>{serviceDescription}</p> : null}
      <p className={comingSoonClassName}>{byLocale(props.locale, 'Profile coming soon', 'الملف قريباً')}</p>
    </article>
  );
}
