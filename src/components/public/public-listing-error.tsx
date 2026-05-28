import type { PublicCatalogLocale } from '@/lib/catalog/public-types';

type PublicListingErrorProps = {
  locale: PublicCatalogLocale;
};

export function PublicListingError({ locale }: PublicListingErrorProps) {
  return (
    <section
      className="mt-10 rounded-2xl border border-rose-200/70 bg-rose-50/70 p-6 text-sm leading-6 text-rose-900 shadow-sm"
      role="alert"
    >
      <p>{locale === 'ar' ? 'تعذر تحميل هذه القائمة حالياً.' : 'We could not load this listing right now.'}</p>
    </section>
  );
}
