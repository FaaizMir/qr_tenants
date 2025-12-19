import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentEarningsContainer from "@/containers/agent/earnings";
import { getTranslations } from "next-intl/server";

export default async function AgentEarningsPage() {
  const tAgentEarnings = await getTranslations("dashboard.agentEarnings");
  const breadcrumbData = [
    { name: tAgentEarnings("agentdashboard"), url: "/agent/dashboard" },
    { name: tAgentEarnings("earnings"), url: "/agent/earnings" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentEarningsContainer />
    </>
  );
}
