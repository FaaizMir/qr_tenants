import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentMerchantsListingContainer from "@/containers/agent/merchants/listing";

export default async function AgentMerchantsPage() {
  const breadcrumbData = [
    { name: "Dashboard", url: "/agent/dashboard" },
    { name: "Merchant Management", url: "/agent/merchants" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentMerchantsListingContainer />
    </>
  );
}
