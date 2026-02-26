import { getTranslations } from "next-intl/server";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantCustomerDataContainer from "@/containers/merchant/customer-data";

export default async function MerchantCustomerDataPage() {
  const t = await getTranslations("merchantCustomerData.page");

  const breadcrumbData = [
    { name: t("dashboardBreadcrumb"), url: "/merchant/dashboard" },
    { name: t("breadcrumb"), url: "/merchant/customer-data" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantCustomerDataContainer />
    </>
  );
}
