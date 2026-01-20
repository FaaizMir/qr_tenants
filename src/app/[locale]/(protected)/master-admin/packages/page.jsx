import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackagesTable from "@/containers/master-admin/packages/packages-table";
import AgentSubscriptionFee from "@/containers/master-admin/packages/agent-subscription-fee";

export default function Packages() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "Packages", url: "/master-admin/packages" },
  ];
  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <div className="px-4">
        <AgentSubscriptionFee />
      </div>
      <PackagesTable />
    </div>
  );
}
