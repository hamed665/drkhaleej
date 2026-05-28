import type { PublicCatalogLocale, PublicDoctorDetail } from '@/lib/catalog/public-types';
import { publicCenterDetailRoute } from '@/lib/routes/public';

import { PublicCenterDetailSection } from './public-center-detail-section';

type PublicDoctorDetailProps = {
  locale: PublicCatalogLocale;
  doctor: PublicDoctorDetail;
};

type DoctorDetailCopy = {
  aboutTitle: string;
  detailsTitle: string;
  servicesTitle: string;
  servicesDescription: string;
  practiceLocationsTitle: string;
  practiceLocationsDescription: string;
  trustTitle: string;
  trustVerified: string;
  trustPlaceholder: string;
  futureTitle: string;
  futureDescription: string;
  futureSlots: string[];
  disclaimerTitle: string;
  disclaimerBody: string;
  genderLabel: string;
  specialtyLabel: string;
  yearsExperienceLabel: string;
  noBio: string;
  noServices: string;
  noPracticeLocations: string;
  noLocation: string;
  centerProfileLabel: string;
};

const copyByLocale: Record<PublicCatalogLocale, DoctorDetailCopy> = {
  en: {
    aboutTitle: 'About this doctor',
    detailsTitle: 'Professional details',
    servicesTitle: 'Services and specialties preview',
    servicesDescription: 'A limited read-only preview of public services and specialty information connected to this doctor.',
    practiceLocationsTitle: 'Practice locations preview',
    practiceLocationsDescription: 'Only connected center names and general area, city, and country information are shown in this phase.',
    trustTitle: 'Profile verification',
    trustVerified: 'This public profile is marked as verified in DrMuscat records. This is not a license or MOH approval claim.',
    trustPlaceholder: 'License and verification details will be added after the provider verification foundation is complete.',
    futureTitle: 'Future doctor profile sections',
    futureDescription: 'These areas are reserved for later approved phases and are not active yet.',
    futureSlots: [
      'Contact',
      'WhatsApp',
      'Directions',
      'Booking',
      'Reviews',
      'Ratings',
      'Media/gallery',
      'Video',
      'Premium profile',
      'Online consultation'
    ],
    disclaimerTitle: 'Medical safety note',
    disclaimerBody:
      'This public profile is for healthcare discovery only. It is not medical advice, diagnosis, emergency guidance, a provider endorsement, or a guarantee of availability.',
    genderLabel: 'Gender',
    specialtyLabel: 'Primary specialty',
    yearsExperienceLabel: 'Years of experience',
    noBio: 'No public biography is available yet.',
    noServices: 'No public services are connected to this doctor profile yet.',
    noPracticeLocations: 'No public practice locations are connected to this doctor profile yet.',
    noLocation: 'General location details are not available yet.',
    centerProfileLabel: 'View center profile'
  },
  ar: {
    aboutTitle: 'عن هذا الطبيب',
    detailsTitle: 'التفاصيل المهنية',
    servicesTitle: 'لمحة عن الخدمات والتخصصات',
    servicesDescription: 'عرض محدود للقراءة فقط للخدمات ومعلومات التخصص العامة المرتبطة بهذا الطبيب.',
    practiceLocationsTitle: 'لمحة عن مواقع الممارسة',
    practiceLocationsDescription: 'تظهر في هذه المرحلة أسماء المراكز المرتبطة ومعلومات عامة فقط عن المنطقة والمدينة والدولة.',
    trustTitle: 'توثيق الملف',
    trustVerified: 'هذا الملف العام محدد كملف موثق في سجلات DrMuscat. هذا ليس ادعاءً بترخيص أو اعتماد من وزارة الصحة.',
    trustPlaceholder: 'ستضاف تفاصيل الترخيص والتوثيق بعد اكتمال أساس توثيق مقدمي الخدمة.',
    futureTitle: 'أقسام ملف الطبيب المستقبلية',
    futureDescription: 'هذه المساحات محجوزة لمراحل لاحقة معتمدة وليست مفعلة حالياً.',
    futureSlots: [
      'التواصل',
      'واتساب',
      'الاتجاهات',
      'الحجز',
      'المراجعات',
      'التقييمات',
      'المعرض',
      'الفيديو',
      'الملف المميز',
      'الاستشارة عن بعد'
    ],
    disclaimerTitle: 'ملاحظة السلامة الطبية',
    disclaimerBody:
      'هذا الملف العام مخصص لاكتشاف خدمات الرعاية الصحية فقط. ولا يعد نصيحة طبية أو تشخيصاً أو إرشاداً للطوارئ أو تزكية لمقدم الخدمة أو ضماناً للتوفر.',
    genderLabel: 'الجنس',
    specialtyLabel: 'التخصص الأساسي',
    yearsExperienceLabel: 'سنوات الخبرة',
    noBio: 'لا توجد سيرة عامة متاحة حتى الآن.',
    noServices: 'لا توجد خدمات عامة مرتبطة بملف هذا الطبيب حتى الآن.',
    noPracticeLocations: 'لا توجد مواقع ممارسة عامة مرتبطة بملف هذا الطبيب حتى الآن.',
    noLocation: 'تفاصيل الموقع العامة غير متاحة بعد.',
    centerProfileLabel: 'عرض ملف المركز'
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

function buildLocationText(locale: PublicCatalogLocale, location: PublicDoctorDetail['practiceLocations'][number]['location']): string | null {
  if (!location) return null;

  const area = preferredText(locale, location.areaNameEn, location.areaNameAr);
  const city = preferredText(locale, location.cityNameEn, location.cityNameAr);
  const country = preferredText(locale, location.countryNameEn, location.countryNameAr);

  return [area, city, country].filter(Boolean).join(' · ') || null;
}

export function PublicDoctorDetail({ locale, doctor }: PublicDoctorDetailProps) {
  const copy = copyByLocale[locale];
  const displayName = preferredText(locale, doctor.displayNameEn, doctor.displayNameAr) ?? preferredText(locale, doctor.fullNameEn, doctor.fullNameAr) ?? doctor.fullNameEn;
  const bio = preferredText(locale, doctor.bioEn, doctor.bioAr);
  const primarySpecialtyName = doctor.primarySpecialty
    ? preferredText(locale, doctor.primarySpecialty.nameEn, doctor.primarySpecialty.nameAr) ?? doctor.primarySpecialty.nameEn
    : null;
  const gender = doctor.gender !== 'unspecified' ? formatNeutralLabel(doctor.gender) : null;

  return (
    <div className="mt-10 space-y-5">
      <PublicCenterDetailSection title={copy.aboutTitle}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {doctor.profileImageUrl ? (
            <img
              src={doctor.profileImageUrl}
              alt={displayName}
              className="h-24 w-24 rounded-2xl border border-slate-200 object-cover shadow-sm"
            />
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
          {gender ? (
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
              <dt className="text-xs font-medium text-slate-500">{copy.genderLabel}</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-950">{gender}</dd>
            </div>
          ) : null}
          {doctor.yearsExperience !== null ? (
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
              <dt className="text-xs font-medium text-slate-500">{copy.yearsExperienceLabel}</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-950">{doctor.yearsExperience}</dd>
            </div>
          ) : null}
          {primarySpecialtyName ? (
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
              <dt className="text-xs font-medium text-slate-500">{copy.specialtyLabel}</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-950">{primarySpecialtyName}</dd>
            </div>
          ) : null}
        </dl>
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
              const locationText = buildLocationText(locale, practiceLocation.location);
              const specialtyName = practiceLocation.primarySpecialty
                ? preferredText(locale, practiceLocation.primarySpecialty.nameEn, practiceLocation.primarySpecialty.nameAr) ?? practiceLocation.primarySpecialty.nameEn
                : null;

              return (
                <li key={practiceLocation.id} className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-semibold leading-6 text-slate-950">{centerName}</h3>
                  <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                    <p>{locationText ?? copy.noLocation}</p>
                    {specialtyName ? <p>{specialtyName}</p> : null}
                  </div>
                  <a
                    href={publicCenterDetailRoute(locale, doctor.defaultCountry, practiceLocation.center.slug)}
                    className="mt-4 inline-flex text-xs font-semibold text-emerald-800 underline-offset-4 hover:underline"
                  >
                    {copy.centerProfileLabel}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-slate-600">{copy.noPracticeLocations}</p>
        )}
      </PublicCenterDetailSection>

      <PublicCenterDetailSection title={copy.trustTitle}>
        <p className="text-sm leading-6 text-slate-700">
          {doctor.verificationStatus === 'verified' ? copy.trustVerified : copy.trustPlaceholder}
        </p>
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
