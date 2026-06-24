import {
  DRMUSCAT_COUNTRY_ADAPTERS,
  DRMUSCAT_COUNTRY_ADAPTER_CONTRACT,
  type DrMuscatCountryAdapter,
  type DrMuscatCountryGeoLevel,
} from '@/config/geo/country-adapter-contract';
import { isInternalGeoCountryCode, type InternalGeoCountryCode } from '@/lib/market/public-market';

export type CountryAdapterLookupInput = {
  countryCode: string;
};

export type CountryAdapterRuntimeState = {
  version: typeof DRMUSCAT_COUNTRY_ADAPTER_CONTRACT.version;
  totalAdapters: number;
  activeAdapters: number;
  disabledDraftAdapters: number;
  activeCountryCodes: readonly InternalGeoCountryCode[];
  publicationPolicy: 'gated';
  metadataPolicy: 'noindex-first';
  schemaPolicy: 'disabled-until-approved';
};

export function listCountryAdapters(): readonly DrMuscatCountryAdapter[] {
  return DRMUSCAT_COUNTRY_ADAPTERS;
}

export function getCountryAdapter(input: CountryAdapterLookupInput): DrMuscatCountryAdapter | null {
  if (!isInternalGeoCountryCode(input.countryCode)) return null;
  return listCountryAdapters().find((adapter) => adapter.countryCode === input.countryCode) ?? null;
}

export function getActiveCountryAdapter(input: CountryAdapterLookupInput): DrMuscatCountryAdapter | null {
  const adapter = getCountryAdapter(input);
  return adapter?.status === 'active' && adapter.publicEnabled ? adapter : null;
}

export function listCountryGeoLevels(countryCode: string): readonly DrMuscatCountryGeoLevel[] {
  return getCountryAdapter({ countryCode })?.geoLevels ?? [];
}

export function getCountryAdapterRuntimeState(): CountryAdapterRuntimeState {
  const adapters = listCountryAdapters();
  const activeAdapters = adapters.filter((adapter) => adapter.status === 'active' && adapter.publicEnabled);

  return {
    version: DRMUSCAT_COUNTRY_ADAPTER_CONTRACT.version,
    totalAdapters: adapters.length,
    activeAdapters: activeAdapters.length,
    disabledDraftAdapters: adapters.filter((adapter) => adapter.status === 'disabled-draft').length,
    activeCountryCodes: activeAdapters.map((adapter) => adapter.countryCode),
    publicationPolicy: 'gated',
    metadataPolicy: 'noindex-first',
    schemaPolicy: 'disabled-until-approved',
  };
}
