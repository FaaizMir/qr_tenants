import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import HomepagePushListing from "@/containers/merchant/homepage-push/listing";
import { getTranslations } from "next-intl/server";

export default async function HomepagePushPage() {
  const t = await getTranslations("homepagePush.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("merchantDashboard"), url: "/merchant/dashboard" },
    { name: t("homepagePush"), url: "/merchant/homepage-push" },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <HomepagePushListing />
    </div>
  );
}
