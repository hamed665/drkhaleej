'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { SupportedCountry } from '@/lib/i18n/config';
import type { PublicCatalogLocale, PublicCatalogQueryResult, PublicDoctorSummary } from '@/lib/catalog/public-types';

type DoctorsPage2026Props = {
  locale: PublicCatalogLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
  result: PublicCatalogQueryResult<PublicDoctorSummary[]>;
};

type DoctorsPageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  searchEyebrow: string;
  searchTitle: string;
  searchDescription: string;
  searchPlaceholder: string;
  specialtyLabel: string;
  cityLabel: string;
  resultLabel: string;
  resetLabel: string;
  profileCta: string;
  profileNote: string;
  emptyTitle: string;
  emptyBody: string;
  noSearchTitle: string;
  noSearchBody: string;
  errorTitle: string;
  errorBody: string;
  sponsoredEyebrow: string;
  sponsoredTitle: string;
  sponsoredBody: string;
  sponsoredBadge: string;
  offersEyebrow: string;
  offersTitle: string;
  offersBody: string;
  articlesEyebrow: string;
  articlesTitle: string;
  articlesBody: string;
  readArticle: string;
  faqEyebrow: string;
  faqTitle: string;
  trustTitle: string;
  trustItems: readonly string[];
  safetyNote: string;
  specialties: readonly string[];
  cities: readonly string[];
  articles: readonly {
    slug: string;
    category: string;
    title: string;
    body: string;
  }[];
  faqs: readonly {
    question: string;
    answer: string;
  }[];
};

