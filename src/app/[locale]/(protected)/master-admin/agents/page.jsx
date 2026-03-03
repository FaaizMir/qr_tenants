import { getTranslations } from "next-intl/server";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminAgentsContainer from "@/containers/master-admin/agents";

export default async function MasterAdminAgentsPage() {
  const t = await getTranslations("masterAdminAgents.breadcrumb");
  
  const breadcrumbData = [
    { name: t("masterAdminDashboard"), url: "/master-admin/dashboard" },
    { name: t("agents"), url: "/master-admin/agents" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MasterAdminAgentsContainer />
    </>
  );
}
