import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { PublicCenterDetail } from './public-types';

type LocationExtraRow = {
  id: string;
  address_line1_en: string | null;
  address_line1_ar: string | null;
  address_line2_en: string | null;
  address_line2_ar: string | null;
  landmark_en: string | null;
  landmark_ar: string | null;
  postal_code: string | null;
};

const LOCATION_EXTRA_SELECT = [
  'id',
  'address_line1_en',
  'address_line1_ar',
  'address_line2_en',
  'address_line2_ar',
  'landmark_en',
  'landmark_ar',
  'postal_code'
].join(',');

function applyLocationExtra(center: PublicCenterDetail, rows: LocationExtraRow[]): PublicCenterDetail {
  if (rows.length === 0) return center;

  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const locations = center.locations.map((location) => {
    const row = rowsById.get(location.id);
    if (!row) return location;

    return {
      ...location,
      addressLine1En: row.address_line1_en,
      addressLine1Ar: row.address_line1_ar,
      addressLine2En: row.address_line2_en,
      addressLine2Ar: row.address_line2_ar,
      landmarkEn: row.landmark_en,
      landmarkAr: row.landmark_ar,
      postalCode: row.postal_code
    };
  });
  const location = center.location ? locations.find((item) => item.id === center.location?.id) ?? center.location : null;

  return { ...center, location, locations };
}

export async function loadPublicCenterLocationExtra(center: PublicCenterDetail): Promise<PublicCenterDetail> {
  const locationIds = center.locations.map((location) => location.id);
  if (locationIds.length === 0) return center;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('center_locations')
    .select(LOCATION_EXTRA_SELECT)
    .in('id', locationIds)
    .eq('is_active', true)
    .is('deleted_at', null);

  if (error || !data) return center;

  return applyLocationExtra(center, data as unknown as LocationExtraRow[]);
}
