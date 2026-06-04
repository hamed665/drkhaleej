'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { SupportedLocale } from '@/lib/i18n/config';

type LanguageSwitchProps = {
  locale: SupportedLocale;
  label: string;
  ariaLabel: string;
  className?: string;
};

function getEquivalentLocalePath(pathname: string | null, locale: SupportedLocale) {
  const targetLocale: SupportedLocale = locale === 'ar' ? 'en' : 'ar';
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

export function LanguageSwitch({ locale, label, ariaLabel, className = 'site-header__locale-link' }: LanguageSwitchProps) {
  const pathname = usePathname();
  const href = getEquivalentLocalePath(pathname, locale);
  const targetLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <Link className={className} href={href} hrefLang={targetLocale} aria-label={ariaLabel}>
      {label}
    </Link>
  );
}
