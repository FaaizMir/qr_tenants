import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import CampaignDetails from "@/containers/merchant/merchant-settings/campaigns/campaign-details";

export default function MerchantCouponsPage({ params }) {
  const { id } = params;
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "Campaigns", url: `/merchant/campaigns/${id}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <CampaignDetails />
    </>
  );
}
