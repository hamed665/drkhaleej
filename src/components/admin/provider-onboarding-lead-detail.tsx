import type { ReactNode } from "react";

import Link from "next/link";

import { ProviderOnboardingLeadHistory } from "@/components/admin/provider-onboarding-lead-history";
import { ProviderOnboardingLeadStatusPriorityForm } from "@/components/admin/provider-onboarding-lead-status-priority-form";

type ProviderLeadStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "qualified"
  | "rejected"
  | "converted"
  | "closed";

type ProviderLeadPriority = "low" | "normal" | "high";

type ProviderOnboardingLeadDetail = {
  id: string;
  createdAt: string;
  updatedAt: string;
  handledAt: string | null;
  centerName: string;
  contactName: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  providerType: string;
  areaText: string | null;
  cityText: string | null;
  preferredLanguage: string | null;
  status: ProviderLeadStatus;
  priority: ProviderLeadPriority;
  requestSource: string;
  consentToContact: boolean;
  message: string | null;
  metadata: unknown;
};

type ProviderOnboardingLeadHistoryEvent = {
  id: string;
  actorProfileId: string | null;
  eventType: string;
  oldStatus: string | null;
  newStatus: string | null;
  oldPriority: string | null;
  newPriority: string | null;
  noteText: string | null;
  metadata: unknown;
  createdAt: string;
};

type ProviderOnboardingLeadDetailProps = {
  lead: ProviderOnboardingLeadDetail;
  historyEvents: ProviderOnboardingLeadHistoryEvent[];
};

const statusStyles: Record<ProviderLeadStatus, string> = {
  new: "border-sky-200 bg-sky-50 text-sky-800",
  reviewing: "border-violet-200 bg-violet-50 text-violet-800",
  contacted: "border-cyan-200 bg-cyan-50 text-cyan-800",
  qualified: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
  converted: "border-teal-200 bg-teal-50 text-teal-800",
  closed: "border-slate-200 bg-slate-100 text-slate-700",
};

const priorityStyles: Record<ProviderLeadPriority, string> = {
  low: "border-slate-200 bg-slate-50 text-slate-700",
  normal: "border-cyan-200 bg-cyan-50 text-cyan-800",
  high: "border-amber-200 bg-amber-50 text-amber-800",
};

function formatDateTime(value: string | null): string {
  if (value === null) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-OM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Muscat",
  }).format(date);
}

function formatLabel(value: string | null): string {
  if (value === null || value.trim().length === 0) {
    return "—";
  }

  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

function locationLabel(
  areaText: string | null,
  cityText: string | null,
): string {
  const parts = [areaText, cityText]
    .filter((part): part is string => typeof part === "string")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return parts.length > 0 ? parts.join(" / ") : "—";
}

function isPlainMetadataObject(
  metadata: unknown,
): metadata is Record<string, unknown> {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    !Array.isArray(metadata)
  );
}

function isUnsafeMetadataKey(key: string): boolean {
  const normalizedKey = key.toLowerCase().replace(/[-\s]+/g, "_");

  return (
    normalizedKey === "ip" ||
    normalizedKey.endsWith("_ip") ||
    normalizedKey.includes("ip_address") ||
    normalizedKey.includes("user_agent") ||
    normalizedKey.includes("useragent")
  );
}

function createSafeMetadata(metadata: unknown): Record<string, unknown> | null {
  if (!isPlainMetadataObject(metadata)) {
    return null;
  }

  const safeEntries = Object.entries(metadata).filter(
    ([key]) => !isUnsafeMetadataKey(key),
  );

  if (safeEntries.length === 0) {
    return null;
  }

  return Object.fromEntries(safeEntries);
}

