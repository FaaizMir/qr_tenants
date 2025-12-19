import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantCreateCouponContainer from "@/containers/merchant/coupons/create";
import { getTranslations } from "next-intl/server";

export default async function CreateCouponPage({ params }) {
  const tCommon = await getTranslations("common");

  const breadcrumbData = [
    { name: tCommon("dashboard"), url: "/merchant/dashboard" },
    { name: "Coupons", url: "/merchant/coupons" },
    { name: "Create Coupon Batch", url: "/merchant/coupons/create" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantCreateCouponContainer />
    </>
  );
}

