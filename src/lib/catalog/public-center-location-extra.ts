import 'server-only';

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

function applyLocationExtra(center: PublicCenterDetail, rows: LocationExtraRow[]): PublicCenterDetail {
  if (rows.length === 0) return center;

  return center;
}

export async function loadPublicCenterLocationExtra(center: PublicCenterDetail): Promise<PublicCenterDetail> {
  return applyLocationExtra(center, []);
}
