import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MerchantsTable from "@/containers/merchants/merchants-table";
import { getTranslations } from "next-intl/server";

export default async function MerchantsPage({ params }) {
  const paramsData = await params;
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");

  const breadcrumbData = [
    { name: tCommon("home"), url: "/dashboard" },
    { name: "Merchants", url: "/merchants" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <MerchantsTable
        title="Merchants"
        description="Manage merchant accounts and tenant information"
        loadingText="Loading merchants..."
      />
    </>
  );
}

