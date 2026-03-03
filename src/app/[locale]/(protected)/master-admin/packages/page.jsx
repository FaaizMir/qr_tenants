import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackagesTable from "@/containers/master-admin/packages/packages-table";
import { getTranslations } from "next-intl/server";
// import AgentSubscriptionFee from "@/containers/master-admin/packages/agent-subscription-fee";

export default async function Packages() {
  const t = await getTranslations("masterAdminPackages");
  
  const breadcrumbData = [
    { name: t("breadcrumb.masterAdminDashboard"), url: "/master-admin/dashboard" },
    { name: t("breadcrumb.packages"), url: "/master-admin/packages" },
  ];
  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <div className="px-4">
        {/* <AgentSubscriptionFee /> */}
      </div>
      <PackagesTable />
    </div>
  );
}
