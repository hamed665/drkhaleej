import type { PublicContactAction, PublicContactActionKind } from '@/lib/catalog/public-contact';
import type { PublicCatalogLocale } from '@/lib/catalog/public-types';

type PublicContactActionsVariant = 'compact' | 'premium';

type PublicContactActionsProps = {
  actions: PublicContactAction[];
  locale: PublicCatalogLocale;
  className?: string;
  variant?: PublicContactActionsVariant;
  showValues?: boolean;
};

const iconByKind: Record<PublicContactActionKind, string> = {
  call: '☎',
  whatsapp: 'WA',
  email: '✉',
  website: '↗'
};

function opensInNewTab(action: PublicContactAction): boolean {
  return action.kind === 'whatsapp' || action.kind === 'website';
}

function stripSchemePrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

function displayValueForAction(action: PublicContactAction): string | null {
  if (action.kind === 'call') return stripSchemePrefix(action.href, 'tel:');
  if (action.kind === 'email') return stripSchemePrefix(action.href, 'mailto:');

  try {
    const parsedUrl = new URL(action.href);
    if (action.kind === 'whatsapp') {
      const digits = parsedUrl.pathname.replace(/^\/+/, '');
      return digits ? `+${digits}` : null;
    }

    return parsedUrl.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function premiumActionClass(action: PublicContactAction): string {
  const baseClass =
    'group flex min-h-24 rounded-2xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2';

  if (action.kind === 'whatsapp') {
    return `${baseClass} border-emerald-200 bg-emerald-50/80 hover:border-emerald-300 hover:bg-emerald-100/70`;
  }

  return `${baseClass} border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50`;
}

export function PublicContactActions({
  actions,
  locale,
  className,
  variant = 'compact',
  showValues = false
}: PublicContactActionsProps) {
  if (actions.length === 0) return null;

  const containerClassName = [
    variant === 'premium' ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4' : 'flex flex-wrap items-center gap-3',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName} aria-label={locale === 'ar' ? 'إجراءات التواصل العامة' : 'Public contact actions'}>
      {actions.map((action) => {
        const label = locale === 'ar' ? action.labelAr : action.labelEn;
        const ariaLabel = locale === 'ar' ? action.ariaLabelAr : action.ariaLabelEn;
        const shouldOpenInNewTab = opensInNewTab(action);
        const displayValue = showValues ? displayValueForAction(action) : null;

        if (variant === 'premium') {
          return (
            <a
              key={`${action.kind}:${action.href}`}
              href={action.href}
              target={shouldOpenInNewTab ? '_blank' : undefined}
              rel={shouldOpenInNewTab ? 'noopener noreferrer' : undefined}
              aria-label={ariaLabel}
              className={premiumActionClass(action)}
            >
              <span className="flex w-full items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-xs font-black text-emerald-800 shadow-sm">
                  {iconByKind[action.kind]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-5 text-slate-950 group-hover:text-emerald-900">{label}</span>
                  {displayValue ? <span className="mt-1 block truncate text-xs font-medium leading-5 text-slate-600">{displayValue}</span> : null}
                </span>
              </span>
            </a>
          );
        }

        return (
          <a
            key={`${action.kind}:${action.href}`}
            href={action.href}
            target={shouldOpenInNewTab ? '_blank' : undefined}
            rel={shouldOpenInNewTab ? 'noopener noreferrer' : undefined}
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
