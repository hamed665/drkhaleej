import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicAreaPageTemplate2026 } from '@/components/geo/PublicAreaPageTemplate2026';
import { PublicDirectoryTemplate2026 } from '@/components/directory/PublicDirectoryTemplate2026';
import { PublicProfileTemplate2026 } from '@/components/profiles/PublicProfileTemplate2026';
import {
  isSupportedCountry,
  isSupportedLocale,
  type SupportedCountry,
  type SupportedLocale
} from '@/lib/i18n/config';
import { createPublicTemplateDemoBundle } from '@/lib/demo/public-template-demo-data';

type Params = { locale: string; country: string };

export const metadata: Metadata = {
  title: 'Public template preview | DrKhaleej',
  description: 'Noindex preview route for checking public profile, directory and area templates with safe demo data.',
  robots: {
    index: false,
    follow: false
  }
};

export default async function PublicTemplatePreviewPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const demo = createPublicTemplateDemoBundle(safeLocale, safeCountry);

  return (
    <div className="dm2026-public-template-preview" data-preview="public-templates">
      <section aria-label="Public profile preview">
        <PublicProfileTemplate2026 {...demo.profile} />
      </section>
      <section aria-label="Public directory preview">
        <PublicDirectoryTemplate2026 {...demo.directory} />
      </section>
      <section aria-label="Public area preview">
        <PublicAreaPageTemplate2026 {...demo.area} />
      </section>
    </div>
  );
}
