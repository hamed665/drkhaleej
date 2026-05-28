import type { PublicCatalogLocale } from '@/lib/catalog/public-types';

type PublicEmptyStateProps = {
  locale: PublicCatalogLocale;
};

export function PublicEmptyState({ locale }: PublicEmptyStateProps) {
  return (
    <section
      className="mt-10 rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-sm leading-6 text-slate-600 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <p>{locale === 'ar' ? 'لا توجد قوائم عامة متاحة بعد.' : 'No public listings are available yet.'}</p>
    </section>
  );
}
