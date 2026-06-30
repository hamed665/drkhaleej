import { formatPublicLocationSummary, getPublicDirectionsUrl } from '@/lib/catalog/public-location';
import type { PublicCatalogLocale, PublicDoctorDetail as PublicDoctorDetailData } from '@/lib/catalog/public-types';
import { publicCenterDetailRoute } from '@/lib/routes/public';

import { PublicCenterDetailSection } from './public-center-detail-section';
import { PublicContactActions } from './public-contact-actions';
import { PublicDoctorPracticeCallback } from './public-doctor-practice-callback';
import { PublicLicenseInfoCard } from './public-license-info-card';

type PublicDoctorDetailProps = {
  locale: PublicCatalogLocale;
  doctor: PublicDoctorDetailData;
};

const copyByLocale = {
  en: {
    aboutTitle: 'About this doctor',
    detailsTitle: 'Professional details',
    servicesTitle: 'Services and specialties preview',
    servicesDescription: 'A limited read-only preview of public services and specialty information connected to this doctor.',
    practiceLocationsTitle: 'Practice locations preview',
    practiceLocationsDescription: 'Only connected center names, public branch labels, and general area, city, and country information are shown in this phase.',
    trustTitle: 'Profile verification',
    trustVerified: 'This public profile is marked as verified in DrKhaleej records. This is not a license or MOH approval claim.',
    trustPlaceholder: 'License and verification details will be added after the provider verification foundation is complete.',
    futureTitle: 'Future doctor profile sections',
    futureDescription: 'These areas are reserved for later approved phases and are not active yet.',
    futureSlots: ['Directions', 'Reviews', 'Ratings', 'Media/gallery', 'Video', 'Premium profile'],
    disclaimerTitle: 'Discovery safety note',
    disclaimerBody: 'This public profile is for healthcare discovery only. Confirm clinical details directly with the provider before making care decisions.',
    genderLabel: 'Gender',
    specialtyLabel: 'Primary specialty',
    yearsExperienceLabel: 'Years of experience',
    noBio: 'No public biography is available yet.',
    noServices: 'No public services are connected to this doctor profile yet.',
    noPracticeLocations: 'No public practice locations are connected to this doctor profile yet.',
    noLocation: 'General location details are not available yet.',
    centerProfileLabel: 'View center profile',
    directionsLabel: 'Open in Maps',
    practiceDirectionsAriaLabel: 'Open this practice location in maps'
  },
  ar: {
    aboutTitle: 'عن هذا الطبيب',
    detailsTitle: 'التفاصيل المهنية',
    servicesTitle: 'لمحة عن الخدمات والتخصصات',
    servicesDescription: 'عرض محدود للقراءة فقط للخدمات ومعلومات التخصص العامة المرتبطة بهذا الطبيب.',
    practiceLocationsTitle: 'لمحة عن مواقع الممارسة',
    practiceLocationsDescription: 'تظهر في هذه المرحلة أسماء المراكز المرتبطة وأسماء الفروع العامة ومعلومات عامة فقط عن المنطقة والمدينة والدولة.',
    trustTitle: 'توثيق الملف',
    trustVerified: 'هذا الملف العام محدد كملف موثق في سجلات DrKhaleej. هذا ليس ادعاءً بترخيص أو اعتماد من وزارة الصحة.',
    trustPlaceholder: 'ستضاف تفاصيل الترخيص والتوثيق بعد اكتمال أساس توثيق مقدمي الخدمة.',
    futureTitle: 'أقسام ملف الطبيب المستقبلية',
    futureDescription: 'هذه المساحات محجوزة لمراحل لاحقة معتمدة وليست مفعلة حالياً.',
    futureSlots: ['الاتجاهات', 'المراجعات', 'التقييمات', 'المعرض', 'الفيديو', 'الملف المميز'],
    disclaimerTitle: 'ملاحظة سلامة الاكتشاف',
    disclaimerBody: 'هذا الملف العام مخصص لاكتشاف خدمات الرعاية فقط. يرجى تأكيد التفاصيل مباشرة مع مقدم الخدمة قبل اتخاذ قرارات الرعاية.',
    genderLabel: 'الجنس',
    specialtyLabel: 'التخصص الأساسي',
    yearsExperienceLabel: 'سنوات الخبرة',
    noBio: 'لا توجد سيرة عامة متاحة حتى الآن.',
    noServices: 'لا توجد خدمات عامة مرتبطة بملف هذا الطبيب حتى الآن.',
    noPracticeLocations: 'لا توجد مواقع ممارسة عامة مرتبطة بملف هذا الطبيب حتى الآن.',
    noLocation: 'تفاصيل الموقع العامة غير متاحة بعد.',
    centerProfileLabel: 'عرض ملف المركز',
    directionsLabel: 'فتح في الخرائط',
    practiceDirectionsAriaLabel: 'فتح موقع الممارسة في الخرائط'
  }
} as const satisfies Record<PublicCatalogLocale, Record<string, string | string[]>>;

