import type { PublicContactAction } from '@/lib/catalog/public-contact';
import type { PublicCenterPublicInfo as PublicCenterPublicInfoData, PublicCenterPublicLocationInfo } from '@/lib/catalog/public-center-public-info';
import {
  formatPublicLocationGeoLine,
  formatPublicLocationName,
  getPublicDirectionsUrl
} from '@/lib/catalog/public-location';
import type { CountryCode, PublicCatalogLocale, PublicProviderLocationSummary } from '@/lib/catalog/public-types';

import { PublicCallbackRequestForm } from './public-callback-request-form';
import { PublicCenterDetailSection } from './public-center-detail-section';
import { PublicContactActions } from './public-contact-actions';

type PublicCenterPublicInfoProps = {
  locale: PublicCatalogLocale;
  centerId: string;
  countryCode: CountryCode;
  publicInfo: PublicCenterPublicInfoData;
  contactTitle: string;
  contactUnavailable: string;
  locationTitle: string;
  locationDescription: string;
  noLocation: string;
  directionsLabel: string;
  directionsAriaLabel: (locationLabel: string) => string;
  fallbackContactActions: PublicContactAction[];
  fallbackLocations: PublicProviderLocationSummary[];
  showSafeContactFallback: boolean;
};

type RenderLocationItem = {
  id: string;
  locationName: string | null;
  geoLine: string | null;
  addressLine: string | null;
  directionsUrl: string | null;
  contactActions: PublicContactAction[];
};

function preferredText(locale: PublicCatalogLocale, en: string | null, ar: string | null): string | null {
  if (locale === 'ar') return ar ?? en;
  return en ?? ar;
}

function mergeContactActions(...groups: PublicContactAction[][]): PublicContactAction[] {
  const seenActions = new Set<string>();
  const actions: PublicContactAction[] = [];

  for (const group of groups) {
    for (const action of group) {
      const actionKey = `${action.kind}:${action.href}`;
      if (seenActions.has(actionKey)) continue;
      seenActions.add(actionKey);
      actions.push(action);
    }
  }

  return actions;
}

function formatAddressLine(locale: PublicCatalogLocale, location: PublicCenterPublicLocationInfo): string | null {
  const line1 = preferredText(locale, location.addressLine1En, location.addressLine1Ar);
  const line2 = preferredText(locale, location.addressLine2En, location.addressLine2Ar);
  const landmark = preferredText(locale, location.landmarkEn, location.landmarkAr);
  const landmarkLabel = locale === 'ar' ? 'قريب من' : 'Near';
  const postalCodeLabel = locale === 'ar' ? 'الرمز البريدي' : 'Postal code';

  return [
    line1,
    line2,
    landmark ? `${landmarkLabel}: ${landmark}` : null,
    location.postalCode ? `${postalCodeLabel}: ${location.postalCode}` : null
  ].filter(Boolean).join(' · ') || null;
}

