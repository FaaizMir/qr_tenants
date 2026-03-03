import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SuperAdminHomepagePushContainer from "@/containers/master-admin/homepage-push";
import { getTranslations } from "next-intl/server";

export default async function SuperAdminHomepagePushPage() {
  const t = await getTranslations("masterAdminHomepagePush.breadcrumbs");
  
  const breadcrumbData = [
    { name: t("masterAdminDashboard"), url: "/master-admin/dashboard" },
    { name: t("homepagePush"), url: "/master-admin/homepage-push" },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <SuperAdminHomepagePushContainer />
    </div>
  );
}
