import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import StatementsContainer from "@/containers/master-admin/statements";

export default function AllStatementsPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "All Statements", url: "/master-admin/statements" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <StatementsContainer />
    </>
  );
}
