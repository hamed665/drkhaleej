import Link from 'next/link';
import { headers } from 'next/headers';

import { isSupportedLocale, localeDirection, type SupportedLocale } from '@/lib/i18n/config';
import { homeRoute } from '@/lib/routes/public';

const notFoundCopy: Record<SupportedLocale, { eyebrow: string; title: string; body: string; cta: string }> = {
  en: {
    eyebrow: 'Page not found',
    title: 'This page is not available.',
    body: 'Return to the DrMuscat homepage to continue discovering healthcare in Oman.',
    cta: 'Back to homepage',
  },
  ar: {
    eyebrow: 'الصفحة غير موجودة',
    title: 'هذه الصفحة غير متاحة.',
    body: 'ارجع إلى الصفحة الرئيسية لدكتور مسقط لمتابعة اكتشاف الرعاية الصحية في عُمان.',
    cta: 'العودة إلى الرئيسية',
  },
};

export default async function NotFound() {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const locale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';
  const copy = notFoundCopy[locale];

  return (
    <section className="dm2026-not-found mx-auto grid min-h-[55vh] max-w-3xl place-items-center px-4 py-16 text-center" dir={localeDirection(locale)}>
      <div className="w-full rounded-[2rem] border border-dm-border bg-white p-8 shadow-dm-lg sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-dm-brand">{copy.eyebrow}</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-dm-text sm:text-5xl">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-dm-text-soft">{copy.body}</p>
        <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-dm-brand px-6 py-3 font-bold text-white shadow-dm-sm transition hover:bg-dm-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dm-accent-gold" href={homeRoute(locale, 'om')}>
          {copy.cta}
        </Link>
      </div>
    </section>
  );
}
