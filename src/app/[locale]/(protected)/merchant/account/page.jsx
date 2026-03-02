import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantAccountContainer from "@/containers/merchant/account";
import { useTranslations } from "next-intl";

export default function MerchantAccountPage() {
  const t = useTranslations("merchantAccount.page.breadcrumb");
  
  const breadcrumbData = [
    { name: t("dashboard"), url: "/merchant/dashboard" },
    { name: t("account"), url: "/merchant/account" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantAccountContainer />
    </>
  );
}
