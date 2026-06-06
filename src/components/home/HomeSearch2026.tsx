'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const firstValue = <T,>(values: readonly T[]): T => {
  const [first] = values;

  if (first === undefined) {
    throw new Error('HomeSearch2026 requires at least one option.');
  }

  return first;
};

type SearchSuggestion = {
  label: string;
  group: string;
  helper: string;
};

type SearchCopy = {
  eyebrow: string;
  title: string;
  description: string;
  careNeedLabel: string;
  careNeedPlaceholder: string;
  providerTypeLabel: string;
  specialtyLabel: string;
  countryLabel: string;
  cityLabel: string;
  areaLabel: string;
  contentTypeLabel: string;
  searchLabel: string;
  providerLabel: string;
  staticPreviewLabel: string;
  staticPreviewNote: string;
  moreLabel: string;
  suggestionPreviewCta: string;
  cityWideAreaLabel: string;
  providerTypes: readonly string[];
  countries: readonly { label: string; disabled?: boolean }[];
  cities: readonly string[];
  areas: readonly string[];
  cityAreas: Readonly<Record<string, readonly string[]>>;
  contentTypes: readonly string[];
  specialties: readonly string[];
  suggestions: readonly SearchSuggestion[];
};

type HomeSearch2026Props = {
  copy: SearchCopy;
  dir: 'ltr' | 'rtl';
  searchHref: string;
  providerHref: string;
};

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function HomeSearch2026({ copy, dir, searchHref, providerHref }: HomeSearch2026Props) {
  const defaultProviderType = firstValue(copy.providerTypes);
  const defaultCountry = firstValue(copy.countries).label;
  const defaultCity = firstValue(copy.cities);
  const defaultContentType = firstValue(copy.contentTypes);
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const areaOptions = copy.cityAreas[selectedCity] ?? [copy.cityWideAreaLabel];
  const [selectedArea, setSelectedArea] = useState(firstValue(areaOptions));
  const popularSuggestions = copy.specialties.slice(0, 12);
  const matchingSuggestions = useMemo(() => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return [];
    }

    return copy.suggestions.filter((suggestion) => {
      const haystack = `${suggestion.label} ${suggestion.group} ${suggestion.helper}`;
      return normalize(haystack).includes(normalizedQuery);
    }).slice(0, 8);
  }, [copy.suggestions, query]);
  const [activeSuggestion, setActiveSuggestion] = useState<SearchSuggestion>(() => copy.suggestions[0] ?? {
    label: firstValue(copy.specialties),
    group: copy.specialtyLabel,
    helper: copy.staticPreviewNote
  });

  const handleCityChange = (city: string) => {
    const nextAreas = copy.cityAreas[city] ?? [copy.cityWideAreaLabel];
    setSelectedCity(city);
    setSelectedArea(firstValue(nextAreas));
  };

  const visibleSuggestions = matchingSuggestions.length > 0 ? matchingSuggestions : copy.suggestions.slice(0, 5);

  return (
    <section className="dm2026-home-search dm2026-search" dir={dir} aria-labelledby="dm2026-home-search-title">
      <form className="dm2026-search-surface dm2026-home-search__surface" action={searchHref} method="get">
        <div className="dm2026-home-search__header">
          <span className="dm2026-badge">{copy.eyebrow}</span>
          <div>
            <h2 id="dm2026-home-search-title">{copy.title}</h2>
            <p>{copy.description}</p>
          </div>
        </div>

        <div className="dm2026-home-search__command">
          <label htmlFor="dm2026-home-care-need">{copy.careNeedLabel}</label>
          <div className="dm2026-home-search__command-input">
            <span aria-hidden="true">⌕</span>
            <input
              id="dm2026-home-care-need"
              name="q"
              className="dm2026-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.careNeedPlaceholder}
              autoComplete="off"
            />
            <button type="submit" className="dm2026-button dm2026-button-primary">
              {copy.searchLabel}
            </button>
          </div>
        </div>

        <div className="dm2026-home-search__chip-rows">
          <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--primary" aria-label={copy.contentTypeLabel}>
            <legend>{copy.contentTypeLabel}</legend>
            <div>
              {copy.contentTypes.map((contentType) => (
                <label key={contentType} className="dm2026-home-search__chip">
                  <input type="radio" name="contentType" value={contentType} defaultChecked={contentType === defaultContentType} />
                  <span>{contentType}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--secondary" aria-label={copy.providerTypeLabel}>
            <legend>{copy.providerTypeLabel}</legend>
            <div>
              {copy.providerTypes.map((providerType) => (
                <label key={providerType} className="dm2026-home-search__chip">
                  <input type="radio" name="type" value={providerType} defaultChecked={providerType === defaultProviderType} />
                  <span>{providerType}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="dm2026-home-search__select-grid" aria-label={`${copy.countryLabel}, ${copy.cityLabel}, ${copy.areaLabel}`}>
          <div className="dm2026-home-search__field">
            <label htmlFor="dm2026-home-country">{copy.countryLabel}</label>
            <select id="dm2026-home-country" name="country" className="dm2026-select" defaultValue={defaultCountry}>
              {copy.countries.map((country) => (
                <option key={country.label} value={country.label} disabled={country.disabled}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          <div className="dm2026-home-search__field">
            <label htmlFor="dm2026-home-city">{copy.cityLabel}</label>
            <select id="dm2026-home-city" name="city" className="dm2026-select" value={selectedCity} onChange={(event) => handleCityChange(event.target.value)}>
              {copy.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="dm2026-home-search__field">
            <label htmlFor="dm2026-home-area">{copy.areaLabel}</label>
            <select id="dm2026-home-area" name="area" className="dm2026-select" value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dm2026-home-search__suggestions" aria-label={copy.staticPreviewLabel} data-static-preview="true">
          <div>
            <strong>{copy.staticPreviewLabel}</strong>
            <p>{copy.staticPreviewNote}</p>
          </div>
          <ul className="dm2026-home-search__popular-list">
            {popularSuggestions.map((specialty) => (
              <li key={specialty}>
                <button type="submit" name="q" value={specialty} className="dm2026-home-search__suggestion-chip">
                  {specialty}
                </button>
              </li>
            ))}
            {copy.specialties.length > popularSuggestions.length ? (
              <li>
                <span className="dm2026-home-search__more-chip">{copy.moreLabel}</span>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="dm2026-home-search__smart-panel" aria-live="polite">
          <div className="dm2026-home-search__smart-list">
            {visibleSuggestions.map((suggestion) => (
              <button
                key={`${suggestion.group}-${suggestion.label}`}
                type="button"
                className="dm2026-home-search__smart-item"
                onClick={() => setQuery(suggestion.label)}
                onMouseEnter={() => setActiveSuggestion(suggestion)}
                onFocus={() => setActiveSuggestion(suggestion)}
              >
                <span aria-hidden="true" />
                <strong>{suggestion.label}</strong>
                <small>{suggestion.group} · {suggestion.helper}</small>
              </button>
            ))}
          </div>
          <aside className="dm2026-home-search__preview" aria-label={activeSuggestion.label}>
            <span aria-hidden="true" />
            <small>{activeSuggestion.group}</small>
            <strong>{activeSuggestion.label}</strong>
            <p>{activeSuggestion.helper}</p>
            <button type="submit" name="q" value={activeSuggestion.label} className="dm2026-home-search__preview-cta">
              {copy.suggestionPreviewCta}
            </button>
          </aside>
        </div>

        <div className="dm2026-home-search__actions">
          <button type="submit" className="dm2026-button dm2026-button-primary">
            {copy.searchLabel}
          </button>
          <Link href={providerHref} className="dm2026-button dm2026-button-secondary">
            {copy.providerLabel}
          </Link>
        </div>
      </form>
    </section>
  );
}
