import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentAccountContainer from "@/containers/agent/account";

export default function AgentAccountPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/agent/dashboard" },
    { name: "Account", url: "/agent/account" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentAccountContainer />
    </>
  );
}
