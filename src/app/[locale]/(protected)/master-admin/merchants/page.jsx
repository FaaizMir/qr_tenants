import { getTranslations } from "next-intl/server";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentMerchantsListingContainer from "@/containers/agent/merchants/listing";

export default async function AgentMerchantsPage() {
  const t = await getTranslations("agentMerchants.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("masterAdminDashboard"), url: "/master-admin/dashboard" },
    { name: t("merchantManagement"), url: "/master-admin/merchants" },
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
