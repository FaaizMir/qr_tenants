import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackageForm from "@/containers/master-admin/packages/packages-form";

export default function EditPackagePage({ params }) {
  const breadcrumbData = [
    { name: "Packages", url: "/master-admin/packages" },
    { name: "Edit Package", url: `/master-admin/packages/edit/${params.id}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <PackageForm isEdit={true} />
    </>
  );
}
