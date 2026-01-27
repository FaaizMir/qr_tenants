import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import StaffManagement from "@/containers/master-admin/staff";

export default function StaffPage() {
    const breadcrumbData = [
        { name: "Master Admin Dashboard", url: "/master-admin/dashboard" },
        { name: "Staff Management", url: "/master-admin/staff" },
    ];

    return (
        <div className="space-y-6">
            <BreadcrumbComponent data={breadcrumbData} />
            <StaffManagement />
        </div>
    );
}
