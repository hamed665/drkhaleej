import type {
  AdminCenterSubscriptionListItem,
  AdminCenterSubscriptionsListResult,
  AdminCenterSubscriptionStatus,
  AdminSubscriptionPlanStatus,
} from "@/server/admin/center-subscriptions";

type CenterSubscriptionsListProps = {
  result: AdminCenterSubscriptionsListResult;
};

const subscriptionStatusStyles: Record<AdminCenterSubscriptionStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  paused: "border-slate-200 bg-slate-50 text-slate-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-800",
  expired: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

const planStatusStyles: Record<AdminSubscriptionPlanStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  active: "border-cyan-200 bg-cyan-50 text-cyan-800",
  inactive: "border-amber-200 bg-amber-50 text-amber-800",
  archived: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

function formatLabel(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim().length === 0) {
    return "—";
  }

  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null): string {
  if (value === null) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-OM", {
    dateStyle: "medium",
    timeZone: "Asia/Muscat",
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-OM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Muscat",
  }).format(date);
}

function formatMoney(amount: number | null, currencyCode: string): string {
  if (amount === null) return "—";

  try {
    return new Intl.NumberFormat("en-OM", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 3,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-OM")} ${currencyCode}`;
  }
}

function notePreview(note: string | null): string {
  if (note === null || note.trim().length === 0) return "—";

  const normalized = note.replace(/\s+/g, " ").trim();
  return normalized.length > 96 ? `${normalized.slice(0, 96)}…` : normalized;
}

function StatusBadge({ status }: { status: AdminCenterSubscriptionStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${subscriptionStatusStyles[status]}`}
    >
      {formatLabel(status)}
    </span>
  );
}

function PlanStatusBadge({ status }: { status: AdminSubscriptionPlanStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${planStatusStyles[status]}`}
    >
      {formatLabel(status)}
    </span>
  );
}

function priceFor(subscription: AdminCenterSubscriptionListItem): string {
  const amount = subscription.agreedPriceAmount ?? subscription.plan?.priceAmount ?? null;
  const currency = subscription.agreedPriceAmount === null
    ? (subscription.plan?.currencyCode ?? subscription.currencyCode)
    : subscription.currencyCode;

  return formatMoney(amount, currency);
}

export function CenterSubscriptionsList({ result }: CenterSubscriptionsListProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          MON-C2
        </p>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">
              Center subscriptions
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Stored commercial overview for center subscription assignments.
              The form above can create or update assignment records only;
              billing, invoices, badges, add-ons, and provider dashboard access
              remain deferred.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm font-medium text-cyan-900">
            Fixed page size: {result.limit} subscriptions
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm leading-6 text-slate-700">
          This list reads existing <strong>subscription_plans</strong> and{" "}
          <strong>center_subscriptions</strong> records. It does not charge,
          invoice, publish badges, or activate ads, offers, or add-ons.
        </p>
      </section>

      {!result.ok ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h3 className="text-lg font-bold">Center subscriptions unavailable</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6">
            Center subscriptions could not be loaded right now. No raw database
            error is exposed here.
          </p>
        </section>
      ) : result.items.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h3 className="text-xl font-bold text-slate-950">
            No center subscriptions found
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            There are no center subscription assignment rows yet. Use the form
            above to create the first admin-only assignment.
          </p>
        </section>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1180px] divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Center</th>
                <th scope="col" className="px-4 py-3 font-semibold">Plan</th>
                <th scope="col" className="px-4 py-3 font-semibold">Subscription</th>
                <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                <th scope="col" className="px-4 py-3 font-semibold">Dates</th>
                <th scope="col" className="px-4 py-3 font-semibold">Sales</th>
                <th scope="col" className="px-4 py-3 font-semibold">Notes</th>
                <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {result.items.map((subscription) => (
                <tr key={subscription.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-950">
                      {subscription.center?.name ?? "Unavailable center"}
                    </div>
                    <div className="mt-1 text-slate-600">
                      {subscription.center?.slug ?? "—"}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {formatLabel(subscription.center?.status)} ·{" "}
                      {formatLabel(subscription.center?.verificationStatus)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-950">
                      {subscription.plan?.name ?? "Unavailable plan"}
                    </div>
                    <div className="mt-1 text-slate-600">
                      {subscription.plan?.slug ?? "—"}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {subscription.plan ? (
                        <PlanStatusBadge status={subscription.plan.status} />
                      ) : null}
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {formatLabel(subscription.plan?.interval)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={subscription.status} />
                    <div className="mt-2 text-slate-600">
                      {formatLabel(subscription.billingInterval)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-950">
                    {priceFor(subscription)}
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600">
                    <div>Start: {formatDate(subscription.startsAt)}</div>
                    <div>End: {formatDate(subscription.endsAt)}</div>
                    <div>Trial: {formatDate(subscription.trialEndsAt)}</div>
                    <div>Cancelled: {formatDate(subscription.cancelledAt)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-800">
                      {subscription.salesProfile?.label ?? "—"}
                    </div>
                    <div className="mt-1 text-slate-600">
                      {subscription.salesProfile?.email ?? "—"}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-4 text-slate-600">
                    {notePreview(subscription.notes)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {formatDateTime(subscription.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
