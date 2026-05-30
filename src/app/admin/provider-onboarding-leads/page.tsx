import { ProviderOnboardingLeadsList } from "@/components/admin/provider-onboarding-leads-list";
import {
  listAdminProviderOnboardingLeads,
  type ProviderOnboardingLeadPriority,
  type ProviderOnboardingLeadStatus,
} from "@/server/admin/provider-onboarding-leads";

type AdminProviderOnboardingLeadsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const allowedStatuses = [
  "new",
  "reviewing",
  "contacted",
  "qualified",
  "rejected",
  "converted",
  "closed",
] as const satisfies readonly ProviderOnboardingLeadStatus[];

const allowedPriorities = [
  "low",
  "normal",
  "high",
] as const satisfies readonly ProviderOnboardingLeadPriority[];

const pageSize = 50;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isAllowedStatus(
  value: string | undefined,
): value is ProviderOnboardingLeadStatus {
  return allowedStatuses.some((allowedStatus) => allowedStatus === value);
}

function isAllowedPriority(
  value: string | undefined,
): value is ProviderOnboardingLeadPriority {
  return allowedPriorities.some((allowedPriority) => allowedPriority === value);
}

function normalizeStatus(
  value: string | string[] | undefined,
): ProviderOnboardingLeadStatus | "" {
  const status = firstParam(value);

  return isAllowedStatus(status) ? status : "";
}

function normalizePriority(
  value: string | string[] | undefined,
): ProviderOnboardingLeadPriority | "" {
  const priority = firstParam(value);

  return isAllowedPriority(priority) ? priority : "";
}

function normalizeDate(value: string | string[] | undefined): string {
  const dateValue = firstParam(value)?.trim();

  if (dateValue === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return "";
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateValue
  ) {
    return "";
  }

  return dateValue;
}

function normalizePage(value: string | string[] | undefined): number {
  const pageValue = firstParam(value);
  const page = Number(pageValue);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export default async function AdminProviderOnboardingLeadsPage({
  searchParams,
}: AdminProviderOnboardingLeadsPageProps) {
  const params = (await searchParams) ?? {};
  const status = normalizeStatus(params.status);
  const priority = normalizePriority(params.priority);
  const createdFrom = normalizeDate(params.createdFrom);
  const createdTo = normalizeDate(params.createdTo);
  const page = normalizePage(params.page);
  const offset = (page - 1) * pageSize;

  const result = await listAdminProviderOnboardingLeads({
    status: status === "" ? null : status,
    priority: priority === "" ? null : priority,
    createdFrom: createdFrom === "" ? null : createdFrom,
    createdTo: createdTo === "" ? null : createdTo,
    limit: pageSize,
    offset,
  });

  return (
    <ProviderOnboardingLeadsList
      result={result}
      filters={{ status, priority, createdFrom, createdTo, page }}
    />
  );
}
