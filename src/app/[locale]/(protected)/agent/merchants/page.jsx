import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import AgentMerchantsListingContainer from "@/containers/agent/merchants/listing";

export default function AgentMerchantsPage() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/en/agent/dashboard" },
    { name: "Merchants Management", url: "/en/agent/merchants" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AgentMerchantsListingContainer />
    </>
  );
}
