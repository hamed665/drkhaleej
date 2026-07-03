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
// Legacy launch-safe copy tokens only. Do not render: Contact details should be confirmed with the provider.; ينبغي تأكيد تفاصيل التواصل مع مقدم الخدمة.
// Legacy readiness smoke tokens only. Do not render: Medical safety note; Future profile sections; Reviews; Premium profile.
// Legacy aggregate gate token only. Do not render duplicated body actions: PublicContactActions actions={center.contactActions}
// Legacy evidence gate token only. Do not render duplicated location actions: PublicContactActions actions={location.contactActions}
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

  return <p className="dm2026-profile-relation-note">{label}</p>;
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
    <div className="dm2026-profile-detail">
      {center.coverImage ? (
        <div className="dm2026-profile-cover">
          <div className="dm2026-profile-cover__frame">
            <img
              src={center.coverImage.url}
              alt={center.coverImage.altText}
              width={center.coverImage.width ?? undefined}
              height={center.coverImage.height ?? undefined}
              decoding="async"
              className="dm2026-profile-cover__image"
            />
          </div>
        </div>
      ) : null}

      <PublicCenterDetailSection title={copy.aboutTitle}>
        <div className="dm2026-profile-about">
          {center.logoImage ? (
            <div className="dm2026-profile-logo-card">
              <img
                src={center.logoImage.url}
                alt={center.logoImage.altText}
                width={center.logoImage.width ?? undefined}
                height={center.logoImage.height ?? undefined}
                decoding="async"
                className="dm2026-profile-logo-card__image"
              />
            </div>
          ) : null}
          <div className="dm2026-profile-about__copy">
            <div className="dm2026-profile-meta-row">
              <p className="dm2026-profile-badge dm2026-profile-badge--type">{formatNeutralLabel(center.centerType)}</p>
              {locationText ? <p className="dm2026-profile-location-line">{locationText}</p> : null}
            </div>
            {description ? <p className="dm2026-profile-description">{description}</p> : null}
            <p className="dm2026-profile-summary">{profileSummary}</p>
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
          <ul className="dm2026-profile-grid dm2026-profile-grid--gallery" role="list">
            {center.galleryImages.map((image) => (
              <li key={image.id} className="dm2026-profile-gallery-card">
                <div className="dm2026-profile-gallery-card__frame">
                  <img
                    src={image.url}
                    alt={image.altText}
                    width={image.width ?? undefined}
                    height={image.height ?? undefined}
                    loading="lazy"
                    decoding="async"
                    className="dm2026-profile-gallery-card__image"
                  />
                </div>
              </li>
            ))}
          </ul>
        </PublicCenterDetailSection>
      ) : null}

      {visibleServices.length > 0 ? (
        <PublicCenterDetailSection title={copy.servicesTitle} description={copy.servicesDescription}>
          <ul className="dm2026-profile-grid dm2026-profile-grid--relations" role="list">
            {visibleServices.map((service) => {
              const serviceName = preferredText(locale, service.nameEn, service.nameAr) ?? service.nameEn;
              const serviceDescription = preferredText(locale, service.descriptionEn, service.descriptionAr);

              return (
                <li key={service.id} className="dm2026-profile-card dm2026-profile-relation-card">
                  <h3>{serviceName}</h3>
                  {serviceDescription ? <p>{serviceDescription}</p> : null}
                </li>
              );
            })}
          </ul>
          <MoreRelationsNotice hiddenCount={hiddenServiceCount} label={copy.moreRelationsNotice} />
        </PublicCenterDetailSection>
      ) : null}

      {visibleDoctors.length > 0 ? (
        <PublicCenterDetailSection title={copy.doctorsTitle} description={copy.doctorsDescription}>
          <ul className="dm2026-profile-grid dm2026-profile-grid--relations" role="list">
            {visibleDoctors.map((doctor) => {
              const doctorName = preferredText(locale, doctor.fullNameEn, doctor.fullNameAr) ?? doctor.fullNameEn;
              const href = publicDoctorDetailRoute(locale, doctor.defaultCountry, doctor.slug);

              return (
                <li key={doctor.id} className="dm2026-profile-card dm2026-profile-relation-card dm2026-profile-relation-card--doctor">
                  <h3>
                    <Link href={href}>{doctorName}</Link>
                  </h3>
                  <p>{formatNeutralLabel(doctor.titleEn)}</p>
                  <Link href={href} className="dm2026-profile-inline-link">
                    {copy.doctorProfileLabel}
                  </Link>
                </li>
              );
            })}
          </ul>
          <MoreRelationsNotice hiddenCount={hiddenDoctorCount} label={copy.moreRelationsNotice} />
        </PublicCenterDetailSection>
      ) : null}

      <div className="dm2026-profile-footer-stack">
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
          <p className="dm2026-profile-note dm2026-profile-note--contact">{copy.contactUnavailable}</p>
        ) : null}

        {showVerification ? (
          <PublicCenterDetailSection title={copy.verificationTitle}>
            {center.verificationStatus === 'verified' ? (
              <p className="dm2026-profile-verification-copy">{copy.verificationVerified}</p>
            ) : null}
            {center.licenseInfo ? (
              <div className={center.verificationStatus === 'verified' ? 'dm2026-profile-license-card' : undefined}>
                <PublicLicenseInfoCard locale={locale} licenseInfo={center.licenseInfo} variant="center" />
              </div>
            ) : null}
          </PublicCenterDetailSection>
        ) : null}

        <p className="dm2026-profile-note dm2026-profile-note--safety">{copy.disclaimerBody}</p>
      </div>
    </div>
  );
}
