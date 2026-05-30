import Link from "next/link";

type ProviderLeadStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "qualified"
  | "rejected"
  | "converted"
  | "closed";

type ProviderLeadPriority = "low" | "normal" | "high";

type ProviderLeadListItem = {
  id: string;
  createdAt: string;
  centerName: string;
  contactName: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  providerType: string;
  areaText: string | null;
  cityText: string | null;
  preferredLanguage: string | null;
  status: ProviderLeadStatus;
  priority: ProviderLeadPriority;
  messagePreview: string | null;
  requestSource: string;
};

type ProviderLeadListResult =
  | {
      ok: true;
      items: ProviderLeadListItem[];
      totalCount: number;
      limit: number;
      offset: number;
    }
  | {
      ok: false;
      reason: "unavailable";
      items: [];
      totalCount: 0;
      limit: number;
      offset: number;
    };

type ProviderLeadFilters = {
  status: ProviderLeadStatus | "";
  priority: ProviderLeadPriority | "";
  createdFrom: string;
  createdTo: string;
  page: number;
};

type ProviderOnboardingLeadsListProps = {
  result: ProviderLeadListResult;
  filters: ProviderLeadFilters;
};

const statusOptions: ProviderLeadStatus[] = [
  "new",
  "reviewing",
  "contacted",
  "qualified",
  "rejected",
  "converted",
  "closed",
];

const priorityOptions: ProviderLeadPriority[] = ["low", "normal", "high"];

const statusStyles: Record<ProviderLeadStatus, string> = {
  new: "border-sky-200 bg-sky-50 text-sky-800",
  reviewing: "border-violet-200 bg-violet-50 text-violet-800",
  contacted: "border-cyan-200 bg-cyan-50 text-cyan-800",
  qualified: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
  converted: "border-teal-200 bg-teal-50 text-teal-800",
  closed: "border-slate-200 bg-slate-100 text-slate-700",
};

const priorityStyles: Record<ProviderLeadPriority, string> = {
  low: "border-slate-200 bg-slate-50 text-slate-700",
  normal: "border-cyan-200 bg-cyan-50 text-cyan-800",
  high: "border-amber-200 bg-amber-50 text-amber-800",
};

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-OM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Muscat",
  }).format(date);
}

