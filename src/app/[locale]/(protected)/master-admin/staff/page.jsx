import { getTranslations } from "next-intl/server";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import StaffManagement from "@/containers/master-admin/staff";

export default async function StaffPage() {
    const t = await getTranslations("masterAdminStaff.breadcrumb");
    
    const breadcrumbData = [
        { name: t("masterAdminDashboard"), url: "/master-admin/dashboard" },
        { name: t("staffManagement"), url: "/master-admin/staff" },
    ];

    return (
        <div className="space-y-6">
            <BreadcrumbComponent data={breadcrumbData} />
            <StaffManagement />
        </div>
    );
}
