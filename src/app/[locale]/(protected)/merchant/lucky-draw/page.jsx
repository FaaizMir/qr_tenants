"use client";

import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
// Logic moved to src/containers/merchant/lucky-draw/index.jsx
import MerchantLuckyDrawContainer from "@/containers/merchant/lucky-draw";

export default function MerchantLuckyDrawPage() {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "Lucky Draw", url: "/merchant/lucky-draw" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantLuckyDrawContainer />
    </>
  );
}
