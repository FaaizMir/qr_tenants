import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SupportContainer from "@/containers/support";
import { getTranslations } from "next-intl/server";

export default async function AgentSupportPage() {
  const t = await getTranslations("support.page.agent");
  
  const breadcrumbData = [
    { name: t("dashboardBreadcrumb"), url: "/agent/dashboard" },
    { name: t("breadcrumb"), url: "/agent/support" },
  ];
  
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <SupportContainer />
    </>
  );
}
