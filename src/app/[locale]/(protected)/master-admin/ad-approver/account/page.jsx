import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AdApproverAccountContainer from "@/containers/master-admin/ad-approver/account";

export default function AdApproverAccountPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/master-admin/dashboard" },
    { name: "Account", url: "/master-admin/ad-approver/account" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AdApproverAccountContainer />
    </>
  );
}
