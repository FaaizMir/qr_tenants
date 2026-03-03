import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminCommissionContainer from "@/containers/master-admin/commission";
import { getTranslations } from "next-intl/server";

export default async function MasterAdminCommissionPage() {
  const t = await getTranslations("masterAdminCommission.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("masterAdminDashboard"), url: "/master-admin/dashboard" },
    { name: t("commission"), url: "/master-admin/commission" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MasterAdminCommissionContainer />
    </>
  );
}
