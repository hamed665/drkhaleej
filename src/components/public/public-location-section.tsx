import type { ReactNode } from 'react';

import {
  formatPublicLocationGeoLine,
  formatPublicLocationName
} from '@/lib/catalog/public-location';
import type { PublicCatalogLocale, PublicProviderLocationSummary } from '@/lib/catalog/public-types';

import { PublicCenterDetailSection } from './public-center-detail-section';

type PublicLocationSectionProps = {
  locale: PublicCatalogLocale;
  title: string;
  description: string;
  locations: PublicProviderLocationSummary[];
  emptyLabel: string;
  renderLocationMeta?: (location: PublicProviderLocationSummary) => ReactNode;
};

export function PublicLocationSection({
  locale,
  title,
  description,
  locations,
  emptyLabel,
  renderLocationMeta
}: PublicLocationSectionProps) {
  return (
    <PublicCenterDetailSection title={title} description={description}>
      {locations.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2" role="list">
          {locations.map((location) => {
            const locationName = formatPublicLocationName(locale, location);
            const geoLine = formatPublicLocationGeoLine(locale, location);

            return (
              <li key={location.id} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                {locationName ? <h3 className="text-sm font-semibold leading-6 text-slate-950">{locationName}</h3> : null}
                <p className={locationName ? 'mt-2 text-sm leading-6 text-slate-600' : 'text-sm leading-6 text-slate-600'}>
                  {geoLine ?? emptyLabel}
                </p>
                {renderLocationMeta ? <div className="mt-3">{renderLocationMeta(location)}</div> : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-slate-600">{emptyLabel}</p>
      )}
    </PublicCenterDetailSection>
  );
}