function metadataHasKeys(
  metadata: unknown,
): metadata is Record<string, unknown> {
  return isPlainMetadataObject(metadata) && Object.keys(metadata).length > 0;
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

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatusBadge({ status }: { status: ProviderLeadStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
    >
      {formatLabel(status)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: ProviderLeadPriority }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${priorityStyles[priority]}`}
    >
      {formatLabel(priority)} priority
    </span>
  );
}

export function ProviderOnboardingLeadUnavailable() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/provider-onboarding-leads"
        className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
      >
        ← Back to leads
      </Link>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h1 className="text-xl font-bold">Lead detail unavailable</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6">
          This read-only lead detail could not be loaded right now. No raw
          database error is exposed here; retry after checking the admin data
          service and environment configuration.
        </p>
      </section>
    </div>
  );
}

export function ProviderOnboardingLeadDetail({
  lead,
  historyEvents,
}: ProviderOnboardingLeadDetailProps) {
  const safeMetadata = createSafeMetadata(lead.metadata);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/provider-onboarding-leads"
        className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
      >
        ← Back to leads
      </Link>

      <header className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50/50 to-slate-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Phase 5.2A-3E · Read-only lead detail
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950">
              {lead.centerName}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Provider onboarding lead submitted by {lead.contactName}. Contact
              fields are displayed as plain text only; updates and outreach are
              intentionally deferred to later approved phases.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-cyan-100 bg-cyan-50/80 p-5 text-sm leading-6 text-cyan-950">
        <span className="font-bold">Admin mutation safety note:</span> this page
        only updates the internal lead status and priority after platform-admin
        authorization. It does not contact the provider, convert the lead,
        create center or provider records, delete data, send notifications,
        publish listings, activate billing or badges, or write audit events.
      </section>

      <DetailSection title="Status and priority update">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Current status
            </p>
            <div className="mt-2">
              <StatusBadge status={lead.status} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Current priority
            </p>
            <div className="mt-2">
              <PriorityBadge priority={lead.priority} />
            </div>
          </div>
        </div>
        <ProviderOnboardingLeadStatusPriorityForm
          leadId={lead.id}
          currentStatus={lead.status}
          currentPriority={lead.priority}
        />
      </DetailSection>

      <ProviderOnboardingLeadHistory events={historyEvents} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <DetailSection title="Provider and contact">
            <dl className="grid gap-4 sm:grid-cols-2">
              <FieldRow label="Lead ID" value={lead.id} />
              <FieldRow label="Center name" value={lead.centerName} />
              <FieldRow label="Contact name" value={lead.contactName} />
              <FieldRow
                label="Provider type"
                value={formatLabel(lead.providerType)}
              />
              <FieldRow label="Phone" value={lead.phone} />
              <FieldRow label="Email" value={lead.email ?? "—"} />
              <FieldRow label="WhatsApp" value={lead.whatsapp ?? "—"} />
              <FieldRow
                label="Consent to contact"
                value={formatBoolean(lead.consentToContact)}
              />
            </dl>
          </DetailSection>

          <DetailSection title="Full message">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-800">
              {lead.message === null || lead.message.trim().length === 0
                ? "No message provided."
                : lead.message}
            </div>
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Timeline">
            <dl className="grid gap-4">
              <FieldRow
                label="Created"
                value={formatDateTime(lead.createdAt)}
              />
              <FieldRow
                label="Updated"
                value={formatDateTime(lead.updatedAt)}
              />
              <FieldRow
                label="Handled"
                value={formatDateTime(lead.handledAt)}
              />
            </dl>
          </DetailSection>

          <DetailSection title="Location and language">
            <dl className="grid gap-4">
              <FieldRow
                label="Area / city"
                value={locationLabel(lead.areaText, lead.cityText)}
              />
              <FieldRow
                label="Preferred language"
                value={formatLabel(lead.preferredLanguage)}
              />
            </dl>
          </DetailSection>

          <DetailSection title="Request and source">
            <dl className="grid gap-4">
              <FieldRow label="Status" value={formatLabel(lead.status)} />
              <FieldRow label="Priority" value={formatLabel(lead.priority)} />
              <FieldRow
                label="Request source"
                value={formatLabel(lead.requestSource)}
              />
            </dl>
          </DetailSection>

          <DetailSection title="Metadata">
            {!metadataHasKeys(lead.metadata) ? (
              <p className="text-sm text-slate-600">No metadata.</p>
            ) : safeMetadata === null ? (
              <p className="text-sm text-slate-600">
                Metadata contains no safe fields to display.
              </p>
            ) : (
              <pre className="max-h-80 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                {JSON.stringify(safeMetadata, null, 2)}
              </pre>
            )}
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
