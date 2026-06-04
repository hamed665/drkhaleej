'use client';

import { FormEvent, useState } from 'react';

import type { SupportedLocale } from '@/lib/i18n/config';

type Props = { locale: SupportedLocale };

const copy = {
  en: { title: 'Ratings and reviews', noReviews: 'No reviews yet', summary: 'No average rating is shown until moderated reviews are available.', distribution: 'Rating distribution', reviewTitle: 'Leave a review', rating: 'Rating', comment: 'Review comment', submit: 'Submit review for moderation', pending: 'Review received. It is pending moderation and is not included in any rating.', note: 'Reviews and comments are reviewed before public display. Ratings are not medical quality rankings.' },
  ar: { title: 'التقييمات والمراجعات', noReviews: 'لا توجد مراجعات بعد', summary: 'لا يتم عرض متوسط تقييم حتى تتوفر مراجعات خاضعة للمراجعة.', distribution: 'توزيع التقييمات', reviewTitle: 'اترك مراجعة', rating: 'التقييم', comment: 'تعليق المراجعة', submit: 'إرسال المراجعة للمراجعة', pending: 'تم استلام المراجعة. وهي قيد المراجعة ولا تدخل في أي تقييم.', note: 'تتم مراجعة التقييمات والتعليقات قبل عرضها للعامة. التقييمات ليست تصنيفاً للجودة الطبية.' },
} as const;

export function ReviewsRatings2026({ locale }: Props) {
  const text = copy[locale];
  const [rating, setRating] = useState<number>(0);
  const [pending, setPending] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) return;
    setPending(true);
    event.currentTarget.reset();
    setRating(0);
  }

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="grid gap-6 lg:grid-cols-2">
      <div>
        <h3 className="text-xl font-bold text-slate-950">{text.title}</h3>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-2xl font-black text-slate-950">—</p><p className="mt-1 font-bold text-slate-700">{text.noReviews}</p><p className="mt-2 text-sm leading-6 text-slate-600">{text.summary}</p></div>
        <h4 className="mt-5 text-sm font-bold text-slate-700">{text.distribution}</h4>
        <div className="mt-3 space-y-2">{[5, 4, 3, 2, 1].map((value) => <div key={value} className="flex items-center gap-3 text-xs font-semibold text-slate-600"><span className="w-8">{value}★</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full w-0 bg-amber-400" /></span><span>0</span></div>)}</div>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-lg font-bold text-slate-950">{text.reviewTitle}</h4>
        <fieldset className="mt-4"><legend className="text-sm font-bold text-slate-700">{text.rating}</legend><div className="mt-2 flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-pressed={rating === value} onClick={() => setRating(value)} className={`rounded-full border px-3 py-2 text-sm font-bold ${rating === value ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600'}`}>{value}★</button>)}</div></fieldset>
        <label className="mt-4 block text-sm font-bold text-slate-700">{text.comment}<textarea required name="reviewComment" rows={4} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" /></label>
        <button type="submit" disabled={!rating} className="mt-4 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">{text.submit}</button>
        {pending ? <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{text.pending}</p> : null}
        <p className="mt-3 text-xs leading-6 text-slate-500">{text.note}</p>
      </form>
    </div>
  );
}
