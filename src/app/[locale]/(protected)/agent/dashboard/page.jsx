import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentDashboardContainer from "@/containers/agent/admin-dashboard";

export default function AgentDashboardPage() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/en/agent/dashboard" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentDashboardContainer />
    </>
  );
}
