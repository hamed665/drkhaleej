import Link from 'next/link';
import { publicDiscoveryRoute } from '@/lib/routes/public';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type ProviderPlansProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

type ProviderPlan = {
  name: string;
  purpose: string;
  features: readonly string[];
  note?: string;
};

type ComparisonRow = {
  label: string;
  values: readonly string[];
};

type ProviderPlansCopy = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryCta: string;
  primaryCtaNote: string;
  secondaryCta: string;
  valueTitle: string;
  valueDescription: string;
  valueBullets: readonly string[];
  plansTitle: string;
  plansDescription: string;
  plans: readonly ProviderPlan[];
  comparisonTitle: string;
  comparisonDescription: string;
  comparisonColumns: readonly string[];
  comparisonRows: readonly ComparisonRow[];
  laterLabel: string;
  safetyTitle: string;
  safetyNote: string;
};

const copyByLocale: Record<SupportedLocale, ProviderPlansCopy> = {
  en: {
    eyebrow: 'Provider plans for Oman',
    heroTitle: 'Grow your healthcare visibility in Oman with DrMuscat.',
    heroDescription:
      'Build an SEO-friendly public profile for your center or clinic, show services, doctors, location, approved media, and safe contact options as DrMuscat rolls out provider tools.',
    primaryCta: 'Request provider onboarding',
    primaryCtaNote: 'Manual onboarding is planned for providers. This page does not submit a form or activate a plan.',
    secondaryCta: 'View public center listings',
    valueTitle: 'A safer path to provider visibility',
    valueDescription:
      'DrMuscat is preparing provider listing options that support public discovery while keeping healthcare claims clear, reviewed, and responsible.',
    valueBullets: [
      'SEO-friendly public profile for your center or clinic.',
      'Show center details, services, doctors, and location.',
      'Add approved gallery, logo, and cover media.',
      'Use contact and callback options where public visibility rules allow.',
      'Prepare for future premium and sponsored visibility without medical quality claims.'
    ],
    plansTitle: 'Simple listing options for centers and clinics',
    plansDescription:
      'Plans are presented as static product guidance in this phase. Pricing, activation, and entitlements are not live yet.',
    plans: [
      {
        name: 'Basic',
        purpose: 'Basic public listing foundation.',
        features: [
          'Basic center profile',
          'Category and area',
          'Limited description',
          'Basic services',
          'Public discovery presence when approved'
        ]
      },
      {
        name: 'Plus',
        purpose: 'Richer profile for active centers.',
        features: [
          'Enhanced profile content',
          'Services and location/maps',
          'Approved gallery/logo/cover media',
          'Contact and callback options where approved',
          'Profile completeness support'
        ]
      },
      {
        name: 'Premium',
        purpose: 'Richer visibility package.',
        features: [
          'Premium-looking profile presentation',
          'More complete profile media',
          'Eligibility for future featured placements where implemented',
          'Future analytics/content options'
        ],
        note: 'Featured placements are future eligible placements where implemented, not active priority ranking.'
      },
      {
        name: 'Sponsored',
        purpose: 'Campaign-based visibility.',
        features: [
          'Clearly labeled sponsored placements',
          'Future campaign start/end controls',
          'Future impressions/clicks reporting',
          'Future homepage/category/search placements where implemented'
        ],
        note: 'Sponsored placement is paid visibility, not medical quality ranking.'
      }
    ],
    comparisonTitle: 'Feature comparison',
    comparisonDescription:
      'This comparison explains planned listing value without enabling checkout, subscription activation, or entitlement enforcement.',
    comparisonColumns: ['Basic', 'Plus', 'Premium', 'Sponsored'],
    comparisonRows: [
      { label: 'Public profile page', values: ['Included', 'Included', 'Included', 'Included'] },
      { label: 'Center details and descriptions', values: ['Basic', 'Enhanced', 'Enhanced', 'Campaign-linked'] },
      { label: 'Services list', values: ['Basic', 'Enhanced', 'Enhanced', 'Campaign-linked'] },
      { label: 'Location and directions', values: ['Basic', 'Included', 'Included', 'Campaign-linked'] },
      { label: 'Logo/cover/gallery support', values: ['Limited', 'Approved media', 'More complete media', 'Campaign media later'] },
      { label: 'Contact actions where approved', values: ['Rules-based', 'Rules-based', 'Rules-based', 'Rules-based'] },
      { label: 'Callback requests where approved contact exists', values: ['Not planned', 'Where approved', 'Where approved', 'Where approved'] },
      { label: 'Profile completeness guidance', values: ['Not planned', 'Included', 'Included', 'Included'] },
      { label: 'Future featured eligibility', values: ['No', 'No', 'Where implemented', 'Campaign-specific'] },
      { label: 'Clearly labeled sponsored placements', values: ['No', 'No', 'No', 'Where implemented'] },
      { label: 'Analytics later', values: ['Later', 'Later', 'Later', 'Later'] },
      { label: 'AI FAQ assistant later', values: ['Later', 'Later', 'Later', 'Later'] }
    ],
    laterLabel: 'Later',
    safetyTitle: 'Important safety note',
    safetyNote:
      'DrMuscat is a healthcare discovery platform. Paid plans do not mean medical quality ranking, government approval, or clinical endorsement. Sponsored or featured placements, when available, must be clearly labeled and do not represent medical superiority.'
  },
  ar: {
    eyebrow: 'خطط مقدمي الخدمة في عُمان',
    heroTitle: 'نمِّ ظهور مركزك الصحي في عُمان مع DrMuscat.',
    heroDescription:
      'أنشئ ملفاً عاماً مناسباً لمحركات البحث لمركزك أو عيادتك، واعرض الخدمات والأطباء والموقع والوسائط المعتمدة وخيارات التواصل الآمنة مع تطور أدوات مقدمي الخدمة في DrMuscat.',
    primaryCta: 'طلب الانضمام كمقدم خدمة',
    primaryCtaNote: 'سيتم التعامل مع انضمام مقدمي الخدمة يدوياً. هذه الصفحة لا ترسل نموذجاً ولا تفعّل أي خطة.',
    secondaryCta: 'عرض قوائم المراكز',
    valueTitle: 'مسار أكثر أماناً لظهور مقدمي الخدمة',
    valueDescription:
      'تعمل DrMuscat على إعداد خيارات ظهور لمقدمي الخدمة تدعم الاكتشاف العام مع الحفاظ على وضوح الادعاءات الصحية ومسؤوليتها.',
    valueBullets: [
      'ملف عام مناسب لمحركات البحث لمركزك أو عيادتك.',
      'عرض بيانات المركز والخدمات والأطباء والموقع.',
      'إضافة الصور والشعار وصورة الغلاف المعتمدة.',
      'استخدام خيارات التواصل وطلب الاتصال عند السماح بها وفق قواعد الظهور العامة.',
      'الاستعداد لخيارات ظهور مميزة أو ممولة مستقبلاً دون ادعاءات جودة طبية.'
    ],
    plansTitle: 'خيارات ظهور مبسطة للمراكز والعيادات',
    plansDescription:
      'تُعرض الخطط هنا كإرشاد تسويقي ثابت في هذه المرحلة. الأسعار والتفعيل والاستحقاقات ليست مفعّلة بعد.',
    plans: [
      {
        name: 'الأساسية',
        purpose: 'أساس للقائمة العامة الأساسية.',
        features: ['ملف مركز أساسي', 'الفئة والمنطقة', 'وصف محدود', 'خدمات أساسية', 'ظهور في الاكتشاف العام عند الاعتماد']
      },
      {
        name: 'بلس',
        purpose: 'ملف أكثر ثراءً للمراكز النشطة.',
        features: [
          'محتوى ملف محسّن',
          'الخدمات والموقع/الخرائط',
          'صور وشعار وغلاف معتمدة',
          'خيارات التواصل وطلب الاتصال عند الاعتماد',
          'دعم اكتمال الملف'
        ]
      },
      {
        name: 'المميزة',
        purpose: 'حزمة ظهور أكثر ثراءً.',
        features: [
          'عرض ملف بمظهر مميز',
          'وسائط ملف أكثر اكتمالاً',
          'أهلية لظهور مميز مستقبلي حيث يتم تنفيذه',
          'خيارات تحليلات ومحتوى مستقبلية'
        ],
        note: 'الظهور المميز يعني أهلية مستقبلية حيث يتم التنفيذ، وليس ترتيباً ذا أولوية مفعّلاً حالياً.'
      },
      {
        name: 'الممولة',
        purpose: 'ظهور قائم على الحملات.',
        features: [
          'مواضع ظهور ممولة موضحة بوضوح',
          'تحكم مستقبلي في بداية ونهاية الحملة',
          'تقارير مستقبلية للظهور والنقرات',
          'مواضع مستقبلية في الرئيسية/الفئات/البحث حيث يتم التنفيذ'
        ],
        note: 'الظهور الممول هو ظهور مدفوع، وليس تصنيفاً للجودة الطبية.'
      }
    ],
    comparisonTitle: 'مقارنة الميزات',
    comparisonDescription:
      'توضح هذه المقارنة قيمة الظهور المخطط لها دون تفعيل الدفع أو الاشتراكات أو الاستحقاقات.',
    comparisonColumns: ['الأساسية', 'بلس', 'المميزة', 'الممولة'],
    comparisonRows: [
      { label: 'صفحة ملف عامة', values: ['متضمن', 'متضمن', 'متضمن', 'متضمن'] },
      { label: 'بيانات المركز والأوصاف', values: ['أساسي', 'محسّن', 'محسّن', 'مرتبط بالحملة'] },
      { label: 'قائمة الخدمات', values: ['أساسي', 'محسّن', 'محسّن', 'مرتبط بالحملة'] },
      { label: 'الموقع والاتجاهات', values: ['أساسي', 'متضمن', 'متضمن', 'مرتبط بالحملة'] },
      { label: 'دعم الشعار/الغلاف/الصور', values: ['محدود', 'وسائط معتمدة', 'وسائط أكثر اكتمالاً', 'وسائط حملة لاحقاً'] },
      { label: 'إجراءات التواصل عند الاعتماد', values: ['حسب القواعد', 'حسب القواعد', 'حسب القواعد', 'حسب القواعد'] },
      { label: 'طلبات الاتصال عند توفر تواصل معتمد', values: ['غير مخطط', 'عند الاعتماد', 'عند الاعتماد', 'عند الاعتماد'] },
      { label: 'إرشاد اكتمال الملف', values: ['غير مخطط', 'متضمن', 'متضمن', 'متضمن'] },
      { label: 'أهلية الظهور المميز مستقبلاً', values: ['لا', 'لا', 'حيث يتم التنفيذ', 'خاص بالحملة'] },
      { label: 'مواضع ممولة موضحة بوضوح', values: ['لا', 'لا', 'لا', 'حيث يتم التنفيذ'] },
      { label: 'التحليلات لاحقاً', values: ['لاحقاً', 'لاحقاً', 'لاحقاً', 'لاحقاً'] },
      { label: 'مساعد أسئلة AI لاحقاً', values: ['لاحقاً', 'لاحقاً', 'لاحقاً', 'لاحقاً'] }
    ],
    laterLabel: 'لاحقاً',
    safetyTitle: 'ملاحظة أمان مهمة',
    safetyNote:
      'DrMuscat منصة لاكتشاف خدمات الرعاية الصحية. الخطط المدفوعة لا تعني تصنيفاً للجودة الطبية أو اعتماداً حكومياً أو توصية علاجية. أي ظهور ممول أو مميز عند توفره يجب أن يكون موضحاً ولا يعني تفوقاً طبياً.'
  }
};

