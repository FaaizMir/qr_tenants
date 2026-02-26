import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SupportContainer from "@/containers/support";
import { getTranslations } from "next-intl/server";

export default async function MasterSupportPage() {
  const t = await getTranslations("support.page.masterAdmin");
  
  const breadcrumbData = [
    { name: t("dashboardBreadcrumb"), url: "/master-admin/dashboard" },
    { name: t("breadcrumb"), url: "/master-admin/support" },
  ];
  
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <SupportContainer />
    </>
  );
}
