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

const comingSoon = {
  en: 'Coming soon',
  ar: 'قريبًا',
} as const satisfies Record<SupportedLocale, string>;

export const countryOptions2026 = {
  en: [
    { code: 'om', label: 'Oman', active: true },
    { code: 'ae', label: `United Arab Emirates — ${comingSoon.en}`, active: false },
    { code: 'sa', label: `Saudi Arabia — ${comingSoon.en}`, active: false },
    { code: 'qa', label: `Qatar — ${comingSoon.en}`, active: false },
    { code: 'bh', label: `Bahrain — ${comingSoon.en}`, active: false },
    { code: 'kw', label: `Kuwait — ${comingSoon.en}`, active: false },
    { code: 'ir', label: `Iran — ${comingSoon.en}`, active: false },
  ],
  ar: [
    { code: 'om', label: 'عُمان', active: true },
    { code: 'ae', label: `الإمارات العربية المتحدة — ${comingSoon.ar}`, active: false },
    { code: 'sa', label: `المملكة العربية السعودية — ${comingSoon.ar}`, active: false },
    { code: 'qa', label: `قطر — ${comingSoon.ar}`, active: false },
    { code: 'bh', label: `البحرين — ${comingSoon.ar}`, active: false },
    { code: 'kw', label: `الكويت — ${comingSoon.ar}`, active: false },
    { code: 'ir', label: `إيران — ${comingSoon.ar}`, active: false },
  ],
} as const satisfies Record<SupportedLocale, readonly CountryOption2026[]>;

export const omanCityOptions2026 = {
  en: [
    { value: 'Muscat', label: 'Muscat' },
    { value: 'Seeb', label: 'Seeb' },
    { value: 'Salalah', label: 'Salalah' },
    { value: 'Sohar', label: 'Sohar' },
    { value: 'Nizwa', label: 'Nizwa' },
    { value: 'Sur', label: 'Sur' },
    { value: 'Buraimi', label: 'Buraimi' },
    { value: 'Ibri', label: 'Ibri' },
    { value: 'Rustaq', label: 'Rustaq' },
    { value: 'Ibra', label: 'Ibra' },
    { value: 'Khasab', label: 'Khasab' },
    { value: 'Duqm', label: 'Duqm' },
  ],
  ar: [
    { value: 'Muscat', label: 'مسقط' },
    { value: 'Seeb', label: 'السيب' },
    { value: 'Salalah', label: 'صلالة' },
    { value: 'Sohar', label: 'صحار' },
    { value: 'Nizwa', label: 'نزوى' },
    { value: 'Sur', label: 'صور' },
    { value: 'Buraimi', label: 'البريمي' },
    { value: 'Ibri', label: 'عبري' },
    { value: 'Rustaq', label: 'الرستاق' },
    { value: 'Ibra', label: 'إبراء' },
    { value: 'Khasab', label: 'خصب' },
    { value: 'Duqm', label: 'الدقم' },
  ],
} as const satisfies Record<SupportedLocale, readonly CityOption2026[]>;

export const omanAreaOptionsByCity2026 = {
  en: {
    Muscat: [
      'Al Khuwair',
      'Azaiba',
      'Al Ghubrah',
      'Qurum',
      'Ruwi',
      'Muttrah',
      'Bausher',
      'Mawaleh',
      'Madinat Qaboos',
      'Muscat Hills',
      'Al Hail',
      'Amerat',
      'Quriyat',
    ],
    Seeb: ['Seeb Center', 'Al Hail', 'Mawaleh', 'Al Khoud', 'Seeb Souq'],
    Salalah: ['Salalah Center', 'Al Haffa', 'Al Saada', 'Awqad', 'Dahariz'],
    Sohar: ['Sohar Center', 'Al Hambar', 'Falaj Al Qabail'],
    Nizwa: ['Nizwa Center', 'Firq'],
    Sur: ['Sur Center', 'Al Ayjah'],
    Buraimi: ['Buraimi Center'],
    Ibri: ['Ibri Center'],
    Rustaq: ['Rustaq Center'],
    Ibra: ['Ibra Center'],
    Khasab: ['Khasab Center'],
    Duqm: ['Duqm Center'],
  },
  ar: {
    Muscat: [
      'الخوير',
      'العذيبة',
      'الغبرة',
      'القرم',
      'روي',
      'مطرح',
      'بوشر',
      'الموالح',
      'مدينة قابوس',
      'مرتفعات مسقط',
      'الحيل',
      'العامرات',
      'قريات',
    ],
    Seeb: ['مركز السيب', 'الحيل', 'الموالح', 'الخوض', 'سوق السيب'],
    Salalah: ['مركز صلالة', 'الحافة', 'السعادة', 'عوقد', 'الدهاريز'],
    Sohar: ['مركز صحار', 'الحمبر', 'فلج القبائل'],
    Nizwa: ['مركز نزوى', 'فرق'],
    Sur: ['مركز صور', 'العجة'],
    Buraimi: ['مركز البريمي'],
    Ibri: ['مركز عبري'],
    Rustaq: ['مركز الرستاق'],
    Ibra: ['مركز إبراء'],
    Khasab: ['مركز خصب'],
    Duqm: ['مركز الدقم'],
  },
} as const satisfies Record<SupportedLocale, Record<string, readonly string[]>>;

export function getDefaultOmanCity2026() {
  return omanCityOptions2026.en[0].value;
}

export function getAreaOptionsForCity2026(locale: SupportedLocale, city: string): readonly string[] {
  const areasByCity = omanAreaOptionsByCity2026[locale] as Record<string, readonly string[]>;
  return areasByCity[city] ?? areasByCity[getDefaultOmanCity2026()] ?? [];
}
