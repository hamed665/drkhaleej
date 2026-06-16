import { CommercialAddOnAssignmentForm } from "@/components/admin/commercial-add-on-assignment-form";
import { listAdminCommercialAddOns } from "@/server/admin/commercial-addons";

export default async function AdminCommercialAddOnsPage() {
  const result = await listAdminCommercialAddOns();

  return (
    <div className="space-y-8">
      <CommercialAddOnAssignmentForm centers={result.centers} />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          ADDON-A
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-slate-950">
          Add-on assignments
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Internal add-on assignment shell. Current records: {result.items.length}.
        </p>
      </section>
    </div>
  );
}
