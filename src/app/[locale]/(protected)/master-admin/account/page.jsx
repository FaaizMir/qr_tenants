import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminAccountContainer from "@/containers/master-admin/account";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminAccountPage() {
  const t = await getTranslations("masterAdminAccount.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("dashboard"), url: "/master-admin/dashboard" },
    { name: t("account"), url: "/master-admin/account" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MasterAdminAccountContainer />
    </>
  );
}
