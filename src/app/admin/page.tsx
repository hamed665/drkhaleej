export default function AdminPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
        Phase 5.2A-3B
      </p>
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">
        Admin access baseline is protected
      </h2>
      <p className="max-w-3xl text-slate-600">
        This minimal admin page verifies the server-side platform-admin guard
        and shell only. Business modules, analytics, provider workflows,
        payments, booking, notifications, AI, file uploads, and private data
        features remain out of scope for this phase.
      </p>
    </div>
  );
}
