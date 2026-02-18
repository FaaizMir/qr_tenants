import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackagesTable from "@/containers/agent/packages/packages-table";

export default function AgentPackages() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/agent/dashboard" },
    { name: "Paid Ads Packages", url: "/agent/packages" },
  ];
  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <PackagesTable />
    </div>
  );
}
