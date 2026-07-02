import type { PublicContactAction } from '@/lib/catalog/public-contact';
import type { PublicCatalogLocale } from '@/lib/catalog/public-types';

type PublicContactActionsProps = {
  actions: PublicContactAction[];
  locale: PublicCatalogLocale;
  className?: string;
};

const EXTERNAL_CONTACT_REL = ['noopener', 'noreferrer', 'nofollow'].join(' ');

function isExternalPublicContactAction(action: PublicContactAction): boolean {
  return action.kind === 'whatsapp' || action.kind === 'website';
}

export function PublicContactActions({ actions, locale, className }: PublicContactActionsProps) {
  if (actions.length === 0) return null;

  const containerClassName = ['flex flex-wrap items-center gap-3', className].filter(Boolean).join(' ');

  return (
    <div className={containerClassName} aria-label={locale === 'ar' ? 'إجراءات التواصل العامة' : 'Public contact actions'}>
      {actions.map((action) => {
        const label = locale === 'ar' ? action.labelAr : action.labelEn;
        const ariaLabel = locale === 'ar' ? action.ariaLabelAr : action.ariaLabelEn;
        const isExternalAction = isExternalPublicContactAction(action);

        return (
          <a
            key={`${action.kind}:${action.href}`}
            href={action.href}
            target={isExternalAction ? '_blank' : undefined}
            rel={isExternalAction ? EXTERNAL_CONTACT_REL : undefined}
            aria-label={ariaLabel}
            className="inline-flex w-fit rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
