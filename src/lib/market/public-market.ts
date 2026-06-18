export const internalGeoCountryCodes = [
  'om',
  'ae',
  'qa',
  'bh',
  'kw',
  'sa',
  'iq',
  'sy',
  'jo',
  'lb',
  'ps',
  'eg',
  'ye',
  'ma',
  'dz',
  'tn',
  'ly',
  'sd',
  'mr',
  'ir'
] as const;

export const publicMarketCountries = ['om'] as const;
export const seoIndexableMarketCountries = ['om'] as const;
export const sitemapMarketCountries = ['om'] as const;

export type InternalGeoCountryCode = (typeof internalGeoCountryCodes)[number];
export type PublicMarketCountry = (typeof publicMarketCountries)[number];

type MarketLaunchConfig = {
  countryCode: InternalGeoCountryCode;
  publicEnabled: boolean;
  seoIndexable: boolean;
  sitemapEnabled: boolean;
  providerOnboardingEnabled: boolean;
};

export const marketLaunchConfig: Record<InternalGeoCountryCode, MarketLaunchConfig> = {
  om: {
    countryCode: 'om',
    publicEnabled: true,
    seoIndexable: true,
    sitemapEnabled: true,
    providerOnboardingEnabled: true
  },
  ae: {
    countryCode: 'ae',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  qa: {
    countryCode: 'qa',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  bh: {
    countryCode: 'bh',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  kw: {
    countryCode: 'kw',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  sa: {
    countryCode: 'sa',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  iq: {
    countryCode: 'iq',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  sy: {
    countryCode: 'sy',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  jo: {
    countryCode: 'jo',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  lb: {
    countryCode: 'lb',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  ps: {
    countryCode: 'ps',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  eg: {
    countryCode: 'eg',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  ye: {
    countryCode: 'ye',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  ma: {
    countryCode: 'ma',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  dz: {
    countryCode: 'dz',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  tn: {
    countryCode: 'tn',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  ly: {
    countryCode: 'ly',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  sd: {
    countryCode: 'sd',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  mr: {
    countryCode: 'mr',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  },
  ir: {
    countryCode: 'ir',
    publicEnabled: false,
    seoIndexable: false,
    sitemapEnabled: false,
    providerOnboardingEnabled: false
  }
} as const;

export function isInternalGeoCountryCode(value: string): value is InternalGeoCountryCode {
  return internalGeoCountryCodes.includes(value as InternalGeoCountryCode);
}

export function isPublicMarketCountry(value: string): value is PublicMarketCountry {
  return publicMarketCountries.includes(value as PublicMarketCountry);
}

export function isSeoIndexableMarketCountry(value: string): value is PublicMarketCountry {
  return seoIndexableMarketCountries.includes(value as PublicMarketCountry);
}

export function isSitemapMarketCountry(value: string): value is PublicMarketCountry {
  return sitemapMarketCountries.includes(value as PublicMarketCountry);
}

export function getMarketLaunchConfig(countryCode: InternalGeoCountryCode): MarketLaunchConfig {
  return marketLaunchConfig[countryCode];
}
