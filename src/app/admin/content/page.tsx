import Link from "next/link";
import { cmsContentTypes, cmsStatuses } from "@/lib/admin/cms-content-options";
import { listAdminCmsContentEntries } from "@/server/admin/cms-content";

type ContentInventoryRow = {
  name: string;
  currentSource: string;
  language: string;
  editableNow: string;
  status: string;
};

const contentInventoryRows: ContentInventoryRow[] = [
  {
    name: "Homepage content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Home search copy",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Home discovery categories",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Home featured / visibility sections",
    currentSource: "Mixed",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Mixed read-only foundation",
  },
  {
    name: "Home special offers section",
    currentSource: "Planned CMS",
    language: "EN/AR",
    editableNow: "Planned CMS",
    status: "Requires CMS model",
  },
  {
    name: "Doctors page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Dental page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Centers page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Labs page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Pharmacies page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Hospitals page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Offers page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based read-only",
  },
  {
    name: "Beauty page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Pet Clinics page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Pet Shops page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "For Providers page content",
    currentSource: "Mixed",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Mixed read-only foundation",
  },
  {
    name: "About page content",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Public discovery FAQs",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based read-only",
  },
  {
    name: "Articles / Wiki content",
    currentSource: "Code-based shell",
    language: "EN/AR",
    editableNow: "Planned CMS",
    status: "Planned CMS",
  },
  {
    name: "Header navigation",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "Footer navigation",
    currentSource: "Code-based active",
    language: "EN/AR",
    editableNow: "Not editable yet",
    status: "Code-based active",
  },
  {
    name: "SEO metadata",
    currentSource: "Mixed",
    language: "EN/AR",
    editableNow: "Planned CMS",
    status: "Requires CMS model",
  },
];

const tableHeaders = [
  "Content area",
  "Current source",
  "Language",
  "Editable now",
  "Status",
] as const;

export default async function AdminContentPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const cmsResult = await listAdminCmsContentEntries({ contentType: String(params.contentType ?? ""), status: String(params.status ?? ""), locale: String(params.locale ?? ""), archived: String(params.archived ?? "active"), search: String(params.search ?? "") });
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Content inventory
        </p>
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">
          Site Content Inventory
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Read-only inventory of current DrMuscat content surfaces. Most public
          text is code-based and is not editable from admin yet. This page does
          not move content into a database and does not create live CMS editing.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              {tableHeaders.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {contentInventoryRows.map((row) => (
              <tr key={row.name}>
                <td className="px-4 py-3 font-semibold text-slate-950">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {row.currentSource}
                </td>
                <td className="px-4 py-3 text-slate-600">{row.language}</td>
                <td className="px-4 py-3 text-slate-600">
                  {row.editableNow}
                </td>
                <td className="px-4 py-3 text-slate-600">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-4 rounded-2xl border border-cyan-100 bg-cyan-50/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">CMS entries</p>
            <h3 className="text-xl font-bold text-slate-950">Internal CMS Core</h3>
            <p className="text-sm text-slate-600">Admin-only draft and revision foundation. Public pages do not read these entries yet.</p>
          </div>
          <Link href="/admin/content/new" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">New CMS entry</Link>
        </div>
        <form className="grid gap-3 md:grid-cols-5">
          <input name="search" placeholder="Search key/title" defaultValue={String(params.search ?? "")} className="rounded-lg border p-2 text-sm" />
          <select name="contentType" defaultValue={String(params.contentType ?? "")} className="rounded-lg border p-2 text-sm"><option value="">All types</option>{cmsContentTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
          <select name="status" defaultValue={String(params.status ?? "")} className="rounded-lg border p-2 text-sm"><option value="">All statuses</option>{cmsStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
          <select name="locale" defaultValue={String(params.locale ?? "")} className="rounded-lg border p-2 text-sm"><option value="">All locales</option><option value="en">en</option><option value="ar">ar</option></select>
          <select name="archived" defaultValue={String(params.archived ?? "active")} className="rounded-lg border p-2 text-sm"><option value="active">Active</option><option value="archived">Archived</option><option value="all">All</option></select>
          <button className="rounded-full border border-slate-300 px-4 py-2 font-semibold">Filter</button>
        </form>
        {!cmsResult.ok ? <p className="rounded-xl bg-white p-4 text-sm text-red-700">CMS entries could not be loaded.</p> : cmsResult.items.length === 0 ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">No CMS entries yet.</p> : <div className="overflow-x-auto rounded-2xl border bg-white"><table className="min-w-full divide-y text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr>{["Key","Type","Locale","Country","Status","Current rev","Created","Updated","Archived"].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead><tbody className="divide-y">{cmsResult.items.map(item => <tr key={item.id}><td className="px-3 py-2 font-semibold"><Link className="text-cyan-700" href={`/admin/content/${item.id}`}>{item.contentKey}</Link></td><td className="px-3 py-2">{item.contentType}</td><td className="px-3 py-2">{item.locale ?? "global"}</td><td className="px-3 py-2">{item.country}</td><td className="px-3 py-2">{item.status}</td><td className="px-3 py-2">{item.currentRevisionNumber ?? "—"}</td><td className="px-3 py-2">{new Date(item.createdAt).toLocaleDateString()}</td><td className="px-3 py-2">{new Date(item.updatedAt).toLocaleDateString()}</td><td className="px-3 py-2">{item.isArchived ? "Archived" : "Active"}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
