import Link from 'next/link';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicDiscoveryRoute } from '@/lib/routes/public';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { LocationSelect2026 } from '@/components/public-2026/search/LocationSelect2026';
import { SearchQuickLinks2026 } from '@/components/public-2026/search/SearchQuickLinks2026';

export type SearchHero2026Props = { locale: SupportedLocale; country: SupportedCountry; copy: Pick<Home2026Copy, 'hero' | 'location'> };

export function SearchHero2026({ locale, country, copy }: SearchHero2026Props) {
  const searchHref = publicDiscoveryRoute(locale, country, 'search');

  return (
    <div className="dm2026-search-hero mx-auto mt-6 w-full max-w-[1000px] rounded-[2rem] border border-white/90 bg-white/95 p-3 shadow-[0_24px_70px_rgba(11,40,38,0.15)] backdrop-blur sm:p-4 lg:p-5">
      <div className="rounded-[1.75rem] border border-dm-border bg-[linear-gradient(180deg,#fff,var(--dm-bg-warm))] p-3.5 sm:p-5 lg:p-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="dm2026-search-input grid gap-2 text-xs font-bold uppercase tracking-[0.08em] text-dm-text-soft">
            {copy.hero.searchLabel}
            <span className="flex min-h-[4.05rem] items-center gap-3 rounded-[1.25rem] border border-dm-border bg-dm-bg px-4 shadow-inner transition focus-within:border-dm-brand focus-within:bg-white focus-within:shadow-dm-sm">
              <span className="text-xl text-dm-brand" aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder={copy.hero.searchPlaceholder}
                className="min-w-0 flex-1 border-0 bg-transparent text-base font-semibold text-dm-text outline-none placeholder:text-dm-text-muted sm:text-lg"
              />
            </span>
          </label>
          <Link href={searchHref} className="dm2026-search-button inline-flex min-h-[4.05rem] items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,var(--dm-teal-700),var(--dm-teal-500))] px-7 text-base font-bold text-white shadow-[0_14px_30px_rgba(14,110,100,0.26)] transition hover:-translate-y-0.5 hover:bg-dm-brand-strong">
            {copy.hero.searchButton}
          </Link>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-dm-border bg-white/80 p-3">
          <p className="mb-3 text-sm font-bold text-dm-text">{copy.hero.locationLabel}</p>
          <LocationSelect2026 locale={locale} copy={copy.location} />
        </div>

        <div className="mt-4">
          <SearchQuickLinks2026 locale={locale} country={country} copy={copy.hero} />
        </div>

        <div className="dm2026-suggestions mt-4 rounded-[1.35rem] border border-dm-border bg-dm-bg-soft/85 p-4">
          <p className="text-sm font-bold text-dm-text">{copy.hero.suggestionTitle}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {copy.hero.suggestionGroups.map((group) => (
              <div key={group.title} className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-dm-sm">
                <h3 className="text-sm font-bold text-dm-brand-strong">{group.title}</h3>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-dm-text-soft">
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
