'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type DoctorsSearch2026Props = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
  resultsId: string;
};

type Suggestion = {
  id: string;
  en: string;
  ar: string;
  helperEn: string;
  helperAr: string;
  specialtyEn?: string;
  specialtyAr?: string;
  cityEn?: string;
  cityAr?: string;
  areaEn?: string;
  areaAr?: string;
  keywordsEn: readonly string[];
  keywordsAr: readonly string[];
};

const copyByLocale = {
  en: {
    badge: 'Doctor search',
    title: 'Find a doctor by specialty, name or area',
    description: 'Start with a doctor name, specialty, clinic or Muscat area.',
    inputLabel: 'What do you need?',
    placeholder: 'Search doctor name, specialty, clinic or area…',
    search: 'Search',
    legend: 'Doctor specialties',
    moreFilters: 'More filters',
    country: 'Country',
    city: 'City',
    area: 'Area',
    suggestionLabel: 'Doctor search suggestions',
    useSuggestion: 'Use suggestion',
    contentType: 'Doctors',
    trustAria: 'Doctor search guidance',
    trust: ['Public discovery only', 'Confirm details with provider', 'Not medical advice'],
    chips: ['Pediatrician', 'Dermatologist', 'Dentist', 'Gynecologist', 'ENT doctor'],
    additionalSpecialties: ['Orthopedist', 'Cardiologist', 'General Practitioner', 'Ophthalmologist', 'Psychiatrist', 'Neurologist'],
    moreSpecialties: 'More specialties',
    countries: ['Oman'],
    cities: ['Muscat', 'Seeb', 'Bawshar', 'Muttrah'],
    areas: ['Al Khuwair', 'Qurum', 'Azaiba', 'Al Ghubra', 'Ruwi']
  },
  ar: {
    badge: 'بحث الأطباء',
    title: 'ابحث عن طبيب حسب التخصص أو الاسم أو المنطقة',
    description: 'ابدأ باسم طبيب أو تخصص أو عيادة أو منطقة في مسقط.',
    inputLabel: 'ماذا تحتاج؟',
    placeholder: 'ابحث باسم الطبيب أو التخصص أو العيادة أو المنطقة…',
    search: 'بحث',
    legend: 'تخصصات الأطباء',
    moreFilters: 'المزيد من الفلاتر',
    country: 'الدولة',
    city: 'المدينة',
    area: 'المنطقة',
    suggestionLabel: 'اقتراحات بحث الأطباء',
    useSuggestion: 'استخدم الاقتراح',
    contentType: 'الأطباء',
    trustAria: 'إرشادات بحث الأطباء',
    trust: ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة طبية'],
    chips: ['طبيب أطفال', 'جلدية', 'أسنان', 'نساء وولادة', 'أنف وأذن وحنجرة'],
    additionalSpecialties: ['عظام', 'قلب', 'طبيب عام', 'عيون', 'نفسي', 'أعصاب'],
    moreSpecialties: 'المزيد من التخصصات',
    countries: ['عُمان'],
    cities: ['مسقط', 'السيب', 'بوشر', 'مطرح'],
    areas: ['الخوير', 'القرم', 'العذيبة', 'الغبرة', 'روي']
  }
} as const;

