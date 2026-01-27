import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { StaffForm } from "@/containers/master-admin/staff/staff-form";

export default async function CreateStaffPage() {
  const breadcrumbData = [
    { name: "Staff Management", url: "/master-admin/staff" },
    { name: "Add Staff", url: "/master-admin/staff/create" },
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbComponent data={breadcrumbData} />
      <StaffForm />
    </div>
  );
}
