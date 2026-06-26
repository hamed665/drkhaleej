const previousPublicBrandName = 'DrMuscat';
const currentPublicBrandName = 'DrKhaleej';

export function normalizePublicBrandCopy(value: string): string {
  return value.replaceAll(previousPublicBrandName, currentPublicBrandName);
}
