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

export function PublicListingGrid(props: PublicListingGridProps) {
  const ariaLabel = props.locale === 'ar' ? 'القوائم العامة' : 'Public listings';

  return (
    <section className="mt-10" aria-label={ariaLabel}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {props.variant === 'center'
          ? props.items.map((item) => (
              <li key={item.id} className="min-w-0">
                <PublicListingCard locale={props.locale} variant="center" item={item} />
              </li>
            ))
          : null}
        {props.variant === 'doctor'
          ? props.items.map((item) => (
              <li key={item.id} className="min-w-0">
                <PublicListingCard locale={props.locale} variant="doctor" item={item} />
              </li>
            ))
          : null}
        {props.variant === 'service'
          ? props.items.map((item) => (
              <li key={item.id} className="min-w-0">
                <PublicListingCard locale={props.locale} variant="service" item={item} />
              </li>
            ))
          : null}
      </ul>
    </section>
  );
}
