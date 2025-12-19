import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentStatementsContainer from "@/containers/agent/statements";

export default function AgentStatementsPage() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/en/agent/dashboard" },
    { name: "Financial Statements", url: "/en/agent/statements" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentStatementsContainer />
    </>
  );
}
