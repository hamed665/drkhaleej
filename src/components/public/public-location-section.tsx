import type { ReactNode } from 'react';

import {
  formatPublicLocationGeoLine,
  formatPublicLocationName,
  getPublicDirectionsUrl
} from '@/lib/catalog/public-location';
import type { PublicCatalogLocale, PublicProviderLocationSummary } from '@/lib/catalog/public-types';

import { PublicCenterDetailSection } from './public-center-detail-section';

type PublicLocationSectionProps = {
  locale: PublicCatalogLocale;
  title: string;
  description: string;
  locations: PublicProviderLocationSummary[];
  emptyLabel: string;
  directionsLabel?: string;
  primaryLocationLabel?: string;
  directionsAriaLabel?: (locationLabel: string) => string;
  renderLocationMeta?: (location: PublicProviderLocationSummary) => ReactNode;
  renderLocationActions?: (location: PublicProviderLocationSummary) => ReactNode;
};

export function PublicLocationSection({
  locale,
  title,
  description,
  locations,
  emptyLabel,
  directionsLabel,
  primaryLocationLabel,
  directionsAriaLabel,
  renderLocationMeta,
  renderLocationActions
}: PublicLocationSectionProps) {
  const resolvedPrimaryLocationLabel = primaryLocationLabel ?? (locale === 'ar' ? 'الفرع الرئيسي' : 'Primary branch');

  return (
    <PublicCenterDetailSection title={title} description={description}>
      {locations.length > 0 ? (
        <ul className="dm2026-profile-grid dm2026-profile-grid--locations" role="list">
          {locations.map((location) => {
            const locationName = formatPublicLocationName(locale, location);
            const geoLine = formatPublicLocationGeoLine(locale, location);
            const locationLabel = locationName ?? geoLine ?? emptyLabel;
            const directionsUrl = getPublicDirectionsUrl(location);
            const cardClassName = location.isPrimary
              ? 'dm2026-profile-card dm2026-profile-location-card dm2026-profile-location-card--primary'
              : 'dm2026-profile-card dm2026-profile-location-card';

            return (
              <li key={location.id} className={cardClassName}>
                <div className="dm2026-profile-location-card__header">
                  <div>
                    <h3>{locationLabel}</h3>
                    <p className="dm2026-profile-location-card__geo">{geoLine ?? emptyLabel}</p>
                  </div>
                  {location.isPrimary ? (
                    <span className="dm2026-profile-location-card__badge">{resolvedPrimaryLocationLabel}</span>
                  ) : null}
                </div>

                {renderLocationActions ? <div className="dm2026-profile-action-row">{renderLocationActions(location)}</div> : null}

                <div className="dm2026-profile-location-card__footer">
                  {directionsLabel && directionsUrl ? (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={directionsAriaLabel ? directionsAriaLabel(locationLabel) : directionsLabel}
                      className="dm2026-profile-action dm2026-profile-action--secondary dm2026-profile-location-card__directions"
                    >
                      {directionsLabel}
                    </a>
                  ) : null}
                  {renderLocationMeta ? <div className="dm2026-profile-location-card__meta">{renderLocationMeta(location)}</div> : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="dm2026-profile-empty">{emptyLabel}</p>
      )}
    </PublicCenterDetailSection>
  );
}
