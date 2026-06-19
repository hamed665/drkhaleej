'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { PublicDiscoveryPageConfig, PublicDiscoverySuggestion } from './publicDiscoveryPageConfig';

type Props = { config: PublicDiscoveryPageConfig };

const normalizeArabic = (value: string) => value
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[إأآٱ]/g, 'ا')
  .replace(/ة/g, 'ه')
  .replace(/ى/g, 'ي')
  .replace(/ـ/g, '');

const normalizeSearch = (value: string) => normalizeArabic(value).trim().toLocaleLowerCase();

export function PublicDiscoverySearch2026({ config }: Props) {
  const { locale, country, dir, path, resultsId, categoryType } = config;
  const copy = config.search;
  const [query, setQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState(copy.mainChips[0] ?? '');
  const [selectedCountry, setSelectedCountry] = useState(copy.defaultCountry);
  const [selectedCity, setSelectedCity] = useState(copy.defaultCity);
  const [selectedArea, setSelectedArea] = useState(copy.defaultArea);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fallbackSuggestion: PublicDiscoverySuggestion = copy.suggestions[0] ?? { id: 'default', label: copy.mainChips[0] ?? copy.contentType, helper: copy.legend, keywords: [] };
  const [activeSuggestion, setActiveSuggestion] = useState<PublicDiscoverySuggestion>(fallbackSuggestion);

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
    setActiveSuggestion(suggestion);
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
          <div className="dm2026-home-search__header">
            <span className="dm2026-badge">{copy.badge}</span>
            <div>
              <h2 id={titleId}>{copy.title}</h2>
              <p>{copy.description}</p>
            </div>
          </div>

          <div className="dm2026-home-search__command">
            <label htmlFor={inputId}>{copy.inputLabel}</label>
            <div className="dm2026-home-search__command-input" role="combobox" aria-expanded={showSuggestions && visibleSuggestions.length > 0} aria-controls={panelId}>
              <span aria-hidden="true">⌕</span>
              <input id={inputId} name="q" className="dm2026-input" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setShowSuggestions(event.target.value.trim().length > 0); }} onFocus={() => setShowSuggestions(normalizeSearch(query).length > 0)} placeholder={copy.placeholder} autoComplete="off" />
              <button type="submit" className="dm2026-button dm2026-button-primary">{copy.button}</button>
            </div>
          </div>

          {showSuggestions && visibleSuggestions.length > 0 ? (
            <div id={panelId} className="dm2026-home-search__smart-panel dm2026-home-search__smart-panel--active" aria-live="polite">
              <div className="dm2026-home-search__smart-list" role="listbox" aria-label={copy.suggestionLabel}>
                {visibleSuggestions.map((suggestion) => (
                  <button key={suggestion.id} type="button" className="dm2026-home-search__smart-item" onClick={() => applySuggestion(suggestion)} onMouseEnter={() => setActiveSuggestion(suggestion)} onFocus={() => setActiveSuggestion(suggestion)} role="option" aria-selected={activeSuggestion?.id === suggestion.id}>
                    <span aria-hidden="true" />
                    <strong>{suggestion.label}</strong>
                    <small>{suggestion.helper}</small>
                  </button>
                ))}
              </div>
              {activeSuggestion ? (
                <aside className="dm2026-home-search__preview" aria-label={activeSuggestion.label}>
                  <span aria-hidden="true" />
                  <small>{copy.badge}</small>
                  <strong>{activeSuggestion.label}</strong>
                  <p>{activeSuggestion.helper}</p>
                  <button type="button" className="dm2026-home-search__preview-cta" onClick={() => applySuggestion(activeSuggestion)}>{copy.useSuggestion}</button>
                </aside>
              ) : null}
            </div>
          ) : null}

          <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--primary" aria-label={copy.legend}>
            <legend>{copy.legend}</legend>
            <div>{copy.mainChips.map((chip) => <label key={chip} className="dm2026-home-search__chip"><input type="radio" name="service" value={chip} checked={chip === selectedChip} onChange={() => setSelectedChip(chip)} /><span>{chip}</span></label>)}</div>
          </fieldset>

          <details className="dm2026-home-search__more-filters">
            <summary>{copy.moreFilters}</summary>
            <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--secondary" aria-label={copy.moreLegend}>
              <legend>{copy.moreLegend}</legend>
              <div>{copy.moreChips.map((chip) => <label key={chip} className="dm2026-home-search__chip"><input type="radio" name="service" value={chip} checked={chip === selectedChip} onChange={() => setSelectedChip(chip)} /><span>{chip}</span></label>)}</div>
            </fieldset>
            <div className="dm2026-home-search__select-grid" aria-label={`${copy.countryLabel}, ${copy.cityLabel}, ${copy.areaLabel}`}>
              <div className="dm2026-home-search__field"><label htmlFor={`dm2026-${categoryType}-country`}>{copy.countryLabel}</label><select id={`dm2026-${categoryType}-country`} name="country" className="dm2026-select" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)}>{copy.countryOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
              <div className="dm2026-home-search__field"><label htmlFor={`dm2026-${categoryType}-city`}>{copy.cityLabel}</label><select id={`dm2026-${categoryType}-city`} name="city" className="dm2026-select" value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>{copy.cityOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
              <div className="dm2026-home-search__field"><label htmlFor={`dm2026-${categoryType}-area`}>{copy.areaLabel}</label><select id={`dm2026-${categoryType}-area`} name="area" className="dm2026-select" value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>{copy.areaOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
            </div>
          </details>

          <div className="dm2026-home-search__trust-row" aria-label={copy.trustAria}>{copy.trust.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
      </form>
    </section>
  );
}
