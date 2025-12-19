import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentWalletContainer from "@/containers/agent/wallet";

export default function AgentWalletPage() {
  const data = [
    { name: "Agent Dashboard", url: "/en/agent/dashboard" },
    { name: "Agent Wallet", url: "/en/agent/wallet" },
  ];

  return (
    <>
      <BreadcrumbComponent data={data} />
      <AgentWalletContainer />
    </>
  );
}
