import { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

export const homeRoute = (locale: SupportedLocale, country: SupportedCountry) =>
  `/${locale}/${country}`;
