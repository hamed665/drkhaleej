import Link from "next/link";

import { ProviderOnboardingLeadDraftCenterForm } from "@/components/admin/provider-onboarding-lead-draft-center-form";

type ProviderOnboardingLeadDraftCenterPanelProps = {
  centerName: string;
  leadId: string;
  metadata: unknown;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function metadataString(metadata: unknown, key: string): string | null {
  if (!isPlainObject(metadata)) return null;

  const value = metadata[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function ProviderOnboardingLeadDraftCenterPanel({
  centerName,
  leadId,
  metadata,
}: ProviderOnboardingLeadDraftCenterPanelProps) {
  const draftCenterId = metadataString(metadata, "draft_center_id");
  const draftCenterSlug = metadataString(metadata, "draft_center_slug");

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
        CENTER-A
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-950">
        Draft center creation
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Create an internal draft center from this lead so a plan can be assigned
        later. The draft center is not published, verified, claimed, billed, or
        shown as a paid placement.
      </p>

      {draftCenterId !== null ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
          <p className="font-bold">Draft center already linked.</p>
          <p className="mt-1">
            {centerName} · {draftCenterSlug ?? draftCenterId}
          </p>
          <Link
            href="/admin/center-subscriptions"
            className="mt-3 inline-flex rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
          >
            Open center subscriptions
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <ProviderOnboardingLeadDraftCenterForm leadId={leadId} />
        </div>
      )}
    </section>
  );
}
