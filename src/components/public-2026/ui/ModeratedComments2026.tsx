"use client";

import { FormEvent, useState } from "react";

import type { SupportedLocale } from "@/lib/i18n/config";

type Props = { locale: SupportedLocale; compact?: boolean };

const copy = {
  en: {
    title: "Comments",
    empty: "No public comments yet.",
    name: "Name (optional)",
    comment: "Leave a comment",
    submit: "Submit comment for review",
    pending: "Thanks — your comment will appear after review.",
    note: "Comments are reviewed before public display. Do not share private medical information.",
  },
  ar: {
    title: "التعليقات",
    empty: "لا توجد تعليقات عامة بعد.",
    name: "الاسم (اختياري)",
    comment: "اكتب تعليقاً",
    submit: "إرسال التعليق للمراجعة",
    pending: "شكراً، سيظهر تعليقك بعد المراجعة.",
    note: "تتم مراجعة التعليقات قبل عرضها للعامة. لا تشارك معلومات طبية خاصة.",
  },
} as const;

export function ModeratedComments2026({ locale, compact = false }: Props) {
  const text = copy[locale];
  const [pending, setPending] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    event.currentTarget.reset();
  }

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"}>
      <h3
        className={
          compact
            ? "text-lg font-bold text-slate-950"
            : "text-xl font-bold text-slate-950"
        }
      >
        {text.title}
      </h3>
      <p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {text.empty}
      </p>
      <form className="mt-4 grid gap-3" onSubmit={submit}>
        <label className="text-sm font-bold text-slate-700">
          {text.name}
          <input
            name="commenterName"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </label>
        <label className="text-sm font-bold text-slate-700">
          {text.comment}
          <textarea
            name="comment"
            required
            rows={compact ? 3 : 4}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white"
        >
          {text.submit}
        </button>
      </form>
      {pending ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
        >
          {text.pending}
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-6 text-slate-500">{text.note}</p>
    </div>
  );
}
