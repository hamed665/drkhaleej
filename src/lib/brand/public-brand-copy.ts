const currentPublicBrandName = 'DrKhaleej';

const legacyPublicBrandNames = [
  'DrMuscat',
  'Dr Muscat',
  'Doctor Muscat',
  'دکتر مسقط',
  'دكتور مسقط',
  'د. مسقط'
] as const;

export function normalizePublicBrandCopy(value: string): string {
  return legacyPublicBrandNames.reduce(
    (normalized, legacyBrandName) => normalized.replaceAll(legacyBrandName, currentPublicBrandName),
    value
  );
}
