import type { PublicCatalogLocale } from '@/lib/catalog/public-types';

type PublicEmptyStateProps = {
  locale: PublicCatalogLocale;
  text?: string | undefined;
};

export function PublicEmptyState({ locale, text }: PublicEmptyStateProps) {
  return (
    <section
      className="dm2026-public-discovery-empty-compact dm2026-card-soft"
      role="status"
      aria-live="polite"
    >
      <h2>{text ?? (locale === 'ar' ? 'لا توجد قوائم عامة متاحة بعد.' : 'No public listings are available yet.')}</h2>
    </section>
  );
}
