"use client";

import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
// Logic moved to src/containers/merchant/wallet/index.jsx
import MerchantWalletContainer from "@/containers/merchant/wallet";

export default function MerchantWalletPage({ embedded = false }) {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/en/merchant/dashboard" },
    { name: "Wallet", url: "/en/merchant/wallet" },
  ];
  return (
    <>
      {!embedded && <BreadcrumbComponent data={breadcrumbData} />}
      <MerchantWalletContainer embedded={embedded} />
    </>
  );
}
