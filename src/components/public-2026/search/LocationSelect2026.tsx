'use client';

import { useMemo, useState } from 'react';

import type { SupportedLocale } from '@/lib/i18n/config';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import {
  countryOptions2026,
  getAreaOptionsForCity2026,
  getDefaultOmanCity2026,
  omanCityOptions2026,
} from '@/components/public-2026/location/location-options-2026';

type LocationSelect2026Props = { locale: SupportedLocale; copy: Home2026Copy['location'] };

export function LocationSelect2026({ locale, copy }: LocationSelect2026Props) {
  const cities = omanCityOptions2026[locale];
  const countries = countryOptions2026[locale];
  const [country, setCountry] = useState('om');
  const [city, setCity] = useState<string>(getDefaultOmanCity2026());
  const [area, setArea] = useState(copy.allAreas);
  const isOmanActive = country === 'om';
  const areaOptions = useMemo(() => getAreaOptionsForCity2026(locale, city), [city, locale]);

  return (
    <div className="dm2026-location grid gap-3 lg:grid-cols-[1fr_1fr_1fr]" aria-describedby="dm2026-location-help">
      <label className="dm2026-location-field grid gap-2 text-xs font-semibold text-dm-text-soft">
        {copy.country}
        <select
          value={country}
          onChange={(event) => {
            const nextCountry = event.target.value;
            setCountry(nextCountry);
            setCity(getDefaultOmanCity2026());
            setArea(copy.allAreas);
          }}
          className="dm2026-select min-h-12 w-full rounded-2xl border border-dm-border bg-white px-4 text-sm font-semibold text-dm-text shadow-dm-sm"
        >
          {countries.map((option) => (
            <option key={option.code} value={option.code} disabled={!option.active}>
              {option.label}
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
          {isOmanActive ? (
            cities.map((cityOption) => (
              <option key={cityOption.value} value={cityOption.value}>
                {cityOption.label}
              </option>
            ))
          ) : (
            <option>{copy.unavailableCity}</option>
          )}
        </select>
      </label>
      <label className="dm2026-location-field grid gap-2 text-xs font-semibold text-dm-text-soft">
        {copy.area}
        <select
          value={isOmanActive ? area : copy.allAreas}
          disabled={!isOmanActive}
          onChange={(event) => setArea(event.target.value)}
          className="dm2026-select min-h-12 w-full rounded-2xl border border-dm-border bg-white px-4 text-sm font-semibold text-dm-text shadow-dm-sm disabled:bg-dm-bg-soft disabled:text-dm-text-muted"
        >
          <option value={copy.allAreas}>{copy.allAreas}</option>
          {areaOptions.map((areaOption) => (
            <option key={areaOption} value={areaOption}>
              {areaOption}
            </option>
          ))}
        </select>
      </label>
      <p id="dm2026-location-help" className="sr-only">
        {copy.countryHelp}
      </p>
    </div>
  );
}
