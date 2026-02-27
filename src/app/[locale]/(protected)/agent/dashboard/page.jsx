import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentDashboardContainer from "@/containers/agent/admin-dashboard";
import { getTranslations } from "next-intl/server";

export default async function AgentDashboardPage() {
  const t = await getTranslations("agentDashboard.page");
  
  const breadcrumbData = [
    { name: t("breadcrumb"), url: "/agent/dashboard" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentDashboardContainer />
    </>
  );
}