const suggestions = [
  { id: 'pediatrician', en: 'Pediatrician', ar: 'طبيب أطفال', helperEn: 'Doctor specialty', helperAr: 'تخصص طبي', specialtyEn: 'Pediatrician', specialtyAr: 'طبيب أطفال', keywordsEn: ['pediatrician', 'pediatrics', 'kids', 'children'], keywordsAr: ['طبيب اطفال', 'طبيب أطفال', 'اطفال', 'أطفال'] },
  { id: 'dermatologist', en: 'Dermatologist', ar: 'جلدية', helperEn: 'Doctor specialty', helperAr: 'تخصص طبي', specialtyEn: 'Dermatologist', specialtyAr: 'جلدية', keywordsEn: ['dermatologist', 'dermatology', 'skin'], keywordsAr: ['جلدية', 'جلديه', 'جلد'] },
  { id: 'dentist', en: 'Dentist', ar: 'أسنان', helperEn: 'Doctor specialty', helperAr: 'تخصص طبي', specialtyEn: 'Dentist', specialtyAr: 'أسنان', keywordsEn: ['dentist', 'dental', 'teeth'], keywordsAr: ['اسنان', 'أسنان', 'طبيب اسنان', 'طبيب أسنان'] },
  { id: 'gynecologist', en: 'Gynecologist', ar: 'نساء وولادة', helperEn: 'Doctor specialty', helperAr: 'تخصص طبي', specialtyEn: 'Gynecologist', specialtyAr: 'نساء وولادة', keywordsEn: ['gynecologist', 'gynecology', 'obgyn', 'women'], keywordsAr: ['نساء', 'ولادة', 'نسائيه', 'نسائية'] },
  { id: 'ent', en: 'ENT doctor', ar: 'أنف وأذن وحنجرة', helperEn: 'Doctor specialty', helperAr: 'تخصص طبي', specialtyEn: 'ENT doctor', specialtyAr: 'أنف وأذن وحنجرة', keywordsEn: ['ent', 'ent doctor', 'ear', 'nose', 'throat'], keywordsAr: ['انف', 'أنف', 'اذن', 'أذن', 'حنجرة'] },
  { id: 'orthopedist', en: 'Orthopedist', ar: 'عظام', helperEn: 'Doctor specialty', helperAr: 'تخصص طبي', specialtyEn: 'Orthopedist', specialtyAr: 'عظام', keywordsEn: ['orthopedist', 'orthopedics', 'bones', 'joints'], keywordsAr: ['عظام', 'مفاصل'] },
  { id: 'cardiologist', en: 'Cardiologist', ar: 'قلب', helperEn: 'Doctor specialty', helperAr: 'تخصص طبي', specialtyEn: 'Cardiologist', specialtyAr: 'قلب', keywordsEn: ['cardiologist', 'cardiology', 'heart'], keywordsAr: ['قلب'] },
  { id: 'gp', en: 'General Practitioner', ar: 'طبيب عام', helperEn: 'Doctor specialty', helperAr: 'تخصص طبي', specialtyEn: 'General Practitioner', specialtyAr: 'طبيب عام', keywordsEn: ['general practitioner', 'gp', 'doctor'], keywordsAr: ['طبيب عام', 'طب عام'] },
  { id: 'pediatrician-muscat', en: 'Pediatrician in Muscat', ar: 'طبيب أطفال في مسقط', helperEn: 'Specialty and city path', helperAr: 'مسار بحث حسب التخصص والمدينة', specialtyEn: 'Pediatrician', specialtyAr: 'طبيب أطفال', cityEn: 'Muscat', cityAr: 'مسقط', keywordsEn: ['pediatrician muscat', 'kids doctor muscat'], keywordsAr: ['طبيب أطفال في مسقط', 'اطفال مسقط'] },
  { id: 'dentist-muscat', en: 'Dentist in Muscat', ar: 'طبيب أسنان في مسقط', helperEn: 'Specialty and city path', helperAr: 'مسار بحث حسب التخصص والمدينة', specialtyEn: 'Dentist', specialtyAr: 'أسنان', cityEn: 'Muscat', cityAr: 'مسقط', keywordsEn: ['dentist muscat', 'dental muscat'], keywordsAr: ['طبيب أسنان في مسقط', 'أسنان مسقط'] },
  { id: 'doctor-khuwair', en: 'Doctor in Al Khuwair', ar: 'طبيب في الخوير', helperEn: 'Area search path', helperAr: 'مسار بحث حسب المنطقة', cityEn: 'Muscat', cityAr: 'مسقط', areaEn: 'Al Khuwair', areaAr: 'الخوير', keywordsEn: ['doctor al khuwair', 'al khuwair doctor', 'khuwair'], keywordsAr: ['طبيب في الخوير', 'الخوير'] },
  { id: 'doctor-qurum', en: 'Doctor in Qurum', ar: 'طبيب في القرم', helperEn: 'Area search path', helperAr: 'مسار بحث حسب المنطقة', cityEn: 'Muscat', cityAr: 'مسقط', areaEn: 'Qurum', areaAr: 'القرم', keywordsEn: ['doctor qurum', 'qurum doctor', 'qurum'], keywordsAr: ['طبيب في القرم', 'القرم'] }
] as const satisfies readonly Suggestion[];