const doctorsPageCopy: Record<PublicCatalogLocale, DoctorsPageCopy> = {
  en: {
    eyebrow: 'Doctor discovery · Oman',
    title: 'Find doctors in Oman with a cleaner, calmer search experience.',
    description:
      'Browse public doctor listings, search by name or title, and use guided filters prepared for specialties, cities, articles, ads, and approved offers as the directory grows.',
    primaryCta: 'Search doctors',
    secondaryCta: 'For providers',
    searchEyebrow: 'Doctor search',
    searchTitle: 'Search the doctor list from one premium panel.',
    searchDescription:
      'This page filters the currently published public doctor list. Specialty, area, availability, and contact filters can become data-backed in later approved phases.',
    searchPlaceholder: 'Search doctor name, title, specialty, or city…',
    specialtyLabel: 'Popular specialty paths',
    cityLabel: 'Oman city paths',
    resultLabel: 'doctor results',
    resetLabel: 'Reset search',
    profileCta: 'View profile',
    profileNote: 'Public profile route. Confirm details directly with the provider.',
    emptyTitle: 'No public doctors are published yet.',
    emptyBody:
      'The page is ready for approved doctor listings. Draft, private, or unapproved doctors are intentionally not shown here.',
    noSearchTitle: 'No doctors match this search yet.',
    noSearchBody: 'Try another name or browse the visible list. This search stays honest instead of inventing doctors, a rare hobby among software products.',
    errorTitle: 'Doctor listings could not be loaded.',
    errorBody: 'Please try again later. Public discovery data is protected and will not be guessed from unavailable records.',
    sponsoredEyebrow: 'Sponsored visibility',
    sponsoredTitle: 'Featured doctor and clinic placements will live here.',
    sponsoredBody:
      'This slot is prepared for clearly labeled sponsored placements after approval. No fake promoted doctors, no fake rankings, no confetti pretending to be trust.',
    sponsoredBadge: 'Ad slot prepared',
    offersEyebrow: 'Special offers',
    offersTitle: 'Approved consultation and care offers can appear here.',
    offersBody:
      'Offer cards are intentionally placeholders until the official offers workflow, review status, and public rendering rules are approved.',
    articlesEyebrow: 'Guides for choosing care',
    articlesTitle: 'Helpful articles can support the doctor search journey.',
    articlesBody: 'Editorial cards link to the existing article shell and stay informational, not medical advice.',
    readArticle: 'Read guide',
    faqEyebrow: 'Doctors FAQ',
    faqTitle: 'Useful answers before contacting a provider',
    trustTitle: 'Discovery safety',
    trustItems: ['Public discovery only', 'No medical advice', 'No fake ratings', 'Provider details must be confirmed directly'],
    safetyNote:
      'DrMuscat helps people discover public care options. It does not diagnose, prescribe, rank doctors medically, or replace a qualified healthcare professional.',
    specialties: ['Pediatrics', 'Dermatology', 'Dentistry', 'Gynecology', 'ENT', 'Orthopedics', 'General Practice', 'Cardiology'],
    cities: ['Muscat', 'Seeb', 'Bawshar', 'Muttrah', 'Salalah', 'Sohar', 'Nizwa', 'Sur'],
    articles: [
      {
        slug: 'how-to-choose-a-dental-clinic-in-muscat',
        category: 'Dental',
        title: 'How to choose a dental clinic in Muscat',
        body: 'A practical guide format for comparing clinic information, location, services, and questions to ask before booking.'
      },
      {
        slug: 'what-to-check-before-booking-dermatology',
        category: 'Dermatology',
        title: 'What to check before booking dermatology',
        body: 'A clear guide format for preparing for a dermatology consultation and reviewing provider information.'
      },
      {
        slug: 'understanding-clinic-services-in-oman',
        category: 'Clinics',
        title: 'Understanding clinic services in Oman',
        body: 'A service explainer for understanding clinic pages, service details, and practical care options.'
      }
    ],
    faqs: [
      {
        question: 'Can I book a doctor directly on DrMuscat?',
        answer:
          'Not yet. This page is a public discovery surface. Booking, appointments, and provider dashboards remain separate future phases.'
      },
      {
        question: 'Are these doctor listings medical advice?',
        answer:
          'No. Listings help users discover public information. Medical decisions should be confirmed with a qualified healthcare professional.'
      },
      {
        question: 'Will sponsored doctors be mixed with organic results?',
        answer:
          'Sponsored placements should remain clearly labeled and visually separated. The current slot is only a prepared UI placeholder.'
      },
      {
        question: 'Can clinics update doctor information?',
        answer:
          'Provider-side editing is not active yet. Admin-controlled workflows and approval gates should come before public provider mutations.'
      }
    ]
  },
  ar: {
    eyebrow: 'اكتشاف الأطباء · عُمان',
    title: 'ابحث عن أطباء في عُمان بتجربة بحث أوضح وأكثر هدوءاً.',
    description:
      'تصفح قوائم الأطباء العامة، وابحث بالاسم أو اللقب، مع فلاتر جاهزة للتخصصات والمدن والمقالات والإعلانات والعروض المعتمدة مع نمو الدليل.',
    primaryCta: 'ابحث عن الأطباء',
    secondaryCta: 'للمقدّمين',
    searchEyebrow: 'بحث الأطباء',
    searchTitle: 'ابحث في قائمة الأطباء من لوحة واحدة مميزة.',
    searchDescription:
      'تقوم هذه الصفحة بتصفية قائمة الأطباء العامة المنشورة حالياً. يمكن تحويل فلاتر التخصص والمنطقة والتوفر والتواصل إلى بيانات فعلية في مراحل لاحقة معتمدة.',
    searchPlaceholder: 'ابحث باسم الطبيب أو اللقب أو التخصص أو المدينة…',
    specialtyLabel: 'مسارات تخصص شائعة',
    cityLabel: 'مسارات مدن عُمان',
    resultLabel: 'نتائج الأطباء',
    resetLabel: 'إعادة البحث',
    profileCta: 'عرض الملف',
    profileNote: 'مسار ملف عام. يرجى تأكيد التفاصيل مباشرة مع مقدّم الخدمة.',
    emptyTitle: 'لا توجد قوائم أطباء عامة منشورة بعد.',
    emptyBody: 'الصفحة جاهزة لقوائم الأطباء المعتمدة. الأطباء غير المعتمدين أو الخاصين لا يظهرون هنا عمداً.',
    noSearchTitle: 'لا توجد نتائج مطابقة لهذا البحث حالياً.',
    noSearchBody: 'جرّب اسماً آخر أو تصفح القائمة الحالية. البحث هنا لا يخترع أطباء من العدم، وهي معجزة صغيرة في عالم البرمجيات.',
    errorTitle: 'تعذر تحميل قوائم الأطباء.',
    errorBody: 'يرجى المحاولة لاحقاً. بيانات الاكتشاف العامة محمية ولا يتم تخمينها عند عدم توفر السجلات.',
    sponsoredEyebrow: 'ظهور ممول',
    sponsoredTitle: 'ستظهر هنا مساحات مميزة للأطباء والعيادات.',
    sponsoredBody:
      'هذه المساحة جاهزة لظهور إعلانات واضحة بعد الموافقة. لا توجد أطباء مروّجون وهميون ولا تقييمات مخترعة.',
    sponsoredBadge: 'مساحة إعلان جاهزة',
    offersEyebrow: 'عروض خاصة',
    offersTitle: 'يمكن أن تظهر هنا عروض استشارة ورعاية معتمدة.',
    offersBody:
      'بطاقات العروض تبقى مؤقتة حتى اعتماد نظام العروض والمراجعة وقواعد العرض العام.',
    articlesEyebrow: 'أدلة لاختيار الرعاية',
    articlesTitle: 'يمكن للمقالات أن تدعم رحلة البحث عن الطبيب.',
    articlesBody: 'ترتبط البطاقات التحريرية بمسار المقالات الحالي وتبقى معلوماتية وليست نصيحة طبية.',
    readArticle: 'اقرأ الدليل',
    faqEyebrow: 'أسئلة الأطباء',
    faqTitle: 'إجابات مفيدة قبل التواصل مع مقدم الخدمة',
    trustTitle: 'سلامة الاكتشاف',
    trustItems: ['اكتشاف عام فقط', 'ليست نصيحة طبية', 'لا توجد تقييمات وهمية', 'يجب تأكيد التفاصيل مباشرة مع مقدم الخدمة'],
    safetyNote:
      'يساعد DrMuscat الناس على اكتشاف خيارات الرعاية العامة. لا يقوم بالتشخيص أو وصف العلاج أو ترتيب الأطباء طبياً ولا يغني عن المختص الصحي المؤهل.',
    specialties: ['طب الأطفال', 'جلدية', 'أسنان', 'نساء وولادة', 'أنف وأذن وحنجرة', 'عظام', 'طب عام', 'قلب'],
    cities: ['مسقط', 'السيب', 'بوشر', 'مطرح', 'صلالة', 'صحار', 'نزوى', 'صور'],
    articles: [
      {
        slug: 'how-to-choose-a-dental-clinic-in-muscat',
        category: 'الأسنان',
        title: 'كيف تختار عيادة أسنان في مسقط',
        body: 'صيغة دليل عملية لمقارنة معلومات العيادات والموقع والخدمات والأسئلة قبل الحجز.'
      },
      {
        slug: 'what-to-check-before-booking-dermatology',
        category: 'الجلدية',
        title: 'ما الذي تتحقق منه قبل حجز استشارة جلدية',
        body: 'صيغة واضحة للتحضير لاستشارة جلدية ومراجعة معلومات مقدم الخدمة.'
      },
      {
        slug: 'understanding-clinic-services-in-oman',
        category: 'العيادات',
        title: 'فهم خدمات العيادات في عُمان',
        body: 'شرح مبسط لفهم صفحات العيادات وتفاصيل الخدمات وخيارات الرعاية العملية.'
      }
    ],
    faqs: [
      {
        question: 'هل يمكنني حجز طبيب مباشرة عبر DrMuscat؟',
        answer: 'ليس بعد. هذه الصفحة مخصصة للاكتشاف العام. الحجز والمواعيد ولوحات مقدمي الخدمة تبقى مراحل مستقبلية منفصلة.'
      },
      {
        question: 'هل قوائم الأطباء تعتبر نصيحة طبية؟',
        answer: 'لا. القوائم تساعد المستخدم على اكتشاف معلومات عامة. يجب تأكيد القرارات الطبية مع مختص صحي مؤهل.'
      },
      {
        question: 'هل سيتم خلط الأطباء الممولين مع النتائج العادية؟',
        answer: 'يجب أن تبقى المساحات الممولة واضحة ومفصولة بصرياً. المساحة الحالية مجرد واجهة جاهزة فقط.'
      },
      {
        question: 'هل يمكن للعيادات تحديث معلومات الأطباء؟',
        answer: 'تعديل مقدمي الخدمة غير مفعل بعد. يجب أن تسبق ذلك مراحل إدارة ومراجعة واعتماد واضحة.'
      }
    ]
  }
};

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatNeutralLabel(value: string): string {
  return value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
}

