import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentCouponSyncContainer from "@/containers/agent/coupon-sync";

export default function AgentCouponSyncPage() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/en/agent/dashboard" },
    { name: "Coupon Sync", url: "/en/agent/coupon-sync" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentCouponSyncContainer />
    </>
  );
}
