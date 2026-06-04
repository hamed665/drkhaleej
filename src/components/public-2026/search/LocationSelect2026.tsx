'use client';

import { useMemo, useState } from 'react';
import type { SupportedLocale } from '@/lib/i18n/config';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';

type LocationSelect2026Props = { locale: SupportedLocale; copy: Home2026Copy['location'] };

type CountryCode = 'om' | 'ae' | 'sa' | 'qa' | 'bh' | 'kw' | 'ir';

const countryOptions: Record<SupportedLocale, readonly { code: CountryCode; label: string; active: boolean }[]> = {
  en: [
    { code: 'om', label: 'Oman', active: true },
    { code: 'ae', label: 'United Arab Emirates', active: false },
    { code: 'sa', label: 'Saudi Arabia', active: false },
    { code: 'qa', label: 'Qatar', active: false },
    { code: 'bh', label: 'Bahrain', active: false },
    { code: 'kw', label: 'Kuwait', active: false },
    { code: 'ir', label: 'Iran', active: false }
  ],
  ar: [
    { code: 'om', label: 'عُمان', active: true },
    { code: 'ae', label: 'الإمارات العربية المتحدة', active: false },
    { code: 'sa', label: 'السعودية', active: false },
    { code: 'qa', label: 'قطر', active: false },
    { code: 'bh', label: 'البحرين', active: false },
    { code: 'kw', label: 'الكويت', active: false },
    { code: 'ir', label: 'إيران', active: false }
  ]
};

const cityOptions = {
  en: ['Muscat', 'Seeb', 'Bausher', 'Muttrah', 'Amerat', 'Quriyat', 'Sohar', 'Salalah', 'Nizwa', 'Sur', 'Ibri', 'Buraimi', 'Rustaq', 'Ibra', 'Khasab', 'Duqm'],
  ar: ['مسقط', 'السيب', 'بوشر', 'مطرح', 'العامرات', 'قريات', 'صحار', 'صلالة', 'نزوى', 'صور', 'عبري', 'البريمي', 'الرستاق', 'إبراء', 'خصب', 'الدقم']
} as const;

const areaOptionsByCityEn: Record<string, readonly string[]> = {
  Muscat: ['Al Khuwair', 'Azaiba', 'Qurum', 'Al Ghubrah', 'Madinat Qaboos', 'Ruwi', 'Muttrah', 'Bausher', 'Mawaleh', 'Muscat Hills', 'Al Hail'],
  Seeb: ['Al Hail', 'Mawaleh', 'Al Khoud', 'Seeb Souq', 'Sur Al Hadid'],
  Bausher: ['Al Ghubrah', 'Bausher Heights', 'Ghala', 'Al Khuwair'],
  Muttrah: ['Muttrah Corniche', 'Ruwi', 'Wadi Kabir'],
  Amerat: ['Al Amerat Heights', 'Al Mahaj'],
  Quriyat: ['Quriyat Center'],
  Sohar: ['Sohar Center', 'Al Hambar', 'Falaj Al Qabail'],
  Salalah: ['Al Haffa', 'Al Saada', 'Awqad', 'Dahariz'],
  Nizwa: ['Nizwa Center', 'Firq'],
  Sur: ['Sur Center', 'Al Ayjah'],
  Ibri: ['Ibri Center'],
  Buraimi: ['Buraimi Center'],
  Rustaq: ['Rustaq Center'],
  Ibra: ['Ibra Center'],
  Khasab: ['Khasab Center'],
  Duqm: ['Duqm Center']
};

