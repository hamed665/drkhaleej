import Link from 'next/link';
import type { SupportedLocale } from '@/lib/i18n/config';

type PublicDirectoryQueryNoticeProps = {
  locale: SupportedLocale;
  query: string;
  clearHref: string;
};

type QueryNoticeCopy = {
  label: string;
  clear: string;
};

const copyByLocale: Record<SupportedLocale, QueryNoticeCopy> = {
  en: {
    label: 'Showing search results for',
    clear: 'Clear search',
  },
  ar: {
    label: 'عرض نتائج البحث عن',
    clear: 'مسح البحث',
  },
};

export function PublicDirectoryQueryNotice({
  locale,
  query,
  clearHref,
}: PublicDirectoryQueryNoticeProps) {
  const copy = copyByLocale[locale];

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/30 p-4 shadow-[0_18px_50px_rgba(15,118,110,0.08)] ring-1 ring-white/80 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-[13px]">
          {copy.label}
        </p>
        <p className="truncate text-lg font-semibold tracking-[-0.01em] text-slate-950 sm:text-xl" title={query}>
          {query}
        </p>
      </div>
      <Link
        href={clearHref}
        className="inline-flex w-full items-center justify-center rounded-full border border-emerald-200 bg-white/85 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 sm:w-auto"
      >
        {copy.clear}
      </Link>
    </div>
  );
}
