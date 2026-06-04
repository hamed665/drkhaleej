import type { SupportedLocale } from '@/lib/i18n/config';

type CountryOption2026 = {
  code: string;
  label: string;
  active: boolean;
};

type CityOption2026 = {
  value: string;
  label: string;
};

const soon = {
  en: 'Soon',
  ar: 'قريبًا',
} as const satisfies Record<SupportedLocale, string>;

export const countryOptions2026 = {
  en: [
    { code: 'om', label: 'Oman', active: true },
    { code: 'ae', label: `United Arab Emirates — ${soon.en}`, active: false },
    { code: 'sa', label: `Saudi Arabia — ${soon.en}`, active: false },
    { code: 'qa', label: `Qatar — ${soon.en}`, active: false },
    { code: 'bh', label: `Bahrain — ${soon.en}`, active: false },
    { code: 'kw', label: `Kuwait — ${soon.en}`, active: false },
    { code: 'ir', label: `Iran — ${soon.en}`, active: false },
  ],
  ar: [
    { code: 'om', label: 'عُمان', active: true },
    { code: 'ae', label: `الإمارات العربية المتحدة — ${soon.ar}`, active: false },
    { code: 'sa', label: `المملكة العربية السعودية — ${soon.ar}`, active: false },
    { code: 'qa', label: `قطر — ${soon.ar}`, active: false },
    { code: 'bh', label: `البحرين — ${soon.ar}`, active: false },
    { code: 'kw', label: `الكويت — ${soon.ar}`, active: false },
    { code: 'ir', label: `إيران — ${soon.ar}`, active: false },
  ],
} as const satisfies Record<SupportedLocale, readonly CountryOption2026[]>;

export const omanCityOptions2026 = {
  en: [
    { value: 'Muscat', label: 'Muscat' },
    { value: 'Seeb', label: 'Seeb' },
    { value: 'Bausher', label: 'Bausher' },
    { value: 'Muttrah', label: 'Muttrah' },
    { value: 'Amerat', label: 'Amerat' },
    { value: 'Quriyat', label: 'Quriyat' },
    { value: 'Sohar', label: 'Sohar' },
    { value: 'Salalah', label: 'Salalah' },
    { value: 'Nizwa', label: 'Nizwa' },
    { value: 'Sur', label: 'Sur' },
    { value: 'Ibri', label: 'Ibri' },
    { value: 'Buraimi', label: 'Buraimi' },
    { value: 'Rustaq', label: 'Rustaq' },
    { value: 'Ibra', label: 'Ibra' },
    { value: 'Khasab', label: 'Khasab' },
    { value: 'Duqm', label: 'Duqm' },
  ],
  ar: [
    { value: 'Muscat', label: 'مسقط' },
    { value: 'Seeb', label: 'السيب' },
    { value: 'Bausher', label: 'بوشر' },
    { value: 'Muttrah', label: 'مطرح' },
    { value: 'Amerat', label: 'العامرات' },
    { value: 'Quriyat', label: 'قريات' },
    { value: 'Sohar', label: 'صحار' },
    { value: 'Salalah', label: 'صلالة' },
    { value: 'Nizwa', label: 'نزوى' },
    { value: 'Sur', label: 'صور' },
    { value: 'Ibri', label: 'عبري' },
    { value: 'Buraimi', label: 'البريمي' },
    { value: 'Rustaq', label: 'الرستاق' },
    { value: 'Ibra', label: 'إبراء' },
    { value: 'Khasab', label: 'خصب' },
    { value: 'Duqm', label: 'الدقم' },
  ],
} as const satisfies Record<SupportedLocale, readonly CityOption2026[]>;

const fallbackAreas = {
  en: ['Central area', 'Nearby areas', 'Other'],
  ar: ['المنطقة المركزية', 'مناطق قريبة', 'أخرى'],
} as const satisfies Record<SupportedLocale, readonly string[]>;

export const omanAreaOptionsByCity2026 = {
  en: {
    Muscat: ['Al Khuwair', 'Azaiba', 'Qurum', 'Al Ghubrah', 'Madinat Qaboos', 'Ruwi', 'Muttrah', 'Bausher', 'Al Hail', 'Mawaleh', 'Muscat Hills', 'Wadi Kabir', 'Al Khoudh', 'Al Mouj', 'Ghala'],
    Seeb: ['Al Hail', 'Mawaleh', 'Al Khoud', 'Seeb Souq', 'Sur Al Hadid'],
    Bausher: ['Al Ghubrah', 'Bausher Heights', 'Ghala', 'Al Khuwair'],
    Muttrah: ['Muttrah Corniche', 'Ruwi', 'Wadi Kabir'],
    Amerat: ['Al Amerat Heights', 'Al Mahaj'],
    Quriyat: ['Quriyat Center'],
    Sohar: ['Sohar Center', 'Al Hambar', 'Falaj Al Qabail'],
    Salalah: ['Al Haffa', 'Al Saada', 'Awqad', 'Dahariz'],
    Nizwa: ['Nizwa Center', 'Firq'],
    Sur: ['Sur Center', 'Al Ayjah'],
    Ibri: fallbackAreas.en,
    Buraimi: fallbackAreas.en,
    Rustaq: fallbackAreas.en,
    Ibra: fallbackAreas.en,
    Khasab: fallbackAreas.en,
    Duqm: fallbackAreas.en,
  },
  ar: {
    Muscat: ['الخوير', 'العذيبة', 'القرم', 'الغبرة', 'مدينة قابوس', 'روي', 'مطرح', 'بوشر', 'الحيل', 'الموالح', 'مرتفعات مسقط', 'وادي الكبير', 'الخوض', 'الموج', 'غلا'],
    Seeb: ['الحيل', 'الموالح', 'الخوض', 'سوق السيب', 'سور الحديد'],
    Bausher: ['الغبرة', 'مرتفعات بوشر', 'غلا', 'الخوير'],
    Muttrah: ['كورنيش مطرح', 'روي', 'وادي الكبير'],
    Amerat: ['مرتفعات العامرات', 'المحج'],
    Quriyat: ['مركز قريات'],
    Sohar: ['مركز صحار', 'الحمبر', 'فلج القبائل'],
    Salalah: ['الحافة', 'السعادة', 'عوقد', 'الدهاريز'],
    Nizwa: ['مركز نزوى', 'فرق'],
    Sur: ['مركز صور', 'العجة'],
    Ibri: fallbackAreas.ar,
    Buraimi: fallbackAreas.ar,
    Rustaq: fallbackAreas.ar,
    Ibra: fallbackAreas.ar,
    Khasab: fallbackAreas.ar,
    Duqm: fallbackAreas.ar,
  },
} as const satisfies Record<SupportedLocale, Record<string, readonly string[]>>;

export function getDefaultOmanCity2026() {
  return omanCityOptions2026.en[0].value;
}

export function getAreaOptionsForCity2026(locale: SupportedLocale, city: string): readonly string[] {
  const areasByCity = omanAreaOptionsByCity2026[locale] as Record<string, readonly string[]>;
  return areasByCity[city] ?? fallbackAreas[locale];
}
