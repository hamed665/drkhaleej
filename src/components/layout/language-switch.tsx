'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { SupportedLocale } from '@/lib/i18n/config';

type LanguageSwitchProps = {
  locale: SupportedLocale;
  label?: string;
  ariaLabel?: string;
  className?: string;
};

function getDetectedLocale(pathname: string | null, fallbackLocale: SupportedLocale): SupportedLocale {
  const firstSegment = pathname?.split('/').filter(Boolean)[0];
  return firstSegment === 'ar' || firstSegment === 'en' ? firstSegment : fallbackLocale;
}

function getEquivalentLocalePath(pathname: string | null, currentLocale: SupportedLocale) {
  const targetLocale: SupportedLocale = currentLocale === 'ar' ? 'en' : 'ar';
  const fallback = `/${targetLocale}/om`;

  if (!pathname) {
    return fallback;
  }

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length >= 2 && (segments[0] === 'en' || segments[0] === 'ar') && segments[1] === 'om') {
    return `/${[targetLocale, ...segments.slice(1)].join('/')}`;
  }

  return fallback;
}

export function LanguageSwitch({
  locale,
  label,
  ariaLabel,
  className = 'site-header__locale-link'
}: LanguageSwitchProps) {
  const pathname = usePathname();
  const currentLocale = getDetectedLocale(pathname, locale);
  const href = getEquivalentLocalePath(pathname, currentLocale);
  const targetLocale: SupportedLocale = currentLocale === 'ar' ? 'en' : 'ar';
  const switchLabel = label ?? (currentLocale === 'ar' ? 'English' : 'العربية');
  const switchAriaLabel = ariaLabel ?? (currentLocale === 'ar' ? 'Switch language to English' : 'Switch language to Arabic');

  return (
    <Link className={className} href={href} hrefLang={targetLocale} aria-label={switchAriaLabel}>
      {switchLabel}
    </Link>
  );
}
