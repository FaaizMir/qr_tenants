import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentEarningsContainer from "@/containers/agent/earnings";

export default async function AgentEarningsPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/agent/dashboard" },
    { name: "Earnings", url: "/agent/earnings" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentEarningsContainer />
    </>
  );
}