function preferredText(locale: PublicCatalogLocale, en: string | null, ar: string | null): string {
  if (locale === 'ar') return ar ?? en ?? '';
  return en ?? ar ?? '';
}

function doctorSearchBlob(doctor: PublicDoctorSummary): string {
  return [doctor.fullNameEn, doctor.fullNameAr ?? '', doctor.titleEn, doctor.titleAr, doctor.gender, doctor.defaultCountry]
    .join(' ')
    .toLowerCase();
}

function StethoscopeMotionSvg({ dir }: { dir: 'ltr' | 'rtl' }) {
  const transform = dir === 'rtl' ? 'scale(-1 1) translate(-420 0)' : undefined;

  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 420 320" role="img">
      <defs>
        <linearGradient id="doctor-hero-metal" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="doctor-hero-tube" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#020617" />
          <stop offset="0.55" stopColor="#111827" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
        <radialGradient id="doctor-hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#a7f3d0" stopOpacity="0.85" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <filter id="doctor-hero-shadow" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" floodColor="#0f172a" floodOpacity="0.18" stdDeviation="16" />
        </filter>
      </defs>
      <g transform={transform}>
        <circle cx="218" cy="168" fill="url(#doctor-hero-glow)" opacity="0.65" r="132">
          <animate attributeName="r" dur="7s" repeatCount="indefinite" values="126;142;126" />
          <animate attributeName="opacity" dur="7s" repeatCount="indefinite" values="0.5;0.78;0.5" />
        </circle>
        <g filter="url(#doctor-hero-shadow)">
          <path
            d="M80 166C42 118 82 54 158 64c64 8 88 52 70 88-20 40-93 39-114 10-18-25 6-58 58-54 84 7 132 54 122 104-10 53-83 75-139 42"
            fill="none"
            stroke="url(#doctor-hero-tube)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="18"
          >
            <animate attributeName="stroke-opacity" dur="6s" repeatCount="indefinite" values="0.88;1;0.88" />
          </path>
          <path
            d="M228 116c36-36 88-42 124-10 34 30 31 78 5 107"
            fill="none"
            stroke="url(#doctor-hero-metal)"
            strokeLinecap="round"
            strokeWidth="10"
          />
          <path d="M238 132c31-28 72-31 101-5 27 24 24 59 4 83" fill="none" stroke="#f8fafc" strokeLinecap="round" strokeOpacity="0.9" strokeWidth="3" />
          <g>
            <animateTransform attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="0 0;0 -4;0 0" />
            <circle cx="248" cy="221" fill="#e0f2fe" r="54" />
            <circle cx="248" cy="221" fill="url(#doctor-hero-metal)" r="40" />
            <circle cx="248" cy="221" fill="#f8fafc" r="25" />
            <circle cx="248" cy="221" fill="#0f172a" r="5" />
            <path d="M208 203l-42-22" fill="none" stroke="url(#doctor-hero-metal)" strokeLinecap="round" strokeWidth="12" />
            <path d="M165 181h-44" fill="none" stroke="url(#doctor-hero-tube)" strokeLinecap="round" strokeWidth="18" />
          </g>
          <circle cx="355" cy="103" fill="#020617" r="14" />
          <circle cx="357" cy="213" fill="#020617" r="14" />
        </g>
        <path d="M40 248c58 30 128 42 218 20" fill="none" stroke="#bae6fd" strokeDasharray="4 12" strokeLinecap="round" strokeWidth="3">
          <animate attributeName="stroke-dashoffset" dur="8s" repeatCount="indefinite" values="0;64" />
        </path>
      </g>
    </svg>
  );
}

