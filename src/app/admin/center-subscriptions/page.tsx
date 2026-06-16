import { BasePlanCatalogSyncPanel } from "@/components/admin/base-plan-catalog-sync-panel";
import { CenterSubscriptionAssignmentForm } from "@/components/admin/center-subscription-assignment-form";
import { CenterSubscriptionsList } from "@/components/admin/center-subscriptions-list";
import { listAdminCenterSubscriptionAssignmentOptions } from "@/server/admin/center-subscription-options";
import { listAdminCenterSubscriptions } from "@/server/admin/center-subscriptions";

export default async function AdminCenterSubscriptionsPage() {
  const [result, options] = await Promise.all([
    listAdminCenterSubscriptions(),
    listAdminCenterSubscriptionAssignmentOptions(),
  ]);
  const visiblePlanCount = options.ok ? options.plans.length : 0;

  return (
    <div className="space-y-8">
      <BasePlanCatalogSyncPanel visiblePlanCount={visiblePlanCount} />
      <CenterSubscriptionAssignmentForm options={options} />
      <CenterSubscriptionsList result={result} />
    </div>
  );
}
