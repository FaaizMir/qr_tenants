import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentSupportContainer from "@/containers/agent/support";

export default function AgentSupportPage() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/en/agent/dashboard" },
    { name: "Support", url: "/en/agent/support" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentSupportContainer />
    </>
  );
}
