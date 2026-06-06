'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const firstValue = <T,>(values: readonly T[]): T => {
  const [first] = values;

  if (first === undefined) {
    throw new Error('HomeSearch2026 requires at least one option.');
  }

  return first;
};

type LocalizedText = {
  en: string;
  ar: string;
};

type SmartSuggestion = {
  id: string;
  labelEn: string;
  labelAr: string;
  group: 'services' | 'providers' | 'areas' | 'offers' | 'guides';
  type: string;
  helperEn: string;
  helperAr: string;
  keywordsEn: readonly string[];
  keywordsAr: readonly string[];
  suggestedContentType?: LocalizedText;
  suggestedProviderType?: LocalizedText;
  suggestedCity?: LocalizedText;
  suggestedArea?: LocalizedText;
};

type SearchSuggestionView = {
  id: string;
  label: string;
  group: string;
  type: string;
  helper: string;
  suggestion: SmartSuggestion;
};

type SearchSuggestion = {
  label: string;
  group: string;
  helper: string;
};

type SearchCopy = {
  eyebrow: string;
  title: string;
  description: string;
  careNeedLabel: string;
  careNeedPlaceholder: string;
  providerTypeLabel: string;
  specialtyLabel: string;
  countryLabel: string;
  cityLabel: string;
  areaLabel: string;
  contentTypeLabel: string;
  searchLabel: string;
  providerLabel: string;
  staticPreviewLabel: string;
  staticPreviewNote: string;
  moreLabel: string;
  suggestionPreviewCta: string;
  cityWideAreaLabel: string;
  providerTypes: readonly string[];
  countries: readonly { label: string; disabled?: boolean }[];
  cities: readonly string[];
  areas: readonly string[];
  cityAreas: Readonly<Record<string, readonly string[]>>;
  contentTypes: readonly string[];
  specialties: readonly string[];
  suggestions: readonly SearchSuggestion[];
};

type HomeSearch2026Props = {
  copy: SearchCopy;
  dir: 'ltr' | 'rtl';
  searchHref: string;
  providerHref: string;
};

const groupLabels: Record<SmartSuggestion['group'], LocalizedText> = {
  services: { en: 'Services', ar: 'الخدمات' },
  providers: { en: 'Provider types', ar: 'أنواع المقدمين' },
  areas: { en: 'Areas', ar: 'المناطق' },
  offers: { en: 'Offers', ar: 'العروض' },
  guides: { en: 'Guides', ar: 'الأدلة' }
};