function getCoordinateDirectionsUrl(latitude: number | null, longitude: number | null): string | null {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function getDetailedDirectionsUrl(location: PublicCenterPublicLocationInfo): string | null {
  const rawMapUrl = location.mapUrl?.trim();
  if (rawMapUrl) {
    try {
      const parsedUrl = new URL(rawMapUrl);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') return parsedUrl.toString();
    } catch {
      // Fall through to coordinate fallback.
    }
  }

  return getCoordinateDirectionsUrl(location.latitude, location.longitude);
}

function buildRenderLocations(
  locale: PublicCatalogLocale,
  detailedLocations: PublicCenterPublicLocationInfo[],
  fallbackLocations: PublicProviderLocationSummary[]
): RenderLocationItem[] {
  const fallbackById = new Map(fallbackLocations.map((location) => [location.id, location]));
  const locationItems: RenderLocationItem[] = detailedLocations.map((location) => {
    const fallbackLocation = fallbackById.get(location.id) ?? null;
    const locationName = preferredText(locale, location.locationNameEn, location.locationNameAr) ?? formatPublicLocationName(locale, fallbackLocation);
    const geoLine = fallbackLocation ? formatPublicLocationGeoLine(locale, fallbackLocation) : null;
    const addressLine = formatAddressLine(locale, location);
    const directionsUrl = getDetailedDirectionsUrl(location) ?? getPublicDirectionsUrl(fallbackLocation);

    return {
      id: location.id,
      locationName,
      geoLine,
      addressLine,
      directionsUrl,
      contactActions: mergeContactActions(location.contactActions, fallbackLocation?.contactActions ?? [])
    };
  });

  const detailedLocationIds = new Set(detailedLocations.map((location) => location.id));
  for (const fallbackLocation of fallbackLocations) {
    if (detailedLocationIds.has(fallbackLocation.id)) continue;

    const locationName = formatPublicLocationName(locale, fallbackLocation);
    const geoLine = formatPublicLocationGeoLine(locale, fallbackLocation);
    locationItems.push({
      id: fallbackLocation.id,
      locationName,
      geoLine,
      addressLine: null,
      directionsUrl: getPublicDirectionsUrl(fallbackLocation),
      contactActions: fallbackLocation.contactActions
    });
  }

  return locationItems;
}

export function PublicCenterPublicInfo({
  locale,
  centerId,
  countryCode,
  publicInfo,
  contactTitle,
  contactUnavailable,
  locationTitle,
  locationDescription,
  noLocation,
  directionsLabel,
  directionsAriaLabel,
  fallbackContactActions,
  fallbackLocations,
  showSafeContactFallback
}: PublicCenterPublicInfoProps) {
  const centerActions = mergeContactActions(publicInfo.contactActions, fallbackContactActions);
  const firstLocationActions =
    publicInfo.locations.find((location) => location.contactActions.length > 0)?.contactActions ??
    fallbackLocations.find((location) => location.contactActions.length > 0)?.contactActions ??
    [];
  const displayContactActions = centerActions.length > 0 ? centerActions : firstLocationActions;
  const locationItems = buildRenderLocations(locale, publicInfo.locations, fallbackLocations);
  const renderContactSection = displayContactActions.length > 0 || showSafeContactFallback;

  return (
    <>
      {renderContactSection ? (
        <PublicCenterDetailSection title={contactTitle}>
          {displayContactActions.length > 0 ? (
            <div className="space-y-4">
              <PublicContactActions actions={displayContactActions} locale={locale} />
              <PublicCallbackRequestForm
                locale={locale}
                countryCode={countryCode}
                centerId={centerId}
                centerLocationId={null}
                doctorId={null}
                doctorPracticeLocationId={null}
                variant="center"
              />
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">{contactUnavailable}</p>
          )}
        </PublicCenterDetailSection>
      ) : null}

      <PublicCenterDetailSection title={locationTitle} description={locationDescription}>
        {locationItems.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2" role="list">
            {locationItems.map((location) => {
              const locationLabel = location.locationName ?? location.geoLine ?? location.addressLine ?? noLocation;

              return (
                <li key={location.id} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                  {location.locationName ? <h3 className="text-sm font-semibold leading-6 text-slate-950">{location.locationName}</h3> : null}
                  {location.geoLine ? (
                    <p className={location.locationName ? 'mt-2 text-sm leading-6 text-slate-600' : 'text-sm leading-6 text-slate-600'}>
                      {location.geoLine}
                    </p>
                  ) : null}
                  {location.addressLine ? (
                    <p className={(location.locationName || location.geoLine ? 'mt-2 ' : '') + 'text-sm leading-6 text-slate-700'}>
                      {location.addressLine}
                    </p>
                  ) : null}
                  {location.contactActions.length > 0 ? (
                    <div className="mt-4">
                      <PublicContactActions actions={location.contactActions} locale={locale} />
                    </div>
                  ) : null}
                  {location.directionsUrl ? (
                    <a
                      href={location.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={directionsAriaLabel(locationLabel)}
                      className={(location.contactActions.length > 0 ? 'mt-3' : 'mt-4') + ' inline-flex w-fit rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'}
                    >
                      {directionsLabel}
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-slate-600">{publicInfo.error ? contactUnavailable : noLocation}</p>
        )}
      </PublicCenterDetailSection>
    </>
  );
}
