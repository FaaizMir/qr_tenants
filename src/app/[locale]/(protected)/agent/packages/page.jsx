import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackagesTable from "@/containers/agent/packages/packages-table";
import { getTranslations } from "next-intl/server";

export default async function AgentPackages() {
  const t = await getTranslations("agentPackages");
  
  const breadcrumbData = [
    { name: t("breadcrumbs.dashboard"), url: "/agent/dashboard" },
    { name: t("breadcrumbs.packages"), url: "/agent/packages" },
  ];
  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <PackagesTable />
    </div>
  );
}
