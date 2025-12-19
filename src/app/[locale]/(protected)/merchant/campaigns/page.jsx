"use client";

import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
// Logic moved to src/containers/merchant/campaigns/index.jsx
import MerchantCampaignsContainer from "@/containers/merchant/campaigns";

export default function MerchantCampaignsPage() {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "Campaigns", url: "/merchant/campaigns" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantCampaignsContainer />
    </>
  );
}
