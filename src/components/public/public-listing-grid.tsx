import { PublicListingCard } from '@/components/public/public-listing-card';
import type {
  PublicCatalogLocale,
  PublicCenterSummary,
  PublicDoctorSummary,
  PublicServiceSummary
} from '@/lib/catalog/public-types';

type PublicListingGridProps =
  | {
      locale: PublicCatalogLocale;
      variant: 'center';
      items: PublicCenterSummary[];
    }
  | {
      locale: PublicCatalogLocale;
      variant: 'doctor';
      items: PublicDoctorSummary[];
    }
  | {
      locale: PublicCatalogLocale;
      variant: 'service';
      items: PublicServiceSummary[];
    };

function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function countryPathSegment(country: string): string {
  return country.toLowerCase();
}

function publicCenterProfileHref(locale: PublicCatalogLocale, item: PublicCenterSummary): string | null {
  if (!isSafeSlug(item.slug)) return null;
  return `/${locale}/${countryPathSegment(item.defaultCountry)}/center/${item.slug}`;
}

function publicDoctorProfileHref(locale: PublicCatalogLocale, item: PublicDoctorSummary): string | null {
  if (!isSafeSlug(item.slug)) return null;
  return `/${locale}/${countryPathSegment(item.defaultCountry)}/doctor/${item.slug}`;
}

export function PublicListingGrid(props: PublicListingGridProps) {
  const ariaLabel = props.locale === 'ar' ? 'القوائم العامة' : 'Public listings';

  return (
    <section className="mt-10" aria-label={ariaLabel}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {props.variant === 'center'
          ? props.items.map((item) => (
              <li key={item.id} className="min-w-0">
                <PublicListingCard
                  locale={props.locale}
                  variant="center"
                  item={item}
                  href={publicCenterProfileHref(props.locale, item)}
                />
              </li>
            ))
          : null}
        {props.variant === 'doctor'
          ? props.items.map((item) => (
              <li key={item.id} className="min-w-0">
                <PublicListingCard
                  locale={props.locale}
                  variant="doctor"
                  item={item}
                  href={publicDoctorProfileHref(props.locale, item)}
                />
              </li>
            ))
          : null}
        {props.variant === 'service'
          ? props.items.map((item) => (
              <li key={item.id} className="min-w-0">
                <PublicListingCard locale={props.locale} variant="service" item={item} href={null} />
              </li>
            ))
          : null}
      </ul>
    </section>
  );
}
