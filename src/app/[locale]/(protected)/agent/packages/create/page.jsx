import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PackageForm from "@/containers/agent/packages/packages-form";

export default function CreatePackagePage() {
  const breadcrumbData = [
    { name: "Agent Dashboard", url: "/agent/dashboard" },
    { name: "Paid Ads Packages", url: "/agent/packages" },
    { name: "Create Package", url: "/agent/packages/create" },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <PackageForm isEdit={false} />
    </div>
  );
}
