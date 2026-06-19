import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { isSupportedCountry, isSupportedLocale, localeDirection } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

const copyByLocale: Record<SupportedLocale, { title: string; description: string; badge: string; heading: string; body: string; safety: string }> = {
  en: {
    title: 'About DrMuscat | Public Healthcare Discovery in Oman',
    description: 'Learn about DrMuscat, a public healthcare discovery platform for Oman built for English and Arabic users.',
    badge: 'About DrMuscat',
    heading: 'Public discovery for healthcare, wellness and provider information in Oman.',
    body: 'DrMuscat helps people browse public provider discovery surfaces in Oman in English and Arabic. Listings, articles and public routes are designed to remain review-aware and conservative while the platform grows.',
    safety: 'DrMuscat is public discovery only. It is not medical advice, booking, payments, diagnosis, emergency triage or a substitute for confirming details directly with providers.'
  },
  ar: {
    title: 'من نحن | DrMuscat',
    description: 'تعرف على DrMuscat، منصة اكتشاف عامة للرعاية الصحية في عُمان للمستخدمين بالعربية والإنجليزية.',
    badge: 'من نحن',
    heading: 'اكتشاف عام للرعاية الصحية والعافية ومعلومات مقدمي الخدمة في عُمان.',
    body: 'يساعد DrMuscat المستخدمين على تصفح مسارات اكتشاف عامة لمقدمي الخدمة في عُمان بالعربية والإنجليزية. صُممت القوائم والمقالات والمسارات العامة لتبقى محافظة ومرتبطة بالمراجعة أثناء نمو المنصة.',
    safety: 'DrMuscat للاكتشاف العام فقط. وليس نصيحة طبية أو حجزاً أو مدفوعات أو تشخيصاً أو فرزاً طارئاً أو بديلاً عن تأكيد التفاصيل مباشرة مع مقدمي الخدمة.'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({ locale, country, pathname: '/about', title: copy.title, description: copy.description });
}

export default async function AboutPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const copy = copyByLocale[safeLocale];
  const dir = localeDirection(safeLocale);

  return (
    <main className="home-foundation dm2026-home-page" dir={dir} data-country={safeCountry} data-locale={safeLocale}>
      <section className="dm2026-container py-16" aria-labelledby="about-title">
        <div className="rounded-[2rem] border border-emerald-900/10 bg-white/80 p-8 shadow-sm md:p-12">
          <span className="dm2026-badge">{copy.badge}</span>
          <h1 id="about-title" className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{copy.heading}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{copy.body}</p>
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{copy.safety}</p>
        </div>
      </section>
    </main>
  );
}
