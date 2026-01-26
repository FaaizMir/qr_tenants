import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SupportContainer from "@/containers/support";

export default function MasterSupportPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "Support", url: "/master-admin/support" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <SupportContainer />
    </>
  );
}
