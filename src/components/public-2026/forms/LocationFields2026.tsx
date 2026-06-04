'use client';

import { useMemo, useState } from 'react';

import type { SupportedLocale } from '@/lib/i18n/config';
import {
  countryOptions2026,
  getAreaOptionsForCity2026,
  getDefaultOmanCity2026,
  omanCityOptions2026,
} from '@/components/public-2026/location/location-options-2026';

type LocationFields2026Labels = {
  country: string;
  city: string;
  area: string;
  allAreas: string;
};

type LocationFields2026Props = {
  locale: SupportedLocale;
  labels: LocationFields2026Labels;
};

export function LocationFields2026({ locale, labels }: LocationFields2026Props) {
  const [country, setCountry] = useState('om');
  const [city, setCity] = useState<string>(getDefaultOmanCity2026());
  const [area, setArea] = useState(labels.allAreas);
  const isOmanActive = country === 'om';
  const countries = countryOptions2026[locale];
  const cities = omanCityOptions2026[locale];
  const areaOptions = useMemo(() => getAreaOptionsForCity2026(locale, city), [city, locale]);

  return (
    <div className="dm2026-form-grid dm2026-form-grid--location">
      <label className="dm2026-form-field">
        <span>{labels.country}</span>
        <select
          value={country}
          onChange={(event) => {
            setCountry(event.target.value);
            setCity(getDefaultOmanCity2026());
            setArea(labels.allAreas);
          }}
        >
          {countries.map((option) => (
            <option key={option.code} value={option.code} disabled={!option.active}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="dm2026-form-field">
        <span>{labels.city}</span>
        <select
          value={city}
          disabled={!isOmanActive}
          onChange={(event) => {
            setCity(event.target.value);
            setArea(labels.allAreas);
          }}
        >
          {cities.map((cityOption) => (
            <option key={cityOption.value} value={cityOption.value}>
              {cityOption.label}
            </option>
          ))}
        </select>
      </label>
      <label className="dm2026-form-field">
        <span>{labels.area}</span>
        <select value={area} disabled={!isOmanActive} onChange={(event) => setArea(event.target.value)}>
          <option value={labels.allAreas}>{labels.allAreas}</option>
          {areaOptions.map((areaOption) => (
            <option key={areaOption} value={areaOption}>
              {areaOption}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
