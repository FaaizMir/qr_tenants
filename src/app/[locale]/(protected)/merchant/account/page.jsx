import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantAccountContainer from "@/containers/merchant/account";

export default function MerchantAccountPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/merchant/dashboard" },
    { name: "Account", url: "/merchant/account" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantAccountContainer />
    </>
  );
}
