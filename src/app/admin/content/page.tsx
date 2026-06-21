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

export default function AdminContentPage() {
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
    </div>
  );
}
