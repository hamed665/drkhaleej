import { normalizePublicBrandCopy } from '@/lib/brand/public-brand-copy';

const OMAN_COUNTRY_CODE = '968';
const OMAN_LOCAL_MOBILE_DIGITS = 8;
const OMAN_INTERNATIONAL_DIGITS = OMAN_COUNTRY_CODE.length + OMAN_LOCAL_MOBILE_DIGITS;

export function normalizeWhatsAppNumber(value?: string): string | null {
  const cleaned = value?.replace(/\D/g, '') ?? '';

  if (cleaned.length === OMAN_LOCAL_MOBILE_DIGITS) {
    return `${OMAN_COUNTRY_CODE}${cleaned}`;
  }

  if (cleaned.startsWith(OMAN_COUNTRY_CODE) && cleaned.length === OMAN_INTERNATIONAL_DIGITS) {
    return cleaned;
  }

  return null;
}

export function getPublicWhatsAppNumber(): string | null {
  return normalizeWhatsAppNumber(
    process.env.NEXT_PUBLIC_DRKHALEEJ_WHATSAPP_NUMBER ?? process.env.NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER
  );
}

export function buildWhatsAppUrl(number: string | null, message: string): string | null {
  if (!number) {
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(normalizePublicBrandCopy(message))}`;
}
