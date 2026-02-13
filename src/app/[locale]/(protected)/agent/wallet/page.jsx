import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentWalletContainer from "@/containers/agent/wallet";

export default async function AgentWalletPage() {
  const data = [
    { name: "Dashboard", url: "/agent/dashboard" },
    { name: "Wallet", url: "/agent/wallet" },
  ];

  return (
    <>
      <BreadcrumbComponent data={data} />
      <AgentWalletContainer />
    </>
  );
}
