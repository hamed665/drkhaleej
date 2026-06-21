import { AdminModuleCard } from "@/components/admin/admin-module-card";
import {
  adminModuleGroups,
  partialAdminModules,
} from "@/lib/admin/control-center";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          PHASED_BUILD_ONLY · Admin UI foundation
        </p>
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">
          Admin Control Center
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Structured internal navigation for approved admin modules and future
          control surfaces. Existing workflows remain linked at their current
          URLs; planned modules are shown without broken routes or live editing.
        </p>
      </div>

      {adminModuleGroups.map((group) => (
        <section key={group.title} className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-950">
              {group.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {group.description}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.modules.map((module) => (
              <AdminModuleCard
                key={`${group.title}-${module.title}`}
                module={module}
              />
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-4 rounded-3xl border border-amber-100 bg-amber-50/60 p-5">
        <div>
          <h3 className="text-xl font-bold text-slate-950">
            Partial / read-only foundations
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            These capabilities exist inside active workflows but are not full
            standalone management systems.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {partialAdminModules.map((module) => (
            <AdminModuleCard key={module.title} module={module} />
          ))}
        </div>
      </section>
    </div>
  );
}