function formatLabel(value: string | null): string {
  if (value === null || value.trim().length === 0) {
    return "—";
  }

  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function locationLabel(areaText: string | null, cityText: string | null): string {
  const parts = [areaText, cityText]
    .filter((part): part is string => typeof part === "string")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return parts.length > 0 ? parts.join(" / ") : "—";
}

function buildPageHref(filters: ProviderLeadFilters, page: number): string {
  const params = new URLSearchParams();

  if (filters.status !== "") params.set("status", filters.status);
  if (filters.priority !== "") params.set("priority", filters.priority);
  if (filters.createdFrom !== "") params.set("createdFrom", filters.createdFrom);
  if (filters.createdTo !== "") params.set("createdTo", filters.createdTo);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query.length > 0
    ? `/admin/provider-onboarding-leads?${query}`
    : "/admin/provider-onboarding-leads";
}

function StatusBadge({ status }: { status: ProviderLeadStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
    >
      {formatLabel(status)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: ProviderLeadPriority }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${priorityStyles[priority]}`}
    >
      {formatLabel(priority)}
    </span>
  );
}

function FieldRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-slate-800">
        {value === null || value.trim().length === 0 ? "—" : value}
      </dd>
    </div>
  );
}

function LeadCard({ lead }: { lead: ProviderLeadListItem }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            {formatDateTime(lead.createdAt)}
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">
            {lead.centerName}
          </h3>
          <p className="text-sm text-slate-600">{lead.contactName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={lead.status} />
          <PriorityBadge priority={lead.priority} />
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <FieldRow label="Phone" value={lead.phone} />
        <FieldRow label="Email" value={lead.email} />
        <FieldRow label="WhatsApp" value={lead.whatsapp} />
        <FieldRow label="Provider type" value={formatLabel(lead.providerType)} />
        <FieldRow label="Area / city" value={locationLabel(lead.areaText, lead.cityText)} />
        <FieldRow
          label="Preferred language"
          value={formatLabel(lead.preferredLanguage)}
        />
        <FieldRow label="Request source" value={formatLabel(lead.requestSource)} />
      </dl>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Message preview
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {lead.messagePreview ?? "No message provided."}
        </p>
      </div>
    </article>
  );
}

export function ProviderOnboardingLeadsList({
  result,
  filters,
}: ProviderOnboardingLeadsListProps) {
  const currentPage = filters.page;
  const totalPages = result.ok
    ? Math.max(1, Math.ceil(result.totalCount / result.limit))
    : 1;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = result.ok && currentPage < totalPages;
  const firstVisibleItem = result.ok && result.totalCount > 0 ? result.offset + 1 : 0;
  const lastVisibleItem = result.ok
    ? Math.min(result.offset + result.items.length, result.totalCount)
    : 0;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Phase 5.2A-3D
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">
              Provider onboarding leads
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Read-only review list for provider onboarding submissions. Status
              actions, assignment, conversion, notifications, and contact links
              are intentionally deferred to later approved phases.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm font-medium text-cyan-900">
            Fixed page size: {result.limit} leads
          </div>
        </div>
      </header>

      <form
        action="/admin/provider-onboarding-leads"
        method="get"
        className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Status</span>
            <select
              name="status"
              defaultValue={filters.status}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Priority</span>
            <select
              name="priority"
              defaultValue={filters.priority}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">All priorities</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {formatLabel(priority)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Created from</span>
            <input
              name="createdFrom"
              type="date"
              defaultValue={filters.createdFrom}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Created to</span>
            <input
              name="createdTo"
              type="date"
              defaultValue={filters.createdTo}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Apply filters
            </button>
            <Link
              href="/admin/provider-onboarding-leads"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Reset
            </Link>
          </div>
        </div>
      </form>

      {!result.ok ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h3 className="text-lg font-bold">Lead list unavailable</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6">
            The read-only lead list could not be loaded right now. No raw
            database error is exposed here; retry after checking the admin data
            service and environment configuration.
          </p>
        </section>
      ) : result.items.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h3 className="text-xl font-bold text-slate-950">No leads found</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            There are no provider onboarding leads matching the current filters.
            Adjust the read-only filters or reset them to review all submitted
            leads.
          </p>
        </section>
      ) : (
        <>
          <div className="text-sm text-slate-600">
            Showing {firstVisibleItem}–{lastVisibleItem} of {result.totalCount} leads.
          </div>

          <div className="space-y-4 lg:hidden">
            {result.items.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="min-w-[1180px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Created</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Center / contact</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Phone</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                  <th scope="col" className="px-4 py-3 font-semibold">WhatsApp</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Provider</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Area / city</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Language</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Priority</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Message preview</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {result.items.map((lead) => (
                  <tr key={lead.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatDateTime(lead.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-950">{lead.centerName}</div>
                      <div className="mt-1 text-slate-600">{lead.contactName}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">{lead.phone}</td>
                    <td className="px-4 py-4">{lead.email ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-4">{lead.whatsapp ?? "—"}</td>
                    <td className="px-4 py-4">{formatLabel(lead.providerType)}</td>
                    <td className="px-4 py-4">{locationLabel(lead.areaText, lead.cityText)}</td>
                    <td className="px-4 py-4">{formatLabel(lead.preferredLanguage)}</td>
                    <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-4"><PriorityBadge priority={lead.priority} /></td>
                    <td className="max-w-xs px-4 py-4 text-slate-600">
                      {lead.messagePreview ?? "No message provided."}
                    </td>
                    <td className="px-4 py-4">{formatLabel(lead.requestSource)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <nav
        aria-label="Provider onboarding lead pagination"
        className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-slate-600">
          Page <span className="font-semibold text-slate-950">{currentPage}</span>
          {result.ok ? (
            <>
              {" "}of <span className="font-semibold text-slate-950">{totalPages}</span>
            </>
          ) : null}
        </p>
        <div className="flex gap-2">
          {hasPreviousPage ? (
            <Link
              href={buildPageHref(filters, currentPage - 1)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Previous
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400">
              Previous
            </span>
          )}
          {hasNextPage ? (
            <Link
              href={buildPageHref(filters, currentPage + 1)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Next
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400">
              Next
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}
