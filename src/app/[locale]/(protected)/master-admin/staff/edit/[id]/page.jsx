import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { StaffForm } from "@/containers/master-admin/staff/staff-form";

export default async function EditStaffPage({ params }) {
    const { id } = await params;

    const breadcrumbData = [
        { name: "Staff Management", url: "/master-admin/staff" },
        { name: "Edit Staff", url: `/master-admin/staff/edit/${id}` },
    ];

    return (
        <div className="space-y-6">
            <BreadcrumbComponent data={breadcrumbData} />
            <StaffForm isEdit={true} staffId={id} />
        </div>
    );
}
