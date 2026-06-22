"use client";

import { useActionState } from "react";
import { createAdminFaqCmsDraft, updateAdminFaqCmsDraft } from "@/server/admin/cms-faq-actions";
import type { AdminFaqCmsItem } from "@/server/admin/cms-faqs";

const initial = { ok: false, message: "" };

export function FaqCmsForm({ item }: { item?: AdminFaqCmsItem }) {
  const [state, action, pending] = useActionState(item ? updateAdminFaqCmsDraft : createAdminFaqCmsDraft, initial);
  return <form action={action} className="space-y-4 rounded-2xl border bg-white p-5 text-sm">
    {item ? <input type="hidden" name="entryId" value={item.id} /> : null}
    {state.message ? <p className={state.ok ? "text-emerald-700" : "text-red-700"}>{state.message}</p> : null}
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">Admin-only FAQ CMS pilot. Public FAQ CMS rendering is feature-flagged and only approved active FAQ entries can be shown publicly.</div>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="font-semibold">Content key<input name="contentKey" defaultValue={item?.contentKey ?? "faq."} disabled={Boolean(item)} required maxLength={160} className="mt-1 w-full rounded-lg border p-2 font-normal"/><span className="mt-1 block text-xs font-normal text-slate-500">Use a stable key such as faq.provider-onboarding. The faq. prefix is enforced.</span></label>
      <label className="font-semibold">Slug/key helper<input name="slug" defaultValue={item?.slug ?? ""} maxLength={160} className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="font-semibold">Question EN<input name="questionEn" defaultValue={item?.questionEn ?? ""} maxLength={220} className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="font-semibold">Question AR<input name="questionAr" defaultValue={item?.questionAr ?? ""} maxLength={220} className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="font-semibold md:col-span-2">Answer EN<textarea name="answerEn" defaultValue={item?.answerEn ?? ""} maxLength={2000} className="mt-1 min-h-28 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="font-semibold md:col-span-2">Answer AR<textarea name="answerAr" defaultValue={item?.answerAr ?? ""} maxLength={2000} className="mt-1 min-h-28 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="font-semibold">Shared category<input name="category" defaultValue={item?.category ?? ""} maxLength={120} className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="font-semibold">Display order<input name="displayOrder" type="number" min={0} max={10000} defaultValue={item?.displayOrder ?? 0} className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="font-semibold">Tags<input name="tags" defaultValue={item?.tags.join(", ") ?? ""} className="mt-1 w-full rounded-lg border p-2 font-normal"/><span className="mt-1 block text-xs font-normal text-slate-500">Comma-separated, up to 10 tags.</span></label>
      <label className="flex items-center gap-2 font-semibold"><input name="isFeatured" type="checkbox" defaultChecked={item?.isFeatured ?? false}/> Featured</label>
      <label className="font-semibold">FAQ group<input name="faqGroup" defaultValue={item?.faqGroup ?? ""} maxLength={120} className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="font-semibold">Review note<textarea name="reviewNote" defaultValue={item?.reviewNote ?? ""} maxLength={1000} className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="font-semibold md:col-span-2">Internal note<textarea name="internalNote" defaultValue={item?.internalNote ?? ""} maxLength={1000} className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
    </div>
    <button disabled={pending} className="rounded-full bg-slate-950 px-4 py-2 font-semibold text-white">{item ? "Save FAQ draft" : "Create FAQ draft"}</button>
  </form>;
}
