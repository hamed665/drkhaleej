import Link from 'next/link';

import { formatPublicLocationSummary } from '@/lib/catalog/public-location';
import {
  hiddenPublicProfileRelationCount,
  limitPublicProfileRelations,
  PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT,
  PUBLIC_CENTER_PROFILE_LOCATION_LIMIT,
  PUBLIC_CENTER_PROFILE_SERVICE_LIMIT,
} from '@/lib/catalog/public-profile-relation-limits';
import { buildPublicCenterProfileSummary } from '@/lib/catalog/public-profile-summary';
import type { PublicCatalogLocale, PublicCenterDetail as PublicCenterDetailData } from '@/lib/catalog/public-types';
import { publicDoctorDetailRoute } from '@/lib/routes/public';

import { PublicCallbackRequestForm } from './public-callback-request-form';
import { PublicCenterDetailSection } from './public-center-detail-section';
import { PublicLocationSection } from './public-location-section';
import { PublicLicenseInfoCard } from './public-license-info-card';

type PublicCenterDetailProps = {
  locale: PublicCatalogLocale;
  center: PublicCenterDetailData;
};

type CenterDetailCopy = {
  aboutTitle: string;
  servicesTitle: string;
  servicesDescription: string;
  doctorsTitle: string;
  doctorsDescription: string;
  locationTitle: string;
  locationDescription: string;
  contactTitle: string;
  contactUnavailable: string;
  galleryTitle: string;
  verificationTitle: string;
  verificationVerified: string;
  disclaimerBody: string;
  noLocation: string;
  moreRelationsNotice: string;
  directionsLabel: string;
  directionsAriaLabel: string;
  doctorProfileLabel: string;
};

// Launch-safe source contract only. Do not render the old empty-state copy:
// License and verification details will be added after the provider verification foundation is complete.
const copyByLocale: Record<PublicCatalogLocale, CenterDetailCopy> = {
  en: {
    aboutTitle: 'About this center',
    servicesTitle: 'Services preview',
    servicesDescription: 'A limited read-only preview of public services connected to this center.',
    doctorsTitle: 'Doctors preview',
    doctorsDescription: 'A limited read-only preview of public doctor profiles connected to this center.',
    locationTitle: 'Location overview',
    locationDescription: 'Public branch labels and general area, city, and country information are shown in this phase.',
    contactTitle: 'Request a callback',
    contactUnavailable: 'Contact details should be confirmed with the provider.',
    galleryTitle: 'Gallery',
    verificationTitle: 'Profile verification',
    verificationVerified: 'This public profile is marked as verified in DrKhaleej records. This is not a license or MOH approval claim.',
    disclaimerBody:
      'This public profile is for healthcare discovery only. It is not medical advice, diagnosis, emergency guidance, or a guarantee of provider availability.',
    noLocation: 'General location details are not available yet.',
    moreRelationsNotice: 'More related items may be surfaced after review.',
    directionsLabel: 'Open in Maps',
    directionsAriaLabel: 'Open this location in maps',
    doctorProfileLabel: 'View doctor profile'
  },
  ar: {
    aboutTitle: 'عن هذا المركز',
    servicesTitle: 'لمحة عن الخدمات',
    servicesDescription: 'عرض محدود للقراءة فقط للخدمات العامة المرتبطة بهذا المركز.',
    doctorsTitle: 'لمحة عن الأطباء',
    doctorsDescription: 'عرض محدود للقراءة فقط لملفات الأطباء العامة المرتبطة بهذا المركز.',
    locationTitle: 'نظرة عامة على الموقع',
    locationDescription: 'تظهر أسماء الفروع العامة ومعلومات عامة عن المنطقة والمدينة والدولة في هذه المرحلة.',
    contactTitle: 'طلب اتصال',
    contactUnavailable: 'ينبغي تأكيد تفاصيل التواصل مع مقدم الخدمة.',
    galleryTitle: 'المعرض',
    verificationTitle: 'توثيق الملف',
    verificationVerified: 'هذا الملف العام محدد كملف موثق في سجلات DrKhaleej. هذا ليس ادعاءً بترخيص أو اعتماد من وزارة الصحة.',
    disclaimerBody:
      'اكتشاف عام فقط. لا يعد نصيحة طبية أو تشخيصاً أو إرشاداً للطوارئ أو ضماناً لتوفر مقدم الخدمة.',
    noLocation: 'تفاصيل الموقع العامة غير متاحة بعد.',
    moreRelationsNotice: 'قد تظهر عناصر مرتبطة إضافية بعد المراجعة.',
    directionsLabel: 'فتح في الخرائط',
    directionsAriaLabel: 'فتح هذا الموقع في الخرائط',
    doctorProfileLabel: 'عرض ملف الطبيب'
  }
};

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

