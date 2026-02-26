import { getTranslations } from "next-intl/server";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import CustomerDetailsContainer from "@/containers/merchant/customer-data/CustomerDetailsContainer";

export default async function CustomerDetailsPage({ params }) {
  const { id } = await params;
  const t = await getTranslations("merchantCustomerData.page");

  const breadcrumbData = [
    { name: t("dashboardBreadcrumb"), url: "/merchant/dashboard" },
    { name: t("breadcrumb"), url: "/merchant/customer-data" },
    {
      name: t("customerDetailsBreadcrumb"),
      url: `/merchant/customer-data/${id}`,
    },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <CustomerDetailsContainer id={id} />
    </>
  );
}
