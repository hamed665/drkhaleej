import { Card2026 } from '@/components/public-2026/ui/Card2026';
import { Button2026 } from '@/components/public-2026/ui/Button2026';

type ProviderPreviewCard2026Props = { title: string; description: string; label: string; href: string };

export function ProviderPreviewCard2026({ title, description, label, href }: ProviderPreviewCard2026Props) {
  return (
    <Card2026 className="flex h-full flex-col justify-between gap-5">
      <div>
        <span className="inline-flex h-12 w-12 rounded-2xl bg-dm-bg-soft ring-1 ring-dm-border" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-dm-text">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-dm-text-soft">{description}</p>
      </div>
      <Button2026 href={href} variant="secondary" className="w-fit">{label}</Button2026>
    </Card2026>
  );
}
