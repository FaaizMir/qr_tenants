"use client";

import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
// Logic moved to src/containers/merchant/dashboard/index.jsx
import MerchantDashboardContainer from "@/containers/merchant/merchant-dashboard";

export default function MerchantDashboardPage() {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantDashboardContainer />
    </>
  );
}