const smartSuggestions: readonly SmartSuggestion[] = [
  { id: 'dentist', labelEn: 'Dentist', labelAr: 'طبيب أسنان', group: 'services', type: 'Service', helperEn: 'Explore dental care options', helperAr: 'استكشف خيارات رعاية الأسنان', keywordsEn: ['dentist', 'dental', 'teeth', 'tooth'], keywordsAr: ['طبيب اسنان', 'طبيب أسنان', 'اسنان', 'أسنان'], suggestedContentType: { en: 'Doctors', ar: 'الأطباء' }, suggestedProviderType: { en: 'Doctors', ar: 'الأطباء' } },
  { id: 'dermatology', labelEn: 'Dermatology', labelAr: 'جلدية', group: 'services', type: 'Service', helperEn: 'Browse skin clinic discovery paths', helperAr: 'استكشف مسارات عيادات الجلدية', keywordsEn: ['dermatology', 'skin', 'doctor'], keywordsAr: ['جلديه', 'جلدية', 'جلد'], suggestedContentType: { en: 'Services', ar: 'الخدمات' }, suggestedProviderType: { en: 'Doctors', ar: 'الأطباء' } },
  { id: 'pediatrics', labelEn: 'Pediatrics', labelAr: 'طب الأطفال', group: 'services', type: 'Service', helperEn: 'Explore child healthcare discovery paths', helperAr: 'استكشف مسارات رعاية الأطفال', keywordsEn: ['pediatrics', 'kids', 'children', 'doctor'], keywordsAr: ['طب الاطفال', 'طب الأطفال', 'اطفال', 'أطفال', 'ط'], suggestedContentType: { en: 'Doctors', ar: 'الأطباء' }, suggestedProviderType: { en: 'Doctors', ar: 'الأطباء' } },
  { id: 'gynecology', labelEn: 'Gynecology', labelAr: 'نساء وولادة', group: 'services', type: 'Service', helperEn: 'Explore women’s health discovery paths', helperAr: 'استكشف مسارات النساء والولادة', keywordsEn: ['gynecology', 'women', 'obgyn'], keywordsAr: ['نساء', 'ولادة', 'نسائيه'] },
  { id: 'ent', labelEn: 'ENT', labelAr: 'أنف وأذن وحنجرة', group: 'services', type: 'Service', helperEn: 'Explore ear, nose and throat discovery paths', helperAr: 'استكشف مسارات الأنف والأذن والحنجرة', keywordsEn: ['ent', 'ear', 'nose', 'throat'], keywordsAr: ['انف', 'أنف', 'اذن', 'أذن', 'حنجرة'] },
  { id: 'orthopedics', labelEn: 'Orthopedics', labelAr: 'عظام', group: 'services', type: 'Service', helperEn: 'Explore bone and joint discovery paths', helperAr: 'استكشف مسارات العظام والمفاصل', keywordsEn: ['orthopedics', 'bones', 'joints'], keywordsAr: ['عظام', 'مفاصل'] },
  { id: 'ophthalmology', labelEn: 'Ophthalmology', labelAr: 'عيون', group: 'services', type: 'Service', helperEn: 'Explore eye care discovery paths', helperAr: 'استكشف مسارات رعاية العيون', keywordsEn: ['ophthalmology', 'eyes', 'eye'], keywordsAr: ['عيون', 'عين'] },
  { id: 'general-practice', labelEn: 'General Practice', labelAr: 'طب عام', group: 'services', type: 'Service', helperEn: 'Explore general medical discovery paths', helperAr: 'استكشف مسارات الطب العام', keywordsEn: ['general practice', 'gp', 'doctor'], keywordsAr: ['طب عام', 'طبيب عام', 'ط'] },
  { id: 'cardiology', labelEn: 'Cardiology', labelAr: 'قلب', group: 'services', type: 'Service', helperEn: 'Explore heart care discovery paths', helperAr: 'استكشف مسارات رعاية القلب', keywordsEn: ['cardiology', 'heart'], keywordsAr: ['قلب'] },
  { id: 'physiotherapy', labelEn: 'Physiotherapy', labelAr: 'علاج طبيعي', group: 'services', type: 'Service', helperEn: 'Explore rehabilitation discovery paths', helperAr: 'استكشف مسارات العلاج الطبيعي', keywordsEn: ['physiotherapy', 'rehab', 'therapy'], keywordsAr: ['علاج طبيعي', 'تأهيل', 'تاهيل'] },
  { id: 'lab-tests', labelEn: 'Lab tests', labelAr: 'فحوصات مختبر', group: 'services', type: 'Service', helperEn: 'Find laboratory-related discovery paths', helperAr: 'مسارات اكتشاف مرتبطة بالمختبرات', keywordsEn: ['lab', 'labs', 'laboratory', 'blood tests', 'tests', 'l', 'b'], keywordsAr: ['مختبر', 'المختبرات', 'فحوصات', 'مخ', 'مخت'], suggestedContentType: { en: 'Labs', ar: 'المختبرات' }, suggestedProviderType: { en: 'Labs', ar: 'المختبرات' } },
  { id: 'dental-cleaning', labelEn: 'Dental cleaning', labelAr: 'تنظيف الأسنان', group: 'services', type: 'Service', helperEn: 'Explore dental cleaning discovery paths', helperAr: 'استكشف خيارات تنظيف الأسنان', keywordsEn: ['dental cleaning', 'dentist', 'teeth cleaning', 'd'], keywordsAr: ['تنظيف الاسنان', 'تنظيف الأسنان', 'اسنان', 'أسنان'] },
  { id: 'skin-clinic', labelEn: 'Skin clinic', labelAr: 'عيادة جلدية', group: 'services', type: 'Service', helperEn: 'Explore skin clinic discovery paths', helperAr: 'استكشف مسارات عيادات الجلدية', keywordsEn: ['skin clinic', 'dermatology', 'skin'], keywordsAr: ['عيادة جلدية', 'عياده جلديه', 'جلدية', 'جلديه'] },
  { id: 'laser-hair-removal', labelEn: 'Laser hair removal', labelAr: 'إزالة الشعر بالليزر', group: 'services', type: 'Service', helperEn: 'Explore beauty and wellness service paths', helperAr: 'استكشف مسارات الجمال والرفاهية', keywordsEn: ['laser', 'hair removal', 'l', 'beauty'], keywordsAr: ['ليزر', 'ازالة الشعر', 'إزالة الشعر', 'جمال'] },
  { id: 'pharmacy', labelEn: 'Pharmacy', labelAr: 'صيدلية', group: 'services', type: 'Service', helperEn: 'Explore pharmacy discovery paths', helperAr: 'استكشف مسارات الصيدليات', keywordsEn: ['pharmacy', 'pharmacies'], keywordsAr: ['صيدلية', 'صيدليات'], suggestedContentType: { en: 'Pharmacies', ar: 'الصيدليات' }, suggestedProviderType: { en: 'Pharmacies', ar: 'الصيدليات' } },
  { id: 'pet-clinic', labelEn: 'Pet clinic', labelAr: 'عيادة بيطرية', group: 'services', type: 'Service', helperEn: 'Explore pet care discovery paths', helperAr: 'استكشف مسارات رعاية الحيوانات', keywordsEn: ['pet', 'vet', 'veterinary', 'pet clinic'], keywordsAr: ['عيادة بيطرية', 'عياده بيطريه', 'بيطري', 'حيوانات'], suggestedProviderType: { en: 'Pet Clinics', ar: 'العيادات البيطرية' } },
  { id: 'nutrition', labelEn: 'Nutrition', labelAr: 'تغذية', group: 'services', type: 'Service', helperEn: 'Explore nutrition discovery paths', helperAr: 'استكشف مسارات التغذية', keywordsEn: ['nutrition', 'diet'], keywordsAr: ['تغذية', 'حمية'] },
  { id: 'mental-health', labelEn: 'Mental health', labelAr: 'صحة نفسية', group: 'services', type: 'Service', helperEn: 'Explore mental health discovery paths', helperAr: 'استكشف مسارات الصحة النفسية', keywordsEn: ['mental health', 'therapy', 'psychology'], keywordsAr: ['صحة نفسية', 'صحه نفسيه', 'نفسي'] },
  { id: 'beauty-clinic', labelEn: 'Beauty clinic', labelAr: 'عيادة تجميل', group: 'services', type: 'Service', helperEn: 'Explore beauty clinic discovery paths', helperAr: 'استكشف مسارات عيادات التجميل', keywordsEn: ['beauty', 'beauty clinic', 'b', 'skin'], keywordsAr: ['عيادة تجميل', 'عياده تجميل', 'جمال', 'تجميل', 'ج'], suggestedProviderType: { en: 'Beauty & Wellness', ar: 'الجمال والرفاهية' } },
  { id: 'wellness-center', labelEn: 'Wellness center', labelAr: 'مركز رفاهية', group: 'services', type: 'Service', helperEn: 'Explore wellness discovery paths', helperAr: 'استكشف مسارات الرفاهية', keywordsEn: ['wellness', 'wellness center'], keywordsAr: ['رفاهية', 'رفاهيه', 'مركز رفاهية'] },
  { id: 'doctors', labelEn: 'Doctors', labelAr: 'الأطباء', group: 'providers', type: 'Provider type', helperEn: 'Explore doctor discovery pages', helperAr: 'استكشف صفحات اكتشاف الأطباء', keywordsEn: ['doctors', 'doctor', 'd'], keywordsAr: ['اطباء', 'أطباء', 'الأطباء', 'الاطباء'], suggestedContentType: { en: 'Doctors', ar: 'الأطباء' }, suggestedProviderType: { en: 'Doctors', ar: 'الأطباء' } },
  { id: 'clinics', labelEn: 'Clinics', labelAr: 'العيادات', group: 'providers', type: 'Provider type', helperEn: 'Explore clinic and center discovery paths', helperAr: 'استكشف مسارات العيادات والمراكز', keywordsEn: ['clinics', 'clinic', 'centers'], keywordsAr: ['عيادات', 'العيادات', 'مراكز'], suggestedContentType: { en: 'Clinics', ar: 'العيادات' }, suggestedProviderType: { en: 'Clinics / Centers', ar: 'العيادات / المراكز' } },
  { id: 'hospitals', labelEn: 'Hospitals', labelAr: 'المستشفيات', group: 'providers', type: 'Provider type', helperEn: 'Explore hospital discovery paths', helperAr: 'استكشف مسارات المستشفيات', keywordsEn: ['hospitals', 'hospital'], keywordsAr: ['مستشفيات', 'المستشفيات'] },
  { id: 'labs', labelEn: 'Labs', labelAr: 'المختبرات', group: 'providers', type: 'Provider type', helperEn: 'Explore laboratory provider paths', helperAr: 'استكشف مسارات مقدّمي المختبرات', keywordsEn: ['labs', 'lab', 'laboratory', 'l'], keywordsAr: ['مختبرات', 'المختبرات', 'مختبر', 'مخ', 'مخت'], suggestedContentType: { en: 'Labs', ar: 'المختبرات' }, suggestedProviderType: { en: 'Labs', ar: 'المختبرات' } },
  { id: 'pharmacies', labelEn: 'Pharmacies', labelAr: 'الصيدليات', group: 'providers', type: 'Provider type', helperEn: 'Explore pharmacy provider paths', helperAr: 'استكشف مسارات الصيدليات', keywordsEn: ['pharmacies', 'pharmacy'], keywordsAr: ['صيدليات', 'الصيدليات'] },
  { id: 'beauty-wellness', labelEn: 'Beauty & Wellness', labelAr: 'الجمال والرفاهية', group: 'providers', type: 'Provider type', helperEn: 'Explore beauty and wellness providers', helperAr: 'استكشف مقدّمي الجمال والرفاهية', keywordsEn: ['beauty', 'wellness', 'b'], keywordsAr: ['الجمال', 'رفاهية', 'رفاهيه', 'جمال', 'ج'], suggestedProviderType: { en: 'Beauty & Wellness', ar: 'الجمال والرفاهية' } },
  { id: 'pet-clinics-provider', labelEn: 'Pet Clinics', labelAr: 'العيادات البيطرية', group: 'providers', type: 'Provider type', helperEn: 'Explore pet clinic providers', helperAr: 'استكشف مقدّمي العيادات البيطرية', keywordsEn: ['pet clinics', 'pet', 'vet'], keywordsAr: ['عيادات بيطرية', 'العيادات البيطرية', 'بيطري'] },
  { id: 'services-provider', labelEn: 'Services', labelAr: 'الخدمات', group: 'providers', type: 'Provider type', helperEn: 'Explore care service paths', helperAr: 'استكشف مسارات الخدمات', keywordsEn: ['services', 'service'], keywordsAr: ['خدمات', 'الخدمات'] },
  { id: 'al-khuwair', labelEn: 'Al Khuwair', labelAr: 'الخوير', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Al Khuwair', helperAr: 'استكشف خيارات الاكتشاف حول الخوير', keywordsEn: ['al khuwair', 'khuwair'], keywordsAr: ['الخوير'], suggestedCity: { en: 'Muscat', ar: 'مسقط' }, suggestedArea: { en: 'Al Khuwair', ar: 'الخوير' } },
  { id: 'qurum', labelEn: 'Qurum', labelAr: 'القرم', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Qurum', helperAr: 'استكشف خيارات الاكتشاف حول القرم', keywordsEn: ['qurum', 'q', 'clinics in qurum', 'pharmacy near qurum'], keywordsAr: ['القرم'], suggestedCity: { en: 'Muscat', ar: 'مسقط' }, suggestedArea: { en: 'Qurum', ar: 'القرم' } },
  { id: 'azaiba', labelEn: 'Azaiba', labelAr: 'العذيبة', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Azaiba', helperAr: 'استكشف خيارات الاكتشاف حول العذيبة', keywordsEn: ['azaiba'], keywordsAr: ['العذيبة', 'العذيبه'], suggestedCity: { en: 'Muscat', ar: 'مسقط' }, suggestedArea: { en: 'Azaiba', ar: 'العذيبة' } },
  { id: 'al-ghubra', labelEn: 'Al Ghubra', labelAr: 'الغبرة', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Al Ghubra', helperAr: 'استكشف خيارات الاكتشاف حول الغبرة', keywordsEn: ['ghubra', 'al ghubra'], keywordsAr: ['الغبرة', 'الغبره'], suggestedCity: { en: 'Muscat', ar: 'مسقط' }, suggestedArea: { en: 'Al Ghubra', ar: 'الغبرة' } },
  { id: 'ruwi', labelEn: 'Ruwi', labelAr: 'روي', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Ruwi', helperAr: 'استكشف خيارات الاكتشاف حول روي', keywordsEn: ['ruwi'], keywordsAr: ['روي'], suggestedCity: { en: 'Muscat', ar: 'مسقط' }, suggestedArea: { en: 'Ruwi', ar: 'روي' } },
  { id: 'muttrah', labelEn: 'Muttrah', labelAr: 'مطرح', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Muttrah', helperAr: 'استكشف خيارات الاكتشاف حول مطرح', keywordsEn: ['muttrah'], keywordsAr: ['مطرح'], suggestedCity: { en: 'Muttrah', ar: 'مطرح' } },
  { id: 'seeb-area', labelEn: 'Seeb', labelAr: 'السيب', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Seeb', helperAr: 'استكشف خيارات الاكتشاف حول السيب', keywordsEn: ['seeb'], keywordsAr: ['السيب'], suggestedCity: { en: 'Seeb', ar: 'السيب' } },
  { id: 'bawshar', labelEn: 'Bawshar', labelAr: 'بوشر', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Bawshar', helperAr: 'استكشف خيارات الاكتشاف حول بوشر', keywordsEn: ['bawshar', 'b', 'boshar'], keywordsAr: ['بوشر'], suggestedCity: { en: 'Bawshar', ar: 'بوشر' }, suggestedArea: { en: 'Bawshar', ar: 'بوشر' } },
  { id: 'madinat-sultan-qaboos', labelEn: 'Madinat Sultan Qaboos', labelAr: 'مدينة السلطان قابوس', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Madinat Sultan Qaboos', helperAr: 'استكشف خيارات الاكتشاف حول مدينة السلطان قابوس', keywordsEn: ['madinat sultan qaboos', 'msq'], keywordsAr: ['مدينة السلطان قابوس'] },
  { id: 'ghala', labelEn: 'Ghala', labelAr: 'غلا', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Ghala', helperAr: 'استكشف خيارات الاكتشاف حول غلا', keywordsEn: ['ghala'], keywordsAr: ['غلا'] },
  { id: 'al-hail', labelEn: 'Al Hail', labelAr: 'الحيل', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Al Hail', helperAr: 'استكشف خيارات الاكتشاف حول الحيل', keywordsEn: ['al hail', 'hail', 'l'], keywordsAr: ['الحيل'], suggestedCity: { en: 'Seeb', ar: 'السيب' }, suggestedArea: { en: 'Al Hail', ar: 'الحيل' } },
  { id: 'al-mouj', labelEn: 'Al Mouj', labelAr: 'الموج', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Al Mouj', helperAr: 'استكشف خيارات الاكتشاف حول الموج', keywordsEn: ['al mouj', 'mouj'], keywordsAr: ['الموج'] },
  { id: 'muscat-hills', labelEn: 'Muscat Hills', labelAr: 'مسقط هيلز', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Muscat Hills', helperAr: 'استكشف خيارات الاكتشاف حول مسقط هيلز', keywordsEn: ['muscat hills'], keywordsAr: ['مسقط هيلز'] },
  { id: 'wadi-kabir', labelEn: 'Wadi Kabir', labelAr: 'وادي الكبير', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Wadi Kabir', helperAr: 'استكشف خيارات الاكتشاف حول وادي الكبير', keywordsEn: ['wadi kabir'], keywordsAr: ['وادي الكبير'] },
  { id: 'darsait', labelEn: 'Darsait', labelAr: 'دارسيت', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Darsait', helperAr: 'استكشف خيارات الاكتشاف حول دارسيت', keywordsEn: ['darsait'], keywordsAr: ['دارسيت'] },
  { id: 'al-amerat', labelEn: 'Al Amerat', labelAr: 'العامرات', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Al Amerat', helperAr: 'استكشف خيارات الاكتشاف حول العامرات', keywordsEn: ['al amerat', 'amerat'], keywordsAr: ['العامرات'] },
  { id: 'mabela', labelEn: 'Mabela', labelAr: 'المعبيلة', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Mabela', helperAr: 'استكشف خيارات الاكتشاف حول المعبيلة', keywordsEn: ['mabela'], keywordsAr: ['المعبيلة', 'المعبيله'] },
  { id: 'sohar-center', labelEn: 'Sohar Center', labelAr: 'مركز صحار', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Sohar Center', helperAr: 'استكشف خيارات الاكتشاف حول مركز صحار', keywordsEn: ['sohar center', 'sohar'], keywordsAr: ['مركز صحار', 'صحار'], suggestedCity: { en: 'Sohar', ar: 'صحار' }, suggestedArea: { en: 'Sohar Center', ar: 'مركز صحار' } },
  { id: 'al-haffa', labelEn: 'Al Haffa', labelAr: 'الحافة', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Al Haffa', helperAr: 'استكشف خيارات الاكتشاف حول الحافة', keywordsEn: ['al haffa', 'haffa', 'salalah'], keywordsAr: ['الحافة', 'الحافه'], suggestedCity: { en: 'Salalah', ar: 'صلالة' }, suggestedArea: { en: 'Al Haffa', ar: 'الحافة' } },
  { id: 'salalah-gardens', labelEn: 'Salalah Gardens', labelAr: 'صلالة جاردنز', group: 'areas', type: 'Area', helperEn: 'Explore public discovery around Salalah Gardens', helperAr: 'استكشف خيارات الاكتشاف حول صلالة جاردنز', keywordsEn: ['salalah gardens', 'salalah'], keywordsAr: ['صلالة جاردنز', 'صلاله جاردنز'], suggestedCity: { en: 'Salalah', ar: 'صلالة' }, suggestedArea: { en: 'Salalah Gardens', ar: 'صلالة جاردنز' } },
  { id: 'dental-offers', labelEn: 'Dental offers', labelAr: 'عروض الأسنان', group: 'offers', type: 'Offer', helperEn: 'Provider-approved offers can appear after review', helperAr: 'تظهر العروض المعتمدة بعد المراجعة', keywordsEn: ['dental offers', 'offers', 'd'], keywordsAr: ['عروض الاسنان', 'عروض الأسنان', 'اسنان'] },
  { id: 'lab-packages', labelEn: 'Lab packages', labelAr: 'باقات المختبر', group: 'offers', type: 'Offer', helperEn: 'Reviewed lab packages can appear after approval', helperAr: 'تظهر باقات المختبر بعد المراجعة', keywordsEn: ['lab packages', 'lab', 'l', 'blood tests'], keywordsAr: ['باقات المختبر', 'مختبر', 'مخ', 'مخت'] },
  { id: 'beauty-offers', labelEn: 'Beauty offers', labelAr: 'عروض التجميل', group: 'offers', type: 'Offer', helperEn: 'Approved beauty offers can appear after review', helperAr: 'تظهر عروض التجميل بعد المراجعة', keywordsEn: ['beauty offers', 'beauty', 'b'], keywordsAr: ['عروض التجميل', 'تجميل', 'جمال', 'ج'] },
  { id: 'pet-clinic-offers', labelEn: 'Pet clinic offers', labelAr: 'عروض العيادات البيطرية', group: 'offers', type: 'Offer', helperEn: 'Approved pet care offers can appear after review', helperAr: 'تظهر عروض رعاية الحيوانات بعد المراجعة', keywordsEn: ['pet clinic offers', 'pet'], keywordsAr: ['عروض العيادات البيطرية', 'بيطري'] },
  { id: 'wellness-packages', labelEn: 'Wellness packages', labelAr: 'باقات الرفاهية', group: 'offers', type: 'Offer', helperEn: 'Approved wellness packages can appear after review', helperAr: 'تظهر باقات الرفاهية بعد المراجعة', keywordsEn: ['wellness packages', 'wellness'], keywordsAr: ['باقات الرفاهية', 'رفاهية'] },
  { id: 'dental-guide', labelEn: 'Dental guide', labelAr: 'دليل الأسنان', group: 'guides', type: 'Guide', helperEn: 'Educational guide preview', helperAr: 'دليل تعليمي مختصر', keywordsEn: ['dental guide', 'dentist', 'd'], keywordsAr: ['دليل الاسنان', 'دليل الأسنان', 'اسنان'] },
  { id: 'lab-tests-guide', labelEn: 'Lab tests guide', labelAr: 'دليل فحوصات المختبر', group: 'guides', type: 'Guide', helperEn: 'Educational guide preview', helperAr: 'دليل تعليمي مختصر', keywordsEn: ['lab tests guide', 'lab', 'l'], keywordsAr: ['دليل فحوصات المختبر', 'مختبر', 'مخ'] },
  { id: 'choosing-clinic', labelEn: 'Choosing a clinic', labelAr: 'اختيار عيادة', group: 'guides', type: 'Guide', helperEn: 'Educational guide preview', helperAr: 'دليل تعليمي مختصر', keywordsEn: ['choosing a clinic', 'clinic'], keywordsAr: ['اختيار عيادة', 'عيادة'] },
  { id: 'pharmacy-guide', labelEn: 'Pharmacy guide', labelAr: 'دليل الصيدليات', group: 'guides', type: 'Guide', helperEn: 'Educational guide preview', helperAr: 'دليل تعليمي مختصر', keywordsEn: ['pharmacy guide', 'pharmacy'], keywordsAr: ['دليل الصيدليات', 'صيدلية'] },
  { id: 'kids-health-guide', labelEn: 'Kids health guide', labelAr: 'دليل صحة الأطفال', group: 'guides', type: 'Guide', helperEn: 'Educational guide preview', helperAr: 'دليل تعليمي مختصر', keywordsEn: ['kids health guide', 'kids', 'children'], keywordsAr: ['دليل صحة الاطفال', 'دليل صحة الأطفال', 'اطفال'] },
  { id: 'pet-care-guide', labelEn: 'Pet care guide', labelAr: 'دليل رعاية الحيوانات', group: 'guides', type: 'Guide', helperEn: 'Educational guide preview', helperAr: 'دليل تعليمي مختصر', keywordsEn: ['pet care guide', 'pet'], keywordsAr: ['دليل رعاية الحيوانات', 'حيوانات', 'بيطري'] }
];

const extraCityAreas = (dir: 'ltr' | 'rtl'): Readonly<Record<string, readonly string[]>> => dir === 'rtl' ? {
  'بوشر': ['بوشر', 'غلا', 'الخوير', 'مدينة السلطان قابوس', 'الغبرة']
} : {
  Bawshar: ['Bawshar', 'Ghala', 'Al Khuwair', 'Madinat Sultan Qaboos', 'Al Ghubra']
};

const normalizeArabic = (value: string) => value
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[إأآٱ]/g, 'ا')
  .replace(/ؤ/g, 'و')
  .replace(/ئ/g, 'ي')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/ـ/g, '');

const normalizeSearch = (value: string) => normalizeArabic(value).trim().toLocaleLowerCase();

const localized = (value: LocalizedText, dir: 'ltr' | 'rtl') => dir === 'rtl' ? value.ar : value.en;

const toView = (suggestion: SmartSuggestion, dir: 'ltr' | 'rtl'): SearchSuggestionView => ({
  id: suggestion.id,
  label: dir === 'rtl' ? suggestion.labelAr : suggestion.labelEn,
  group: localized(groupLabels[suggestion.group], dir),
  type: suggestion.type,
  helper: dir === 'rtl' ? suggestion.helperAr : suggestion.helperEn,
  suggestion
});

const scoreSuggestion = (suggestion: SmartSuggestion, query: string, dir: 'ltr' | 'rtl') => {
  const label = normalizeSearch(dir === 'rtl' ? suggestion.labelAr : suggestion.labelEn);
  const helper = normalizeSearch(dir === 'rtl' ? suggestion.helperAr : suggestion.helperEn);
  const keywords = (dir === 'rtl' ? suggestion.keywordsAr : suggestion.keywordsEn).map(normalizeSearch);

  if (label.startsWith(query)) return 10;
  if (keywords.some((keyword) => keyword.startsWith(query))) return 8;
  if (label.includes(query)) return 6;
  if (keywords.some((keyword) => keyword.includes(query))) return 4;
  if (helper.includes(query)) return 2;

  return 0;
};

const safeSetIfAvailable = (value: string | undefined, values: readonly string[], setter: (nextValue: string) => void) => {
  if (value && values.includes(value)) {
    setter(value);
  }
};

export function HomeSearch2026({ copy, dir, searchHref, providerHref }: HomeSearch2026Props) {
  const defaultProviderType = firstValue(copy.providerTypes);
  const defaultCountry = firstValue(copy.countries).label;
  const defaultCity = firstValue(copy.cities);
  const defaultContentType = firstValue(copy.contentTypes);
  const cityAreas = useMemo(() => ({ ...copy.cityAreas, ...extraCityAreas(dir) }), [copy.cityAreas, dir]);
  const [query, setQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState(defaultContentType);
  const [selectedProviderType, setSelectedProviderType] = useState(defaultProviderType);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const areaOptions = cityAreas[selectedCity] ?? [copy.cityWideAreaLabel];
  const [selectedArea, setSelectedArea] = useState(firstValue(areaOptions));
  const [showMorePopular, setShowMorePopular] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SearchSuggestionView>(() => toView(firstValue(smartSuggestions), dir));
  const [activeSuggestion, setActiveSuggestion] = useState<SearchSuggestionView>(() => toView(firstValue(smartSuggestions), dir));
  const [searchPreviewVisible, setSearchPreviewVisible] = useState(false);

  const matchingSuggestions = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    if (!normalizedQuery) {
      return [];
    }

    return smartSuggestions
      .map((suggestion) => ({ suggestion, score: scoreSuggestion(suggestion, normalizedQuery, dir) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.suggestion.labelEn.localeCompare(b.suggestion.labelEn))
      .slice(0, 10)
      .map(({ suggestion }) => toView(suggestion, dir));
  }, [dir, query]);

  const popularSuggestions = useMemo(() => smartSuggestions
    .filter((suggestion) => ['dentist', 'dermatology', 'pediatrics', 'lab-tests', 'pharmacy', 'pet-clinic', 'beauty-clinic', 'al-khuwair', 'qurum'].includes(suggestion.id))
    .map((suggestion) => toView(suggestion, dir)), [dir]);
  const expandedPopularSuggestions = showMorePopular ? smartSuggestions.slice(0, 18).map((suggestion) => toView(suggestion, dir)) : popularSuggestions;
  const hasTypedQuery = normalizeSearch(query).length > 0;
  const visibleSuggestions = hasTypedQuery ? matchingSuggestions : [];
  const suggestionPanelId = 'dm2026-home-search-smart-panel';

  const resetAreaForCity = (city: string) => {
    const nextAreas = cityAreas[city] ?? [copy.cityWideAreaLabel];
    setSelectedCity(city);
    setSelectedArea(firstValue(nextAreas));
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);

    if (country === defaultCountry) {
      resetAreaForCity(selectedCity);
    }
  };

  const applySuggestion = (view: SearchSuggestionView) => {
    const suggestion = view.suggestion;
    setQuery(view.label);
    setSelectedSuggestion(view);
    setActiveSuggestion(view);
    setSearchPreviewVisible(false);

    safeSetIfAvailable(localized(suggestion.suggestedContentType ?? { en: '', ar: '' }, dir), copy.contentTypes, setSelectedContentType);
    safeSetIfAvailable(localized(suggestion.suggestedProviderType ?? { en: '', ar: '' }, dir), copy.providerTypes, setSelectedProviderType);

    const nextCity = suggestion.suggestedCity ? localized(suggestion.suggestedCity, dir) : undefined;
    if (nextCity && copy.cities.includes(nextCity)) {
      const nextAreas = cityAreas[nextCity] ?? [copy.cityWideAreaLabel];
      setSelectedCity(nextCity);
      const nextArea = suggestion.suggestedArea ? localized(suggestion.suggestedArea, dir) : firstValue(nextAreas);
      setSelectedArea(nextAreas.includes(nextArea) ? nextArea : firstValue(nextAreas));
    } else if (suggestion.suggestedArea) {
      safeSetIfAvailable(localized(suggestion.suggestedArea, dir), areaOptions, setSelectedArea);
    }

    setShowSuggestions(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSuggestions(false);
    setSearchPreviewVisible(true);
  };

  return (
    <section className="dm2026-home-search dm2026-search" dir={dir} aria-labelledby="dm2026-home-search-title">
      <form className="dm2026-search-surface dm2026-home-search__surface" action={searchHref} method="get" onSubmit={handleSubmit}>
        <div className="dm2026-home-search__header">
          <span className="dm2026-badge">{copy.eyebrow}</span>
          <div>
            <h2 id="dm2026-home-search-title">{copy.title}</h2>
            <p>{copy.description}</p>
          </div>
        </div>

        <div className="dm2026-home-search__command">
          <label htmlFor="dm2026-home-care-need">{copy.careNeedLabel}</label>
          <div className="dm2026-home-search__command-input" role="combobox" aria-expanded={showSuggestions && visibleSuggestions.length > 0} aria-controls={suggestionPanelId}>
            <span aria-hidden="true">⌕</span>
            <input
              id="dm2026-home-care-need"
              name="q"
              className="dm2026-input"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowSuggestions(event.target.value.trim().length > 0);
                setSearchPreviewVisible(false);
              }}
              onFocus={() => setShowSuggestions(normalizeSearch(query).length > 0)}
              placeholder={copy.careNeedPlaceholder}
              autoComplete="off"
            />
            <button type="submit" className="dm2026-button dm2026-button-primary">
              {copy.searchLabel}
            </button>
          </div>
        </div>

        {showSuggestions && visibleSuggestions.length > 0 ? (
          <div id={suggestionPanelId} className="dm2026-home-search__smart-panel dm2026-home-search__smart-panel--active" aria-live="polite">
            <div className="dm2026-home-search__smart-list" role="listbox" aria-label={copy.staticPreviewLabel}>
              {visibleSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="dm2026-home-search__smart-item"
                  onClick={() => applySuggestion(suggestion)}
                  onMouseEnter={() => setActiveSuggestion(suggestion)}
                  onFocus={() => setActiveSuggestion(suggestion)}
                  role="option"
                  aria-selected={activeSuggestion.id === suggestion.id}
                >
                  <span aria-hidden="true" />
                  <strong>{suggestion.label}</strong>
                  <small>{suggestion.group} · {suggestion.helper}</small>
                </button>
              ))}
            </div>
            <aside className="dm2026-home-search__preview" aria-label={activeSuggestion.label}>
              <span aria-hidden="true" />
              <small>{activeSuggestion.group}</small>
              <strong>{activeSuggestion.label}</strong>
              <p>{activeSuggestion.helper}</p>
              <button type="button" className="dm2026-home-search__preview-cta" onClick={() => applySuggestion(activeSuggestion)}>
                {copy.suggestionPreviewCta}
              </button>
            </aside>
          </div>
        ) : null}

        <div className="dm2026-home-search__chip-rows">
          <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--primary" aria-label={copy.contentTypeLabel}>
            <legend>{copy.contentTypeLabel}</legend>
            <div>
              {copy.contentTypes.map((contentType) => (
                <label key={contentType} className="dm2026-home-search__chip">
                  <input type="radio" name="contentType" value={contentType} checked={contentType === selectedContentType} onChange={() => setSelectedContentType(contentType)} />
                  <span>{contentType}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--secondary" aria-label={copy.providerTypeLabel}>
            <legend>{copy.providerTypeLabel}</legend>
            <div>
              {copy.providerTypes.map((providerType) => (
                <label key={providerType} className="dm2026-home-search__chip">
                  <input type="radio" name="type" value={providerType} checked={providerType === selectedProviderType} onChange={() => setSelectedProviderType(providerType)} />
                  <span>{providerType}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="dm2026-home-search__select-grid" aria-label={`${copy.countryLabel}, ${copy.cityLabel}, ${copy.areaLabel}`}>
          <div className="dm2026-home-search__field">
            <label htmlFor="dm2026-home-country">{copy.countryLabel}</label>
            <select id="dm2026-home-country" name="country" className="dm2026-select" value={selectedCountry} onChange={(event) => handleCountryChange(event.target.value)}>
              {copy.countries.map((country) => (
                <option key={country.label} value={country.label} disabled={country.disabled}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          <div className="dm2026-home-search__field">
            <label htmlFor="dm2026-home-city">{copy.cityLabel}</label>
            <select id="dm2026-home-city" name="city" className="dm2026-select" value={selectedCity} onChange={(event) => resetAreaForCity(event.target.value)}>
              {copy.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="dm2026-home-search__field">
            <label htmlFor="dm2026-home-area">{copy.areaLabel}</label>
            <select id="dm2026-home-area" name="area" className="dm2026-select" value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!hasTypedQuery ? (
          <div className="dm2026-home-search__suggestions" aria-label={copy.staticPreviewLabel} data-static-preview="true">
            <div>
              <strong>{copy.staticPreviewLabel}</strong>
              <p>{copy.staticPreviewNote}</p>
            </div>
            <ul className="dm2026-home-search__popular-list" data-expanded={showMorePopular ? 'true' : 'false'}>
              {expandedPopularSuggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button type="button" className="dm2026-home-search__suggestion-chip" onClick={() => applySuggestion(suggestion)}>
                    {suggestion.label}
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="dm2026-home-search__more-chip" aria-expanded={showMorePopular} onClick={() => setShowMorePopular((value) => !value)}>
                  {copy.moreLabel}
                </button>
              </li>
            </ul>
          </div>
        ) : null}

        <div className="dm2026-home-search__actions">
          <button type="submit" className="dm2026-button dm2026-button-primary">
            {copy.searchLabel}
          </button>
          <Link href={providerHref} className="dm2026-button dm2026-button-secondary">
            {copy.providerLabel}
          </Link>
        </div>

        {searchPreviewVisible ? (
          <div className="dm2026-home-search__discovery-preview" role="status">
            <strong>{dir === 'rtl' ? 'معاينة الاكتشاف' : 'Discovery preview'}</strong>
            <p>{[query || selectedSuggestion.label, selectedContentType, selectedCity, selectedArea].filter(Boolean).join(' · ')}</p>
            <small>{dir === 'rtl' ? 'ستظهر الملفات العامة بعد مراجعة بيانات المقدمين واعتمادها.' : 'Reviewed public profiles will appear here after provider data is approved.'}</small>
          </div>
        ) : null}
      </form>
    </section>
  );
}
