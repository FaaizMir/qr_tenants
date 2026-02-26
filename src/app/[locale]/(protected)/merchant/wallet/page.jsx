"use client";

import { useTranslations } from "next-intl";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
// Logic moved to src/containers/merchant/wallet/index.jsx
import MerchantWalletContainer from "@/containers/merchant/wallet";

export default function MerchantWalletPage({ embedded = false }) {
  const t = useTranslations("merchantWallet.page");
  
  const breadcrumbData = [
    { name: t("dashboardBreadcrumb"), url: "/merchant/dashboard" },
    { name: t("breadcrumb"), url: "/merchant/wallet" },
  ];
  return (
    <>
      {!embedded && <BreadcrumbComponent data={breadcrumbData} />}
      <MerchantWalletContainer embedded={embedded} />
    </>
  );
}
