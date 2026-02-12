import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantCreateCouponContainer from "@/containers/merchant/coupons/create";
import { getTranslations } from "next-intl/server";

export default async function CreateCouponPage({ params }) {
  const t = await getTranslations("merchantCoupons.breadcrumbs");

  const breadcrumbData = [
    { name: t("merchantDashboard"), url: "/merchant/dashboard" },
    { name: t("coupons"), url: "/merchant/coupons" },
    { name: t("createCouponBatch"), url: "/merchant/coupons/create" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantCreateCouponContainer />
    </>
  );
}

