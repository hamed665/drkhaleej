import { isPublicMarketCountry, publicMarketCountries, type PublicMarketCountry } from '@/lib/market/public-market';

export const supportedLocales = ['en', 'ar'] as const;
export const supportedCountries = ['om'] as const satisfies typeof publicMarketCountries;

export type SupportedLocale = (typeof supportedLocales)[number];
export type SupportedCountry = PublicMarketCountry;

export const isSupportedLocale = (value: string): value is SupportedLocale =>
  supportedLocales.includes(value as SupportedLocale);

export const isSupportedCountry = (value: string): value is SupportedCountry =>
  isPublicMarketCountry(value);

export const localeDirection = (locale: SupportedLocale): 'ltr' | 'rtl' =>
  locale === 'ar' ? 'rtl' : 'ltr';
