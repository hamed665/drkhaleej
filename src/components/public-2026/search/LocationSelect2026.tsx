'use client';

import { useMemo, useState } from 'react';
import type { SupportedLocale } from '@/lib/i18n/config';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';

type LocationSelect2026Props = { locale: SupportedLocale; copy: Home2026Copy['location'] };

const countryOptions = {
  en: ['Oman', 'UAE', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Kuwait', 'Iran'],
  ar: ['عُمان', 'الإمارات', 'السعودية', 'قطر', 'البحرين', 'الكويت', 'إيران']
} as const;

const cityOptions = {
  en: ['Muscat', 'Seeb', 'Bausher', 'Muttrah', 'Amerat', 'Quriyat', 'Sohar', 'Salalah', 'Nizwa', 'Sur', 'Ibri', 'Buraimi', 'Rustaq', 'Ibra', 'Khasab', 'Duqm'],
  ar: ['مسقط', 'السيب', 'بوشر', 'مطرح', 'العامرات', 'قريات', 'صحار', 'صلالة', 'نزوى', 'صور', 'عبري', 'البريمي', 'الرستاق', 'إبراء', 'خصب', 'الدقم']
} as const;

const areaOptionsByCityEn: Record<string, readonly string[]> = {
  Muscat: ['Al Khuwair', 'Qurum', 'Azaiba', 'Madinat Sultan Qaboos'],
  Seeb: ['Al Hail', 'Al Mawaleh', 'Al Khoud', 'Al Mabela'],
  Bausher: ['Bausher', 'Ghubrah', 'Al Ansab', 'Madinat Al Ilam'],
  Muttrah: ['Ruwi', 'Wadi Kabir', 'Muttrah Corniche'],
  Amerat: ['Al Amerat Heights', 'Al Nahda'],
  Quriyat: ['Quriyat Center', 'Daghmar'],
  Sohar: ['Sohar Center', 'Al Hambar'],
  Salalah: ['City Center', 'Al Saada'],
  Nizwa: ['Nizwa Center', 'Firq'],
  Sur: ['Sur Center', 'Al Ayjah'],
  Ibri: ['Ibri Center', 'Al Dariz'],
  Buraimi: ['Buraimi Center', 'Al Khadra'],
  Rustaq: ['Rustaq Center', 'Al Hazm'],
  Ibra: ['Ibra Center', 'Al Yahmadi'],
  Khasab: ['Khasab Center', 'Bukha'],
  Duqm: ['Duqm Center', 'Say']
};

const areaOptionsByCityAr: Record<string, readonly string[]> = {
  مسقط: ['الخوير', 'القرم', 'العذيبة', 'مدينة السلطان قابوس'],
  السيب: ['الحيل', 'الموالح', 'الخوض', 'المعبيلة'],
  بوشر: ['بوشر', 'الغبرة', 'الأنصب', 'مدينة الإعلام'],
  مطرح: ['روي', 'وادي الكبير', 'كورنيش مطرح'],
  العامرات: ['مرتفعات العامرات', 'النهضة'],
  قريات: ['مركز قريات', 'ضغمر'],
  صحار: ['مركز صحار', 'الهمبار'],
  صلالة: ['وسط المدينة', 'السعادة'],
  نزوى: ['مركز نزوى', 'فرق'],
  صور: ['مركز صور', 'العِيجة'],
  عبري: ['مركز عبري', 'الدريز'],
  البريمي: ['مركز البريمي', 'الخضراء'],
  الرستاق: ['مركز الرستاق', 'الحزم'],
  إبراء: ['مركز إبراء', 'اليحمدي'],
  خصب: ['مركز خصب', 'بخاء'],
  الدقم: ['مركز الدقم', 'صاي']
};

export function LocationSelect2026({ locale, copy }: LocationSelect2026Props) {
  const cities = cityOptions[locale];
  const countries = countryOptions[locale];
  const [city, setCity] = useState<string>(cities[0]);
  const areaOptions = useMemo(() => (locale === 'ar' ? areaOptionsByCityAr[city] : areaOptionsByCityEn[city]) ?? [], [city, locale]);

  return (
    <div className="dm2026-location grid gap-3 lg:grid-cols-[1fr_1fr_1fr]" aria-describedby="dm2026-location-help">
      <label className="dm2026-location-field grid gap-2 text-sm font-semibold text-dm-text-soft">
        {copy.country}
        <select className="min-h-12 w-full rounded-2xl border border-dm-border bg-white px-4 text-dm-text shadow-dm-sm">
          {countries.map((country, index) => (
            <option key={country} value={country} disabled={index !== 0}>
              {index === 0 ? country : `${country} — ${copy.comingSoon}`}
            </option>
          ))}
        </select>
      </label>
      <label className="dm2026-location-field grid gap-2 text-sm font-semibold text-dm-text-soft">
        {copy.city}
        <select value={city} onChange={(event) => setCity(event.target.value)} className="min-h-12 w-full rounded-2xl border border-dm-border bg-white px-4 text-dm-text shadow-dm-sm">
          {cities.map((cityOption) => (
            <option key={cityOption} value={cityOption}>{cityOption}</option>
          ))}
        </select>
      </label>
      <label className="dm2026-location-field grid gap-2 text-sm font-semibold text-dm-text-soft">
        {copy.area}
        <select className="min-h-12 w-full rounded-2xl border border-dm-border bg-white px-4 text-dm-text shadow-dm-sm">
          <option>{copy.allAreas}</option>
          {areaOptions.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </label>
      <p id="dm2026-location-help" className="text-sm text-dm-text-muted lg:col-span-3">{copy.countryHelp}</p>
    </div>
  );
}
