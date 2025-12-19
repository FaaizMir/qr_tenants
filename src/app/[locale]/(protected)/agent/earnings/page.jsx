import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentEarningsContainer from "@/containers/agent/earnings";

export default function AgentEarningsPage() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/en/agent/dashboard" },
    { name: "Earnings", url: "/en/agent/earnings" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentEarningsContainer />
    </>
  );
}
