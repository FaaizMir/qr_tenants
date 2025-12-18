import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantForm from "@/containers/merchants/merchant-form";
import { getTranslations } from "next-intl/server";

export default async function CreateMerchantPage({ params }) {
  const paramsData = await params;
  const tCommon = await getTranslations("common");

  const breadcrumbData = [
    { name: tCommon("home"), url: "/dashboard" },
    { name: "Merchants", url: "/merchants" },
    { name: "Create Merchant", url: "/merchants/create" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantForm isEdit={false} />
    </>
  );
}

