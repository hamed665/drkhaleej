export const PUBLIC_CENTER_PROFILE_LOCATION_LIMIT = 6;
export const PUBLIC_CENTER_PROFILE_SERVICE_LIMIT = 12;
export const PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT = 12;
export const PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT = 12;
export const PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT = 8;

export function limitPublicProfileRelations<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, Math.max(0, limit));
}

export function hiddenPublicProfileRelationCount(items: readonly unknown[], limit: number): number {
  return Math.max(0, items.length - Math.max(0, limit));
}
