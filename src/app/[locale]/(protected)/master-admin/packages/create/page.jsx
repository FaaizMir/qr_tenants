import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackageForm from "@/containers/master-admin/packages/packages-form";

export default function AgentSupportPage() {
  const breadcrumbData = [
    { name: "Packages", url: "/master-admin/packages" },
    { name: "Create Package", url: "/master-admin/packages/create" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <PackageForm isEdit={false} />
    </>
  );
}
