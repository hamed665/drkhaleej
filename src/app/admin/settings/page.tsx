import { adminPermissionGroups, adminRoles } from "@/lib/admin/permissions";
import { requireAdminPermission } from "@/server/admin/permissions";

export default async function AdminSettingsPage() {
  const admin = await requireAdminPermission("admin.settings.read");
  const permissionSet = new Set(admin.permissions);
  const adminName =
    admin.profile.display_name ?? admin.profile.full_name ?? admin.profile.email ?? admin.profile.id;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Governance</p>
        <h1 className="text-3xl font-bold text-slate-950">Roles / Access Overview</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Read-only overview of the current platform-admin permission context. Role assignment UI is
          planned but not active.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase text-slate-500">Current admin</p>
          <p className="mt-2 font-semibold">{adminName}</p>
          <p className="mt-1 text-xs text-slate-500">Profile ID: {admin.profile.id}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase text-slate-500">Resolved role</p>
          <p className="mt-2 font-semibold">{adminRoles[admin.role].label}</p>
          <p className="mt-1 text-xs text-slate-500">
            Existing is_platform_admin profiles resolve as super_admin.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase text-slate-500">Current permissions</p>
          <p className="mt-2 text-2xl font-bold">{admin.permissions.length}</p>
          <p className="mt-1 text-xs text-slate-500">Active foundation permissions only.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold">Grouped permissions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {adminPermissionGroups.map((group) => (
            <div key={group.label} className="rounded-2xl border border-slate-100 p-4">
              <h3 className="font-semibold">{group.label}</h3>
              <ul className="mt-3 space-y-2">
                {group.permissions.map((permission) => {
                  const isActive = permissionSet.has(permission);

                  return (
                    <li key={permission} className="flex items-center justify-between gap-3 text-sm">
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs">{permission}</code>
                      <span className={isActive ? "text-emerald-700" : "text-slate-400"}>
                        {isActive ? "Active" : "Future"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        No role editing, admin creation, invitations, signup, password management, or auth flow
        changes are enabled in this PR.
      </div>
    </section>
  );
}
