import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { ArticleCard2026 } from '@/components/public-2026/cards/ArticleCard2026';
import { SectionHeader2026 } from '@/components/public-2026/ui/SectionHeader2026';

type HomeArticles2026Props = { copy: Home2026Copy['articles'] };

export function HomeArticles2026({ copy }: HomeArticles2026Props) {
  return (
    <section className="dm2026-articles py-10" aria-labelledby="dm2026-articles-title">
      <SectionHeader2026 id="dm2026-articles-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} centered />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {copy.cards.map((card) => <ArticleCard2026 key={card.title} {...card} />)}
      </div>
    </section>
  );
}
