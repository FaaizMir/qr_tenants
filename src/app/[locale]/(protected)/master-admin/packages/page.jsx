import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackagesTable from "@/containers/master-admin/packages/packages-table";

export default function Packages() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "Packages", url: "/master-admin/packages" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <PackagesTable />
    </>
  );
}