const areaOptionsByCityAr: Record<string, readonly string[]> = {
  مسقط: ['الخوير', 'العذيبة', 'القرم', 'الغبرة', 'مدينة قابوس', 'روي', 'مطرح', 'بوشر', 'الموالح', 'مرتفعات مسقط', 'الحيل'],
  السيب: ['الحيل', 'الموالح', 'الخوض', 'سوق السيب', 'سور الحديد'],
  بوشر: ['الغبرة', 'مرتفعات بوشر', 'غلا', 'الخوير'],
  مطرح: ['كورنيش مطرح', 'روي', 'وادي الكبير'],
  العامرات: ['مرتفعات العامرات', 'المحج'],
  قريات: ['مركز قريات'],
  صحار: ['مركز صحار', 'الهمبار', 'فلج القبائل'],
  صلالة: ['الحافة', 'السعادة', 'عوقد', 'الدهاريز'],
  نزوى: ['مركز نزوى', 'فرق'],
  صور: ['مركز صور', 'العِيجة'],
  عبري: ['مركز عبري'],
  البريمي: ['مركز البريمي'],
  الرستاق: ['مركز الرستاق'],
  إبراء: ['مركز إبراء'],
  خصب: ['مركز خصب'],
  الدقم: ['مركز الدقم']
};

export function LocationSelect2026({ locale, copy }: LocationSelect2026Props) {
  const cities = cityOptions[locale];
  const countries = countryOptions[locale];
  const [country, setCountry] = useState<CountryCode>('om');
  const [city, setCity] = useState<string>(cities[0]);
  const [area, setArea] = useState<string>(copy.allAreas);
  const isOmanActive = country === 'om';
  const areaOptions = useMemo(() => (locale === 'ar' ? areaOptionsByCityAr[city] : areaOptionsByCityEn[city]) ?? [], [city, locale]);

  return (
    <div className="dm2026-location grid gap-3 lg:grid-cols-[1fr_1fr_1fr]" aria-describedby="dm2026-location-help">
      <label className="dm2026-location-field grid gap-2 text-xs font-semibold text-dm-text-soft">
        {copy.country}
        <select
          value={country}
          onChange={(event) => {
            const nextCountry = event.target.value as CountryCode;
            setCountry(nextCountry);
            setCity(cities[0]);
            setArea(copy.allAreas);
          }}
          className="dm2026-select min-h-12 w-full rounded-2xl border border-dm-border bg-white px-4 text-sm font-semibold text-dm-text shadow-dm-sm"
        >
          {countries.map((option) => (
            <option key={option.code} value={option.code}>
              {option.active ? option.label : `${option.label} — ${copy.comingSoon}`}
            </option>
          ))}
        </select>
      </label>
      <label className="dm2026-location-field grid gap-2 text-xs font-semibold text-dm-text-soft">
        {copy.city}
        <select
          value={isOmanActive ? city : copy.unavailableCity}
          disabled={!isOmanActive}
          onChange={(event) => {
            setCity(event.target.value);
            setArea(copy.allAreas);
          }}
          className="dm2026-select min-h-12 w-full rounded-2xl border border-dm-border bg-white px-4 text-sm font-semibold text-dm-text shadow-dm-sm disabled:bg-dm-bg-soft disabled:text-dm-text-muted"
        >
          {isOmanActive ? cities.map((cityOption) => <option key={cityOption} value={cityOption}>{cityOption}</option>) : <option>{copy.unavailableCity}</option>}
        </select>
      </label>
      <label className="dm2026-location-field grid gap-2 text-xs font-semibold text-dm-text-soft">
        {copy.area}
        <select
          value={isOmanActive ? area : copy.unavailableArea}
          disabled={!isOmanActive}
          onChange={(event) => setArea(event.target.value)}
          className="dm2026-select min-h-12 w-full rounded-2xl border border-dm-border bg-white px-4 text-sm font-semibold text-dm-text shadow-dm-sm disabled:bg-dm-bg-soft disabled:text-dm-text-muted"
        >
          {isOmanActive ? (
            <>
              <option value={copy.allAreas}>{copy.allAreas}</option>
              {areaOptions.map((areaOption) => <option key={areaOption} value={areaOption}>{areaOption}</option>)}
            </>
          ) : <option>{copy.unavailableArea}</option>}
        </select>
      </label>
      <p id="dm2026-location-help" className="text-xs font-medium text-dm-text-muted lg:col-span-3">{copy.countryHelp}</p>
    </div>
  );
}
