type Params = { locale: string; country: string };

type Copy = {
  badge: string;
  title: string;
  intro: string;
  primary: string;
  provider: string;
  whatsapp: string;
  searchBadge: string;
  searchTitle: string;
  searchText: string;
  queryLabel: string;
  placeholder: string;
  searchIn: string;
  country: string;
  city: string;
  area: string;
  moreFilters: string;
  specialty: string;
  searchButton: string;
  trustItems: readonly string[];
  chips: readonly string[];
  specialties: readonly string[];
  areas: readonly string[];
};

const copy: Record<'en' | 'ar', Copy> = {
  en: {
    badge: 'Doctors in Oman',
    title: 'Find doctors in Oman.',
    intro: 'Browse doctors, specialties, clinics and care paths across Oman. DrMuscat is a public discovery platform, not medical advice.',
    primary: 'Search doctors',
    provider: 'List your center',
    whatsapp: 'WhatsApp',
    searchBadge: 'Doctor search',
    searchTitle: 'Search doctors, specialties or areas',
    searchText: 'Use the same DrMuscat smart search style to start from a doctor name, specialty, clinic or Muscat area.',
    queryLabel: 'What do you need?',
    placeholder: 'Search doctor name, specialty, clinic or area...',
    searchIn: 'Search in',
    country: 'Country',
    city: 'City',
    area: 'Area',
    moreFilters: 'More filters',
    specialty: 'Specialty paths',
    searchButton: 'Search',
    trustItems: ['Public discovery only', 'Confirm details with provider', 'Not medical advice'],
    chips: ['Doctors', 'Clinics', 'Dental', 'Dermatology', 'Pediatrics', 'Women’s health', 'ENT', 'Orthopedics'],
    specialties: ['General Practice', 'Cardiology', 'Ophthalmology', 'Physiotherapy'],
    areas: ['Muscat', 'Al Khuwair', 'Qurum', 'Azaiba']
  },
  ar: {
    badge: 'الأطباء في عُمان',
    title: 'ابحث عن أطباء في عُمان.',
    intro: 'تصفح الأطباء والتخصصات والعيادات ومسارات الرعاية في عُمان. DrMuscat منصة اكتشاف عامة وليست نصيحة طبية.',
    primary: 'ابحث عن الأطباء',
    provider: 'أدرج مركزك',
    whatsapp: 'واتساب',
    searchBadge: 'بحث الأطباء',
    searchTitle: 'ابحث عن الأطباء أو التخصصات أو المناطق',
    searchText: 'استخدم نفس أسلوب بحث DrMuscat الذكي للبدء باسم طبيب أو تخصص أو عيادة أو منطقة في مسقط.',
    queryLabel: 'ماذا تحتاج؟',
    placeholder: 'ابحث باسم الطبيب أو التخصص أو العيادة أو المنطقة...',
    searchIn: 'ابحث في',
    country: 'الدولة',
    city: 'المدينة',
    area: 'المنطقة',
    moreFilters: 'المزيد من الفلاتر',
    specialty: 'مسارات التخصص',
    searchButton: 'بحث',
    trustItems: ['اكتشاف عام فقط', 'أكد التفاصيل مع مقدم الخدمة', 'ليست نصيحة طبية'],
    chips: ['الأطباء', 'العيادات', 'الأسنان', 'الجلدية', 'طب الأطفال', 'النساء والولادة', 'أنف وأذن وحنجرة', 'العظام'],
    specialties: ['طب عام', 'قلب', 'عيون', 'علاج طبيعي'],
    areas: ['مسقط', 'الخوير', 'القرم', 'العذيبة']
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const lang = locale === 'ar' ? 'ar' : 'en';
  return {
    title: lang === 'ar' ? 'الأطباء في عُمان | DrMuscat' : 'Doctors in Oman | DrMuscat',
    description: copy[lang].intro
  };
}

export default async function DoctorsPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  const lang = locale === 'ar' ? 'ar' : 'en';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = copy[lang];
  const root = `/${lang}/${country}`;

  return (
    <main className="dm2026-shell doctors-a" dir={dir} data-locale={lang} data-country={country}>
      <style>{styles}</style>
      <section className="doctors-a__section" aria-labelledby="doctors-a-title">
        <div className="dm2026-container doctors-a__stack">
          <div className="dm2026-glass doctors-a__hero-strip">
            <div>
              <span className="dm2026-badge">{t.badge}</span>
              <h1 id="doctors-a-title">{t.title}</h1>
              <p>{t.intro}</p>
            </div>
            <div className="doctors-a__hero-actions">
              <a className="dm2026-button dm2026-button-primary" href="#doctors-a-search">{t.primary}</a>
              <a className="dm2026-button dm2026-button-secondary" href={`${root}/for-providers`}>{t.provider}</a>
              <button className="dm2026-button dm2026-button-secondary doctors-a__whatsapp" type="button">{t.whatsapp}</button>
            </div>
          </div>

          <section id="doctors-a-search" className="dm2026-home-search dm2026-search doctors-a__search" aria-labelledby="doctors-a-search-title">
            <form className="dm2026-search-surface dm2026-home-search__surface doctors-a__surface" action={`${root}/search`} method="get">
              <div className="dm2026-home-search__main doctors-a__search-main">
                <div className="dm2026-home-search__header">
                  <span className="dm2026-badge">{t.searchBadge}</span>
                  <div>
                    <h2 id="doctors-a-search-title">{t.searchTitle}</h2>
                    <p>{t.searchText}</p>
                  </div>
                </div>

                <div className="dm2026-home-search__command">
                  <label htmlFor="doctors-a-query">{t.queryLabel}</label>
                  <div className="dm2026-home-search__command-input">
                    <span aria-hidden="true">⌕</span>
                    <input id="doctors-a-query" name="q" className="dm2026-input" type="search" placeholder={t.placeholder} autoComplete="off" />
                    <button type="submit" className="dm2026-button dm2026-button-primary">{t.searchButton}</button>
                  </div>
                </div>

                <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--primary" aria-label={t.searchIn}>
                  <legend>{t.searchIn}</legend>
                  <div>
                    {t.chips.map((chip, index) => (
                      <label key={chip} className="dm2026-home-search__chip">
                        <input type="radio" name="contentType" value={chip} defaultChecked={index === 0} />
                        <span>{chip}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="dm2026-home-search__select-grid" aria-label={`${t.country}, ${t.city}, ${t.area}`}>
                  <div className="dm2026-home-search__field">
                    <label htmlFor="doctors-a-country">{t.country}</label>
                    <select id="doctors-a-country" name="country" className="dm2026-select" defaultValue={lang === 'ar' ? 'عُمان' : 'Oman'}>
                      <option>{lang === 'ar' ? 'عُمان' : 'Oman'}</option>
                    </select>
                  </div>
                  <div className="dm2026-home-search__field">
                    <label htmlFor="doctors-a-city">{t.city}</label>
                    <select id="doctors-a-city" name="city" className="dm2026-select" defaultValue={lang === 'ar' ? 'مسقط' : 'Muscat'}>
                      <option>{lang === 'ar' ? 'مسقط' : 'Muscat'}</option>
                      <option>{lang === 'ar' ? 'السيب' : 'Seeb'}</option>
                      <option>{lang === 'ar' ? 'بوشر' : 'Bawshar'}</option>
                    </select>
                  </div>
                  <div className="dm2026-home-search__field">
                    <label htmlFor="doctors-a-area">{t.area}</label>
                    <select id="doctors-a-area" name="area" className="dm2026-select" defaultValue={t.areas[1]}>
                      {t.areas.map((area) => <option key={area}>{area}</option>)}
                    </select>
                  </div>
                </div>

                <details className="dm2026-home-search__more-filters">
                  <summary>{t.moreFilters}</summary>
                  <fieldset className="dm2026-home-search__segment dm2026-home-search__segment--secondary" aria-label={t.specialty}>
                    <legend>{t.specialty}</legend>
                    <div>
                      {t.specialties.map((specialty) => (
                        <label key={specialty} className="dm2026-home-search__chip">
                          <input type="radio" name="specialty" value={specialty} />
                          <span>{specialty}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </details>

                <div className="dm2026-home-search__actions">
                  <button type="submit" className="dm2026-button dm2026-button-primary">{t.searchButton}</button>
                  <a href={`${root}/for-providers`} className="dm2026-button dm2026-button-secondary">{t.provider}</a>
                  <button type="button" className="dm2026-button dm2026-button-ghost">{t.whatsapp}</button>
                </div>

                <ul className="dm2026-home-search__trust-row" aria-label={t.trustTitle}>
                  {t.trustItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

const styles = `
.doctors-a { min-block-size: 100svh; }
.doctors-a__section { min-block-size: calc(100svh - 5.5rem); display: grid; align-items: start; overflow: hidden; padding-block: clamp(0.85rem, 2vw, 1.2rem) clamp(1rem, 2.4vw, 1.5rem); }
.doctors-a__stack { display: grid; gap: clamp(0.8rem, 1.8vw, 1.15rem); }
.doctors-a__hero-strip { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: clamp(0.7rem, 1.8vw, 1rem); align-items: end; padding: clamp(0.9rem, 1.9vw, 1.25rem); }
.doctors-a__hero-strip h1 { max-inline-size: 14ch; margin: 0.42rem 0 0; color: var(--dm-teal-950, #07302c); font-size: clamp(1.85rem, 3.2vw, 2.75rem); font-weight: 720; line-height: 1.04; letter-spacing: -0.04em; }
.doctors-a__hero-strip p { max-inline-size: 54rem; margin: 0.45rem 0 0; color: var(--dm-color-text-muted, #66736f); font-size: clamp(0.9rem, 1.05vw, 0.98rem); line-height: 1.62; }
.doctors-a__hero-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: end; align-items: center; }
.doctors-a__whatsapp { color: var(--dm-teal-950, #07302c); border-color: rgba(14, 110, 100, 0.22); background: rgba(220, 238, 235, 0.72); }
.doctors-a__search { display: block; }
.doctors-a__surface { max-inline-size: none; margin: 0; }
.doctors-a__search-main { display: grid; gap: clamp(0.46rem, 1vw, 0.68rem); }
[dir='rtl'] .doctors-a__hero-strip h1, [dir='rtl'] .dm2026-home-search__header h2 { letter-spacing: 0; line-height: 1.16; }
@media (max-width: 68rem) { .doctors-a__hero-strip { grid-template-columns: 1fr; align-items: start; } .doctors-a__hero-actions { justify-content: start; } }
@media (max-width: 42rem) { .doctors-a__hero-actions { align-items: stretch; flex-direction: column; } .doctors-a__hero-strip h1 { font-size: clamp(1.78rem, 8.4vw, 2.55rem); } }
`;
