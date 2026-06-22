import 'server-only';

import { createSupabaseServiceRoleClient } from '@/lib/supabase/service-role';
import type { Json } from '@/lib/supabase/types';

export type PublicFaqCmsItem = {
  questionEn: string | null;
  questionAr: string | null;
  answerEn: string | null;
  answerAr: string | null;
  category: string | null;
  tags: string[];
  displayOrder: number;
  isFeatured: boolean;
};

type JsonRecord = Record<string, Json>;
type PublicFaqCmsRevision = { title_en: string | null; title_ar: string | null; body_en: Json; body_ar: Json; status: string };
type PublicFaqCmsRow = { content_key: string; title_en: string | null; title_ar: string | null; updated_at: string; cms_content_revisions?: PublicFaqCmsRevision | PublicFaqCmsRevision[] | null };

export function isPublicFaqCmsEnabled(): boolean {
  return ['1', 'true', 'yes', 'on'].includes((process.env.DRMUSCAT_PUBLIC_FAQ_CMS_ENABLED ?? '').trim().toLowerCase());
}

function object(value: Json | null | undefined): JsonRecord { return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {}; }
function nonEmptyText(value: Json | string | null | undefined): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function numberValue(value: Json | undefined): number { return typeof value === 'number' && Number.isFinite(value) ? value : 0; }
function boolValue(value: Json | undefined): boolean { return typeof value === 'boolean' ? value : false; }
function tagsValue(value: Json | undefined): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim()).slice(0, 12) : []; }
function currentRevision(row: PublicFaqCmsRow): PublicFaqCmsRevision | null { return Array.isArray(row.cms_content_revisions) ? row.cms_content_revisions[0] ?? null : row.cms_content_revisions ?? null; }

function mapPublicFaq(row: PublicFaqCmsRow): PublicFaqCmsItem | null {
  const revision = currentRevision(row);
  if (!revision || revision.status !== 'approved') return null;
  const bodyEn = object(revision.body_en);
  const bodyAr = object(revision.body_ar);
  const questionEn = nonEmptyText(revision.title_en) ?? nonEmptyText(row.title_en);
  const questionAr = nonEmptyText(revision.title_ar) ?? nonEmptyText(row.title_ar);
  const answerEn = nonEmptyText(bodyEn.answer);
  const answerAr = nonEmptyText(bodyAr.answer);
  if ((!questionEn && !questionAr) || (!answerEn && !answerAr)) return null;
  const tagsEn = tagsValue(bodyEn.tags);
  return { questionEn, questionAr, answerEn, answerAr, category: nonEmptyText(bodyEn.category) ?? nonEmptyText(bodyAr.category), tags: tagsEn.length ? tagsEn : tagsValue(bodyAr.tags), displayOrder: numberValue(bodyEn.display_order ?? bodyAr.display_order), isFeatured: boolValue(bodyEn.is_featured ?? bodyAr.is_featured) };
}

export async function listApprovedPublicFaqCmsItems(): Promise<PublicFaqCmsItem[]> {
  if (!isPublicFaqCmsEnabled()) return [];
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('cms_content_entries')
      .select('content_key,title_en,title_ar,updated_at,cms_content_revisions!cms_content_entries_current_revision_id_fkey(title_en,title_ar,body_en,body_ar,status)')
      .eq('content_type', 'faq')
      .eq('status', 'approved')
      .eq('is_archived', false)
      .is('deleted_at', null)
      .not('current_revision_id', 'is', null)
      .eq('cms_content_revisions.status', 'approved')
      .order('updated_at', { ascending: false })
      .order('content_key', { ascending: true })
      .limit(100);
    if (error || !data) return [];
    return (data as PublicFaqCmsRow[]).map(mapPublicFaq).filter((item): item is PublicFaqCmsItem => item !== null).sort((a, b) => a.displayOrder - b.displayOrder);
  } catch { return []; }
}
