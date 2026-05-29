'use client';

import { type FormEvent, useId, useState } from 'react';

type CallbackRequestStatus = 'idle' | 'submitting' | 'success' | 'error';

type PublicCallbackRequestFormProps = {
  locale: 'en' | 'ar';
  countryCode: 'om';
  centerId: string;
  centerLocationId?: string | null;
  doctorId?: string | null;
  doctorPracticeLocationId?: string | null;
  variant?: 'center' | 'practice';
};

type CallbackRequestCopy = {
  titleCenter: string;
  titlePractice: string;
  nameLabel: string;
  phoneLabel: string;
  preferredLanguageLabel: string;
  messageLabel: string;
  consentLabel: string;
  safetyLineOne: string;
  safetyLineTwo: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
};

const copyByLocale: Record<'en' | 'ar', CallbackRequestCopy> = {
  en: {
    titleCenter: 'Request a callback',
    titlePractice: 'Request callback from center',
    nameLabel: 'Your name',
    phoneLabel: 'Phone number',
    preferredLanguageLabel: 'Preferred language optional',
    messageLabel: 'Message optional',
    consentLabel: 'I agree that the center may contact me about this request.',
    safetyLineOne: 'This is not an appointment, emergency service, or medical advice.',
    safetyLineTwo: 'Do not use this form for urgent medical needs.',
    submit: 'Send request',
    submitting: 'Sending...',
    success: 'Your request was received. The center may contact you later.',
    error: 'We could not send this request right now. Please try again later.'
  },
  ar: {
    titleCenter: 'طلب اتصال',
    titlePractice: 'طلب اتصال من المركز',
    nameLabel: 'الاسم',
    phoneLabel: 'رقم الهاتف',
    preferredLanguageLabel: 'اللغة المفضلة اختياري',
    messageLabel: 'رسالة اختيارية',
    consentLabel: 'أوافق على أن يتواصل معي المركز بخصوص هذا الطلب.',
    safetyLineOne: 'هذا ليس حجز موعد أو خدمة طوارئ أو نصيحة طبية.',
    safetyLineTwo: 'لا تستخدم هذا النموذج للحالات الطبية العاجلة.',
    submit: 'إرسال الطلب',
    submitting: 'جارٍ الإرسال...',
    success: 'تم استلام طلبك. قد يتواصل معك المركز لاحقاً.',
    error: 'تعذر إرسال الطلب الآن. يرجى المحاولة لاحقاً.'
  }
};

export function PublicCallbackRequestForm({
  locale,
  countryCode,
  centerId,
  centerLocationId = null,
  doctorId = null,
  doctorPracticeLocationId = null,
  variant = 'center'
}: PublicCallbackRequestFormProps) {
  const copy = copyByLocale[locale];
  const formId = useId();
  const [requesterName, setRequesterName] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [message, setMessage] = useState('');
  const [consentToContact, setConsentToContact] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<CallbackRequestStatus>('idle');

  const isSubmitting = status === 'submitting';
  const statusMessage = status === 'success' ? copy.success : status === 'error' ? copy.error : '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    if (!consentToContact) {
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/callback-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          centerId,
          centerLocationId: centerLocationId ?? null,
          doctorId: doctorId ?? null,
          doctorPracticeLocationId: doctorPracticeLocationId ?? null,
          requesterName,
          requesterPhone,
          preferredLanguage: preferredLanguage || null,
          message: message || null,
          locale,
          countryCode,
          consentToContact,
          honeypot
        })
      });

      const result = (await response.json().catch(() => null)) as { ok?: unknown } | null;

      if (response.status === 202 && result?.ok === true) {
        setRequesterName('');
        setRequesterPhone('');
        setPreferredLanguage('');
        setMessage('');
        setHoneypot('');
        setStatus('success');
        return;
      }

      setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 sm:p-5" aria-labelledby={`${formId}-title`}>
      <div className="space-y-2">
        <h3 id={`${formId}-title`} className="text-sm font-semibold leading-6 text-slate-950">
          {variant === 'practice' ? copy.titlePractice : copy.titleCenter}
        </h3>
        <div className="space-y-1 text-xs leading-5 text-slate-600">
          <p>{copy.safetyLineOne}</p>
          <p>{copy.safetyLineTwo}</p>
        </div>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-requester-name`} className="text-xs font-semibold text-slate-700">
              {copy.nameLabel}
            </label>
            <input
              id={`${formId}-requester-name`}
              name="requesterName"
              type="text"
              autoComplete="name"
              required
              value={requesterName}
              onChange={(event) => setRequesterName(event.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor={`${formId}-requester-phone`} className="text-xs font-semibold text-slate-700">
              {copy.phoneLabel}
            </label>
            <input
              id={`${formId}-requester-phone`}
              name="requesterPhone"
              type="tel"
              autoComplete="tel"
              required
              value={requesterPhone}
              onChange={(event) => setRequesterPhone(event.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-preferred-language`} className="text-xs font-semibold text-slate-700">
            {copy.preferredLanguageLabel}
          </label>
          <input
            id={`${formId}-preferred-language`}
            name="preferredLanguage"
            type="text"
            autoComplete="language"
            value={preferredLanguage}
            onChange={(event) => setPreferredLanguage(event.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-message`} className="text-xs font-semibold text-slate-700">
            {copy.messageLabel}
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            rows={3}
            maxLength={500}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="block w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor={`${formId}-honeypot`}>Leave this field blank</label>
          <input
            id={`${formId}-honeypot`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <input
            id={`${formId}-consent`}
            name="consentToContact"
            type="checkbox"
            required
            checked={consentToContact}
            onChange={(event) => setConsentToContact(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-2 focus:ring-emerald-500/40"
          />
          <label htmlFor={`${formId}-consent`} className="text-xs leading-5 text-slate-700">
            {copy.consentLabel}
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? copy.submitting : copy.submit}
          </button>

          <p
            className={status === 'success' ? 'text-xs font-medium leading-5 text-emerald-800' : 'text-xs font-medium leading-5 text-red-700'}
            aria-live="polite"
          >
            {statusMessage}
          </p>
        </div>
      </form>
    </section>
  );
}
