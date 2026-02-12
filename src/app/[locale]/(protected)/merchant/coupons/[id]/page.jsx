import MerchantCouponDetailContainer from "@/containers/merchant/coupons/detail";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { getTranslations } from "next-intl/server";

export default async function CouponBatchDetailPage() {
  const t = await getTranslations("merchantCoupons.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("merchantDashboard"), url: "/merchant/dashboard" },
    { name: t("couponBatches"), url: "/merchant/coupons" },
    { name: t("detail"), url: "#" }, // Name will be dynamic in container, but for breadcrumb in page we can use static or pass it
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantCouponDetailContainer />
    </div>
  );
}
