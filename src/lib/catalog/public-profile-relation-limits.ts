export const PUBLIC_CENTER_PROFILE_LOCATION_LIMIT = 6;
export const PUBLIC_CENTER_PROFILE_SERVICE_LIMIT = 12;
export const PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT = 12;
export const PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT = 12;
export const PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT = 8;
export const PUBLIC_DOCTOR_PROFILE_CENTER_LIMIT = 6;
export const PUBLIC_PROFILE_RELATED_PROVIDER_LIMIT = 8;
export const PUBLIC_IMPORT_PROFILE_LOCAL_SUGGESTION_LIMIT = 12;

export function limitPublicProfileRelations<T>(items: readonly T[], limit: number): T[] {
  const safeLimit = Math.max(0, limit);
  if (safeLimit === 0) return [];
  return items.slice(0, limit);
}

export function hiddenPublicProfileRelationCount(items: readonly unknown[], limit: number): number {
  return Math.max(0, items.length - Math.max(0, limit));
}
