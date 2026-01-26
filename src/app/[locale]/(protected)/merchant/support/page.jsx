import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SupportContainer from "@/containers/support";

export default function MerchantSupportPage() {
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "Support", url: "/merchant/support" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <SupportContainer />
    </>
  );
}
