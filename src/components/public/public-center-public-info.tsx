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

type CenterContactCopy = {
  eyebrow: string;
  intro: string;
  callbackSummary: string;
  callbackHint: string;
  branchLabel: string;
  addressLabel: string;
  locationLabel: string;
};

const contactCopyByLocale: Record<PublicCatalogLocale, CenterContactCopy> = {
  en: {
    eyebrow: 'Fast public contact',
    intro: 'Use the directory buttons below and confirm important details directly with the provider.',
    callbackSummary: 'Request a callback',
    callbackHint: 'Optional form for non-urgent contact.',
    branchLabel: 'Branch',
    addressLabel: 'Address',
    locationLabel: 'Location'
  },
  ar: {
    eyebrow: 'تواصل عام سريع',
    intro: 'استخدم أزرار الدليل أدناه وأكد التفاصيل المهمة مباشرة مع مقدم الخدمة.',
    callbackSummary: 'طلب اتصال',
    callbackHint: 'نموذج اختياري للتواصل غير العاجل.',
    branchLabel: 'الفرع',
    addressLabel: 'العنوان',
    locationLabel: 'الموقع'
  }
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

function normalizePublicMapUrl(value: string | null | undefined): string | null {
  const rawMapUrl = value?.trim();
  if (!rawMapUrl) return null;

  try {
    const parsedUrl = new URL(rawMapUrl);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') return parsedUrl.toString();
  } catch {
    return null;
  }

  return null;
}

function getTextDirectionsUrl(...parts: Array<string | null | undefined>): string | null {
  const query = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(', ');

  if (!query) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function getDetailedDirectionsUrl(
  location: PublicCenterPublicLocationInfo,
  locationName: string | null,
  geoLine: string | null,
  addressLine: string | null
): string | null {
  return (
    normalizePublicMapUrl(location.mapUrl) ??
    getCoordinateDirectionsUrl(location.latitude, location.longitude) ??
    getTextDirectionsUrl(locationName, addressLine, geoLine)
  );
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
    const directionsUrl = getDetailedDirectionsUrl(location, locationName, geoLine, addressLine) ?? getPublicDirectionsUrl(fallbackLocation);

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
      directionsUrl: getPublicDirectionsUrl(fallbackLocation) ?? getTextDirectionsUrl(locationName, geoLine),
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
  const copy = contactCopyByLocale[locale];
  const centerActions = mergeContactActions(publicInfo.contactActions, fallbackContactActions);
  const firstLocationActions =
    publicInfo.locations.find((location) => location.contactActions.length > 0)?.contactActions ??
    fallbackLocations.find((location) => location.contactActions.length > 0)?.contactActions ??
    [];
  const displayContactActions = centerActions.length > 0 ? centerActions : firstLocationActions;
  const locationItems = buildRenderLocations(locale, publicInfo.locations, fallbackLocations);
  const primaryLocation = locationItems.find((location) => location.directionsUrl) ?? locationItems[0] ?? null;
  const primaryLocationLabel = primaryLocation?.locationName ?? primaryLocation?.geoLine ?? primaryLocation?.addressLine ?? noLocation;
  const primaryDirectionsUrl = primaryLocation?.directionsUrl ?? null;
  const renderContactSection = displayContactActions.length > 0 || Boolean(primaryDirectionsUrl) || showSafeContactFallback;

  return (
    <>
      {renderContactSection ? (
        <PublicCenterDetailSection title={contactTitle}>
          {displayContactActions.length > 0 || primaryDirectionsUrl ? (
            <div className="space-y-5">
              <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/40 p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">{copy.eyebrow}</p>
                    <p className="text-sm leading-6 text-slate-700">{copy.intro}</p>
                  </div>
                  {primaryDirectionsUrl ? (
                    <a
                      href={primaryDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={directionsAriaLabel(primaryLocationLabel)}
                      className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <span aria-hidden="true">Map</span>
                      <span>{copy.locationLabel}</span>
                    </a>
                  ) : null}
                </div>

                {displayContactActions.length > 0 ? (
                  <PublicContactActions actions={displayContactActions} locale={locale} variant="premium" showValues />
                ) : null}
              </div>

              <details className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm open:bg-slate-50/70 sm:p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-bold text-slate-950 marker:hidden">
                  <span>
                    <span className="block">{copy.callbackSummary}</span>
                    <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{copy.callbackHint}</span>
                  </span>
                  <span className="mt-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 transition group-open:rotate-180">More</span>
                </summary>
                <div className="mt-4">
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
              </details>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">{contactUnavailable}</p>
          )}
        </PublicCenterDetailSection>
      ) : null}

      <PublicCenterDetailSection title={locationTitle} description={locationDescription}>
        {locationItems.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2" role="list">
            {locationItems.map((location) => {
              const locationLabel = location.locationName ?? location.geoLine ?? location.addressLine ?? noLocation;

              return (
                <li key={location.id} className="rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm ring-1 ring-emerald-50/70">
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{copy.branchLabel}</p>
                    {location.locationName ? <h3 className="text-base font-bold leading-7 text-slate-950">{location.locationName}</h3> : null}
                    {location.geoLine ? <p className="text-sm leading-6 text-slate-600">{location.geoLine}</p> : null}
                    {location.addressLine ? (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{copy.addressLabel}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-800">{location.addressLine}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {location.directionsUrl ? (
                      <a
                        href={location.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={directionsAriaLabel(locationLabel)}
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      >
                        <span aria-hidden="true">Map</span>
                        <span>{directionsLabel}</span>
                      </a>
                    ) : null}
                    {location.contactActions.length > 0 ? <PublicContactActions actions={location.contactActions} locale={locale} /> : null}
                  </div>
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
