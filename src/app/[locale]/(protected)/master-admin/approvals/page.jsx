import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminApprovalsContainer from "@/containers/master-admin/approvals";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminApprovalsPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "Approvals", url: "/master-admin/approvals" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MasterAdminApprovalsContainer />
    </>
  );
}
