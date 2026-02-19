import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminAccountContainer from "@/containers/master-admin/account";

export default function MasterAdminAccountPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/master-admin/dashboard" },
    { name: "Account", url: "/master-admin/account" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MasterAdminAccountContainer />
    </>
  );
}
