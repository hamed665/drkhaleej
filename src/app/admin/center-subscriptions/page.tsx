import { CenterSubscriptionsList } from "@/components/admin/center-subscriptions-list";
import { listAdminCenterSubscriptions } from "@/server/admin/center-subscriptions";

export default async function AdminCenterSubscriptionsPage() {
  const result = await listAdminCenterSubscriptions();

  return <CenterSubscriptionsList result={result} />;
}
