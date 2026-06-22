export const cmsContentTypes = ["homepage_section", "about_page", "for_providers_page", "faq", "article", "seo_metadata", "navigation_label", "generic_page", "offer_copy", "landing_page"] as const;
export const cmsStatuses = ["draft", "in_review", "approved", "rejected", "published", "archived"] as const;
export type CmsContentType = (typeof cmsContentTypes)[number];
export type CmsStatus = (typeof cmsStatuses)[number];
export function isCmsContentType(value: string): value is CmsContentType { return (cmsContentTypes as readonly string[]).includes(value); }
export function isCmsStatus(value: string): value is CmsStatus { return (cmsStatuses as readonly string[]).includes(value); }
