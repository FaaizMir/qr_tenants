import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackageForm from "@/containers/master-admin/packages/packages-form";
import { getTranslations } from "next-intl/server";

export default async function AgentSupportPage() {
  const t = await getTranslations("masterAdminPackages");
  
  const breadcrumbData = [
    { name: t("breadcrumb.packages"), url: "/master-admin/packages" },
    { name: t("breadcrumb.createPackage"), url: "/master-admin/packages/create" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <PackageForm isEdit={false} />
    </>
  );
}
