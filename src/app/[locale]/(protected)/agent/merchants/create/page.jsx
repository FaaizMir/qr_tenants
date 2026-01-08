import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import CreateMerchantContainer from "@/containers/agent/merchants/create";

export default function CreateMerchantPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/agent/dashboard" },
    { name: "Merchants", url: "/agent/merchants" },
    { name: "Onboard", url: "/agent/merchants/create" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <CreateMerchantContainer />
    </>
  );
}
