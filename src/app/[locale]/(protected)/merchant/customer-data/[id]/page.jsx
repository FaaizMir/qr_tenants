import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import CustomerDetailsContainer from "@/containers/merchant/customer-data/CustomerDetailsContainer";

export default function CustomerDetailsPage({ params }) {
  const { id } = params;
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "Customer Data", url: "/merchant/customer-data" },
    { name: "Customer Details", url: `/merchant/customer-data/${id}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <CustomerDetailsContainer id={id} />
    </>
  );
}
