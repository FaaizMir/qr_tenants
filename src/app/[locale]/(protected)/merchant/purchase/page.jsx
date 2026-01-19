import React from "react";
import MerchantPurchase from "@/containers/merchant/purchase";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default function MerchantPurchasePage() {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "Purchase", url: "/merchant/purchase" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantPurchase />
    </>
  );
}
