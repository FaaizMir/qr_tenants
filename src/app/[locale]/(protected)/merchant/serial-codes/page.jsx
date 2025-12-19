"use client";

import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
// Logic moved to src/containers/merchant/serial-codes/index.jsx
import MerchantSerialCodesContainer from "@/containers/merchant/serial-codes";

export default function MerchantSerialCodesPage() {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/en/merchant/dashboard" },
    { name: "Serial Codes", url: "/en/merchant/serial-codes" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />{" "}
      <MerchantSerialCodesContainer />
    </>
  );
}
