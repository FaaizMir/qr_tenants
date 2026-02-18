import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantAllCoupons from "@/containers/merchant/coupons/listing/merchantAllCoupons";
import { getTranslations } from "next-intl/server";

export default async function MerchantCouponsPage({ embedded = false }) {
  const t = await getTranslations("merchantCoupons.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("merchantDashboard"), url: "/merchant/dashboard" },
    { name: t("couponBatches"), url: "/merchant/coupons" },
  ];

  return (
    <div className="space-y-6">
      {!embedded && <BreadcrumbComponent data={breadcrumbData} />}
      {/* <MerchantCouponsListingContainer embedded={embedded} /> */}
      <MerchantAllCoupons />
    </div>
  );
}
