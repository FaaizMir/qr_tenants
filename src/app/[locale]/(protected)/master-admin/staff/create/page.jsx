import { getTranslations } from "next-intl/server";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { StaffForm } from "@/containers/master-admin/staff/staff-form";

export default async function CreateStaffPage() {
  const t = await getTranslations("masterAdminStaff.breadcrumb");
  
  const breadcrumbData = [
    { name: t("staffManagement"), url: "/master-admin/staff" },
    { name: t("addStaff"), url: "/master-admin/staff/create" },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <StaffForm />
    </div>
  );
}