function MoreRelationsNotice({ hiddenCount, label }: { hiddenCount: number; label: string }) {
  if (hiddenCount === 0) return null;

  return <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>;
}

export function PublicCenterDetail({ locale, center }: PublicCenterDetailProps) {
  const copy = copyByLocale[locale];
  const description =
    preferredText(locale, center.shortDescriptionEn, center.shortDescriptionAr) ??
    preferredText(locale, center.descriptionEn, center.descriptionAr);
  const profileSummary = buildPublicCenterProfileSummary(locale, center);
  const locationText = formatPublicLocationSummary(locale, center.location);
  const visibleLocations = limitPublicProfileRelations(center.locations, PUBLIC_CENTER_PROFILE_LOCATION_LIMIT);
  const visibleServices = limitPublicProfileRelations(center.services, PUBLIC_CENTER_PROFILE_SERVICE_LIMIT);
  const visibleDoctors = limitPublicProfileRelations(center.doctors, PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT);
  const hiddenLocationCount = hiddenPublicProfileRelationCount(center.locations, PUBLIC_CENTER_PROFILE_LOCATION_LIMIT);
  const hiddenServiceCount = hiddenPublicProfileRelationCount(center.services, PUBLIC_CENTER_PROFILE_SERVICE_LIMIT);
  const hiddenDoctorCount = hiddenPublicProfileRelationCount(center.doctors, PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT);
  const showCallbackRequest = center.contactActions.length > 0;
  const showSafeContactFallback = center.contactActions.length === 0 && visibleLocations.length > 0;
  const showVerification = center.verificationStatus === 'verified' || center.licenseInfo !== null;

  return (
    <div className="mt-10 space-y-5">
      {center.coverImage ? (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-sm ring-1 ring-white/70">
          <div className="aspect-[16/7] w-full overflow-hidden bg-slate-100">
            <img
              src={center.coverImage.url}
              alt={center.coverImage.altText}
              width={center.coverImage.width ?? undefined}
              height={center.coverImage.height ?? undefined}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      <PublicCenterDetailSection title={copy.aboutTitle}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {center.logoImage ? (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:h-20 sm:w-20">
              <img
                src={center.logoImage.url}
                alt={center.logoImage.altText}
                width={center.logoImage.width ?? undefined}
                height={center.logoImage.height ?? undefined}
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="inline-flex w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                {formatNeutralLabel(center.centerType)}
              </p>
              {locationText ? <p className="text-sm leading-6 text-slate-600">{locationText}</p> : null}
            </div>
            {description ? <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{description}</p> : null}
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{profileSummary}</p>
          </div>
        </div>
      </PublicCenterDetailSection>

      {visibleLocations.length > 0 ? (
        <>
          <PublicLocationSection
            locale={locale}
            title={copy.locationTitle}
            description={copy.locationDescription}
            locations={visibleLocations}
            emptyLabel={copy.noLocation}
            directionsLabel={copy.directionsLabel}
            directionsAriaLabel={() => copy.directionsAriaLabel}
          />
          <MoreRelationsNotice hiddenCount={hiddenLocationCount} label={copy.moreRelationsNotice} />
        </>
      ) : null}

      {center.galleryImages.length > 0 ? (
        <PublicCenterDetailSection title={copy.galleryTitle}>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
            {center.galleryImages.map((image) => (
              <li key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src={image.url}
                    alt={image.altText}
                    width={image.width ?? undefined}
                    height={image.height ?? undefined}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </li>
            ))}
          </ul>
        </PublicCenterDetailSection>
      ) : null}

      {visibleServices.length > 0 ? (
        <PublicCenterDetailSection title={copy.servicesTitle} description={copy.servicesDescription}>
          <ul className="grid gap-3 sm:grid-cols-2" role="list">
            {visibleServices.map((service) => {
              const serviceName = preferredText(locale, service.nameEn, service.nameAr) ?? service.nameEn;
              const serviceDescription = preferredText(locale, service.descriptionEn, service.descriptionAr);

              return (
                <li key={service.id} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-semibold leading-6 text-slate-950">{serviceName}</h3>
                  {serviceDescription ? <p className="mt-2 text-sm leading-6 text-slate-600">{serviceDescription}</p> : null}
                </li>
              );
            })}
          </ul>
          <MoreRelationsNotice hiddenCount={hiddenServiceCount} label={copy.moreRelationsNotice} />
        </PublicCenterDetailSection>
      ) : null}

      {visibleDoctors.length > 0 ? (
        <PublicCenterDetailSection title={copy.doctorsTitle} description={copy.doctorsDescription}>
          <ul className="grid gap-3 sm:grid-cols-2" role="list">
            {visibleDoctors.map((doctor) => {
              const doctorName = preferredText(locale, doctor.fullNameEn, doctor.fullNameAr) ?? doctor.fullNameEn;
              const href = publicDoctorDetailRoute(locale, doctor.defaultCountry, doctor.slug);

              return (
                <li key={doctor.id} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                  <h3>
                    <Link href={href} className="text-sm font-semibold leading-6 text-slate-950 underline-offset-4 hover:text-emerald-800 hover:underline">
                      {doctorName}
                    </Link>
                  </h3>
                  <p className="mt-2 text-xs font-medium text-slate-500">{formatNeutralLabel(doctor.titleEn)}</p>
                  <Link href={href} className="mt-3 inline-flex text-xs font-semibold text-emerald-800 underline-offset-4 hover:underline">
                    {copy.doctorProfileLabel}
                  </Link>
                </li>
              );
            })}
          </ul>
          <MoreRelationsNotice hiddenCount={hiddenDoctorCount} label={copy.moreRelationsNotice} />
        </PublicCenterDetailSection>
      ) : null}

      {showCallbackRequest ? (
        <PublicCenterDetailSection title={copy.contactTitle}>
          <PublicCallbackRequestForm
            locale={locale}
            countryCode={center.defaultCountry}
            centerId={center.id}
            centerLocationId={null}
            doctorId={null}
            doctorPracticeLocationId={null}
            variant="center"
          />
        </PublicCenterDetailSection>
      ) : null}

      {showSafeContactFallback ? (
        <p className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-xs leading-5 text-slate-600 shadow-sm">
          {copy.contactUnavailable}
        </p>
      ) : null}

      {showVerification ? (
        <PublicCenterDetailSection title={copy.verificationTitle}>
          {center.verificationStatus === 'verified' ? (
            <p className="text-sm leading-6 text-slate-700">{copy.verificationVerified}</p>
          ) : null}
          {center.licenseInfo ? (
            <div className={center.verificationStatus === 'verified' ? 'mt-4' : undefined}>
              <PublicLicenseInfoCard locale={locale} licenseInfo={center.licenseInfo} variant="center" />
            </div>
          ) : null}
        </PublicCenterDetailSection>
      ) : null}

      <p className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-xs leading-5 text-slate-500">
        {copy.disclaimerBody}
      </p>
    </div>
  );
}
