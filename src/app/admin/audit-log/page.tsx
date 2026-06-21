import { requireAdminPermission } from "@/server/admin/permissions";
import { listAdminAuditEvents } from "@/server/admin/audit-log";

export default async function AdminAuditLogPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPermission("admin.audit.read");
  const params = (await searchParams) ?? {};
  const value = (key: string) => typeof params[key] === "string" ? params[key] : undefined;
  const result = await listAdminAuditEvents({ action: value("action"), entityType: value("entityType"), actorEmail: value("actorEmail"), createdFrom: value("createdFrom"), createdTo: value("createdTo") });

  return <section className="space-y-6">
    <div><p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Governance</p><h1 className="text-3xl font-bold text-slate-950">Audit log</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">Read-only server-side audit events for protected admin actions. No secrets, raw sessions, or service role keys are exposed.</p></div>
    <form className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-5">
      <input name="action" placeholder="Action" defaultValue={value("action")} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
      <input name="entityType" placeholder="Entity type" defaultValue={value("entityType")} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
      <input name="actorEmail" placeholder="Actor email" defaultValue={value("actorEmail")} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
      <input name="createdFrom" type="date" defaultValue={value("createdFrom")} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
      <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Filter</button>
    </form>
    {!result.ok ? <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-900">Audit log could not be loaded.</div> : result.items.length === 0 ? <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No audit events yet.</div> : <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Created</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Permission</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Summary</th></tr></thead><tbody className="divide-y divide-slate-100">{result.items.map((event) => <tr key={event.id} className="align-top"><td className="px-4 py-3 text-slate-600">{new Date(event.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })}</td><td className="px-4 py-3">{event.actorEmail ?? event.actorProfileId ?? "System"}</td><td className="px-4 py-3 font-mono text-xs">{event.permissionKey ?? "—"}</td><td className="px-4 py-3 font-mono text-xs">{event.action}</td><td className="px-4 py-3"><div>{event.entityType}</div><div className="font-mono text-xs text-slate-500">{event.entityId ?? "—"}</div></td><td className="px-4 py-3"><div>{event.summary}</div>{event.reason ? <div className="mt-1 text-xs text-slate-500">Reason: {event.reason}</div> : null}</td></tr>)}</tbody></table></div>}
  </section>;
}
