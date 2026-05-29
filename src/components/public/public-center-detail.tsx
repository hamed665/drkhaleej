import { formatPublicLocationSummary } from '@/lib/catalog/public-location';
import type { PublicCenterDetail, PublicCatalogLocale } from '@/lib/catalog/public-types';

import { PublicCallbackRequestForm } from './public-callback-request-form';
import { PublicCenterDetailSection } from './public-center-detail-section';
import { PublicContactActions } from './public-contact-actions';
import { PublicLocationSection } from './public-location-section';

type PublicCenterDetailProps = {
  locale: PublicCatalogLocale;
  center: PublicCenterDetail;
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
  verificationTitle: string;
  verificationVerified: string;
  verificationPlaceholder: string;
  futureTitle: string;
  futureDescription: string;
  futureSlots: string[];
  disclaimerTitle: string;
  disclaimerBody: string;
  noServices: string;
  noDoctors: string;
  noLocation: string;
  directionsLabel: string;
  directionsAriaLabel: string;
};

const copyByLocale: Record<PublicCatalogLocale, CenterDetailCopy> = {
  en: {
    aboutTitle: 'About this center',
    servicesTitle: 'Services preview',
    servicesDescription: 'A limited read-only preview of public services connected to this center.',
    doctorsTitle: 'Doctors preview',
    doctorsDescription: 'A limited read-only preview of public doctor profiles connected to this center.',
    locationTitle: 'Location overview',
    locationDescription: 'Only public branch labels and general area, city, and country information are shown in this phase.',
    contactTitle: 'Contact this center',
    verificationTitle: 'Profile verification',
    verificationVerified: 'This public profile is marked as verified in DrMuscat records. This is not a license or MOH approval claim.',
    verificationPlaceholder: 'License and verification details will be added after the provider verification foundation is complete.',
    futureTitle: 'Future profile sections',
    futureDescription: 'These areas are reserved for later approved phases and are not active yet.',
    futureSlots: ['Gallery', 'Video', 'Reviews', 'Premium profile'],
    disclaimerTitle: 'Medical safety note',
    disclaimerBody:
      'This public profile is for healthcare discovery only. It is not medical advice, diagnosis, emergency guidance, or a guarantee of provider availability.',
    noServices: 'No public services are connected to this profile yet.',
    noDoctors: 'No public doctors are connected to this profile yet.',
    noLocation: 'General location details are not available yet.',
    directionsLabel: 'Open in Maps',
    directionsAriaLabel: 'Open this location in maps'
  },
  ar: {
    aboutTitle: 'عن هذا المركز',
    servicesTitle: 'لمحة عن الخدمات',
    servicesDescription: 'عرض محدود للقراءة فقط للخدمات العامة المرتبطة بهذا المركز.',
    doctorsTitle: 'لمحة عن الأطباء',
    doctorsDescription: 'عرض محدود للقراءة فقط لملفات الأطباء العامة المرتبطة بهذا المركز.',
    locationTitle: 'نظرة عامة على الموقع',
    locationDescription: 'تظهر في هذه المرحلة أسماء الفروع العامة ومعلومات عامة فقط عن المنطقة والمدينة والدولة.',
    contactTitle: 'التواصل مع المركز',
    verificationTitle: 'توثيق الملف',
    verificationVerified: 'هذا الملف العام محدد كملف موثق في سجلات DrMuscat. هذا ليس ادعاءً بترخيص أو اعتماد من وزارة الصحة.',
    verificationPlaceholder: 'ستضاف تفاصيل الترخيص والتوثيق بعد اكتمال أساس توثيق مقدمي الخدمة.',
    futureTitle: 'أقسام الملف المستقبلية',
    futureDescription: 'هذه المساحات محجوزة لمراحل لاحقة معتمدة وليست مفعلة حالياً.',
    futureSlots: ['المعرض', 'الفيديو', 'المراجعات', 'الملف المميز'],
    disclaimerTitle: 'ملاحظة السلامة الطبية',
    disclaimerBody:
      'هذا الملف العام مخصص لاكتشاف خدمات الرعاية الصحية فقط. ولا يعد نصيحة طبية أو تشخيصاً أو إرشاداً للطوارئ أو ضماناً لتوفر مقدم الخدمة.',
    noServices: 'لا توجد خدمات عامة مرتبطة بهذا الملف حتى الآن.',
    noDoctors: 'لا يوجد أطباء عامون مرتبطون بهذا الملف حتى الآن.',
    noLocation: 'تفاصيل الموقع العامة غير متاحة بعد.',
    directionsLabel: 'فتح في الخرائط',
    directionsAriaLabel: 'فتح هذا الموقع في الخرائط'
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

export function PublicCenterDetail({ locale, center }: PublicCenterDetailProps) {
  const copy = copyByLocale[locale];
  const description =
    preferredText(locale, center.shortDescriptionEn, center.shortDescriptionAr) ??
    preferredText(locale, center.descriptionEn, center.descriptionAr);
  const locationText = formatPublicLocationSummary(locale, center.location);

  return (
    <div className="mt-10 space-y-5">
      <PublicCenterDetailSection title={copy.aboutTitle}>
        <div className="flex flex-wrap items-center gap-3">
          <p className="inline-flex w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            {formatNeutralLabel(center.centerType)}
          </p>
          {locationText ? <p className="text-sm leading-6 text-slate-600">{locationText}</p> : null}
        </div>
        {description ? <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{description}</p> : null}
      </PublicCenterDetailSection>

      {center.contactActions.length > 0 ? (
        <PublicCenterDetailSection title={copy.contactTitle}>
          <div className="space-y-4">
            <PublicContactActions actions={center.contactActions} locale={locale} />
            <PublicCallbackRequestForm
              locale={locale}
              countryCode={center.defaultCountry}
              centerId={center.id}
              centerLocationId={null}
              doctorId={null}
              doctorPracticeLocationId={null}
              variant="center"
            />
          </div>
        </PublicCenterDetailSection>
      ) : null}

      <PublicLocationSection
        locale={locale}
        title={copy.locationTitle}
        description={copy.locationDescription}
        locations={center.locations}
        emptyLabel={copy.noLocation}
        directionsLabel={copy.directionsLabel}
        directionsAriaLabel={() => copy.directionsAriaLabel}
        renderLocationActions={(location) => <PublicContactActions actions={location.contactActions} locale={locale} />}
      />

      <PublicCenterDetailSection title={copy.servicesTitle} description={copy.servicesDescription}>
        {center.services.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2" role="list">
            {center.services.map((service) => {
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
        ) : (
          <p className="text-sm leading-6 text-slate-600">{copy.noServices}</p>
        )}
      </PublicCenterDetailSection>

      <PublicCenterDetailSection title={copy.doctorsTitle} description={copy.doctorsDescription}>
        {center.doctors.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2" role="list">
            {center.doctors.map((doctor) => {
              const doctorName = preferredText(locale, doctor.fullNameEn, doctor.fullNameAr) ?? doctor.fullNameEn;

              return (
                <li key={doctor.id} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-semibold leading-6 text-slate-950">{doctorName}</h3>
                  <p className="mt-2 text-xs font-medium text-slate-500">{formatNeutralLabel(doctor.titleEn)}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-slate-600">{copy.noDoctors}</p>
        )}
      </PublicCenterDetailSection>

      <PublicCenterDetailSection title={copy.verificationTitle}>
        <p className="text-sm leading-6 text-slate-700">
          {center.verificationStatus === 'verified' ? copy.verificationVerified : copy.verificationPlaceholder}
        </p>
      </PublicCenterDetailSection>

      <PublicCenterDetailSection title={copy.futureTitle} description={copy.futureDescription}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {copy.futureSlots.map((slot) => (
            <li key={slot} className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
              {slot}
            </li>
          ))}
        </ul>
      </PublicCenterDetailSection>

      <PublicCenterDetailSection title={copy.disclaimerTitle}>
        <p className="text-sm leading-6 text-slate-700">{copy.disclaimerBody}</p>
      </PublicCenterDetailSection>
    </div>
  );
}
