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
    <div className="dm2026-search-hero mx-auto mt-8 w-full max-w-[1040px] rounded-[2rem] border border-dm-border bg-white/90 p-4 shadow-dm-lg backdrop-blur sm:p-6 lg:p-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="dm2026-search-input grid gap-2 text-sm font-semibold text-dm-text-soft">
          {copy.hero.searchLabel}
          <input
            type="search"
            placeholder={copy.hero.searchPlaceholder}
            className="min-h-14 w-full rounded-2xl border border-dm-border bg-white px-4 text-base text-dm-text shadow-dm-sm placeholder:text-dm-text-muted"
          />
        </label>
        <Link href={searchHref} className="dm2026-search-button inline-flex min-h-14 items-center justify-center rounded-2xl bg-dm-brand px-8 text-base font-bold text-white shadow-dm-md transition hover:bg-dm-brand-strong">
          {copy.hero.searchButton}
        </Link>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-bold text-dm-text">{copy.hero.locationLabel}</p>
        <LocationSelect2026 locale={locale} copy={copy.location} />
      </div>

      <div className="mt-5">
        <SearchQuickLinks2026 locale={locale} country={country} copy={copy.hero} />
      </div>

      <div className="dm2026-suggestions mt-5 rounded-[1.5rem] border border-dm-border bg-dm-bg-soft/70 p-4">
        <p className="text-sm font-bold text-dm-text">{copy.hero.suggestionTitle}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          {copy.hero.suggestionGroups.map((group) => (
            <div key={group.title} className="rounded-2xl bg-white/85 p-3 shadow-dm-sm">
              <h3 className="text-sm font-bold text-dm-brand-strong">{group.title}</h3>
              <ul className="mt-2 space-y-1 text-sm text-dm-text-soft">
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
