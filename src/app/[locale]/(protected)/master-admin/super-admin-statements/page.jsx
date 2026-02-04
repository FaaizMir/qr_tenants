import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SuperAdminStatementsContainer from "@/containers/master-admin/super-admin-statements";

export default function SuperAdminStatementsPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    {
      name: "Super Admin Statements",
      url: "/master-admin/super-admin-statements",
    },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <SuperAdminStatementsContainer />
    </>
  );
}
