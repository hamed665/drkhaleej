import Link from 'next/link';
import { headers } from 'next/headers';
import { LanguageSwitch } from '@/components/layout/language-switch';
import { Container } from '@/components/ui/container';
import { isSupportedLocale, localeDirection, SupportedLocale } from '@/lib/i18n/config';
import {
  homeRoute,
  publicArticlesRoute,
  publicDiscoveryRoute,
  publicListYourCenterRoute,
  publicProviderRoute,
} from '@/lib/routes/public';

type FooterColumn = { title: string; items: readonly { label: string; href?: string }[] };

const footerCopy: Record<
  SupportedLocale,
  {
    brand: string;
    tagline: string;
    navLabel: string;
    discover: string;
    providers: string;
    support: string;
    about: string;
    home: string;
    doctors: string;
    centers: string;
    pharmacies: string;
    labs: string;
    services: string;
    search: string;
    articles: string;
    forProviders: string;
    signIn: string;
    register: string;
    listYourCenter: string;
    whatsappHelp: string;
    faq: string;
    reportIssue: string;
    suggestEdit: string;
    aboutDrMuscat: string;
    privacy: string;
    terms: string;
    disclaimerLabel: string;
    pricingPlans: string;
    profileUpdate: string;
    aboutText: string;
    utility: string;
    switchLabel: string;
    localeSwitch: string;
  }
> = {
  en: {
    brand: 'DrMuscat',
    tagline: 'A healthcare discovery directory for doctors, clinics, pharmacies, labs, and healthcare services in Oman.',
    navLabel: 'Footer public navigation',
    discover: 'Discover',
    providers: 'For Providers',
    support: 'Support',
    about: 'About',
    home: 'Home',
    doctors: 'Doctors',
    centers: 'Centers',
    pharmacies: 'Pharmacies',
    labs: 'Labs',
    services: 'Services',
    search: 'Search',
    articles: 'Articles',
    forProviders: 'For Providers',
    signIn: 'Sign in',
    register: 'Create account',
    listYourCenter: 'List your center',
    whatsappHelp: 'WhatsApp support',
    faq: 'FAQ',
    reportIssue: 'Report an issue',
    suggestEdit: 'Suggest an edit',
    aboutDrMuscat: 'About DrMuscat',
    privacy: 'Privacy policy',
    terms: 'Terms',
    disclaimerLabel: 'Disclaimer',
    pricingPlans: 'Pricing and plans',
    profileUpdate: 'Request profile update',
    aboutText: 'DrMuscat helps people discover doctors, clinics, pharmacies, labs, and healthcare services in Oman. It is a discovery platform, not a medical advice service.',
    utility: 'DrMuscat is a healthcare discovery platform only. Published information is not medical advice, diagnosis, or treatment. Always confirm details directly with the provider.',
    switchLabel: 'Switch language to Arabic',
    localeSwitch: 'العربية'
  },
  ar: {
    brand: 'دكتور مسقط',
    tagline: 'دليل لاكتشاف الأطباء والعيادات والصيدليات والمختبرات والخدمات الصحية في عُمان.',
    navLabel: 'تنقل التذييل العام',
    discover: 'اكتشف',
    providers: 'لمقدمي الرعاية',
    support: 'الدعم',
    about: 'حول المنصة',
    home: 'الرئيسية',
    doctors: 'الأطباء',
    centers: 'المراكز',
    pharmacies: 'الصيدليات',
    labs: 'المختبرات',
    services: 'الخدمات',
    search: 'البحث',
    articles: 'المقالات',
    forProviders: 'لمقدمي الرعاية',
    signIn: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    listYourCenter: 'أدرج مركزك',
    whatsappHelp: 'مساعدة واتساب',
    faq: 'الأسئلة الشائعة',
    reportIssue: 'الإبلاغ عن مشكلة',
    suggestEdit: 'اقتراح تعديل',
    aboutDrMuscat: 'عن دكتور مسقط',
    privacy: 'سياسة الخصوصية',
    terms: 'الشروط',
    disclaimerLabel: 'إخلاء المسؤولية',
    pricingPlans: 'الأسعار والخطط',
    profileUpdate: 'طلب تحديث الملف',
    aboutText: 'دكتور مسقط منصة لاكتشاف الأطباء والعيادات والصيدليات والمختبرات والخدمات الصحية في عُمان. المنصة مخصصة للاكتشاف وليست بديلاً عن النصيحة الطبية.',
    utility: 'دكتور مسقط منصة لاكتشاف خدمات الرعاية الصحية فقط. لا تُعد المعلومات المنشورة نصيحة طبية أو تشخيصاً أو علاجاً. يرجى تأكيد التفاصيل مباشرة مع مقدم الخدمة.',
    switchLabel: 'تبديل اللغة إلى الإنجليزية',
    localeSwitch: 'English'
  }
};

export async function SiteFooter() {
  const localeHeader = (await headers()).get('x-drmuscat-locale');
  const safeLocale: SupportedLocale = localeHeader && isSupportedLocale(localeHeader) ? localeHeader : 'en';
  const copy = footerCopy[safeLocale];
  const dir = localeDirection(safeLocale);
  const homeHref = homeRoute(safeLocale, 'om');
  const columns: FooterColumn[] = [
    {
      title: copy.discover,
      items: [
        { href: homeHref, label: copy.home },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'doctors'), label: copy.doctors },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'centers'), label: copy.centers },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'pharmacies'), label: copy.pharmacies },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'labs'), label: copy.labs },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'services'), label: copy.services },
        { href: publicDiscoveryRoute(safeLocale, 'om', 'search'), label: copy.search },
        { href: publicArticlesRoute(safeLocale, 'om'), label: copy.articles }
      ]
    },
    {
      title: copy.providers,
      items: [
        { href: publicListYourCenterRoute(safeLocale, 'om'), label: copy.listYourCenter },
        { href: publicProviderRoute(safeLocale, 'om'), label: copy.forProviders },
        { href: publicProviderRoute(safeLocale, 'om'), label: copy.pricingPlans },
        { href: publicListYourCenterRoute(safeLocale, 'om'), label: copy.profileUpdate }
      ]
    },
    {
      title: copy.support,
      items: [
        { label: copy.whatsappHelp },
        { label: copy.faq },
        { label: copy.reportIssue },
        { label: copy.suggestEdit }
      ]
    },
    {
      title: copy.about,
      items: [
        { label: copy.aboutDrMuscat },
        { label: copy.privacy },
        { label: copy.terms },
        { label: copy.disclaimerLabel },
        { label: copy.aboutText }
      ]
    }
  ];

  return (
    <footer className="site-footer site-footer--premium" role="contentinfo" dir={dir}>
      <Container className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>{copy.brand}</strong>
          <p>{copy.tagline}</p>
          <LanguageSwitch
            locale={safeLocale}
            label={copy.localeSwitch}
            ariaLabel={copy.switchLabel}
            className="site-footer__locale-switch"
          />
        </div>
        <nav className="site-footer__links" aria-label={copy.navLabel}>
          {columns.map((column) => (
            <div key={column.title} className="site-footer__column">
              <h2>{column.title}</h2>
              <ul>
                {column.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="site-footer__utility">{copy.utility}</p>
      </Container>
    </footer>
  );
}
