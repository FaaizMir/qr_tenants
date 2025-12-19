import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentWalletContainer from "@/containers/agent/wallet";
import { getTranslations } from "next-intl/server";

export default async function AgentWalletPage() {
  const tAgentWallet = await getTranslations("dashboard.agentWallet");
  const tAgentDashboard = await getTranslations(
    "dashboard.agentMerchantManagement"
  );
  const data = [
    { name: tAgentDashboard("agentdashboard"), url: "/agent/dashboard" },
    { name: tAgentWallet("agentwallet"), url: "/agent/wallet" },
  ];

  return (
    <>
      <BreadcrumbComponent data={data} />
      <AgentWalletContainer />
    </>
  );
}
