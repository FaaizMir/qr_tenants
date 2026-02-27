import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackageForm from "@/containers/agent/packages/packages-form";
import { getTranslations } from "next-intl/server";

export default async function EditPackagePage() {
  const t = await getTranslations("agentPackages");
  
  const breadcrumbData = [
    { name: t("breadcrumbs.dashboard"), url: "/agent/dashboard" },
    { name: t("breadcrumbs.packages"), url: "/agent/packages" },
    { name: t("breadcrumbs.edit"), url: "#" },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <PackageForm isEdit={true} />
    </div>
  );
}