const normalizeArabic = (value: string) => value
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[إأآٱ]/g, 'ا')
  .replace(/ة/g, 'ه')
  .replace(/ى/g, 'ي')
  .replace(/ـ/g, '');

const normalizeSearch = (value: string) => normalizeArabic(value).trim().toLocaleLowerCase();

export function DoctorsSearch2026({ locale, country, dir, resultsId }: DoctorsSearch2026Props) {
  const copy = copyByLocale[locale];
  const [query, setQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(copy.chips[0]);
  const [selectedCountry, setSelectedCountry] = useState<string>(copy.countries[0]);
  const [selectedCity, setSelectedCity] = useState<string>(copy.cities[0]);
  const [selectedArea, setSelectedArea] = useState<string>(copy.areas[0]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion>(suggestions[0]);

  const visibleSuggestions = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (normalizedQuery.length < 1) return [];

    return suggestions
      .map((suggestion) => {
        const label = normalizeSearch(locale === 'ar' ? suggestion.ar : suggestion.en);
        const helper = normalizeSearch(locale === 'ar' ? suggestion.helperAr : suggestion.helperEn);
        const keywords = (locale === 'ar' ? suggestion.keywordsAr : suggestion.keywordsEn).map(normalizeSearch);
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
      .sort((a, b) => b.score - a.score || a.suggestion.en.localeCompare(b.suggestion.en))
      .slice(0, 8)
      .map(({ suggestion }) => suggestion);
  }, [locale, query]);

  const applySuggestion = (suggestion: Suggestion) => {
    setQuery(locale === 'ar' ? suggestion.ar : suggestion.en);
    setActiveSuggestion(suggestion);

    const specialty = locale === 'ar' ? suggestion.specialtyAr : suggestion.specialtyEn;
    const city = locale === 'ar' ? suggestion.cityAr : suggestion.cityEn;
    const area = locale === 'ar' ? suggestion.areaAr : suggestion.areaEn;

    if (specialty && [...copy.chips, ...copy.additionalSpecialties].includes(specialty as never)) setSelectedSpecialty(specialty);
    if (city && (copy.cities as readonly string[]).includes(city)) setSelectedCity(city);
    if (area && (copy.areas as readonly string[]).includes(area)) setSelectedArea(area);

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
    params.set('specialty', selectedSpecialty);

    const nextUrl = `/${locale}/${country}/doctors?${params.toString()}#${resultsId}`;
    window.history.replaceState(null, '', nextUrl);
    document.getElementById(resultsId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowSuggestions(false);
  };

  const panelId = 'dm2026-doctors-search-smart-panel';
  const activeLabel = locale === 'ar' ? activeSuggestion.ar : activeSuggestion.en;

  return (
    <section className="dm2026-home-search dm2026-search dm2026-doctors-search" dir={dir} aria-labelledby="dm2026-doctors-search-title">
      <form className="dm2026-search-surface dm2026-home-search__surface" action={`/${locale}/${country}/doctors#${resultsId}`} method="get" onSubmit={handleSubmit}>
        <input type="hidden" name="contentType" value={copy.contentType} />
        <div className="dm2026-home-search__main">
          <div className="dm2026-home-search__header">
            <span className="dm2026-badge">{copy.badge}</span>
            <div>
              <h2 id="dm2026-doctors-search-title">{copy.title}</h2>
              <p>{copy.description}</p>
            </div>
          </div>

          <div className="dm2026-home-search__command">
            <label htmlFor="dm2026-doctors-care-need">{copy.inputLabel}</label>
            <div className="dm2026-home-search__command-input" role="combobox" aria-expanded={showSuggestions && visibleSuggestions.length > 0} aria-controls={panelId}>
              <span aria-hidden="true">⌕</span>
              <input
                id="dm2026-doctors-care-need"
                name="q"
                className="dm2026-input"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowSuggestions(event.target.value.trim().length > 0);
                }}
                onFocus={() => setShowSuggestions(normalizeSearch(query).length > 0)}
                placeholder={copy.placeholder}
                autoComplete="off"
              />
              <button type="submit" className="dm2026-button dm2026-button-primary">{copy.search}</button>
            </div>
          </div>

          {showSuggestions && visibleSuggestions.length > 0 ? (
            <div id={panelId} className="dm2026-home-search__smart-panel dm2026-home-search__smart-panel--active" aria-live="polite">
              <div className="dm2026-home-search__smart-list" role="listbox" aria-label={copy.suggestionLabel}>
                {visibleSuggestions.map((suggestion) => (
                  <button key={suggestion.id} type="button" className="dm2026-home-search__smart-item" onClick={() => applySuggestion(suggestion)} onMouseEnter={() => setActiveSuggestion(suggestion)} onFocus={() => setActiveSuggestion(suggestion)} role="option" aria-selected={activeSuggestion.id === suggestion.id}>
                    <span aria-hidden="true" />
                    <strong>{locale === 'ar' ? suggestion.ar : suggestion.en}</strong>
                    <small>{locale === 'ar' ? suggestion.helperAr : suggestion.helperEn}</small>
                  </button>
                ))}
              </div>
              <aside className="dm2026-home-search__preview" aria-label={activeLabel}>
                <span aria-hidden="true" />
                <small>{copy.badge}</small>
                <strong>{activeLabel}</strong>
                <p>{locale === 'ar' ? activeSuggestion.helperAr : activeSuggestion.helperEn}</p>
                <button type="button" className="dm2026-home-search__preview-cta" onClick={() => applySuggestion(activeSuggestion)}>{copy.useSuggestion}</button>
              </aside>
            </div>
          ) : null}

          <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--primary" aria-label={copy.legend}>
            <legend>{copy.legend}</legend>
            <div>
              {copy.chips.map((chip) => (
                <label key={chip} className="dm2026-home-search__chip">
                  <input type="radio" name="specialty" value={chip} checked={chip === selectedSpecialty} onChange={() => setSelectedSpecialty(chip)} />
                  <span>{chip}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <details className="dm2026-home-search__more-filters">
            <summary>{copy.moreFilters}</summary>
            <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--secondary" aria-label={copy.moreSpecialties}>
              <legend>{copy.moreSpecialties}</legend>
              <div>
                {copy.additionalSpecialties.map((chip) => (
                  <label key={chip} className="dm2026-home-search__chip">
                    <input type="radio" name="specialty" value={chip} checked={chip === selectedSpecialty} onChange={() => setSelectedSpecialty(chip)} />
                    <span>{chip}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="dm2026-home-search__select-grid" aria-label={`${copy.country}, ${copy.city}, ${copy.area}`}>
              <div className="dm2026-home-search__field">
                <label htmlFor="dm2026-doctors-country">{copy.country}</label>
                <select id="dm2026-doctors-country" name="country" className="dm2026-select" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)}>
                  {copy.countries.map((countryOption) => <option key={countryOption} value={countryOption}>{countryOption}</option>)}
                </select>
              </div>
              <div className="dm2026-home-search__field">
                <label htmlFor="dm2026-doctors-city">{copy.city}</label>
                <select id="dm2026-doctors-city" name="city" className="dm2026-select" value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
                  {copy.cities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div className="dm2026-home-search__field">
                <label htmlFor="dm2026-doctors-area">{copy.area}</label>
                <select id="dm2026-doctors-area" name="area" className="dm2026-select" value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                  {copy.areas.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
            </div>
          </details>

          <div className="dm2026-home-search__trust-row" aria-label={copy.trustAria}>
            {copy.trust.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </form>
    </section>
  );
}
