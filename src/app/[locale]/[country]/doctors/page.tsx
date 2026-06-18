type Params = { locale: string; country: string };

type Copy = {
  badge: string;
  title: string;
  intro: string;
  primary: string;
  provider: string;
  whatsapp: string;
  imageBadge: string;
  imageTitle: string;
  imageText: string;
  searchBadge: string;
  searchTitle: string;
  searchText: string;
  placeholder: string;
  searchButton: string;
  quick: string;
  trustTitle: string;
  trustItems: readonly string[];
  chips: readonly string[];
};

const copy: Record<'en' | 'ar', Copy> = {
  en: {
    badge: 'Doctors in Oman',
    title: 'Find the right doctor in Oman.',
    intro: 'Search doctor profiles, specialties, clinics and care paths across Oman. DrMuscat is a public discovery platform, not medical advice.',
    primary: 'Search doctors',
    provider: 'List your center',
    whatsapp: 'WhatsApp',
    imageBadge: 'Provider image',
    imageTitle: 'Doctor or clinic photo area',
    imageText: 'Prepared for an approved real image. No fake doctor photos and no decorative hero artwork.',
    searchBadge: 'Doctor search',
    searchTitle: 'Search by name, specialty or area',
    searchText: 'A premium search surface prepared for approved public doctor listings as the directory grows.',
    placeholder: 'Doctor name, specialty, clinic or area…',
    searchButton: 'Search',
    quick: 'Popular paths',
    trustTitle: 'Discovery safety',
    trustItems: ['Public discovery only', 'Not medical advice', 'Approved listings only'],
    chips: ['Pediatrics', 'Dermatology', 'Dentistry', 'Gynecology', 'ENT', 'Orthopedics', 'General Practice', 'Cardiology']
  },
  ar: {
    badge: 'الأطباء في عُمان',
    title: 'ابحث عن الطبيب المناسب في عُمان.',
    intro: 'ابحث في ملفات الأطباء والتخصصات والعيادات ومسارات الرعاية في عُمان. DrMuscat منصة اكتشاف عامة وليست نصيحة طبية.',
    primary: 'ابحث عن الأطباء',
    provider: 'أدرج مركزك',
    whatsapp: 'واتساب',
    imageBadge: 'صورة مقدم الخدمة',
    imageTitle: 'مساحة صورة لطبيب أو عيادة',
    imageText: 'مجهزة لصورة حقيقية معتمدة. لا توجد صور أطباء وهمية ولا رسومات كبطل للصفحة.',
    searchBadge: 'بحث الأطباء',
    searchTitle: 'ابحث بالاسم أو التخصص أو المنطقة',
    searchText: 'واجهة بحث مميزة ومجهزة لقوائم الأطباء العامة المعتمدة مع نمو الدليل.',
    placeholder: 'اسم الطبيب أو التخصص أو العيادة أو المنطقة…',
    searchButton: 'بحث',
    quick: 'مسارات شائعة',
    trustTitle: 'سلامة الاكتشاف',
    trustItems: ['اكتشاف عام فقط', 'ليست نصيحة طبية', 'قوائم معتمدة فقط'],
    chips: ['طب الأطفال', 'جلدية', 'أسنان', 'نساء وولادة', 'أنف وأذن وحنجرة', 'عظام', 'طب عام', 'قلب']
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
        <div className="dm2026-container doctors-a__grid">
          <div className="dm2026-glass doctors-a__copy-card">
            <span className="dm2026-badge">{t.badge}</span>
            <h1 id="doctors-a-title">{t.title}</h1>
            <p>{t.intro}</p>
            <div className="doctors-a__actions">
              <a className="dm2026-button dm2026-button-primary" href="#doctors-a-search">{t.primary}</a>
              <a className="dm2026-button dm2026-button-secondary" href={`${root}/for-providers`}>{t.provider}</a>
              <button className="dm2026-button dm2026-button-secondary doctors-a__whatsapp" type="button">{t.whatsapp}</button>
            </div>
            <div className="dm2026-glass doctors-a__trust" aria-label={t.trustTitle}>
              <strong>{t.trustTitle}</strong>
              <ul>{t.trustItems.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>

          <aside className="dm2026-card-glass doctors-a__search-card" aria-label={t.searchTitle}>
            <figure className="doctors-a__photo-slot">
              <figcaption>
                <span className="dm2026-badge">{t.imageBadge}</span>
                <strong>{t.imageTitle}</strong>
                <small>{t.imageText}</small>
              </figcaption>
            </figure>
            <div id="doctors-a-search" className="dm2026-search-surface doctors-a__search-box">
              <header>
                <span className="dm2026-badge">{t.searchBadge}</span>
                <h2>{t.searchTitle}</h2>
                <p>{t.searchText}</p>
              </header>
              <form className="doctors-a__search-row">
                <label className="sr-only" htmlFor="doctors-a-q">{t.placeholder}</label>
                <input className="dm2026-input" id="doctors-a-q" name="q" placeholder={t.placeholder} type="search" />
                <button className="dm2026-button dm2026-button-primary" type="button">{t.searchButton}</button>
              </form>
              <div className="doctors-a__quick">
                <span className="dm2026-badge">{t.quick}</span>
                <div>{t.chips.map((chip) => <button className="doctors-a__chip" key={chip} type="button">{chip}</button>)}</div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

const styles = `
.doctors-a { min-block-size: 100svh; }
.doctors-a__section { min-block-size: calc(100svh - 5.6rem); display: grid; align-items: center; overflow: hidden; padding-block: clamp(0.85rem, 2vw, 1.35rem) clamp(1rem, 2.5vw, 1.65rem); }
.doctors-a__grid { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(21rem, 1fr); gap: clamp(0.85rem, 2vw, 1.35rem); align-items: stretch; }
.doctors-a__copy-card, .doctors-a__search-card { min-block-size: clamp(27rem, 64svh, 33rem); }
.doctors-a__copy-card { display: grid; align-content: center; gap: clamp(0.58rem, 1.2vw, 0.82rem); padding: clamp(1rem, 2.2vw, 1.5rem); }
.doctors-a__copy-card h1 { max-inline-size: 12.4ch; margin: 0; color: var(--dm-teal-950, #07302c); font-size: clamp(1.95rem, 3.9vw, 3.25rem); font-weight: 720; line-height: 1.02; letter-spacing: -0.04em; }
.doctors-a__copy-card p { max-inline-size: 36rem; margin: 0; color: var(--dm-color-text-muted, #66736f); font-size: clamp(0.88rem, 1.05vw, 0.98rem); line-height: 1.65; }
.doctors-a__actions { display: flex; flex-wrap: wrap; gap: 0.48rem; align-items: center; margin-block-start: 0.1rem; }
.doctors-a__whatsapp { color: var(--dm-teal-950, #07302c); border-color: rgba(14, 110, 100, 0.22); background: rgba(220, 238, 235, 0.72); }
.doctors-a__trust { display: grid; gap: 0.5rem; margin-block-start: 0.15rem; padding: 0.76rem 0.85rem; }
.doctors-a__trust strong { color: var(--dm-teal-950, #07302c); font-size: 0.9rem; font-weight: 760; }
.doctors-a__trust ul { display: flex; flex-wrap: wrap; gap: 0.36rem; margin: 0; padding: 0; list-style: none; }
.doctors-a__trust li, .doctors-a__chip { border: 1px solid rgba(14, 110, 100, 0.14); border-radius: var(--dm-radius-pill, 999px); background: rgba(239, 246, 244, 0.86); color: var(--dm-color-brand-strong, #0b6f63); font-size: 0.78rem; font-weight: 680; padding: 0.36rem 0.58rem; }
.doctors-a__search-card { display: grid; grid-template-rows: minmax(11rem, 0.95fr) auto; gap: 0.72rem; padding: clamp(0.68rem, 1.4vw, 0.95rem); }
.doctors-a__photo-slot { position: relative; min-block-size: 100%; overflow: hidden; margin: 0; border: 1px solid rgba(255, 255, 255, 0.82); border-radius: var(--dm-radius-xl, 1.375rem); background: linear-gradient(135deg, rgba(7, 48, 44, 0.08), transparent 38%), radial-gradient(360px circle at 78% 18%, rgba(201, 162, 75, 0.16), transparent 48%), linear-gradient(135deg, rgba(239, 246, 244, 0.96), rgba(255, 255, 255, 0.78)); }
.doctors-a__photo-slot::before { content: ""; position: absolute; inset: 0.9rem; border: 1px dashed rgba(14, 110, 100, 0.24); border-radius: calc(var(--dm-radius-xl, 1.375rem) - 0.35rem); }
.doctors-a__photo-slot figcaption { position: absolute; inset-inline: 0.9rem; inset-block-end: 0.9rem; display: grid; gap: 0.26rem; padding: 0.78rem 0.86rem; border: 1px solid rgba(255, 255, 255, 0.76); border-radius: var(--dm-radius-lg, 1rem); background: rgba(255, 255, 255, 0.82); box-shadow: 0 12px 30px rgba(11, 40, 38, 0.08); }
.doctors-a__photo-slot strong { color: var(--dm-teal-950, #07302c); font-size: 0.94rem; font-weight: 760; }
.doctors-a__photo-slot small { color: var(--dm-color-text-muted, #66736f); font-size: 0.78rem; line-height: 1.45; }
.doctors-a__search-box { gap: 0.55rem; padding: clamp(0.7rem, 1.4vw, 0.9rem); border-color: rgba(14, 110, 100, 0.16); background: radial-gradient(420px circle at 12% -18%, rgba(42, 161, 146, 0.12), transparent 48%), radial-gradient(340px circle at 95% 0%, rgba(201, 162, 75, 0.1), transparent 45%), rgba(255, 255, 255, 0.92); }
.doctors-a__search-box header { display: grid; gap: 0.26rem; }
.doctors-a__search-box h2 { margin: 0; color: var(--dm-teal-950, #07302c); font-size: clamp(1rem, 1.55vw, 1.22rem); font-weight: 680; line-height: 1.16; letter-spacing: -0.014em; }
.doctors-a__search-box p { max-inline-size: 44rem; margin: 0; color: var(--dm-color-text-muted, #66736f); font-size: 0.78rem; line-height: 1.48; }
.doctors-a__search-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.44rem; align-items: center; }
.doctors-a__quick { display: grid; gap: 0.42rem; }
.doctors-a__quick > div { display: flex; flex-wrap: wrap; gap: 0.36rem; }
.doctors-a__chip { font: inherit; cursor: pointer; transition: transform 140ms ease, background-color 140ms ease, color 140ms ease, border-color 140ms ease; }
.doctors-a__chip:hover { transform: translateY(-1px); border-color: rgba(14, 110, 100, 0.32); background: rgba(220, 238, 235, 0.96); }
[dir='rtl'] .doctors-a__copy-card h1, [dir='rtl'] .doctors-a__search-box h2 { letter-spacing: 0; line-height: 1.14; }
@media (max-width: 980px) { .doctors-a__section { min-block-size: auto; align-items: start; } .doctors-a__grid { grid-template-columns: 1fr; } .doctors-a__copy-card, .doctors-a__search-card { min-block-size: auto; } .doctors-a__search-card { grid-template-rows: minmax(14rem, auto) auto; } }
@media (max-width: 640px) { .doctors-a__search-row { grid-template-columns: 1fr; } .doctors-a__copy-card h1 { font-size: clamp(1.85rem, 9vw, 2.65rem); } .doctors-a__photo-slot { min-block-size: 13rem; } }
`;
