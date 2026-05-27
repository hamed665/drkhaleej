import { PublicComingSoonPanel } from '@/components/public/public-coming-soon-panel';
import { PublicDiscoveryGrid } from '@/components/public/public-discovery-grid';
import { PublicRouteHero } from '@/components/public/public-route-hero';

type PublicPageShellProps = {
  dir: 'ltr' | 'rtl';
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  panelHeading: string;
  panelBody: string;
  gridTitle: string;
  gridItems: readonly string[];
};

export function PublicPageShell({
  dir,
  heroBadge,
  heroTitle,
  heroDescription,
  panelHeading,
  panelBody,
  gridTitle,
  gridItems
}: PublicPageShellProps) {
  return (
    <main className="public-page-shell" dir={dir}>
      <PublicRouteHero badge={heroBadge} title={heroTitle} description={heroDescription} dir={dir} />
      <PublicComingSoonPanel heading={panelHeading} body={panelBody} />
      <PublicDiscoveryGrid title={gridTitle} items={gridItems} />
    </main>
  );
}