function preferredText(locale: PublicCatalogLocale, en: string | null, ar: string | null): string | null {
  return locale === 'ar' ? ar ?? en : en ?? ar;
}

function formatNeutralLabel(value: string): string {
  return value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
}

function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

export function PublicDoctorDetail({ locale, doctor }: PublicDoctorDetailProps) {
  const copy = copyByLocale[locale];
  const bio = preferredText(locale, doctor.bioEn, doctor.bioAr);
  const primarySpecialtyName = doctor.primarySpecialty
    ? preferredText(locale, doctor.primarySpecialty.nameEn, doctor.primarySpecialty.nameAr) ?? doctor.primarySpecialty.nameEn
    : null;
  const gender = doctor.gender !== 'unspecified' ? formatNeutralLabel(doctor.gender) : null;

  return (
    <div className="mt-10 space-y-5">
      <PublicCenterDetailSection title={copy.aboutTitle}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {doctor.profileImage ? (
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              <img
                src={doctor.profileImage.url}
                alt={doctor.profileImage.altText}
                width={doctor.profileImage.width ?? undefined}
                height={doctor.profileImage.height ?? undefined}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="inline-flex w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                {formatNeutralLabel(doctor.titleEn)}
              </p>
              {primarySpecialtyName ? <p className="text-sm leading-6 text-slate-600">{primarySpecialtyName}</p> : null}
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{bio ?? copy.noBio}</p>
          </div>
        </div>
      </PublicCenterDetailSection>

      <PublicCenterDetailSection title={copy.detailsTitle}>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gender ? <DetailItem label={copy.genderLabel} value={gender} /> : null}
          {doctor.yearsExperience !== null ? <DetailItem label={copy.yearsExperienceLabel} value={doctor.yearsExperience} /> : null}
          {primarySpecialtyName ? <DetailItem label={copy.specialtyLabel} value={primarySpecialtyName} /> : null}
        </dl>
        {doctor.licenseInfo ? (
          <div className="mt-4">
            <PublicLicenseInfoCard locale={locale} licenseInfo={doctor.licenseInfo} variant="doctor" />
          </div>
        ) : null}
      </PublicCenterDetailSection>

      <PublicCenterDetailSection title={copy.servicesTitle} description={copy.servicesDescription}>
        {doctor.services.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2" role="list">
            {doctor.services.map((service) => {
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

      <PublicCenterDetailSection title={copy.practiceLocationsTitle} description={copy.practiceLocationsDescription}>
        {doctor.practiceLocations.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2" role="list">
            {doctor.practiceLocations.map((practiceLocation) => {
              const centerName = preferredText(locale, practiceLocation.center.nameEn, practiceLocation.center.nameAr) ?? practiceLocation.center.nameEn;
              const locationText = formatPublicLocationSummary(locale, practiceLocation.location);
              const directionsUrl = getPublicDirectionsUrl(practiceLocation.location);
              return (
                <li key={practiceLocation.id} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-semibold leading-6 text-slate-950">{centerName}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{locationText ?? copy.noLocation}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <PublicContactActions actions={practiceLocation.contactActions} locale={locale} />
                    {directionsUrl ? (
                      <a href={directionsUrl} target="_blank" rel="noopener noreferrer" aria-label={copy.practiceDirectionsAriaLabel} className="inline-flex w-fit rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                        {copy.directionsLabel}
                      </a>
                    ) : null}
                    <a href={publicCenterDetailRoute(locale, doctor.defaultCountry, practiceLocation.center.slug)} className="inline-flex text-xs font-semibold text-emerald-800 underline-offset-4 hover:underline">
                      {copy.centerProfileLabel}
                    </a>
                  </div>
                  <PublicDoctorPracticeCallback locale={locale} doctor={doctor} practiceLocation={practiceLocation} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-slate-600">{copy.noPracticeLocations}</p>
        )}
      </PublicCenterDetailSection>

      <PublicCenterDetailSection title={copy.trustTitle}>
        <p className="text-sm leading-6 text-slate-700">{doctor.verificationStatus === 'verified' ? copy.trustVerified : copy.trustPlaceholder}</p>
      </PublicCenterDetailSection>

      <PublicCenterDetailSection title={copy.futureTitle} description={copy.futureDescription}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" role="list">
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
