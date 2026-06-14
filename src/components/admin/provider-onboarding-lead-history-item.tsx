export type ProviderOnboardingLeadHistoryEvent = {
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

type ProviderOnboardingLeadHistoryItemProps = {
  event: ProviderOnboardingLeadHistoryEvent;
};

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Timestamp unavailable";
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

function getEventLabel(eventType: string): string {
  if (eventType === "status_changed") return "Status changed";
  if (eventType === "priority_changed") return "Priority changed";
  if (eventType === "note_added") return "Private note added";

  return "Lead event";
}

function getEventDetail(event: ProviderOnboardingLeadHistoryEvent): string {
  if (event.eventType === "status_changed") {
    if (event.oldStatus === null) {
      return `Status set to ${formatLabel(event.newStatus)}`;
    }

    return `${formatLabel(event.oldStatus)} → ${formatLabel(event.newStatus)}`;
  }

  if (event.eventType === "priority_changed") {
    if (event.oldPriority === null) {
      return `Priority set to ${formatLabel(event.newPriority)}`;
    }

    return `${formatLabel(event.oldPriority)} → ${formatLabel(event.newPriority)}`;
  }

  if (event.eventType === "note_added") {
    return (
      event.noteText?.trim() ||
      "Private admin note saved without displayable text."
    );
  }

  return "A private lead activity entry was recorded for this lead.";
}

export function ProviderOnboardingLeadHistoryItem({
  event,
}: ProviderOnboardingLeadHistoryItemProps) {
  const isNote = event.eventType === "note_added";

  return (
    <li className="relative pl-8">
      <span className="absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-teal-200 bg-white shadow-[0_0_0_5px_rgba(221,235,232,0.72)]">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-700" />
      </span>

      <article className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {getEventLabel(event.eventType)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {formatDateTime(event.createdAt)}
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[0.7rem] font-semibold text-teal-800">
            Private admin activity
          </span>
        </div>

        <p
          className={`mt-3 text-sm leading-6 ${
            isNote
              ? "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
              : "font-medium text-slate-800"
          }`}
        >
          {getEventDetail(event)}
        </p>
      </article>
    </li>
  );
}
