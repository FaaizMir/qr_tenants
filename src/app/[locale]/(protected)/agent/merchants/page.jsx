import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentMerchantsListingContainer from "@/containers/agent/merchants/listing";
import { getTranslations } from "next-intl/server";

export default async function AgentMerchantsPage() {
  const tMerchants = await getTranslations("dashboard.agentMerchantManagement");
  const breadcrumbData = [
    { name: tMerchants("agentdashboard"), url: "/en/agent/dashboard" },
    { name: tMerchants("merchantmanagement"), url: "/en/agent/merchants" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentMerchantsListingContainer />
    </>
  );
}
