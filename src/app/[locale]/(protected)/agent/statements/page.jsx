import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentStatementsContainer from "@/containers/agent/statements";

export default function AgentStatementsPage() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/agent/dashboard" },
    { name: "Financial Statements", url: "/agent/statements" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentStatementsContainer />
    </>
  );
}
