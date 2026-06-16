import { CenterSubscriptionAssignmentForm } from "@/components/admin/center-subscription-assignment-form";
import { CenterSubscriptionsList } from "@/components/admin/center-subscriptions-list";
import { listAdminCenterSubscriptionAssignmentOptions } from "@/server/admin/center-subscription-options";
import { listAdminCenterSubscriptions } from "@/server/admin/center-subscriptions";

export default async function AdminCenterSubscriptionsPage() {
  const [result, options] = await Promise.all([
    listAdminCenterSubscriptions(),
    listAdminCenterSubscriptionAssignmentOptions(),
  ]);

  return (
    <div className="space-y-8">
      <CenterSubscriptionAssignmentForm options={options} />
      <CenterSubscriptionsList result={result} />
    </div>
  );
}