function DoctorAvatarSvg({ index }: { index: number }) {
  const gradientId = `doctor-avatar-gradient-${index}`;

  return (
    <svg aria-hidden="true" className="h-16 w-16 shrink-0" viewBox="0 0 80 80">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ccfbf1" />
          <stop offset="0.45" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
      <rect fill={`url(#${gradientId})`} height="78" rx="26" width="78" x="1" y="1" />
      <circle cx="40" cy="31" fill="#0f172a" opacity="0.88" r="12" />
      <path d="M20 64c4-14 14-22 20-22s16 8 20 22" fill="#0f172a" opacity="0.82" />
      <path d="M17 18c9-9 20-12 33-8" fill="none" stroke="#14b8a6" strokeLinecap="round" strokeWidth="4" />
      <path d="M59 21c5 5 8 11 9 19" fill="none" stroke="#f59e0b" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

function PremiumSection({
  eyebrow,
  title,
  body,
  children
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-5 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
        {body ? <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{body}</p> : null}
      </div>
      {children}
    </section>
  );
}

function StatePanel({ title, body, tone = 'neutral' }: { title: string; body: string; tone?: 'neutral' | 'error' }) {
  const toneClass = tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-950' : 'border-slate-200 bg-white/85 text-slate-900';

  return (
    <div className={`rounded-[2rem] border p-7 shadow-sm ${toneClass}`}>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 opacity-80">{body}</p>
    </div>
  );
}

function DoctorCard2026({
  doctor,
  index,
  locale,
  country,
  copy
}: {
  doctor: PublicDoctorSummary;
  index: number;
  locale: PublicCatalogLocale;
  country: SupportedCountry;
  copy: DoctorsPageCopy;
}) {
  const name = preferredText(locale, doctor.fullNameEn, doctor.fullNameAr);
  const title = formatNeutralLabel(doctor.titleEn);
  const href = `/${locale}/${country}/doctor/${doctor.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_110px_rgba(15,23,42,0.14)]">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-100/60 blur-2xl transition group-hover:bg-sky-100" />
      <div className="relative flex items-start gap-4">
        <DoctorAvatarSvg index={index} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{title}</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-7 text-slate-950">{name}</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{doctor.defaultCountry.toUpperCase()}</span>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-800">{formatNeutralLabel(doctor.gender)}</span>
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-600">{copy.profileNote}</p>
      <Link
        className="mt-auto inline-flex w-fit items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-teal-700"
        href={href}
      >
        {copy.profileCta}
      </Link>
    </article>
  );
}

export function DoctorsPage2026({ locale, country, dir, result }: DoctorsPage2026Props) {
  const copy = doctorsPageCopy[locale];
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const doctors = useMemo(() => (result.ok ? result.data : []), [result]);
  const normalizedQuery = normalizeSearchText(query);
  const filteredDoctors = useMemo(() => {
    if (!normalizedQuery) return doctors;
    return doctors.filter((doctor) => doctorSearchBlob(doctor).includes(normalizedQuery));
  }, [doctors, normalizedQuery]);
  const doctorCount = result.ok ? doctors.length : 0;
  const visibleCount = result.ok ? filteredDoctors.length : 0;

  const activateChip = (label: string) => {
    setActiveChip(label);
    setQuery(label);
  };

  const resetSearch = () => {
    setQuery('');
    setActiveChip(null);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dff7f3_0,#eef8ff_28%,#f8fafc_58%,#ffffff_100%)]" dir={dir}>
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="absolute left-10 top-16 h-36 w-36 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute right-10 top-32 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="rounded-[2.5rem] border border-white/80 bg-white/75 p-6 shadow-[0_32px_120px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/60 backdrop-blur sm:p-8 lg:p-10">
            <p className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-teal-800">
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{copy.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full bg-teal-700 px-5 py-3 text-sm font-black text-white shadow-xl shadow-teal-900/15 transition hover:bg-teal-800" href="#doctor-search">
                {copy.primaryCta}
              </a>
              <Link className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-teal-200 hover:text-teal-800" href={`/${locale}/${country}/for-providers`}>
                {copy.secondaryCta}
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {copy.trustItems.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm font-bold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[340px] rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-white/70 via-sky-50/80 to-teal-50/70 p-4 shadow-[0_32px_120px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/60 backdrop-blur sm:p-6">
            <StethoscopeMotionSvg dir={dir} />
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-4 shadow-lg backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{copy.trustTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy.safetyNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="doctor-search" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.25rem] border border-white/80 bg-white/85 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/60 backdrop-blur sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-700">{copy.searchEyebrow}</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{copy.searchTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{copy.searchDescription}</p>
            </div>
            <form
              className="rounded-[1.8rem] border border-slate-200 bg-slate-50/80 p-3 shadow-inner"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="sr-only" htmlFor="doctor-list-search">
                {copy.searchPlaceholder}
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="min-h-14 flex-1 rounded-2xl border border-white bg-white px-4 text-base font-semibold text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-teal-200 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.12)]"
                  id="doctor-list-search"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveChip(null);
                  }}
                  placeholder={copy.searchPlaceholder}
                  type="search"
                  value={query}
                />
                <button className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-teal-700" type="submit">
                  {copy.primaryCta}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">{copy.specialtyLabel}</p>
              <div className="flex flex-wrap gap-2">
                {copy.specialties.map((specialty) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeChip === specialty ? 'border-teal-600 bg-teal-700 text-white shadow-lg shadow-teal-900/15' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-800'}`}
                    key={specialty}
                    onClick={() => activateChip(specialty)}
                    type="button"
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">{copy.cityLabel}</p>
              <div className="flex flex-wrap gap-2">
                {copy.cities.map((city) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeChip === city ? 'border-sky-600 bg-sky-700 text-white shadow-lg shadow-sky-900/15' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:text-sky-800'}`}
                    key={city}
                    onClick={() => activateChip(city)}
                    type="button"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
            <p>
              <span className="font-black text-slate-950">{visibleCount}</span> / {doctorCount} {copy.resultLabel}
            </p>
            <button className="font-black text-teal-700 transition hover:text-teal-900" onClick={resetSearch} type="button">
              {copy.resetLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {!result.ok ? <StatePanel body={copy.errorBody} title={copy.errorTitle} tone="error" /> : null}
        {result.ok && doctors.length === 0 ? <StatePanel body={copy.emptyBody} title={copy.emptyTitle} /> : null}
        {result.ok && doctors.length > 0 && filteredDoctors.length === 0 ? <StatePanel body={copy.noSearchBody} title={copy.noSearchTitle} /> : null}
        {result.ok && filteredDoctors.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
            {filteredDoctors.map((doctor, index) => (
              <li className="min-w-0" key={doctor.id}>
                <DoctorCard2026 copy={copy} country={country} doctor={doctor} index={index} locale={locale} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <PremiumSection body={copy.sponsoredBody} eyebrow={copy.sponsoredEyebrow} title={copy.sponsoredTitle}>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-teal-50 p-6 shadow-sm">
            <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-800">{copy.sponsoredBadge}</p>
            <h3 className="mt-5 text-2xl font-black text-slate-950">{copy.sponsoredTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{copy.sponsoredBody}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['Top doctor placement', 'Clinic campaign card'].map((label) => (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-5" key={label}>
                <div className="h-24 rounded-[1.5rem] bg-gradient-to-br from-slate-100 via-teal-50 to-sky-50" />
                <p className="mt-4 text-sm font-black text-slate-800">{label}</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">Clearly labeled placement slot. No live promotion in this phase.</p>
              </div>
            ))}
          </div>
        </div>
      </PremiumSection>

      <PremiumSection body={copy.offersBody} eyebrow={copy.offersEyebrow} title={copy.offersTitle}>
        <div className="grid gap-4 md:grid-cols-3">
          {['Consultation offer', 'Dental checkup', 'Skin clinic package'].map((label) => (
            <div className="relative overflow-hidden rounded-[2rem] border border-teal-100 bg-white/85 p-5 shadow-sm" key={label}>
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-teal-100 blur-2xl" />
              <p className="relative text-xs font-black uppercase tracking-[0.18em] text-teal-700">Prepared offer slot</p>
              <h3 className="relative mt-4 text-xl font-black text-slate-950">{label}</h3>
              <p className="relative mt-3 text-sm leading-7 text-slate-600">Approved provider offers can appear here after review and public rendering rules.</p>
            </div>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection body={copy.articlesBody} eyebrow={copy.articlesEyebrow} title={copy.articlesTitle}>
        <div className="grid gap-5 md:grid-cols-3">
          {copy.articles.map((article) => (
            <Link
              className="group rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
              href={`/${locale}/${country}/articles/${article.slug}`}
              key={article.slug}
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{article.category}</p>
              <h3 className="mt-4 text-xl font-black leading-7 text-slate-950">{article.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{article.body}</p>
              <p className="mt-5 text-sm font-black text-teal-700 transition group-hover:text-teal-900">{copy.readArticle}</p>
            </Link>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow={copy.faqEyebrow} title={copy.faqTitle}>
        <div className="grid gap-4 lg:grid-cols-2">
          {copy.faqs.map((faq) => (
            <details className="group rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-sm open:border-teal-200" key={faq.question}>
              <summary className="cursor-pointer list-none text-base font-black text-slate-950">
                {faq.question}
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </PremiumSection>

      <section className="mx-auto mt-10 w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_30px_100px_rgba(15,23,42,0.22)]">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-200">{copy.trustTitle}</p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-200">{copy.safetyNote}</p>
        </div>
      </section>
    </main>
  );
}
