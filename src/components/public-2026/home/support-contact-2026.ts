import type { SupportedLocale } from '@/lib/i18n/config';

/** Placeholder only. Replace with the approved DrMuscat support WhatsApp number before launch. */
export const DRMUSCAT_SUPPORT_WHATSAPP = '000000000000';

const supportMessages: Record<SupportedLocale, string> = {
  en: 'Hello DrMuscat, I have a question.',
  ar: 'مرحباً دكتور مسقط، لدي سؤال.',
};

export function drMuscatSupportWhatsAppUrl(locale: SupportedLocale) {
  const message = encodeURIComponent(supportMessages[locale]);
  return `https://wa.me/${DRMUSCAT_SUPPORT_WHATSAPP}?text=${message}`;
}
