import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SupportStaffAccountContainer from "@/containers/master-admin/support-staff/account";

export default function SupportStaffAccountPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/master-admin/dashboard" },
    { name: "Account", url: "/master-admin/support-staff/account" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <SupportStaffAccountContainer />
    </>
  );
}
