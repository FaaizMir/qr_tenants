"use client";

import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
// Logic moved to src/containers/merchant/customer-data/index.jsx
import MerchantCustomerDataContainer from "@/containers/merchant/customer-data";

export default function MerchantCustomerDataPage() {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "Customer Data", url: "/merchant/customer-data" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantCustomerDataContainer />
    </>
  );
}
