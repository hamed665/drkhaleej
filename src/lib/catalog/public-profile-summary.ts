import { formatPublicLocationGeoLine } from './public-location';
import type {
  CenterType,
  DoctorTitle,
  PublicCatalogLocale,
  PublicCenterDetail,
  PublicDoctorDetail,
} from './public-types';

function preferredText(locale: PublicCatalogLocale, en: string | null, ar: string | null): string | null {
  return locale === 'ar' ? ar ?? en : en ?? ar;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function formatNeutralLabel(value: string): string {
  return value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
}

const centerTypeLabelByValue: Record<string, Record<PublicCatalogLocale, string>> = {
  clinic: { en: 'clinic', ar: 'عيادة' },
  hospital: { en: 'hospital', ar: 'مستشفى' },
  pharmacy: { en: 'pharmacy', ar: 'صيدلية' },
  laboratory: { en: 'medical laboratory', ar: 'مختبر طبي' },
  medical_center: { en: 'medical center', ar: 'مركز طبي' },
  dental_clinic: { en: 'dental clinic', ar: 'عيادة أسنان' },
  beauty_center: { en: 'aesthetic center', ar: 'مركز تجميل' },
};

const doctorTitleLabelByValue: Record<string, Record<PublicCatalogLocale, string>> = {
  dr: { en: 'doctor', ar: 'طبيب' },
  doctor: { en: 'doctor', ar: 'طبيب' },
  dentist: { en: 'dentist', ar: 'طبيب أسنان' },
  consultant: { en: 'consultant doctor', ar: 'طبيب استشاري' },
  specialist: { en: 'specialist doctor', ar: 'طبيب اختصاصي' },
  general_practitioner: { en: 'general practitioner', ar: 'طبيب عام' },
};

function labelForCenterType(locale: PublicCatalogLocale, centerType: CenterType): string {
  return centerTypeLabelByValue[centerType]?.[locale] ?? formatNeutralLabel(centerType).toLowerCase();
}

function labelForDoctorTitle(locale: PublicCatalogLocale, title: DoctorTitle): string {
  return doctorTitleLabelByValue[title]?.[locale] ?? formatNeutralLabel(title).toLowerCase();
}

function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? normalizeText(value) : ''))
        .filter((value) => value.length > 0),
    ),
  );
}

function listPreview(locale: PublicCatalogLocale, values: string[], max = 2): string | null {
  const names = values.slice(0, max);
  if (names.length === 0) return null;
  if (names.length === 1) return names[0] ?? null;
  const lastName = names[names.length - 1];
  if (!lastName) return null;
  if (locale === 'ar') return names.join(' و ');
  return `${names.slice(0, -1).join(', ')} and ${lastName}`;
}

export function buildPublicProfileMetaDescription(summary: string): string {
  const normalizedSummary = normalizeText(summary);
  if (normalizedSummary.length <= 155) return normalizedSummary;
  return `${normalizedSummary.slice(0, 152).trim()}...`;
}

export function buildPublicCenterProfileSummary(
  locale: PublicCatalogLocale,
  center: PublicCenterDetail,
): string {
  const name = preferredText(locale, center.nameEn, center.nameAr) ?? center.nameEn;
  const centerTypeLabel = labelForCenterType(locale, center.centerType);
  const locationText = formatPublicLocationGeoLine(locale, center.location) ?? (locale === 'ar' ? 'عُمان' : 'Oman');
  const serviceList = listPreview(
    locale,
    uniqueNonEmpty(center.services.map((service) => preferredText(locale, service.nameEn, service.nameAr))),
  );
  const doctorList = listPreview(
    locale,
    uniqueNonEmpty(center.doctors.map((doctor) => preferredText(locale, doctor.fullNameEn, doctor.fullNameAr))),
  );

  const sentences =
    locale === 'ar'
      ? [
          `${name} مدرج كملف عام لـ ${centerTypeLabel} في ${locationText}.`,
          serviceList ? `تشمل الخدمات العامة المرتبطة ${serviceList} عند توفرها في بيانات DrKhaleej المعتمدة.` : null,
          doctorList ? `تشمل ملفات الأطباء المرتبطة ${doctorList} عند توفرها.` : null,
          'تستخدم هذه الصفحة بيانات دليل عامة معتمدة للاكتشاف، وينبغي تأكيد التفاصيل الحالية مباشرة مع مقدم الخدمة قبل الزيارة.',
        ]
      : [
          `${name} is listed as a public ${centerTypeLabel} profile in ${locationText}.`,
          serviceList ? `Connected public services include ${serviceList} when available in approved DrKhaleej directory data.` : null,
          doctorList ? `Related public doctor profiles include ${doctorList} when available.` : null,
          'This page uses approved public directory data for discovery, and current details should be confirmed directly with the provider before visiting.',
        ];

  return sentences.filter((sentence): sentence is string => Boolean(sentence)).join(' ');
}

export function buildPublicDoctorProfileSummary(
  locale: PublicCatalogLocale,
  doctor: PublicDoctorDetail,
): string {
  const name =
    preferredText(locale, doctor.displayNameEn, doctor.displayNameAr) ??
    preferredText(locale, doctor.fullNameEn, doctor.fullNameAr) ??
    doctor.fullNameEn;
  const titleLabel = labelForDoctorTitle(locale, doctor.titleEn);
  const specialtyName = doctor.primarySpecialty
    ? preferredText(locale, doctor.primarySpecialty.nameEn, doctor.primarySpecialty.nameAr)
    : null;
  const serviceList = listPreview(
    locale,
    uniqueNonEmpty(doctor.services.map((service) => preferredText(locale, service.nameEn, service.nameAr))),
  );
  const practiceCenterList = listPreview(
    locale,
    uniqueNonEmpty(
      doctor.practiceLocations.map((practiceLocation) =>
        preferredText(locale, practiceLocation.center.nameEn, practiceLocation.center.nameAr),
      ),
    ),
  );

  const sentences =
    locale === 'ar'
      ? [
          `${name} مدرج كملف طبيب عام في عُمان بصفة ${titleLabel}.`,
          specialtyName ? `يرتبط هذا الملف بتخصص ${specialtyName} عند توفره في بيانات DrKhaleej المعتمدة.` : null,
          serviceList ? `تشمل الخدمات العامة المرتبطة ${serviceList} عند توفرها.` : null,
          practiceCenterList ? `تشمل مواقع الممارسة المرتبطة ${practiceCenterList} عند توفرها.` : null,
          'تستخدم هذه الصفحة بيانات دليل عامة معتمدة للاكتشاف، وينبغي تأكيد التفاصيل الحالية مباشرة مع مقدم الخدمة قبل اتخاذ أي قرار.',
        ]
      : [
          `${name} is listed as a public doctor profile in Oman with the public title ${titleLabel}.`,
          specialtyName ? `This profile is connected to ${specialtyName} when available in approved DrKhaleej directory data.` : null,
          serviceList ? `Connected public services include ${serviceList} when available.` : null,
          practiceCenterList ? `Connected practice locations include ${practiceCenterList} when available.` : null,
          'This page uses approved public directory data for discovery, and current details should be confirmed directly with the provider before making any decision.',
        ];

  return sentences.filter((sentence): sentence is string => Boolean(sentence)).join(' ');
}
