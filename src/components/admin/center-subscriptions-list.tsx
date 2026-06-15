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

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-slate-800">{value}</dd>
    </div>
  );
}

function CenterSubscriptionCard({
  subscription,
}: {
  subscription: AdminCenterSubscriptionListItem;
}) {
  const centerLabel = subscription.center?.name ?? "Unavailable center";
  const centerMeta = subscription.center
    ? `${subscription.center.slug} · ${formatLabel(subscription.center.status)}`
    : "Related center is unavailable or deleted";
  const planLabel = subscription.plan?.name ?? "Unavailable plan";
  const planMeta = subscription.plan
    ? `${subscription.plan.slug} · ${formatLabel(subscription.plan.interval)}`
    : "Related plan is unavailable or deleted";
  const priceAmount =
    subscription.agreedPriceAmount ?? subscription.plan?.priceAmount ?? null;
  const priceCurrency = subscription.agreedPriceAmount === null
    ? (subscription.plan?.currencyCode ?? subscription.currencyCode)
    : subscription.currencyCode;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            Updated {formatDateTime(subscription.updatedAt)}
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">
            {centerLabel}
          </h3>
          <p className="text-sm text-slate-600">{centerMeta}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={subscription.status} />
          {subscription.plan ? <PlanStatusBadge status={subscription.plan.status} /> : null}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <FieldRow label="Plan" value={planLabel} />
        <FieldRow label="Plan details" value={planMeta} />
        <FieldRow
          label="Price"
          value={formatMoney(priceAmount, priceCurrency)}
        />
        <FieldRow
          label="Billing interval"
          value={formatLabel(subscription.billingInterval)}
        />
        <FieldRow label="Starts" value={formatDate(subscription.startsAt)} />
        <FieldRow label="Ends" value={formatDate(subscription.endsAt)} />
        <FieldRow
          label="Trial ends"
          value={formatDate(subscription.trialEndsAt)}
        />
        <FieldRow
          label="Cancelled"
          value={formatDate(subscription.cancelledAt)}
        />
        <FieldRow
          label="Sales profile"
          value={subscription.salesProfile?.label ?? "—"}
        />
        <FieldRow label="Notes" value={notePreview(subscription.notes)} />
      </dl>
    </article>
  );
}

export function CenterSubscriptionsList({ result }: CenterSubscriptionsListProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          MON-C1
        </p>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">
              Center subscriptions
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Read-only commercial overview for center subscription assignments.
              Plan assignment, billing actions, upgrades, downgrades, and
              cancellation workflows are intentionally deferred to MON-C2.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm font-medium text-cyan-900">
            Fixed page size: {result.limit} subscriptions
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm leading-6 text-slate-700">
          This page uses existing <strong>subscription_plans</strong> and{" "}
          <strong>center_subscriptions</strong> records only. It does not create,
          edit, cancel, bill, invoice, or publish anything.
        </p>
      </section>

      {!result.ok ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h3 className="text-lg font-bold">Center subscriptions unavailable</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6">
            Center subscriptions could not be loaded right now. No raw database
            error is exposed here; retry after checking the admin data service
            and environment configuration.
          </p>
        </section>
      ) : result.items.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h3 className="text-xl font-bold text-slate-950">
            No center subscriptions found
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            There are no active center subscription assignment rows yet. This is
            a read-only page; MON-C2 will handle assignment actions later.
          </p>
        </section>
      ) : (
        <>
          <div className="text-sm text-slate-600">
            Showing {result.items.length} center subscription records.
          </div>

          <div className="space-y-4 xl:hidden">
            {result.items.map((subscription) => (
              <CenterSubscriptionCard
                key={subscription.id}
                subscription={subscription}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm xl:block">
            <table className="min-w-[1320px] divide-y divide-slate-200 text-left text-sm">
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
                {result.items.map((subscription) => {
                  const priceAmount =
                    subscription.agreedPriceAmount ??
                    subscription.plan?.priceAmount ??
                    null;
                  const priceCurrency = subscription.agreedPriceAmount === null
                    ? (subscription.plan?.currencyCode ?? subscription.currencyCode)
                    : subscription.currencyCode;

                  return (
                    <tr key={subscription.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-950">
                          {subscription.center?.name ?? "Unavailable center"}
                        </div>
                        <div className="mt-1 text-slate-600">
                          {subscription.center?.slug ?? "—"}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-700">
                            {formatLabel(subscription.center?.status)}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-700">
                            {formatLabel(subscription.center?.verificationStatus)}
                          </span>
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
                        {formatMoney(priceAmount, priceCurrency)}
                      </td>
                      <td className="px-4 py-4">
                        <dl className="space-y-1 text-xs text-slate-600">
                          <div>
                            <dt className="inline font-semibold text-slate-700">Start: </dt>
                            <dd className="inline">{formatDate(subscription.startsAt)}</dd>
                          </div>
                          <div>
                            <dt className="inline font-semibold text-slate-700">End: </dt>
                            <dd className="inline">{formatDate(subscription.endsAt)}</dd>
                          </div>
                          <div>
                            <dt className="inline font-semibold text-slate-700">Trial: </dt>
                            <dd className="inline">{formatDate(subscription.trialEndsAt)}</dd>
                          </div>
                          <div>
                            <dt className="inline font-semibold text-slate-700">Cancelled: </dt>
                            <dd className="inline">{formatDate(subscription.cancelledAt)}</dd>
                          </div>
                        </dl>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
