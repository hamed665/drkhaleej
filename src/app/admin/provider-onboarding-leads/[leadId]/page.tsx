import { notFound } from "next/navigation";

import {
  ProviderOnboardingLeadDetail,
  ProviderOnboardingLeadUnavailable,
} from "@/components/admin/provider-onboarding-lead-detail";
import {
  getAdminProviderOnboardingLeadById,
  listProviderOnboardingLeadEvents,
} from "@/server/admin/provider-onboarding-leads";

type AdminProviderOnboardingLeadDetailPageProps = {
  params: Promise<{
    leadId: string;
  }>;
};

export default async function AdminProviderOnboardingLeadDetailPage({
  params,
}: AdminProviderOnboardingLeadDetailPageProps) {
  const { leadId } = await params;
  const result = await getAdminProviderOnboardingLeadById(leadId);

  if (!result.ok) {
    if (result.reason === "not_found") {
      notFound();
    }

    return <ProviderOnboardingLeadUnavailable />;
  }

  const historyResult = await listProviderOnboardingLeadEvents(leadId);
  const historyEvents = historyResult.ok ? historyResult.events : [];

  return (
    <ProviderOnboardingLeadDetail
      lead={result.lead}
      historyEvents={historyEvents}
    />
  );
}
