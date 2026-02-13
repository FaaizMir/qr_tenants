import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentDashboardContainer from "@/containers/agent/admin-dashboard";

export default async function AgentDashboardPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/agent/dashboard" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentDashboardContainer />
    </>
  );
}
