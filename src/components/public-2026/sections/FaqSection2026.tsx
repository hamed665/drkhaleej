import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { SectionHeader2026 } from '@/components/public-2026/ui/SectionHeader2026';

type FaqSection2026Props = { copy: Home2026Copy['faq'] };

export function FaqSection2026({ copy }: FaqSection2026Props) {
  return (
    <section className="dm2026-faq py-10" aria-labelledby="dm2026-faq-title">
      <SectionHeader2026 id="dm2026-faq-title" eyebrow={copy.eyebrow} title={copy.title} />
      <div className="mt-8 grid gap-4">
        {copy.items.map((item) => (
          <details key={item.question} className="dm2026-faq-item rounded-[1.5rem] border border-dm-border bg-white/85 p-5 shadow-dm-sm">
            <summary className="cursor-pointer text-lg font-bold text-dm-text">{item.question}</summary>
            <p className="mt-3 text-sm leading-6 text-dm-text-soft">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
