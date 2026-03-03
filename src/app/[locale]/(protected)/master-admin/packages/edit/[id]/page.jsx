import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackageForm from "@/containers/master-admin/packages/packages-form";
import { getTranslations } from "next-intl/server";

export default async function EditPackagePage({ params }) {
  const packageId = params.id;
  const t = await getTranslations("masterAdminPackages");
  
  const breadcrumbData = [
    { name: t("breadcrumb.packages"), url: "/master-admin/packages" },
    { name: t("breadcrumb.editPackage"), url: `/master-admin/packages/edit/${packageId}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <PackageForm isEdit={true} />
    </>
  );
}
