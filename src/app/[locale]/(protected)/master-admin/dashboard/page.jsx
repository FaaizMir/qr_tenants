import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import MasterAdminDashboardContainer from "@/containers/master-admin/dashboard";

export default async function MasterAdminDashboardPage() {
    const breadcrumbData = [
        { name: "Dashboard", url: "/master-admin/dashboard" },
    ];
    return (
        <>
            <BreadcrumbComponent data={breadcrumbData} />
            <MasterAdminDashboardContainer />
        </>
    );
}
