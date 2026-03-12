import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import CreateMerchantContainer from "@/containers/agent/merchants/create";
import { getTranslations } from "next-intl/server";

export default async function CreateMerchantPage({ params }) {
  const paramsData = await params;
  const tCommon = await getTranslations("common");

  const breadcrumbData = [
    { name: tCommon("dashboard"), url: "/dashboard" },
    { name: "Merchants", url: "/agent/merchants" },
    { name: "Create Merchant", url: "/agent/merchants/create" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <CreateMerchantContainer />
    </>
  );
}

