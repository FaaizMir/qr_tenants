import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentMerchantsListingContainer from "@/containers/agent/merchants/listing";
import { getTranslations } from "next-intl/server";

export default async function AgentMerchantsPage() {
  const breadcrumbData = [
    { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
    { name: "Merchant Management", url: "/master-admin/merchants" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentMerchantsListingContainer
        showCreate={false}
        showEdit={false}
        isMasterAdmin={true}
      />
    </>
  );
}
