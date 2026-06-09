export function normalizeWhatsAppNumber(value?: string): string | null {
  const normalized = value?.replace(/\D/g, '') ?? '';

  return normalized.length > 0 ? normalized : null;
}

export function buildWhatsAppUrl(number: string | null, message: string): string | null {
  if (!number) {
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
