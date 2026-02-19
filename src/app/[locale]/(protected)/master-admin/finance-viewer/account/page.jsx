import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import FinanceViewerAccountContainer from "@/containers/finance-viewer/account";

export default function FinanceViewerAccountPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/master-admin/dashboard" },
    { name: "Account", url: "/master-admin/finance-viewer/account" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <FinanceViewerAccountContainer />
    </>
  );
}
