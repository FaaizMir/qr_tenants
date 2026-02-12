import { useTranslations } from "next-intl";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
// Logic moved to src/containers/merchant/dashboard/index.jsx
import MerchantDashboardContainer from "@/containers/merchant/merchant-dashboard";

export default function MerchantDashboardPage() {
  const t = useTranslations("merchantDashboard.page");
  
  const breadcrumbData = [
    { name: t("breadcrumb"), url: "/merchant/dashboard" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantDashboardContainer />
    </>
  );
}
