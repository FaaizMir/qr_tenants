import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantStatements from "@/containers/merchant/statements";

export default function AgentStatementsPage() {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "Financial Statements", url: "/merchant/statements" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantStatements />
    </>
  );
}
