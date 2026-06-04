import Link from 'next/link';

import { LocationFields2026 } from '@/components/public-2026/forms/LocationFields2026';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicProviderRoute } from '@/lib/routes/public';

type ListYourCenterPage2026Props = {
  locale: SupportedLocale;
  country: SupportedCountry;
};

const listingCopy = {
  en: {
    title: 'List your center on DrMuscat',
    lead: 'Request a reviewed public listing for a clinic, pharmacy, lab, wellness provider, beauty clinic, dental clinic, pet clinic, or other healthcare-related service in Oman.',
    providerType: 'Provider type',
    name: 'Center / provider name',
    contact: 'Contact person',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    email: 'Email (optional)',
    country: 'Country',
    city: 'City',
    area: 'Area',
    allAreas: 'All areas',
    checkbox: 'I confirm I am authorized to request or claim this listing.',
    submit: 'Request listing review',
    reviewNote: 'Listings are reviewed before public display. No ratings, reviews, or medical claims are added from this form.',
    providersLink: 'See provider options',
    stepsTitle: 'How listing works',
    steps: ['Submit essential details', 'DrMuscat reviews the listing', 'Approved public information can be displayed', 'Growth and featured placement options remain placeholders until approved'],
    faqTitle: 'Listing request FAQ',
    faqs: [['Does submission guarantee public display?', 'No. Listings are reviewed before public display.'], ['Can I claim an existing profile?', 'Use the authorization confirmation and provide accurate contact details.'], ['Are ratings added from this form?', 'No. Ratings, reviews, and medical claims are not added from this form.'], ['How should I correct information?', 'Submit accurate details or contact DrMuscat support for review.']],
    types: ['Clinic / medical center', 'Doctor', 'Pharmacy', 'Laboratory', 'Dental clinic', 'Beauty / wellness', 'Pet clinic', 'Other healthcare-related service'],
  },
  ar: {
    title: 'أدرج مركزك في دكتور مسقط',
    lead: 'اطلب إدراجًا عامًا تتم مراجعته لعيادة أو صيدلية أو مختبر أو مقدم عافية أو عيادة تجميل أو أسنان أو عيادة بيطرية أو خدمة صحية مرتبطة في عُمان.',
    providerType: 'نوع مقدم الرعاية',
    name: 'اسم المركز / مقدم الخدمة',
    contact: 'الشخص المسؤول',
    phone: 'الهاتف',
    whatsapp: 'واتساب',
    email: 'البريد الإلكتروني (اختياري)',
    country: 'الدولة',
    city: 'المدينة',
    area: 'المنطقة',
    allAreas: 'كل المناطق',
    checkbox: 'أؤكد أنني مخول بطلب أو مطالبة هذا الإدراج.',
    submit: 'طلب مراجعة الإدراج',
    reviewNote: 'تتم مراجعة الملفات قبل عرضها للعامة. لا تتم إضافة تقييمات أو مراجعات أو ادعاءات طبية من هذا النموذج.',
    providersLink: 'اطلع على خيارات مقدمي الرعاية',
    stepsTitle: 'كيف يعمل الإدراج',
    steps: ['إرسال التفاصيل الأساسية', 'يراجع دكتور مسقط الإدراج', 'يمكن عرض المعلومات العامة المعتمدة', 'تبقى خيارات النمو والظهور المميز كعناصر تمهيدية حتى اعتمادها'],
    faqTitle: 'أسئلة طلب الإدراج',
    faqs: [['هل يضمن الإرسال العرض العام؟', 'لا. تتم مراجعة الإدراجات قبل عرضها للعامة.'], ['هل يمكنني المطالبة بملف موجود؟', 'استخدم تأكيد التفويض وقدم بيانات تواصل دقيقة.'], ['هل تتم إضافة تقييمات من هذا النموذج؟', 'لا. لا تتم إضافة تقييمات أو مراجعات أو ادعاءات طبية من هذا النموذج.'], ['كيف أصحح المعلومات؟', 'أرسل تفاصيل دقيقة أو تواصل مع دعم دكتور مسقط للمراجعة.']],
    types: ['عيادة / مركز طبي', 'طبيب', 'صيدلية', 'مختبر', 'عيادة أسنان', 'تجميل / عافية', 'عيادة بيطرية', 'خدمة صحية مرتبطة أخرى'],
  },
} as const;

export function ListYourCenterPage2026({ locale, country }: ListYourCenterPage2026Props) {
  const copy = listingCopy[locale];

  return (
    <main className="dm2026-page dm2026-listing-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <section className="dm2026-listing-shell" aria-labelledby="dm2026-listing-title">
        <div className="dm2026-listing-intro">
          <p className="dm2026-eyebrow">DrMuscat</p>
          <h1 id="dm2026-listing-title">{copy.title}</h1>
          <p>{copy.lead}</p>
          <Link className="dm2026-inline-cta" href={publicProviderRoute(locale, country)}>{copy.providersLink}</Link>
          <div className="dm2026-steps-card">
            <h2>{copy.stepsTitle}</h2>
            <ol>
              {copy.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
        <form className="dm2026-form dm2026-listing-form" action="#">
          <label className="dm2026-form-field">
            <span>{copy.providerType}</span>
            <select>
              {copy.types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="dm2026-form-field">
            <span>{copy.name}</span>
            <input type="text" placeholder={copy.name} />
          </label>
          <LocationFields2026 locale={locale} labels={{ country: copy.country, city: copy.city, area: copy.area, allAreas: copy.allAreas }} />
          <div className="dm2026-form-grid">
            <label className="dm2026-form-field">
              <span>{copy.contact}</span>
              <input type="text" placeholder={copy.contact} />
            </label>
            <label className="dm2026-form-field">
              <span>{copy.phone}</span>
              <input type="tel" placeholder={copy.phone} />
            </label>
            <label className="dm2026-form-field">
              <span>{copy.whatsapp}</span>
              <input type="tel" placeholder={copy.whatsapp} />
            </label>
            <label className="dm2026-form-field">
              <span>{copy.email}</span>
              <input type="email" placeholder={copy.email} />
            </label>
          </div>
          <label className="dm2026-checkbox-row">
            <input type="checkbox" />
            <span>{copy.checkbox}</span>
          </label>
          <button className="dm2026-submit" type="button">{copy.submit}</button>
          <p className="dm2026-disclaimer-note">{copy.reviewNote}</p>
        </form>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-14"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-bold text-slate-950">{copy.faqTitle}</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{copy.faqs.map(([question, answer]) => <details key={question} className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer font-bold text-slate-950">{question}</summary><p className="mt-2 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></div></section>
    </main>
  );
}
