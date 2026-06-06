'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type HeaderLanguageSwitchProps = {
  className: string;
};

const getSwitchTarget = (pathname: string | null) => {
  const segments = (pathname ?? '').split('/').filter(Boolean);
  const currentLocale = segments[0] === 'ar' ? 'ar' : 'en';
  const targetLocale = currentLocale === 'ar' ? 'en' : 'ar';
  const country = segments[1] || 'om';
  return {
    href: `/${targetLocale}/${country}`,
    hrefLang: targetLocale,
    label: currentLocale === 'ar' ? 'English' : 'العربية',
    ariaLabel: currentLocale === 'ar' ? 'Switch language to English' : 'Switch language to Arabic'
  };
};

export function HeaderLanguageSwitch({ className }: HeaderLanguageSwitchProps) {
  const pathname = usePathname();
  const target = getSwitchTarget(pathname);

  return (
    <Link
      href={target.href}
      className={className}
      hrefLang={target.hrefLang}
      aria-label={target.ariaLabel}
      data-dm2026-locale-switch
    >
      <span>{target.label}</span>
    </Link>
  );
}
