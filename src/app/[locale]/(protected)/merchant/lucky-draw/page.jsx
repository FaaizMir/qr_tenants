"use client";

import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { useTranslations } from "next-intl";
// Logic moved to src/containers/merchant/lucky-draw/index.jsx
import MerchantLuckyDrawContainer from "@/containers/merchant/lucky-draw";

export default function MerchantLuckyDrawPage() {
  const t = useTranslations("merchantLuckyDraw.page");
  
  const breadcrumbData = [
    { name: t("dashboardBreadcrumb"), url: "/merchant/dashboard" },
    { name: t("breadcrumb"), url: "/merchant/lucky-draw" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantLuckyDrawContainer />
    </>
  );
}
