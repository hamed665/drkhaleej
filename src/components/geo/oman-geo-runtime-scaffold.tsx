import type { GeoLaunchPhase, GeoScope } from '@/config/geo/oman';
import type { OmanGeoEditorialContentEntry } from '@/config/geo/editorial-content-contract';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

export type OmanGeoScaffoldEntity = 'governorate' | 'wilayat' | 'area';

export type OmanGeoScaffoldItem = {
  slug: string;
  labelEn: string;
  labelAr: string;
  governorateSlug?: string;
  wilayatSlug?: string;
  scope: GeoScope;
  publicLaunchPhase: GeoLaunchPhase;
  isMvp: boolean;
};

type OmanGeoRuntimeScaffoldProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
  entity: OmanGeoScaffoldEntity;
  item: OmanGeoScaffoldItem;
  parentLabel?: string;
  editorialContent?: OmanGeoEditorialContentEntry | null;
};

const entityCopy: Record<SupportedLocale, Record<OmanGeoScaffoldEntity, string>> = {
  en: {
    governorate: 'Governorate',
    wilayat: 'Wilayat',
    area: 'Area',
  },
  ar: {
    governorate: 'محافظة',
    wilayat: 'ولاية',
    area: 'منطقة',
  },
};

const pageCopy: Record<SupportedLocale, { eyebrow: string; description: string; status: string; editorialTitle: string; editorialEmpty: string }> = {
  en: {
    eyebrow: 'DrMuscat Geo Discovery',
    description: 'This geo discovery page is a runtime scaffold. Provider listings, editorial content, metadata, sitemap entries and structured data will be added in later approved phases.',
    status: 'Runtime scaffold only',
    editorialTitle: 'Editorial content',
    editorialEmpty: 'No published human-reviewed editorial content is available for this geo page yet.',
  },
  ar: {
    eyebrow: 'اكتشاف المناطق في DrMuscat',
    description: 'هذه الصفحة هي هيكل أولي للتشغيل فقط. ستتم إضافة القوائم والمحتوى التحريري والبيانات الوصفية وخرائط الموقع والبيانات المنظمة في مراحل لاحقة معتمدة.',
    status: 'هيكل تشغيل أولي فقط',
    editorialTitle: 'المحتوى التحريري',
    editorialEmpty: 'لا يوجد محتوى تحريري منشور ومراجع بشرياً لهذه الصفحة الجغرافية حتى الآن.',
  },
};

function localizedLabel(item: OmanGeoScaffoldItem, locale: SupportedLocale): string {
  return locale === 'ar' ? item.labelAr : item.labelEn;
}

export function OmanGeoRuntimeScaffold({ locale, country, entity, item, parentLabel, editorialContent = null }: OmanGeoRuntimeScaffoldProps) {
  const copy = pageCopy[locale];
  const title = localizedLabel(item, locale);
  const entityLabel = entityCopy[locale][entity];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12" data-country={country} data-locale={locale} data-geo-entity={entity} data-editorial-content-status={editorialContent?.status ?? 'none'}>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{copy.eyebrow}</p>
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-slate-500">{entityLabel}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
          {parentLabel ? <p className="text-base text-slate-600">{parentLabel}</p> : null}
          <p className="max-w-3xl text-base leading-7 text-slate-700">{copy.description}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">{copy.editorialTitle}</h2>
        {editorialContent ? (
          <div className="mt-4 flex flex-col gap-4">
            {editorialContent.blocks.map((block) => (
              <article key={block.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{block.key}</p>
                <p className="mt-2 text-sm leading-6 text-slate-800">{block.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600">{copy.editorialEmpty}</p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</p>
          <p className="mt-2 font-mono text-sm text-slate-900">{item.slug}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Launch phase</p>
          <p className="mt-2 font-mono text-sm text-slate-900">{String(item.publicLaunchPhase)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-2 text-sm text-slate-900">{copy.status}</p>
        </div>
      </section>
    </main>
  );
}
