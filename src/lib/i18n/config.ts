export const supportedLocales = ['en', 'ar'] as const;
export const supportedCountries = ['om'] as const;

export type SupportedLocale = (typeof supportedLocales)[number];
export type SupportedCountry = (typeof supportedCountries)[number];

export const isSupportedLocale = (value: string): value is SupportedLocale =>
  supportedLocales.includes(value as SupportedLocale);

export const isSupportedCountry = (value: string): value is SupportedCountry =>
  supportedCountries.includes(value as SupportedCountry);

export const localeDirection = (locale: SupportedLocale): 'ltr' | 'rtl' =>
  locale === 'ar' ? 'rtl' : 'ltr';
