"use client";

import { useTranslations } from "next-intl";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SupportContainer from "@/containers/support";

export default function MerchantSupportPage() {
  const t = useTranslations("support.page");
  
  const breadcrumbData = [
    { name: t("dashboardBreadcrumb"), url: "/merchant/dashboard" },
    { name: t("breadcrumb"), url: "/merchant/support" },
  ];
  
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <SupportContainer />
    </>
  );
}
