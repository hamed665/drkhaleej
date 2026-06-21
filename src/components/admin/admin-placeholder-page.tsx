import { AdminStatusBadge } from "@/components/admin/admin-module-card";
import type { AdminModuleStatus } from "@/lib/admin/control-center";

type AdminPlaceholderSection = {
  title: string;
  items: string[];
};

type AdminPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  status?: AdminModuleStatus;
  sections: AdminPlaceholderSection[];
};

export function AdminPlaceholderPage({
  eyebrow,
  title,
  description,
  status = "Planned",
  sections,
}: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          {eyebrow}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">
            {title}
          </h2>
          <AdminStatusBadge status={status} />
        </div>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <h3 className="font-bold text-slate-950">{section.title}</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
