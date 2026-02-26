import React from "react";
import MerchantPurchase from "@/containers/merchant/purchase";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { useTranslations } from "next-intl";

export default function MerchantPurchasePage() {
  const t = useTranslations("merchantPurchase.page");
  
  const breadcrumbData = [
    { name: t("dashboardBreadcrumb"), url: "/merchant/dashboard" },
    { name: t("breadcrumb"), url: "/merchant/purchase" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantPurchase />
    </>
  );
}
