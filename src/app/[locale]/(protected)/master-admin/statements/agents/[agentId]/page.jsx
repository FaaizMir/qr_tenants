import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentStatementsContainer from "@/containers/master-admin/agent-statements";

export default function AgentStatementsPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "Agents", url: "/master-admin/agents" },
    { name: "Agent Statements", url: "/master-admin/statements" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentStatementsContainer />
    </>
  );
}
