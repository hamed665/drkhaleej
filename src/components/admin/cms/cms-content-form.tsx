"use client";

import { useActionState } from "react";
import { createAdminCmsContentEntry, updateAdminCmsContentDraft } from "@/server/admin/cms-content-actions";
import { cmsContentTypes } from "@/lib/admin/cms-content-options";
import type { CmsContentEntry, CmsContentRevision } from "@/server/admin/cms-content";

const initial = { ok: false, message: "" };
function jsonText(value: unknown) { return JSON.stringify(value ?? {}, null, 2); }
export function CmsContentForm({ entry, revision }: { entry?: CmsContentEntry; revision?: CmsContentRevision | null }) {
  const action = entry ? updateAdminCmsContentDraft : createAdminCmsContentEntry;
  const [state, formAction, pending] = useActionState(action, initial);
  return <form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
    {entry ? <input type="hidden" name="entryId" value={entry.id} /> : null}
    {state.message ? <p className={state.ok ? "text-emerald-700" : "text-red-700"}>{state.message}</p> : null}
    <div className="grid gap-4 md:grid-cols-2">
      <label>Content key<input name="contentKey" defaultValue={entry?.contentKey ?? ""} disabled={Boolean(entry)} required className="mt-1 w-full rounded-lg border p-2" maxLength={160}/></label>
      <label>Content type<select name="contentType" defaultValue={entry?.contentType ?? "generic_page"} disabled={Boolean(entry)} className="mt-1 w-full rounded-lg border p-2">{cmsContentTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
      <label>Locale<select name="locale" defaultValue={entry?.locale ?? ""} disabled={Boolean(entry)} className="mt-1 w-full rounded-lg border p-2"><option value="">Global/internal</option><option value="en">English</option><option value="ar">Arabic</option></select></label>
      <label>Country<input name="country" value="om" readOnly className="mt-1 w-full rounded-lg border bg-slate-50 p-2"/></label>
      <label>Title EN<input name="titleEn" defaultValue={revision?.titleEn ?? entry?.titleEn ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={220}/></label>
      <label>Title AR<input name="titleAr" defaultValue={revision?.titleAr ?? entry?.titleAr ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={220}/></label>
      <label>Slug<input name="slug" defaultValue={entry?.slug ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={160}/></label>
      <label>Summary EN<input name="summaryEn" defaultValue={revision?.summaryEn ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={500}/></label>
      <label>Summary AR<input name="summaryAr" defaultValue={revision?.summaryAr ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={500}/></label>
      <label>SEO title EN<input name="seoTitleEn" defaultValue={revision?.seoTitleEn ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={70}/></label>
      <label>SEO title AR<input name="seoTitleAr" defaultValue={revision?.seoTitleAr ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={70}/></label>
      <label>SEO description EN<textarea name="seoDescriptionEn" defaultValue={revision?.seoDescriptionEn ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={170}/></label>
      <label>SEO description AR<textarea name="seoDescriptionAr" defaultValue={revision?.seoDescriptionAr ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={170}/></label>
      <label>Metadata JSON<textarea name="metadata" defaultValue={jsonText(revision?.metadata ?? entry?.metadata)} className="mt-1 h-32 w-full rounded-lg border font-mono text-xs p-2"/></label>
      <label>Body EN JSON<textarea name="bodyEn" defaultValue={jsonText(revision?.bodyEn)} className="mt-1 h-32 w-full rounded-lg border font-mono text-xs p-2"/></label>
      <label>Body AR JSON<textarea name="bodyAr" defaultValue={jsonText(revision?.bodyAr)} className="mt-1 h-32 w-full rounded-lg border font-mono text-xs p-2"/></label>
      <label>Review note<textarea name="reviewNote" defaultValue={revision?.reviewNote ?? ""} className="mt-1 w-full rounded-lg border p-2" maxLength={1000}/></label>
    </div>
    <button disabled={pending} className="rounded-full bg-slate-950 px-4 py-2 font-semibold text-white">{entry ? "Save draft" : "Create draft CMS entry"}</button>
  </form>;
}
