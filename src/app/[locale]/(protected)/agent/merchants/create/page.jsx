import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import CreateMerchantContainer from "@/containers/agent/merchants/create";
import { getTranslations } from "next-intl/server";

export default async function CreateMerchantPage() {
  const t = await getTranslations("agentMerchants.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("dashboard"), url: "/agent/dashboard" },
    { name: t("merchants"), url: "/agent/merchants" },
    { name: t("create"), url: "/agent/merchants/create" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <CreateMerchantContainer />
    </>
  );
}
