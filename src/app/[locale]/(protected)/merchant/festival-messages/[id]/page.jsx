import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import FestivalDetails from "@/containers/merchant/merchant-settings/festival-messages/festival-details";

export default function MerchantCouponsPage({ params }) {
  const { id } = params;
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "Festival Messages", url: `/merchant/festival/${id}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <FestivalDetails />
    </>
  );
}
