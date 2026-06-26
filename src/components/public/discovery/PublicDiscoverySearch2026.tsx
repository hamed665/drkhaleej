'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { normalizePublicBrandCopy } from '@/lib/brand/public-brand-copy';
import type { PublicDiscoveryPageConfig, PublicDiscoverySuggestion } from './publicDiscoveryPageConfig';

type Props = { config: PublicDiscoveryPageConfig };

const normalizeArabic = (value: string) => value
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[إأآٱ]/g, 'ا')
  .replace(/ة/g, 'ه')
  .replace(/ى/g, 'ي')
  .replace(/ـ/g, '');

const normalizeSearch = (value: string) => normalizeArabic(value).replace(/\s+/g, ' ').trim().toLocaleLowerCase();

export function PublicDiscoverySearch2026({ config }: Props) {
  const { locale, country, dir, path, resultsId, categoryType } = config;
  const copy = config.search;
  const brandCopy = normalizePublicBrandCopy;
  const [query, setQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState(copy.mainChips[0] ?? '');
  const [selectedCountry, setSelectedCountry] = useState(copy.defaultCountry);
  const [selectedCity, setSelectedCity] = useState(copy.defaultCity);
  const [selectedArea, setSelectedArea] = useState(copy.defaultArea);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const visibleSuggestions = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (normalizedQuery.length < 1) return [];

    return copy.suggestions
      .map((suggestion) => {
        const label = normalizeSearch(suggestion.label);
        const helper = normalizeSearch(suggestion.helper);
        const keywords = suggestion.keywords.map(normalizeSearch);
        const score = label.startsWith(normalizedQuery)
          ? 10
          : keywords.some((keyword) => keyword.startsWith(normalizedQuery))
            ? 8
            : label.includes(normalizedQuery)
              ? 6
              : keywords.some((keyword) => keyword.includes(normalizedQuery))
                ? 4
                : helper.includes(normalizedQuery)
                  ? 2
                  : 0;

        return { suggestion, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.suggestion.label.localeCompare(b.suggestion.label))
      .slice(0, 8)
      .map(({ suggestion }) => suggestion);
  }, [copy.suggestions, query]);

  const applySuggestion = (suggestion: PublicDiscoverySuggestion) => {
    setQuery(suggestion.label);
    if (suggestion.chip && [...copy.mainChips, ...copy.moreChips].includes(suggestion.chip)) setSelectedChip(suggestion.chip);
    if (suggestion.city && copy.cityOptions.includes(suggestion.city)) setSelectedCity(suggestion.city);
    if (suggestion.area && copy.areaOptions.includes(suggestion.area)) setSelectedArea(suggestion.area);
    setShowSuggestions(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    params.set('contentType', copy.contentType);
    params.set('country', selectedCountry);
    params.set('city', selectedCity);
    params.set('area', selectedArea);
    if (selectedChip) params.set('service', selectedChip);

    window.history.replaceState(null, '', `/${locale}/${country}${path}?${params.toString()}#${resultsId}`);
    document.getElementById(resultsId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowSuggestions(false);
  };

  const panelId = `dm2026-${categoryType}-search-smart-panel`;
  const inputId = `dm2026-${categoryType}-care-need`;
  const titleId = `dm2026-${categoryType}-search-title`;

  return (
    <section className={`dm2026-home-search dm2026-search dm2026-doctors-search dm2026-public-discovery-search dm2026-public-discovery-search--${categoryType}`} dir={dir} aria-labelledby={titleId}>
      <form className="dm2026-search-surface dm2026-home-search__surface" action={`/${locale}/${country}${path}#${resultsId}`} method="get" onSubmit={handleSubmit}>
        <input type="hidden" name="contentType" value={copy.contentType} />
        <div className="dm2026-home-search__main">
          <div className="dm2026-home-search__header dm2026-public-discovery-search__header">
            <div>
              <h2 id={titleId}>{brandCopy(copy.title)}</h2>
              <p>{brandCopy(copy.description)}</p>
            </div>
          </div>

          <div className="dm2026-home-search__command dm2026-public-discovery-command">
            <label htmlFor={inputId}>{brandCopy(copy.inputLabel)}</label>
            <div className="dm2026-home-search__command-input dm2026-public-discovery-command-input" role="combobox" aria-expanded={showSuggestions && visibleSuggestions.length > 0} aria-controls={panelId}>
              <span aria-hidden="true">⌕</span>
              <input
                id={inputId}
                name="q"
                className="dm2026-input"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowSuggestions(event.target.value.trim().length > 0);
                }}
                onFocus={() => {
                  if (query.trim().length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowSuggestions(false), 140);
                }}
                placeholder={brandCopy(copy.placeholder)}
                autoComplete="off"
              />
              <button type="submit" className="dm2026-button dm2026-button-primary">{brandCopy(copy.button)}</button>
            </div>
            {showSuggestions && visibleSuggestions.length > 0 ? (
              <div id={panelId} className="dm2026-public-discovery-suggestions" role="listbox" aria-label={brandCopy(copy.suggestionLabel)} aria-live="polite">
                {visibleSuggestions.map((suggestion) => (
                  <button key={suggestion.id} type="button" role="option" aria-selected="false" className="dm2026-public-discovery-suggestion" onMouseDown={(event) => event.preventDefault()} onClick={() => applySuggestion(suggestion)}>
                    <span>{brandCopy(suggestion.label)}</span>
                    {suggestion.helper ? <small>{brandCopy(suggestion.helper)}</small> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--primary" aria-label={brandCopy(copy.legend)}>
            <legend>{brandCopy(copy.legend)}</legend>
            <div>{copy.mainChips.map((chip) => <label key={chip} className="dm2026-home-search__chip"><input type="radio" name="service" value={chip} checked={chip === selectedChip} onChange={() => setSelectedChip(chip)} /><span>{brandCopy(chip)}</span></label>)}</div>
          </fieldset>

          <details className="dm2026-home-search__more-filters">
            <summary>{brandCopy(copy.moreFilters)}</summary>
            <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--secondary" aria-label={brandCopy(copy.moreLegend)}>
              <legend>{brandCopy(copy.moreLegend)}</legend>
              <div>{copy.moreChips.map((chip) => <label key={chip} className="dm2026-home-search__chip"><input type="radio" name="service" value={chip} checked={chip === selectedChip} onChange={() => setSelectedChip(chip)} /><span>{brandCopy(chip)}</span></label>)}</div>
            </fieldset>
            <div className="dm2026-home-search__select-grid" aria-label={`${brandCopy(copy.countryLabel)}, ${brandCopy(copy.cityLabel)}, ${brandCopy(copy.areaLabel)}`}>
              <div className="dm2026-home-search__field"><label htmlFor={`dm2026-${categoryType}-country`}>{brandCopy(copy.countryLabel)}</label><select id={`dm2026-${categoryType}-country`} name="country" className="dm2026-select" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)}>{copy.countryOptions.map((option) => <option key={option} value={option}>{brandCopy(option)}</option>)}</select></div>
              <div className="dm2026-home-search__field"><label htmlFor={`dm2026-${categoryType}-city`}>{brandCopy(copy.cityLabel)}</label><select id={`dm2026-${categoryType}-city`} name="city" className="dm2026-select" value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>{copy.cityOptions.map((option) => <option key={option} value={option}>{brandCopy(option)}</option>)}</select></div>
              <div className="dm2026-home-search__field"><label htmlFor={`dm2026-${categoryType}-area`}>{brandCopy(copy.areaLabel)}</label><select id={`dm2026-${categoryType}-area`} name="area" className="dm2026-select" value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>{copy.areaOptions.map((option) => <option key={option} value={option}>{brandCopy(option)}</option>)}</select></div>
            </div>
          </details>

          <div className="dm2026-home-search__trust-row" aria-label={brandCopy(copy.trustAria)}>{copy.trust.map((item) => <span key={item}>{brandCopy(item)}</span>)}</div>
        </div>
      </form>
    </section>
  );
}
