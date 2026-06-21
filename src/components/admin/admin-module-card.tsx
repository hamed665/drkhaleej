import Link from "next/link";

import type {
  AdminModule,
  AdminModuleStatus,
} from "@/lib/admin/control-center";

const statusStyles: Record<AdminModuleStatus, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Read-only": "border-sky-200 bg-sky-50 text-sky-800",
  Partial: "border-amber-200 bg-amber-50 text-amber-900",
  Planned: "border-slate-200 bg-slate-100 text-slate-700",
  "Coming next": "border-violet-200 bg-violet-50 text-violet-800",
  "Requires schema": "border-rose-200 bg-rose-50 text-rose-800",
};

export function AdminStatusBadge({ status }: { status: AdminModuleStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function AdminModuleCard({ module }: { module: AdminModule }) {
  const card = (
    <div
      className={`flex h-full flex-col justify-between rounded-2xl border p-4 transition ${
        module.href
          ? "border-slate-200 bg-white shadow-sm hover:border-cyan-200 hover:shadow-md"
          : "border-slate-200 bg-slate-50/80 opacity-80"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-slate-950">
            {module.title}
          </h3>
          <AdminStatusBadge status={module.status} />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {module.description}
        </p>
      </div>
      <p className="mt-4 text-sm font-semibold text-cyan-800">
        {module.href ? "Open module" : "No active route yet"}
      </p>
    </div>
  );

  if (!module.href) {
    return card;
  }

  return (
    <Link
      href={module.href}
      className="block h-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
    >
      {card}
    </Link>
  );
}