const sectionClassName = 'mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8';
const cardClassName = 'rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm';

export function PublicProviderPlans({ locale, country, dir }: ProviderPlansProps) {
  const copy = copyByLocale[locale];
  const centerListingsHref = publicDiscoveryRoute(locale, country, 'centers');

  return (
    <main className="bg-slate-50 text-slate-950" dir={dir}>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-cyan-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.2),transparent_35%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
          <div>
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-sm backdrop-blur">
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{copy.heroTitle}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">{copy.heroDescription}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-950/20 sm:w-auto">
                {copy.primaryCta}
              </span>
              <Link
                href={centerListingsHref}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15 sm:w-auto"
              >
                {copy.secondaryCta}
              </Link>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200">{copy.primaryCtaNote}</p>
          </div>
          <aside className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
            <h2 className="text-xl font-bold text-white">{copy.valueTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-100">{copy.valueDescription}</p>
            <ul className="mt-6 space-y-3">
              {copy.valueBullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-sm leading-6 text-slate-50">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-xs font-black text-emerald-950">
                    ✓
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">{copy.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{copy.plansTitle}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{copy.plansDescription}</p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {copy.plans.map((plan) => (
            <article key={plan.name} className={`${cardClassName} flex h-full flex-col`}>
              <h3 className="text-xl font-bold text-slate-950">{plan.name}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-emerald-800">{plan.purpose}</p>
              <ul className="mt-5 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.note ? (
                <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-900">
                  {plan.note}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClassName}>
        <div className={cardClassName}>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{copy.comparisonTitle}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{copy.comparisonDescription}</p>
          </div>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-start text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white/95 px-4 py-3 text-start font-bold text-slate-900 rtl:left-auto rtl:right-0">
                    {copy.comparisonTitle}
                  </th>
                  {copy.comparisonColumns.map((column) => (
                    <th key={column} className="px-4 py-3 text-start font-bold text-slate-900">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copy.comparisonRows.map((row) => (
                  <tr key={row.label} className="border-t border-slate-100">
                    <th className="sticky left-0 border-t border-slate-100 bg-white/95 px-4 py-4 text-start font-semibold text-slate-800 rtl:left-auto rtl:right-0">
                      {row.label}
                    </th>
                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${copy.comparisonColumns[index]}`} className="border-t border-slate-100 px-4 py-4 text-slate-600">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={`${sectionClassName} pt-0`}>
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-emerald-950">{copy.safetyTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-emerald-900 sm:text-base">{copy.safetyNote}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm sm:w-auto">
              {copy.primaryCta}
            </span>
            <Link
              href={centerListingsHref}
              className="inline-flex w-full items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100 sm:w-auto"
            >
              {copy.secondaryCta}
            </Link>
          </div>
          <p className="mt-4 text-sm leading-6 text-emerald-900">{copy.primaryCtaNote}</p>
        </div>
      </section>
    </main>
  );
}
