import {
  ProviderOnboardingLeadHistoryItem,
  type ProviderOnboardingLeadHistoryEvent,
} from "./provider-onboarding-lead-history-item";

type ProviderOnboardingLeadHistoryProps = {
  events: ProviderOnboardingLeadHistoryEvent[];
};

export function ProviderOnboardingLeadHistory({
  events,
}: ProviderOnboardingLeadHistoryProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-teal-50/45 to-stone-50 p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            Private admin activity
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-950">
            Lead history
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Visible only to platform admins. This read-only timeline shows
            stored lead events without adding notes, contact actions,
            assignment, or conversion workflow controls.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          Read-only
        </span>
      </div>

      {events.length > 0 ? (
        <ol className="mt-6 space-y-4 border-l border-teal-100">
          {events.map((event) => (
            <ProviderOnboardingLeadHistoryItem key={event.id} event={event} />
          ))}
        </ol>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-teal-200 bg-white/80 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
            <span aria-hidden="true" className="text-lg font-bold">
              ↺
            </span>
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">
            No history entries yet
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Event rows may be empty because event writing and private note add
            actions are scheduled for later phases. The current status and
            priority above can still be valid even when no history rows exist.
          </p>
        </div>
      )}
    </section>
  );
}
