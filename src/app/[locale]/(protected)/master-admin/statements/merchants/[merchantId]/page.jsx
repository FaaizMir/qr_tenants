import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantStatementsContainer from "@/containers/master-admin/merchant-statements";

export default function MerchantStatementsPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "Merchants", url: "/master-admin/merchants" },
    { name: "Merchant Statements", url: "/master-admin/statements/merchants" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantStatementsContainer />
    </>
  );
}
