import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import StatementsContainer from "@/containers/statements";

export default function AgentStatementsPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "Financial Statements", url: "/master-admin/statements" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <StatementsContainer />
    </>
  );
}
