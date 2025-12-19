import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantForm from "@/containers/merchant/merchant-form";
import { getTranslations } from "next-intl/server";

export default async function EditMerchantPage({ params }) {
  const paramsData = await params;
  const { id } = paramsData;
  const tCommon = await getTranslations("common");

  const breadcrumbData = [
    { name: tCommon("dashboard"), url: "/dashboard" },
    { name: "Merchants", url: "/merchants" },
    { name: "Edit Merchant", url: `/merchants/edit/${id}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantForm merchantId={id} isEdit={true} />
    </>
  );
}

