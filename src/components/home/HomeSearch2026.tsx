import Link from 'next/link';

const firstValue = <T,>(values: readonly T[]): T => {
  const [first] = values;

  if (first === undefined) {
    throw new Error('HomeSearch2026 requires at least one option.');
  }

  return first;
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
  providerTypes: readonly string[];
  countries: readonly { label: string; disabled?: boolean }[];
  cities: readonly string[];
  areas: readonly string[];
  contentTypes: readonly string[];
  specialties: readonly string[];
};

type HomeSearch2026Props = {
  copy: SearchCopy;
  dir: 'ltr' | 'rtl';
  searchHref: string;
  providerHref: string;
};

export function HomeSearch2026({ copy, dir, searchHref, providerHref }: HomeSearch2026Props) {
  const defaultProviderType = firstValue(copy.providerTypes);
  const defaultCountry = firstValue(copy.countries).label;
  const defaultCity = firstValue(copy.cities);
  const defaultArea = firstValue(copy.areas);
  const defaultContentType = firstValue(copy.contentTypes);

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
            <select id="dm2026-home-city" name="city" className="dm2026-select" defaultValue={defaultCity}>
              {copy.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="dm2026-home-search__field">
            <label htmlFor="dm2026-home-area">{copy.areaLabel}</label>
            <select id="dm2026-home-area" name="area" className="dm2026-select" defaultValue={defaultArea}>
              {copy.areas.map((area) => (
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
          <ul>
            {copy.specialties.map((specialty) => (
              <li key={specialty}>
                <button type="submit" name="q" value={specialty} className="dm2026-home-search__suggestion-chip">
                  {specialty}
                </button>
              </li>
            ))}
          </ul>
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
