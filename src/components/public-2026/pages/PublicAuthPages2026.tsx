import Link from 'next/link';

import { LocationFields2026 } from '@/components/public-2026/forms/LocationFields2026';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicRegisterRoute, publicSignInRoute } from '@/lib/routes/public';

type PublicAuthPageProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
};

const authCopy = {
  en: {
    signInTitle: 'Sign in to DrMuscat',
    signInLead: 'Frontend sign-in preview for healthcare discovery. Authentication backend is not connected in this UI phase.',
    google: 'Continue with Google',
    phone: 'Continue with phone OTP',
    credentials: 'Email/phone + password',
    credentialPlaceholder: 'Email or phone',
    passwordPlaceholder: 'Password',
    forgot: 'Forgot password?',
    create: 'Create account',
    submit: 'Sign in preview',
    registerTitle: 'Create your DrMuscat account',
    registerLead: 'Choose the role that best matches how you will use DrMuscat. Admin roles are not publicly self-selectable.',
    roleLabel: 'Role',
    locationTitle: 'Location preference',
    name: 'Full name',
    email: 'Email or phone',
    country: 'Country',
    city: 'City',
    area: 'Area',
    allAreas: 'All areas',
    already: 'Already have an account?',
    next: 'Continue preview',
    disclaimer: 'Account actions are frontend placeholders only; no credentials are submitted in this phase.',
    roles: [
      'Looking for care',
      'Doctor',
      'Clinic / medical center',
      'Pharmacy',
      'Laboratory',
      'Wellness / beauty / pet / other provider',
      'Marketer / sales partner',
    ],
  },
  ar: {
    signInTitle: 'تسجيل الدخول إلى دكتور مسقط',
    signInLead: 'واجهة تسجيل دخول تجريبية لاكتشاف الرعاية الصحية. لم يتم ربط نظام المصادقة في هذه المرحلة.',
    google: 'المتابعة باستخدام Google',
    phone: 'المتابعة برمز الهاتف',
    credentials: 'البريد/الهاتف + كلمة المرور',
    credentialPlaceholder: 'البريد الإلكتروني أو الهاتف',
    passwordPlaceholder: 'كلمة المرور',
    forgot: 'هل نسيت كلمة المرور؟',
    create: 'إنشاء حساب',
    submit: 'معاينة تسجيل الدخول',
    registerTitle: 'أنشئ حسابك في دكتور مسقط',
    registerLead: 'اختر الدور الأقرب لطريقة استخدامك لدكتور مسقط. أدوار الإدارة غير متاحة للاختيار العام.',
    roleLabel: 'الدور',
    locationTitle: 'تفضيل الموقع',
    name: 'الاسم الكامل',
    email: 'البريد الإلكتروني أو الهاتف',
    country: 'الدولة',
    city: 'المدينة',
    area: 'المنطقة',
    allAreas: 'كل المناطق',
    already: 'لديك حساب بالفعل؟',
    next: 'متابعة المعاينة',
    disclaimer: 'إجراءات الحساب هنا واجهة أمامية فقط؛ لا يتم إرسال بيانات اعتماد في هذه المرحلة.',
    roles: [
      'أبحث عن رعاية',
      'طبيب',
      'عيادة / مركز طبي',
      'صيدلية',
      'مختبر',
      'مقدم عافية / تجميل / بيطري / خدمات أخرى',
      'مسوق / شريك مبيعات',
    ],
  },
} as const satisfies Record<SupportedLocale, Record<string, string | readonly string[]>>;

export function SignInPage2026({ locale, country }: PublicAuthPageProps) {
  const copy = authCopy[locale];

  return (
    <main className="dm2026-page dm2026-auth-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <section className="dm2026-auth-card" aria-labelledby="dm2026-sign-in-title">
        <p className="dm2026-eyebrow">DrMuscat</p>
        <h1 id="dm2026-sign-in-title">{copy.signInTitle}</h1>
        <p>{copy.signInLead}</p>
        <div className="dm2026-auth-actions">
          <button type="button">{copy.google}</button>
          <button type="button">{copy.phone}</button>
        </div>
        <form className="dm2026-form" action="#">
          <h2>{copy.credentials}</h2>
          <label className="dm2026-form-field">
            <span>{copy.credentialPlaceholder}</span>
            <input type="text" placeholder={copy.credentialPlaceholder} />
          </label>
          <label className="dm2026-form-field">
            <span>{copy.passwordPlaceholder}</span>
            <input type="password" placeholder={copy.passwordPlaceholder} />
          </label>
          <div className="dm2026-auth-row">
            <a href="#forgot">{copy.forgot}</a>
            <Link href={publicRegisterRoute(locale, country)}>{copy.create}</Link>
          </div>
          <button className="dm2026-submit" type="button">{copy.submit}</button>
        </form>
        <p className="dm2026-disclaimer-note">{copy.disclaimer}</p>
      </section>
    </main>
  );
}

export function RegisterPage2026({ locale, country }: PublicAuthPageProps) {
  const copy = authCopy[locale];

  return (
    <main className="dm2026-page dm2026-auth-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <section className="dm2026-auth-card dm2026-auth-card--wide" aria-labelledby="dm2026-register-title">
        <p className="dm2026-eyebrow">DrMuscat</p>
        <h1 id="dm2026-register-title">{copy.registerTitle}</h1>
        <p>{copy.registerLead}</p>
        <form className="dm2026-form" action="#">
          <div className="dm2026-form-grid">
            <label className="dm2026-form-field">
              <span>{copy.name}</span>
              <input type="text" placeholder={copy.name} />
            </label>
            <label className="dm2026-form-field">
              <span>{copy.email}</span>
              <input type="text" placeholder={copy.email} />
            </label>
          </div>
          <fieldset className="dm2026-role-grid">
            <legend>{copy.roleLabel}</legend>
            {(copy.roles as readonly string[]).map((role) => (
              <label key={role}>
                <input type="radio" name="role" />
                <span>{role}</span>
              </label>
            ))}
          </fieldset>
          <h2>{copy.locationTitle}</h2>
          <LocationFields2026 locale={locale} labels={{ country: copy.country, city: copy.city, area: copy.area, allAreas: copy.allAreas }} />
          <div className="dm2026-auth-row">
            <Link href={publicSignInRoute(locale, country)}>{copy.already}</Link>
          </div>
          <button className="dm2026-submit" type="button">{copy.next}</button>
        </form>
        <p className="dm2026-disclaimer-note">{copy.disclaimer}</p>
      </section>
    </main>
  );
}
