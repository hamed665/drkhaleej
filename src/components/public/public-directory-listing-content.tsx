import { PublicEmptyState } from '@/components/public/public-empty-state';
import { PublicListingError } from '@/components/public/public-listing-error';
import { PublicListingGrid } from '@/components/public/public-listing-grid';
import type {
  PublicCatalogLocale,
  PublicCatalogQueryResult,
  PublicCenterSummary,
  PublicDoctorSummary,
  PublicServiceSummary
} from '@/lib/catalog/public-types';

type PublicDirectoryListingContentProps =
  | {
      locale: PublicCatalogLocale;
      variant: 'center';
      result: PublicCatalogQueryResult<PublicCenterSummary[]>;
    }
  | {
      locale: PublicCatalogLocale;
      variant: 'doctor';
      result: PublicCatalogQueryResult<PublicDoctorSummary[]>;
    }
  | {
      locale: PublicCatalogLocale;
      variant: 'service';
      result: PublicCatalogQueryResult<PublicServiceSummary[]>;
    };

export function PublicDirectoryListingContent(props: PublicDirectoryListingContentProps) {
  if (!props.result.ok) {
    return <PublicListingError locale={props.locale} />;
  }

  if (props.result.data.length === 0) {
    return <PublicEmptyState locale={props.locale} />;
  }

  if (props.variant === 'center') {
    return <PublicListingGrid locale={props.locale} variant="center" items={props.result.data} />;
  }

  if (props.variant === 'doctor') {
    return <PublicListingGrid locale={props.locale} variant="doctor" items={props.result.data} />;
  }

  return <PublicListingGrid locale={props.locale} variant="service" items={props.result.data} />;
}
