"use client";

import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
// Logic moved to src/containers/merchant/ads/index.jsx
import MerchantAdsContainer from "@/containers/merchant/ads";

export default function MerchantAdsPage() {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/en/merchant/dashboard" },
    { name: "Ads & Promotions", url: "/en/merchant/ads" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantAdsContainer />
    </>
  );
}
