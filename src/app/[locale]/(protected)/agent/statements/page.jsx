import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentStatements from "@/containers/agent/statements";

export default function AgentStatementsPage() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/agent/dashboard" },
    { name: "Financial Statements", url: "/agent/statements" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentStatements />
    </>
  );
}
