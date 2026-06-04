import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { Card2026 } from '@/components/public-2026/ui/Card2026';
import { SectionHeader2026 } from '@/components/public-2026/ui/SectionHeader2026';

type TrustAndSafety2026Props = { copy: Home2026Copy['safety'] };

export function TrustAndSafety2026({ copy }: TrustAndSafety2026Props) {
  return (
    <section className="dm2026-safety py-10" aria-labelledby="dm2026-safety-title">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <SectionHeader2026 id="dm2026-safety-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        <Card2026 className="bg-dm-brand-strong text-white">
          <ul className="grid gap-3">
            {copy.points.map((point) => (
              <li key={point} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white">{point}</li>
            ))}
          </ul>
        </Card2026>
      </div>
    </section>
  );
}
