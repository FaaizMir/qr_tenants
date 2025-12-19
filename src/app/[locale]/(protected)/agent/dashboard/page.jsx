import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentDashboardContainer from "@/containers/agent/admin-dashboard";
import { getTranslations } from "next-intl/server";

export default async function AgentDashboardPage() {
  const tAgentDashboard = await getTranslations("dashboard.agentDashboard");
  const breadcrumbData = [
    { name: tAgentDashboard("agentdashboard"), url: "/agent/dashboard" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentDashboardContainer />
    </>
  );
}
