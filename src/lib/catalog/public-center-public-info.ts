import 'server-only';

import { buildPublicContactActions, type PublicContactAction } from './public-contact';
import type { Database } from '@/lib/supabase/types';

type CenterRow = Database['public']['Tables']['centers']['Row'];

type PublicCenterInfoRow = Pick<
  CenterRow,
  | 'id'
  | 'default_country'
  | 'primary_phone'
  | 'secondary_phone'
  | 'whatsapp_phone'
  | 'email'
  | 'website_url'
  | 'public_primary_phone_visible'
  | 'public_secondary_phone_visible'
  | 'public_whatsapp_phone_visible'
  | 'public_email_visible'
  | 'contact_review_status'
>;

export type PublicCenterPublicInfo = {
  contactActions: PublicContactAction[];
  error: boolean;
};

export const PUBLIC_CENTER_INFO_LOCATION_LIMIT = 6;

export function mapPublicCenterInfoForTest(center: PublicCenterInfoRow): PublicCenterPublicInfo {
  return {
    contactActions: buildPublicContactActions({
      contactReviewStatus: center.contact_review_status,
      country: center.default_country,
      primaryPhone: center.primary_phone,
      secondaryPhone: center.secondary_phone,
      whatsappPhone: center.whatsapp_phone,
      email: center.email,
      websiteUrl: center.website_url,
      publicPrimaryPhoneVisible: center.public_primary_phone_visible,
      publicSecondaryPhoneVisible: center.public_secondary_phone_visible,
      publicWhatsappPhoneVisible: center.public_whatsapp_phone_visible,
      publicEmailVisible: center.public_email_visible
    }),
    error: false
  };
}
