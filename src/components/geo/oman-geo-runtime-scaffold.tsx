import type { GeoLaunchPhase, GeoScope } from '@/config/geo/oman';
import type { OmanGeoEditorialContentEntry } from '@/config/geo/editorial-content-contract';
import type { OmanGeoProviderInventoryEntityContract } from '@/config/geo/provider-inventory-contract';
import type { OmanGeoIndexPromotionEligibility } from '@/lib/geo/oman-index-promotion-eligibility';
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
  providerInventory?: OmanGeoProviderInventoryEntityContract | null;
  indexPromotionEligibility?: OmanGeoIndexPromotionEligibility | null;
};

type PageCopy = {
  eyebrow: string;
  description: string;
  status: string;
  editorialTitle: string;
  editorialEmpty: string;
  providerTitle: string;
  providerEmpty: string;
  minimumProviders: string;
  publishedProviders: string;
  inventoryStatus: string;
  indexTitle: string;
  indexEligibility: string;
  indexStatus: string;
  noindexStatus: string;
  sitemapStatus: string;
  jsonLdStatus: string;
  blockedReasons: string;
  available: string;
  blocked: string;
  allowed: string;
  notAllowed: string;
  required: string;
  notRequired: string;
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

const pageCopy: Record<SupportedLocale, PageCopy> = {
  en: {
    eyebrow: 'DrMuscat Geo Discovery',
    description: 'This geo discovery page is a runtime scaffold. Provider inventory, provider listings, editorial content, metadata, sitemap entries and structured data will be added in later approved phases.',
    status: 'Runtime scaffold only',
    editorialTitle: 'Editorial content',
    editorialEmpty: 'No published human-reviewed editorial content is available for this geo page yet.',
    providerTitle: 'Provider inventory',
    providerEmpty: 'No approved provider inventory evidence is available for this geo page yet.',
    minimumProviders: 'Minimum providers',
    publishedProviders: 'Published providers',
    inventoryStatus: 'Inventory status',
    indexTitle: 'Index promotion eligibility',
    indexEligibility: 'Eligibility',
    indexStatus: 'Promotion status',
    noindexStatus: 'Noindex',
    sitemapStatus: 'Sitemap',
    jsonLdStatus: 'JSON-LD',
    blockedReasons: 'Blocked reasons',
    available: 'Available',
    blocked: 'Blocked',
    allowed: 'Allowed',
    notAllowed: 'Not allowed',
    required: 'Required',
    notRequired: 'Not required',
  },
  ar: {
    eyebrow: 'اكتشاف المناطق في DrMuscat',
    description: 'هذه الصفحة هي هيكل أولي للتشغيل فقط. ستتم إضافة مخزون مقدمي الخدمة والقوائم والمحتوى التحريري والبيانات الوصفية وخرائط الموقع والبيانات المنظمة في مراحل لاحقة معتمدة.',
    status: 'هيكل تشغيل أولي فقط',
    editorialTitle: 'المحتوى التحريري',
    editorialEmpty: 'لا يوجد محتوى تحريري منشور ومراجع بشرياً لهذه الصفحة الجغرافية حتى الآن.',
    providerTitle: 'مخزون مقدمي الخدمة',
    providerEmpty: 'لا يوجد دليل معتمد لمخزون مقدمي الخدمة لهذه الصفحة الجغرافية حتى الآن.',
    minimumProviders: 'الحد الأدنى لمقدمي الخدمة',
    publishedProviders: 'مقدمو الخدمة المنشورون',
    inventoryStatus: 'حالة المخزون',
    indexTitle: 'أهلية الفهرسة',
    indexEligibility: 'الأهلية',
    indexStatus: 'حالة الترقية',
    noindexStatus: 'منع الفهرسة',
    sitemapStatus: 'خريطة الموقع',
    jsonLdStatus: 'JSON-LD',
    blockedReasons: 'أسباب الحظر',
    available: 'متاح',
    blocked: 'محظور',
    allowed: 'مسموح',
    notAllowed: 'غير مسموح',
    required: 'مطلوب',
    notRequired: 'غير مطلوب',
  },
};

function localizedLabel(item: OmanGeoScaffoldItem, locale: SupportedLocale): string {
  return locale === 'ar' ? item.labelAr : item.labelEn;
}

export function OmanGeoRuntimeScaffold({
  locale,
  country,
  entity,
  item,
  parentLabel,
  editorialContent = null,
  providerInventory = null,
  indexPromotionEligibility = null,
}: OmanGeoRuntimeScaffoldProps) {
  const copy = pageCopy[locale];
  const title = localizedLabel(item, locale);
  const entityLabel = entityCopy[locale][entity];

  return (
    <main
      className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12"
      data-country={country}
      data-locale={locale}
      data-geo-entity={entity}
      data-editorial-content-status={editorialContent?.status ?? 'none'}
      data-provider-inventory-status={providerInventory?.status ?? 'none'}
      data-index-promotion-eligible={String(indexPromotionEligibility?.eligibleForIndexPromotion ?? false)}
    >
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
        <h2 className="text-lg font-semibold text-slate-950">{copy.indexTitle}</h2>
        {indexPromotionEligibility ? (
          <div className="mt-4 flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.indexEligibility}</p>
                <p className="mt-2 text-sm text-slate-900">{indexPromotionEligibility.eligibleForIndexPromotion ? copy.available : copy.blocked}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.noindexStatus}</p>
                <p className="mt-2 text-sm text-slate-900">{indexPromotionEligibility.noindexRequired ? copy.required : copy.notRequired}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.sitemapStatus}</p>
                <p className="mt-2 text-sm text-slate-900">{indexPromotionEligibility.sitemapAllowed ? copy.allowed : copy.notAllowed}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.jsonLdStatus}</p>
                <p className="mt-2 text-sm text-slate-900">{indexPromotionEligibility.jsonLdAllowed ? copy.allowed : copy.notAllowed}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.indexStatus}</p>
              <p className="mt-2 font-mono text-sm text-slate-900">{indexPromotionEligibility.status}</p>
            </div>
            {indexPromotionEligibility.blockedReasons.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.blockedReasons}</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
                  {indexPromotionEligibility.blockedReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600">{copy.blocked}</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">{copy.providerTitle}</h2>
        {providerInventory ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.minimumProviders}</p>
              <p className="mt-2 font-mono text-sm text-slate-900">{providerInventory.minimumPublishedProviders}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.publishedProviders}</p>
              <p className="mt-2 font-mono text-sm text-slate-900">{providerInventory.publishedProviderCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.inventoryStatus}</p>
              <p className="mt-2 font-mono text-sm text-slate-900">{providerInventory.status}</p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600">{copy.providerEmpty}</p>
        )}
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
