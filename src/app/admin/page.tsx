import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Phase 5.2A-3D
        </p>
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">
          Admin access baseline is protected
        </h2>
        <p className="max-w-3xl text-slate-600">
          This minimal admin area verifies the server-side platform-admin guard
          and shell. Business mutations, analytics, provider workflows,
          payments, booking, notifications, AI, file uploads, and private data
          features remain out of scope unless explicitly approved.
        </p>
      </div>

      <section className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-800">
          Approved read-only module
        </p>
        <h3 className="mt-2 text-xl font-bold text-slate-950">
          Provider onboarding lead review
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
          Review provider onboarding submissions in a protected, read-only list.
          Status actions, contact actions, assignment, conversion, and audit
          writes come later in separately approved phases.
        </p>
        <Link
          href="/admin/provider-onboarding-leads"
          className="mt-4 inline-flex rounded-2xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        >
          Open read-only lead list
        </Link>
      </section>
    </div>
  );
}
